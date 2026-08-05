/**
 * Content type options offered in the UI. The `id` is sent to the generate
 * endpoint and used server-side to tailor the format of generated output. The
 * hidden system prompt lives entirely on the server; these only describe the
 * format the professional wants and never expose the engine instructions.
 *
 * The list is every platform the full suite includes, broken out one by one
 * (rather than the full suite itself, which the UI routes to the waitlist
 * instead of generating, since one combined generation across all platforms
 * is what risks the serverless timeout). "full_suite" stays a real,
 * generatable content type server-side for when that constraint goes away.
 */
export type ContentTypeId =
  | "full_suite"
  | "linkedin_post"
  | "instagram_caption"
  | "facebook_post"
  | "youtube_script"
  | "x_thread";

export type ContentTypeOption = {
  id: ContentTypeId;
  label: string;
  description: string;
};

/**
 * The full-suite platforms actually generatable one at a time. TikTok isn't
 * offered as its own generate button here — its clarifying-question flow
 * needed a text input the "picking" composer doesn't have once it's not the
 * very first prompt — so it's folded into "YouTube / TikTok" (id stays
 * `youtube_script`) as one general short-form-video deliverable instead.
 * The insights funnel and tone questionnaire still offer TikTok and YouTube
 * Shorts as separate platform choices (see ALL_PLATFORMS in
 * contentEngine.ts) — this merge is specific to the generate button, not a
 * claim that they're the same platform.
 */
export const PLATFORM_CONTENT_TYPES: ContentTypeOption[] = [
  { id: "linkedin_post", label: "LinkedIn", description: "Professional, authority-led text post" },
  { id: "instagram_caption", label: "Instagram", description: "Carousel outline and caption with hashtags" },
  { id: "facebook_post", label: "Facebook", description: "Warm, community-minded post" },
  { id: "youtube_script", label: "YouTube / TikTok", description: "3 title options, script, and B-roll list for short-form video" },
  { id: "x_thread", label: "X", description: "Numbered tweet thread" },
];

export const CONTENT_TYPES: ContentTypeOption[] = [
  ...PLATFORM_CONTENT_TYPES,
  {
    id: "full_suite",
    label: "Full suite",
    description: "Every deliverable across all platforms",
  },
];

export const DEFAULT_CONTENT_TYPE: ContentTypeId = PLATFORM_CONTENT_TYPES[0]!.id;

export function isContentTypeId(value: string): value is ContentTypeId {
  return CONTENT_TYPES.some((option) => option.id === value);
}

/** Exact starter prompt wording, carried over from the source app. */
export const STARTER_PROMPTS: string[] = [
  "Write a market update",
  "Share a client success story",
  "Explain a buying tip",
];
