import { getSupabaseClient } from "./supabaseClient";
import type { WaitlistRequestBody, HandlerResult } from "../lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Inserts a waitlist submission, together with the tone-of-voice answers and
 * the generated output, into Supabase. See build spec "Data storage:
 * Supabase" — one table, `waitlist_submissions`, no normalisation needed for
 * the prototype.
 */
export async function waitlistHandler(rawBody: unknown): Promise<HandlerResult> {
  const body = (rawBody ?? {}) as Partial<WaitlistRequestBody>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

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

  const { error } = await supabase.from("waitlist_submissions").insert({
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
  });

  if (error) {
    console.error("Supabase insert failed", error);
    return { statusCode: 502, body: { error: "Could not save your submission. Please try again." } };
  }

  return { statusCode: 200, body: { ok: true } };
}
