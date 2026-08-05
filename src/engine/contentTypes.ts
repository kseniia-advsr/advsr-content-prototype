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
  | "tiktok_script"
  | "youtube_script"
  | "x_thread";

export type ContentTypeOption = {
  id: ContentTypeId;
  label: string;
  description: string;
};

/** The 6 full-suite platforms, individually selectable, in the order offered everywhere else (breakdown cards, platform picker). */
export const PLATFORM_CONTENT_TYPES: ContentTypeOption[] = [
  { id: "linkedin_post", label: "LinkedIn", description: "Professional, authority-led text post" },
  { id: "instagram_caption", label: "Instagram", description: "Carousel outline and caption with hashtags" },
  { id: "facebook_post", label: "Facebook", description: "Warm, community-minded post" },
  { id: "tiktok_script", label: "TikTok", description: "Short punchy script with an on-screen hook" },
  { id: "youtube_script", label: "YouTube Shorts", description: "Title, script, and B-roll list" },
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
