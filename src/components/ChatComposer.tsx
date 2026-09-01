import { useEffect, useState } from "react";
import {
  PLATFORM_CONTENT_TYPES,
  STARTER_PROMPTS,
  DEFAULT_CONTENT_TYPE,
  type ContentTypeId,
  type ContentTypeOption,
} from "../engine/contentTypes";

const PLACEHOLDER_ROTATION_MS = 7000;

/**
 * "topic": the very first submission — a platform picker (every full-suite
 *   platform, single-select, plus Full Suite) sits below the input, rotating
 *   starter-prompt placeholders. Choosing a platform only updates the local
 *   selection; nothing fires until the topic is actually sent. Full Suite is
 *   the exception — clicking it acts immediately (see onFullSuiteRequested),
 *   since there's nothing to generate for it either way.
 * "answer": replying to a clarifying question — no picker, short
 *   single-line placeholder.
 * "picking": at least one platform has generated and platforms remain — the
 *   composer is replaced by a picker for every platform, plus Full Suite;
 *   ones already generated render checked and faded rather than disappearing.
 * "done": every platform has been used — replaced by a Get Full Access
 *   button in the same slot.
 */
export type ComposerMode = "topic" | "answer" | "picking" | "done";

function FullSuiteButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-advsr-orange px-3 py-1.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      ✨ For all platforms
    </button>
  );
}

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
  platforms,
  remainingPlatformIds,
  onGetFullAccess,
  disabled,
  generatingContentTypeId,
}: {
  mode: ComposerMode;
  onSubmit: (text: string, contentType: ContentTypeId) => void;
  /** Full Suite was clicked (before or after the first prompt) — never generates, always routes to the (dismissable) waitlist instead. */
  onFullSuiteRequested: () => void;
  /** A platform pill was clicked in "picking" mode — re-sends the original topic for that platform. */
  onPickPlatform: (contentType: ContentTypeId) => void;
  /** Every full-suite platform, shown in "picking" mode — not just the remaining ones, since generated platforms stay visible (checked, faded) instead of disappearing. */
  platforms: ContentTypeOption[];
  /** Platforms not yet generated — everything else in `platforms` renders as already done. */
  remainingPlatformIds: ContentTypeId[];
  onGetFullAccess: () => void;
  disabled: boolean;
  /** The platform currently generating, so "picking" mode can show the loading state on the pill the visitor just clicked rather than leaving that clear only in the transcript above. Null outside of an in-flight platform pick. */
  generatingContentTypeId?: ContentTypeId | null;
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
    onSubmit(trimmed, contentType);
    setInput("");
  };

  // While a response is in flight, the last message is the visitor's own
  // reply (not yet an assistant question), so `mode` alone would momentarily
  // read as "topic" and flash the starter-prompt placeholder — show a
  // neutral loading placeholder instead regardless of mode.
  const placeholder = disabled ? "Thinking…" : mode === "topic" ? STARTER_PROMPTS[placeholderIndex] : "Your answer…";

  if (mode === "picking") {
    const generatingOption = platforms.find((p) => p.id === generatingContentTypeId);
    return (
      <div className="bg-advsr-bg px-6 py-4">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-advsr-border bg-advsr-surface p-4 shadow-lg">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-advsr-text">
            {generatingOption ? (
              <>
                <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-advsr-border border-t-advsr-orange" />
                Generating your {generatingOption.label} post…
              </>
            ) : (
              "What platform are you posting on next?"
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {platforms.map((option) => {
              const isGenerating = option.id === generatingContentTypeId;
              const isDone = !remainingPlatformIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPickPlatform(option.id)}
                  disabled={disabled || isDone}
                  className={
                    "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed " +
                    (isGenerating
                      ? "border-advsr-orange bg-advsr-orange/10 text-advsr-orange"
                      : isDone
                        ? "border-advsr-border text-advsr-muted opacity-50"
                        : "border-advsr-border text-advsr-muted hover:border-advsr-orange-2 hover:text-advsr-text disabled:opacity-50")
                  }
                >
                  {option.label}
                  {isDone ? " ✓" : ""}
                </button>
              );
            })}
            <FullSuiteButton onClick={onFullSuiteRequested} disabled={disabled} />
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
    <div className="space-y-3 bg-advsr-bg px-6 py-4">
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
        <div className="flex items-center justify-end pt-2">
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

      {mode === "topic" && (
        <div className="mx-auto flex w-full max-w-3xl flex-wrap justify-center gap-2">
          {PLATFORM_CONTENT_TYPES.map((option) => {
            const selected = contentType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setContentType(option.id)}
                disabled={disabled}
                aria-pressed={selected}
                className={
                  "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 " +
                  (selected
                    ? "border-advsr-orange bg-advsr-orange/15 text-advsr-orange"
                    : "border-advsr-border text-advsr-muted hover:border-advsr-orange-2 hover:text-advsr-text")
                }
              >
                {option.label}
              </button>
            );
          })}
          <FullSuiteButton onClick={onFullSuiteRequested} disabled={disabled} />
        </div>
      )}
    </div>
  );
}
