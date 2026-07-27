import { parseOutputSections, formatOutputHtml } from "../lib/parseOutput";
import { CopyButton } from "./CopyButton";

export type ChatMessage = { role: "user" | "assistant"; content: string };

function AssistantMessage({ content }: { content: string }) {
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
      </div>
    </div>
  );
}

export function ChatTranscript({
  messages,
  isLoading,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
}) {
  const hasMessages = messages.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-6 py-6">
      {!hasMessages && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-advsr-muted">
          <span className="text-3xl opacity-40">✨</span>
          <p className="text-sm">Tell me what you want to talk about ✨</p>
        </div>
      )}

      {messages.map((m, i) =>
        m.role === "user" ? (
          <div key={i} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl bg-advsr-orange px-4 py-2.5 text-sm text-black">
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ) : (
          <AssistantMessage key={i} content={m.content} />
        )
      )}

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
