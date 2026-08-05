import { getSupabaseClient } from "./supabaseClient";
import { buildToneColumns } from "./toneColumns";
import type { CaptureRequestBody, HandlerResult } from "../lib/types";

/**
 * Generic incremental capture: upserts partial fields onto the
 * waitlist_submissions row identified by sessionId, creating the row on
 * first use — well before name/email are known, see supabase/schema.sql's
 * nullable name/email — and merging onto it on every later call. Every
 * capture point in the funnel sends only the columns it owns:
 *
 * - Early profile capture (right after the tone-of-voice + insights funnel,
 *   before the composer appears): toneProfile, postingFrequencyBefore,
 *   platformBeliefBefore, estimatedHourlyRate.
 * - Posting-frequency "after" answer, once the visitor reconsiders:
 *   postingFrequencyAfter, changedMindOnFrequency.
 * - Once content is generated: clarifyingQa, generatedOutput.
 * - Thumbs up/down on the generated content: contentFeedback.
 *
 * The final waitlist form submission (waitlistHandler.ts) also upserts by
 * session_id, so it merges onto whatever this handler already wrote rather
 * than creating a second row.
 */
export async function captureHandler(rawBody: unknown): Promise<HandlerResult> {
  const body = (rawBody ?? {}) as Partial<CaptureRequestBody>;
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return { statusCode: 400, body: { error: "A session id is required." } };
  }

  const fields = body.fields ?? {};
  const row: Record<string, unknown> = { session_id: sessionId };

  if (fields.toneProfile !== undefined) {
    row.tone_profile = fields.toneProfile ?? {};
    Object.assign(row, buildToneColumns(fields.toneProfile));
  }
  if (typeof fields.postingFrequencyBefore === "string") {
    row.posting_frequency_before = fields.postingFrequencyBefore.trim() || null;
  }
  if (typeof fields.postingFrequencyAfter === "string") {
    row.posting_frequency_after = fields.postingFrequencyAfter.trim() || null;
  }
  if (typeof fields.changedMindOnFrequency === "boolean") {
    row.changed_mind_on_frequency = fields.changedMindOnFrequency;
  }
  if (typeof fields.platformBeliefBefore === "string") {
    row.platform_belief_before = fields.platformBeliefBefore.trim() || null;
  }
  if (typeof fields.estimatedHourlyRate === "number" && Number.isFinite(fields.estimatedHourlyRate)) {
    row.estimated_hourly_rate = fields.estimatedHourlyRate;
  }
  if (Array.isArray(fields.clarifyingQa)) {
    row.clarifying_qa = fields.clarifyingQa;
  }
  if (typeof fields.generatedOutput === "string") {
    row.generated_output = fields.generatedOutput;
  }
  if (fields.contentFeedback !== undefined) {
    if (fields.contentFeedback !== "GOOD" && fields.contentFeedback !== "BAD") {
      return { statusCode: 400, body: { error: "contentFeedback must be GOOD or BAD." } };
    }
    row.content_feedback = fields.contentFeedback;
  }

  if (Object.keys(row).length === 1) {
    return { statusCode: 400, body: { error: "No fields to save." } };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { statusCode: 500, body: { error: "Storage is not configured yet." } };
  }

  const { error } = await supabase
    .from("waitlist_submissions")
    .upsert(row, { onConflict: "session_id" });

  if (error) {
    console.error("Supabase capture upsert failed", error);
    return { statusCode: 502, body: { error: "Could not save. Please try again." } };
  }

  return { statusCode: 200, body: { ok: true } };
}
