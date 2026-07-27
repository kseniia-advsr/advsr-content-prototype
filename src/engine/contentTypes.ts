/**
 * Content type options offered in the UI. The `id` is sent to the generate
 * endpoint and used server-side to tailor the format of generated output. The
 * hidden system prompt lives entirely on the server; these only describe the
 * format the professional wants and never expose the engine instructions.
 */
export type ContentTypeId =
  | "full_suite"
  | "linkedin_post"
  | "instagram_caption"
  | "email_newsletter"
  | "market_commentary";

export type ContentTypeOption = {
  id: ContentTypeId;
  label: string;
  description: string;
};

export const CONTENT_TYPES: ContentTypeOption[] = [
  {
    id: "full_suite",
    label: "Full suite",
    description: "Every deliverable across all platforms",
  },
  {
    id: "linkedin_post",
    label: "LinkedIn post",
    description: "Professional, authority-led text post",
  },
  {
    id: "instagram_caption",
    label: "Instagram caption",
    description: "Short, hook-led caption with hashtags",
  },
  {
    id: "email_newsletter",
    label: "Email newsletter",
    description: "Warm, value-rich update for your list",
  },
  {
    id: "market_commentary",
    label: "Market commentary",
    description: "Data-aware view on the market",
  },
];

export const DEFAULT_CONTENT_TYPE: ContentTypeId = "full_suite";

export function isContentTypeId(value: string): value is ContentTypeId {
  return CONTENT_TYPES.some((option) => option.id === value);
}

/** Exact starter prompt wording, carried over from the source app. */
export const STARTER_PROMPTS: string[] = [
  "Write a market update",
  "Share a client success story",
  "Explain a buying tip",
];
