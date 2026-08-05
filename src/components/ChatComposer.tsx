import { useEffect, useState } from "react";
import {
  CONTENT_TYPES,
  STARTER_PROMPTS,
  DEFAULT_CONTENT_TYPE,
  type ContentTypeId,
  type ContentTypeOption,
} from "../engine/contentTypes";

const PLACEHOLDER_ROTATION_MS = 7000;

/**
 * "topic": the very first submission — content-type selector shown (every
 *   full-suite platform individually, plus Full Suite itself), rotating
 *   starter-prompt placeholders. Selecting Full Suite and sending routes to
 *   the waitlist instead of generating (see onFullSuiteRequested).
 * "answer": replying to a clarifying question — no content-type selector,
 *   short single-line placeholder.
 * "picking": at least one platform has generated and platforms remain — the
 *   composer is replaced by a picker for the next platform, plus Full Suite.
 * "done": every platform has been used — replaced by a Get Full Access
 *   button in the same slot.
 */
export type ComposerMode = "topic" | "answer" | "picking" | "done";

/**
 * Persistent bottom slot: the composer before the first topic and through
 * the clarifying-question exchange, then a platform picker once at least one
 * platform has generated, then a Get Full Access button once they all have —
 * always present in that position rather than disappearing after one use.
 */
export function ChatComposer({
  mode,
  onSubmit,
  onFullSuiteRequested,
  onPickPlatform,
  remainingPlatforms,
  onGetFullAccess,
  disabled,
}: {
  mode: ComposerMode;
  onSubmit: (text: string, contentType: ContentTypeId) => void;
  /** Full Suite was selected (from the dropdown) or clicked (from the picker) — never generates, always routes to the (dismissable) waitlist instead. */
  onFullSuiteRequested: () => void;
  /** A platform pill was clicked in "picking" mode — re-sends the original topic for that platform. */
  onPickPlatform: (contentType: ContentTypeId) => void;
  /** Platforms not yet used, shown in "picking" mode. */
  remainingPlatforms: ContentTypeOption[];
  onGetFullAccess: () => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");
  const [contentType, setContentType] = useState<ContentTypeId>(DEFAULT_CONTENT_TYPE);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (mode !== "topic") return;
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % STARTER_PROMPTS.length);
    }, PLACEHOLDER_ROTATION_MS);
    return () => clearInterval(id);
  }, [mode]);

  const start = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    if (contentType === "full_suite") {
      onFullSuiteRequested();
      return;
    }
    onSubmit(trimmed, contentType);
    setInput("");
  };

  // While a response is in flight, the last message is the visitor's own
  // reply (not yet an assistant question), so `mode` alone would momentarily
  // read as "topic" and flash the starter-prompt placeholder — show a
  // neutral loading placeholder instead regardless of mode.
  const placeholder = disabled ? "Thinking…" : mode === "topic" ? STARTER_PROMPTS[placeholderIndex] : "Your answer…";

  if (mode === "picking") {
    return (
      <div className="bg-advsr-bg px-6 py-4">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-advsr-border bg-advsr-surface p-4 shadow-lg">
          <p className="mb-3 text-sm font-medium text-advsr-text">
            Want the same idea for another platform?
          </p>
          <div className="flex flex-wrap gap-2">
            {remainingPlatforms.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onPickPlatform(option.id)}
                disabled={disabled}
                className="rounded-full border border-advsr-border px-3 py-1.5 text-sm text-advsr-muted transition-colors hover:border-advsr-orange-2 hover:text-advsr-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onFullSuiteRequested}
              disabled={disabled}
              className="rounded-full bg-advsr-orange px-3 py-1.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✨ Full Suite
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "done") {
    return (
      <div className="bg-advsr-bg px-6 py-4">
        <button
          type="button"
          onClick={onGetFullAccess}
          className="mx-auto block w-full max-w-3xl rounded-2xl bg-advsr-orange px-4 py-3 text-center font-heading font-semibold text-black shadow-lg transition-opacity hover:opacity-90"
        >
          Get full access
        </button>
      </div>
    );
  }

  return (
    <div className="bg-advsr-bg px-6 py-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(input);
        }}
        className="mx-auto w-full max-w-3xl rounded-2xl border border-advsr-border bg-advsr-surface p-3 shadow-lg"
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
          placeholder={placeholder}
          rows={mode === "topic" ? 3 : 1}
          disabled={disabled}
          className="min-h-[2.25rem] w-full resize-none border-0 bg-transparent text-base text-advsr-text placeholder:text-advsr-muted focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-3 pt-2">
          {mode === "topic" ? (
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
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            aria-label="Send"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-advsr-orange text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
