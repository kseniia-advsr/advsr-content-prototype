import { getSupabaseClient } from "./supabaseClient";
import { buildToneColumns } from "./toneColumns";
import type { WaitlistRequestBody, HandlerResult } from "../lib/types";

export { buildToneColumns } from "./toneColumns";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Final waitlist form submission. Upserts by session_id (rather than a plain
 * insert) so this merges onto the row "early profile capture" already
 * created via captureHandler.ts (tone-of-voice answers, funnel answers,
 * generated output) instead of creating a duplicate row. Sessions that
 * somehow never captured anything earlier (e.g. capture failed, or an old
 * client without a session id) still get a fresh row — session_id is
 * nullable, so a request without one just inserts as before.
 */
export async function waitlistHandler(rawBody: unknown): Promise<HandlerResult> {
  const body = (rawBody ?? {}) as Partial<WaitlistRequestBody>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";

  if (!name || !EMAIL_RE.test(email)) {
    return { statusCode: 400, body: { error: "Name and a valid email are required." } };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      statusCode: 500,
      body: { error: "Waitlist storage is not configured yet. Set SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY." },
    };
  }

  const row = {
    ...(sessionId ? { session_id: sessionId } : {}),
    name,
    email,
    company: typeof body.company === "string" && body.company.trim() ? body.company.trim() : null,
    market: typeof body.market === "string" && body.market.trim() ? body.market.trim() : null,
    expected_price:
      typeof body.expectedPrice === "string" && body.expectedPrice.trim()
        ? body.expectedPrice.trim()
        : null,
    missing_feedback:
      typeof body.missingFeedback === "string" && body.missingFeedback.trim()
        ? body.missingFeedback.trim()
        : null,
    has_advsr_login: Boolean(body.hasAdvsrLogin),
    tone_profile: body.toneProfile ?? {},
    generated_output: typeof body.generatedOutput === "string" ? body.generatedOutput : null,
    ...buildToneColumns(body.toneProfile),
  };

  const { error } = sessionId
    ? await supabase.from("waitlist_submissions").upsert(row, { onConflict: "session_id" })
    : await supabase.from("waitlist_submissions").insert(row);

  if (error) {
    console.error("Supabase waitlist write failed", error);
    return { statusCode: 502, body: { error: "Could not save your submission. Please try again." } };
  }

  return { statusCode: 200, body: { ok: true } };
}
