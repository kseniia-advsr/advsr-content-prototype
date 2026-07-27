import { useEffect, useState } from "react";
import { CONTENT_TYPES, STARTER_PROMPTS, DEFAULT_CONTENT_TYPE, type ContentTypeId } from "../engine/contentTypes";

const PLACEHOLDER_ROTATION_MS = 7000;

export function ChatComposer({
  onSubmit,
  disabled,
}: {
  onSubmit: (topic: string, contentType: ContentTypeId) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");
  const [contentType, setContentType] = useState<ContentTypeId>(DEFAULT_CONTENT_TYPE);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % STARTER_PROMPTS.length);
    }, PLACEHOLDER_ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  const start = (topic: string) => {
    const trimmed = topic.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, contentType);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="font-heading text-3xl font-bold text-advsr-text sm:text-4xl">
          <span className="block">Content for every platform,</span>
          <span className="block">in one prompt.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-advsr-muted">
          <span className="block">One thought becomes 5 social media posts.</span>
          <span className="block">No marketing team and up to 8 hours saved weekly.</span>
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
          placeholder={STARTER_PROMPTS[placeholderIndex]}
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
    </div>
  );
}
