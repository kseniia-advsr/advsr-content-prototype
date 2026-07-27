import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  PREMIUM_MODEL,
  PREMIUM_MAX_TOKENS,
} from "../engine/contentEngine";
import { buildAdvisorContext } from "../engine/advisorContext";
import { isContentTypeId, DEFAULT_CONTENT_TYPE } from "../engine/contentTypes";
import { checkRateLimit } from "./rateLimit";
import type { GenerateRequestBody, HandlerResult } from "../lib/types";

const MAX_TOPIC_LENGTH = 2000;

/**
 * Core logic for the Phase 1 "premium first-generation" endpoint: no auth,
 * one Anthropic call per request, best available model, output ceiling well
 * above the source app's 4,096-token cap. Framework-agnostic so both the
 * Netlify function (production) and the Vite dev middleware (local dev) can
 * call it directly. See build spec section 3, "Premium first-generation flag".
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

  const advisorContext = buildAdvisorContext(body.toneResponses ?? null);
  const systemPrompt = buildSystemPrompt(contentType, null, advisorContext, platforms);

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: PREMIUM_MODEL,
      max_tokens: PREMIUM_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: topic }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return { statusCode: 200, body: { output: text } };
  } catch (err) {
    console.error("Anthropic generation failed", err);
    return { statusCode: 502, body: { error: "Content generation failed. Please try again." } };
  }
}
