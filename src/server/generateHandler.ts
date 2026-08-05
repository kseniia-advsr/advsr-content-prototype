import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  CONTENT_MODEL,
  PREMIUM_MAX_TOKENS,
  CLARIFY_TURN_SYSTEM_PROMPT,
  MAX_CLARIFYING_QUESTIONS,
} from "../engine/contentEngine";
import { buildAdvisorContext } from "../engine/advisorContext";
import { isContentTypeId, DEFAULT_CONTENT_TYPE } from "../engine/contentTypes";
import { checkRateLimit } from "./rateLimit";
import type { ClarifyingQa, GenerateRequestBody, HandlerResult } from "../lib/types";

const MAX_TOPIC_LENGTH = 2000;
const CLARIFY_TURN_MAX_TOKENS = 100;

/**
 * This whole handler runs as one synchronous Netlify Function call with a
 * hard wall-clock execution limit (reported anywhere from 10s to 60s
 * depending on plan/account — genuinely unclear; see generateHandler
 * discussion history). The Anthropic SDK's own defaults (2 retries,
 * 10-minute internal timeout) assume no such external deadline exists, so
 * left uncustomized they can silently burn the whole budget retrying a
 * transient hiccup before the function itself gets killed — which surfaces
 * to the visitor as a confusing generic network error instead of this
 * handler's own clean "please try again" message. Failing fast and without
 * retry keeps the handler in control of that message.
 *
 * These numbers are informed by one measured sample, not a guarantee:
 * a bare clarify-turn call took ~2.1s, and a single-platform generation
 * (well under the full-suite ceiling) took ~10.5s. Real network/model
 * variance means neither figure is a hard ceiling — these budgets leave
 * real margin above both, but a full-suite generation (all 6 platforms in
 * one call) is a fundamentally larger request than what was measured and
 * may still exceed both these budgets and the function's own limit. That's
 * an architectural problem these timeouts don't solve, only fail cleanly on.
 */
const CLARIFY_TURN_REQUEST_OPTIONS = { maxRetries: 0, timeout: 8_000 };
const GENERATION_REQUEST_OPTIONS = { maxRetries: 0, timeout: 25_000 };

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/**
 * Parses a single clarify-turn response into one short question, or null
 * when the model says READY (or the response was empty). Only the first
 * line is used — defensive against the model adding extra text despite the
 * "one sentence, nothing else" instruction. Exported for unit testing.
 */
export function parseClarifyTurnResponse(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "READY") return null;
  const firstLine = trimmed.split("\n")[0]!.replace(/^[-*\d.)\s]+/, "").trim();
  return firstLine || null;
}

/**
 * Core logic for the Phase 1 "premium first-generation" endpoint: no auth,
 * output ceiling well above the source app's 4,096-token cap. Framework-
 * agnostic so both the Netlify function (production) and the Vite dev
 * middleware (local dev) can call it directly. See build spec section 3,
 * "Premium first-generation flag".
 *
 * Asks at most MAX_CLARIFYING_QUESTIONS (one) short clarifying question
 * before generating, and only when the topic as given genuinely cannot be
 * turned into content (too short, a bare greeting, gibberish) — a real topic
 * or thought, however brief, goes straight to generation. Each call either
 * returns that one question, or generates and returns the final content once
 * the model says it's ready or the single-question cap is already used.
 * Answering the question never counts as using up the one premium
 * generation — only a returned `output` does.
 */
export async function generateHandler(
  rawBody: unknown,
  clientIp: string
): Promise<HandlerResult> {
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return {
      statusCode: 429,
      body: { error: `Too many requests. Try again in ${rateLimit.retryAfterSeconds}s.` },
    };
  }

  const body = (rawBody ?? {}) as Partial<GenerateRequestBody>;
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";

  if (!topic) {
    return { statusCode: 400, body: { error: "A topic is required." } };
  }
  if (topic.length > MAX_TOPIC_LENGTH) {
    return { statusCode: 400, body: { error: "Topic is too long." } };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: { error: "Content generation is not configured yet. Set ANTHROPIC_API_KEY." },
    };
  }

  const contentType =
    body.contentType && isContentTypeId(body.contentType) ? body.contentType : DEFAULT_CONTENT_TYPE;
  const platforms = Array.isArray(body.platforms)
    ? body.platforms.filter((p): p is string => typeof p === "string")
    : undefined;
  const clarifyingQa: ClarifyingQa[] = Array.isArray(body.clarifyingQa)
    ? body.clarifyingQa.filter(
        (qa): qa is ClarifyingQa =>
          !!qa &&
          typeof qa.question === "string" &&
          typeof qa.answer === "string" &&
          qa.answer.trim().length > 0
      )
    : [];

  const advisorContext = buildAdvisorContext(body.toneResponses ?? null);
  const client = new Anthropic({ apiKey });

  if (clarifyingQa.length < MAX_CLARIFYING_QUESTIONS) {
    try {
      const exchangeSoFar = clarifyingQa
        .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
        .join("\n");
      const turnResponse = await client.messages.create(
        {
          model: CONTENT_MODEL,
          max_tokens: CLARIFY_TURN_MAX_TOKENS,
          system: CLARIFY_TURN_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                `Topic: ${topic}`,
                advisorContext ? `Advisor profile:${advisorContext}` : "",
                exchangeSoFar ? `Answered so far:\n${exchangeSoFar}` : "",
              ]
                .filter(Boolean)
                .join("\n\n"),
            },
          ],
        },
        CLARIFY_TURN_REQUEST_OPTIONS
      );
      const question = parseClarifyTurnResponse(extractText(turnResponse));
      if (question) {
        return { statusCode: 200, body: { question } };
      }
    } catch (err) {
      // The clarify step is a nice-to-have; if it fails, fall through to
      // direct generation rather than blocking the one premium generation.
      console.error("Clarify turn failed, generating directly", err);
    }
  }

  const qaBlock =
    clarifyingQa.length > 0
      ? `\n\nThe advisor answered these clarifying questions before this topic:\n${clarifyingQa
          .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
          .join("\n")}`
      : "";

  const systemPrompt = buildSystemPrompt(contentType, null, advisorContext, platforms);

  try {
    const response = await client.messages.create(
      {
        model: CONTENT_MODEL,
        max_tokens: PREMIUM_MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: `${topic}${qaBlock}` }],
      },
      GENERATION_REQUEST_OPTIONS
    );

    return { statusCode: 200, body: { output: extractText(response) } };
  } catch (err) {
    console.error("Anthropic generation failed", err);
    return { statusCode: 502, body: { error: "Content generation failed. Please try again." } };
  }
}
