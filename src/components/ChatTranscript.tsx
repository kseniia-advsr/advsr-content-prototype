import { parseOutputSections, formatOutputHtml } from "../lib/parseOutput";
import { CopyButton } from "./CopyButton";

export type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; kind: "content"; content: string }
  | { role: "assistant"; kind: "question"; content: string };

function AssistantQuestion({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-advsr-orange/15 text-advsr-orange">
        ✨
      </div>
      <div className="max-w-[80%] rounded-2xl border border-advsr-border bg-advsr-surface px-4 py-2.5 text-sm text-advsr-text">
        {content}
      </div>
    </div>
  );
}

function FeedbackButtons({
  feedback,
  onFeedback,
}: {
  feedback: "GOOD" | "BAD" | null;
  onFeedback: (value: "GOOD" | "BAD") => void;
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs text-advsr-muted">Was this useful?</span>
      <button
        type="button"
        onClick={() => onFeedback("GOOD")}
        aria-label="Good response"
        aria-pressed={feedback === "GOOD"}
        className={
          "rounded-md border px-2 py-1 text-sm transition-colors " +
          (feedback === "GOOD"
            ? "border-advsr-orange bg-advsr-orange/15 text-advsr-orange"
            : "border-advsr-border text-advsr-muted hover:border-advsr-orange-2 hover:text-advsr-text")
        }
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => onFeedback("BAD")}
        aria-label="Bad response"
        aria-pressed={feedback === "BAD"}
        className={
          "rounded-md border px-2 py-1 text-sm transition-colors " +
          (feedback === "BAD"
            ? "border-advsr-orange bg-advsr-orange/15 text-advsr-orange"
            : "border-advsr-border text-advsr-muted hover:border-advsr-orange-2 hover:text-advsr-text")
        }
      >
        👎
      </button>
    </div>
  );
}

function AssistantMessage({
  content,
  feedback,
  onFeedback,
}: {
  content: string;
  feedback: "GOOD" | "BAD" | null;
  onFeedback: (value: "GOOD" | "BAD") => void;
}) {
  const sections = parseOutputSections(content);
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-advsr-orange/15 text-advsr-orange">
        ✨
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {sections.map((section) => (
          <article
            key={section.heading}
            className="overflow-hidden rounded-xl border border-advsr-border bg-advsr-surface"
          >
            <div className="flex items-center justify-between gap-2 border-b border-advsr-border px-3 py-2">
              <span className="text-xs font-semibold text-advsr-orange">{section.heading}</span>
              <CopyButton text={section.body} />
            </div>
            <div
              className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-advsr-text"
              dangerouslySetInnerHTML={{ __html: formatOutputHtml(section.body) }}
            />
          </article>
        ))}
        <FeedbackButtons feedback={feedback} onFeedback={onFeedback} />
      </div>
    </div>
  );
}

export function ChatTranscript({
  messages,
  isLoading,
  contentFeedback,
  onFeedback,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  contentFeedback: "GOOD" | "BAD" | null;
  onFeedback: (value: "GOOD" | "BAD") => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-6 py-6">
      {messages.map((m, i) => {
        if (m.role === "user") {
          return (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-advsr-orange px-4 py-2.5 text-sm text-black">
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          );
        }
        if (m.kind === "question") {
          return <AssistantQuestion key={i} content={m.content} />;
        }
        return (
          <AssistantMessage key={i} content={m.content} feedback={contentFeedback} onFeedback={onFeedback} />
        );
      })}

      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-advsr-orange/15 text-advsr-orange">
            ✨
          </div>
          <div className="flex items-center gap-2 py-2 text-advsr-muted">
            <span className="size-4 animate-spin rounded-full border-2 border-advsr-border border-t-advsr-orange" />
            <span className="text-sm">Composing your content…</span>
          </div>
        </div>
      )}
    </div>
  );
}
