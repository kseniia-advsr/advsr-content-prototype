import type { ToneResponses } from "../engine/toneProfile";

/** Every "multi" and "location" field in the schema, stored as its own text[] column. */
const ARRAY_TONE_FIELDS = [
  "style",
  "client_feeling",
  "qualities_always",
  "qualities_avoid",
  "build_trust",
  "greatest_strength",
  "known_for",
  "location",
  "content_focus",
  "platforms",
  "content_comfort",
  "brand_affinities",
  "brand_words",
  "never",
  "ai_help",
  "ideal_clients",
] as const;

/** Every "single" and "text" field in the schema, stored as its own text column. */
const TEXT_TONE_FIELDS = [
  "formality",
  "directness",
  "personality_level",
  "archetype",
  "negotiation_style",
  "commercial_level",
  "opportunity_presentation",
  "risk_appetite",
  // Also folded into a dedicated SPELLING directive in the system prompt
  // (see advisorContext.ts) — that's a prompt-construction concern, separate
  // from this being a real form answer that still deserves its own column.
  "english_variant",
  "term_advisor",
  "term_property",
  "term_client",
  "term_opportunity",
  "term_sale",
  "term_buyer",
  "term_vendor",
  "term_market",
  "term_network",
  "len_email",
  "len_social",
  "len_market",
  "len_property",
  "share_personal",
  "personal_ok",
  "personal_offlimits",
  "personal_interests",
  "example_email",
  "example_whatsapp",
  "example_linkedin",
  "example_proposal",
  "example_market",
  "example_property",
  "example_presentation",
  "display_name",
  "extra_context",
] as const;

/** Every "rating10" field in the schema (a 1-10 scale), stored as its own integer column. */
const NUMBER_TONE_FIELDS = ["trust", "likeability", "respect", "discretion", "reliability"] as const;

function extractArray(responses: ToneResponses | undefined, field: string): string[] | null {
  const value = responses?.[field];
  if (!Array.isArray(value)) return null;
  const items = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return items.length > 0 ? items : null;
}

function extractText(responses: ToneResponses | undefined, field: string): string | null {
  const value = responses?.[field];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractNumber(responses: ToneResponses | undefined, field: string): number | null {
  const value = responses?.[field];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractChannelRatings(
  responses: ToneResponses | undefined,
  field: string
): Record<string, number> | null {
  const value = responses?.[field];
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, number>).filter(
    ([, rating]) => typeof rating === "number" && rating > 0
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

/**
 * Flattens every one of the 58 tone-of-voice answers (all "multi", "single",
 * "text", "location", "rating10" and "channels" fields across all 16
 * sections) into their own named columns so each one can be queried directly
 * in Supabase, without unpacking the tone_profile jsonb blob. tone_profile
 * itself is kept as-is as the full raw backup; this is purely an additional,
 * queryable projection of the same responses object. `visibility` maps to
 * the `visibility_level` column since `visibility` collides with the
 * Postgres/Supabase reserved-ish naming the table already uses for
 * row-level visibility conventions. `channel_personality` (the one
 * "channels"-type field) is a rating-per-channel object, stored as jsonb
 * rather than text[] or a plain column, same shape as it's answered in.
 *
 * Shared by waitlistHandler.ts (final submission) and captureHandler.ts
 * (early profile capture) — both write the same projection.
 */
export function buildToneColumns(
  responses: ToneResponses | null | undefined
): Record<string, string | string[] | number | Record<string, number> | null> {
  const r = responses ?? undefined;
  const columns: Record<string, string | string[] | number | Record<string, number> | null> = {};
  for (const field of ARRAY_TONE_FIELDS) columns[field] = extractArray(r, field);
  for (const field of TEXT_TONE_FIELDS) columns[field] = extractText(r, field);
  for (const field of NUMBER_TONE_FIELDS) columns[field] = extractNumber(r, field);
  columns.visibility_level = extractText(r, "visibility");
  columns.channel_personality = extractChannelRatings(r, "channel_personality");
  return columns;
}
