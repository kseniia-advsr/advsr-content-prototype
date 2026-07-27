import { useState } from "react";
import { CONTENT_TYPES, STARTER_PROMPTS, DEFAULT_CONTENT_TYPE, type ContentTypeId } from "../engine/contentTypes";

const STARTER_EMOJI: Record<string, string> = {
  "Write a market update": "📊",
  "Share a client success story": "🏡",
  "Explain a buying tip": "💡",
};

export function ChatComposer({
  onSubmit,
  disabled,
}: {
  onSubmit: (topic: string, contentType: ContentTypeId) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");
  const [contentType, setContentType] = useState<ContentTypeId>(DEFAULT_CONTENT_TYPE);

  const start = (topic: string) => {
    const trimmed = topic.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, contentType);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl font-bold text-advsr-text sm:text-4xl">
          Content for every platform. Your voice, in one prompt.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-advsr-muted">
          One topic becomes a LinkedIn post, an Instagram caption and
          carousel, a TikTok script, a full YouTube package, a tweet thread
          and a Facebook post, each one written the way you actually sound.
          No marketing team, no extra hours lost to content, up to 8 hours
          back in your week.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(input);
        }}
        className="rounded-2xl border border-advsr-border bg-advsr-surface p-3 shadow-lg"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              start(input);
            }
          }}
          placeholder="e.g. the market you know best this quarter, or a recent close you're proud of"
          rows={3}
          disabled={disabled}
          className="min-h-20 w-full resize-none border-0 bg-transparent text-base text-advsr-text placeholder:text-advsr-muted focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-3 pt-2">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentTypeId)}
            disabled={disabled}
            aria-label="Output format"
            className="h-9 rounded-lg border border-advsr-border bg-advsr-bg px-2 text-sm text-advsr-text focus:outline-none disabled:opacity-50"
          >
            {CONTENT_TYPES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            aria-label="Create content"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-advsr-orange text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↑
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => start(prompt)}
            disabled={disabled}
            className="rounded-full border border-advsr-border bg-advsr-surface px-4 py-2 text-sm text-advsr-text/90 transition-colors hover:border-advsr-orange-2 hover:bg-advsr-border disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="mr-1.5" aria-hidden="true">
              {STARTER_EMOJI[prompt] ?? "✨"}
            </span>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
