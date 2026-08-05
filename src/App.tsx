import { useCallback, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ToneDialog } from "./components/ToneDialog";
import { InsightsFunnel, type InsightsFunnelResult } from "./components/InsightsFunnel";
import { Hero } from "./components/Hero";
import { ChatComposer, type ComposerMode } from "./components/ChatComposer";
import { ChatTranscript, type ChatMessage } from "./components/ChatTranscript";
import { WaitlistDialog, type WaitlistSubmission } from "./components/WaitlistDialog";
import { useIdleOrScrollGate } from "./lib/useIdleOrScrollGate";
import type { ToneResponses } from "./engine/toneProfile";
import type { ContentTypeId } from "./engine/contentTypes";
import type {
  CaptureFields,
  ClarifyingQa,
  GenerateResponseBody,
  WaitlistResponseBody,
} from "./lib/types";

const FUNNEL_DELAY_MS = 7000;

const initialState = () => ({
  toneOpen: true,
  toneResponses: {} as ToneResponses,
  toneSectionIndex: 0,
  funnelOpen: false,
  // True from the moment the tone dialog closes until the insights funnel is
  // filled out — covers both the 7s pause before it appears and the time
  // spent in it. Locks the Sidebar's "+ New content" button for that whole
  // span so a reset can never race the pending funnel timer.
  funnelPending: false,
  messages: [] as ChatMessage[],
  isLoading: false,
  generateError: null as string | null,
  waitlistOpen: false,
  waitlistSubmitted: false,
  clarifyingQa: [] as ClarifyingQa[],
  contentFeedback: null as "GOOD" | "BAD" | null,
  // The topic + content type the advisor originally submitted, held onto so
  // each clarifying-answer round-trip can re-send the same request with the
  // growing Q&A history folded in.
  pendingTopic: "",
  pendingContentType: "full_suite" as ContentTypeId,
});

/** Best-effort incremental save — never blocks or fails the UX it's attached to. */
async function capture(sessionId: string, fields: CaptureFields) {
  try {
    await fetch("/api/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, fields }),
    });
  } catch {
    // Telemetry only — a failed capture must never block generation or chat.
  }
}

export default function App() {
  // One id per browser session, generated once and reused for every capture
  // call and the final waitlist submission, so the whole funnel accumulates
  // onto a single Supabase row instead of creating duplicates.
  const [sessionId] = useState(() => crypto.randomUUID());
  const [state, setState] = useState(initialState);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);

  const {
    toneOpen,
    toneResponses,
    toneSectionIndex,
    funnelOpen,
    funnelPending,
    messages,
    isLoading,
    generateError,
    waitlistOpen,
    waitlistSubmitted,
    clarifyingQa,
    contentFeedback,
    pendingTopic,
    pendingContentType,
  } = state;

  const patch = (next: Partial<ReturnType<typeof initialState>>) =>
    setState((prev) => ({ ...prev, ...next }));

  // Holds the pending "show the funnel after 7s" timer so it can be torn
  // down on unmount — resetSession can't race it in practice since
  // funnelPending disables the button that triggers a reset, but this still
  // guards against a setState-after-unmount warning if the tab closes mid-wait.
  const funnelTimeoutRef = useRef<number | null>(null);

  const resetSession = () => {
    if (funnelTimeoutRef.current !== null) {
      window.clearTimeout(funnelTimeoutRef.current);
      funnelTimeoutRef.current = null;
    }
    setState(initialState());
    setWaitlistError(null);
    setWaitlistSubmitting(false);
  };

  const handleToneFinish = () => {
    // Closing the tone dialog doesn't reveal the funnel immediately — it
    // waits 7s on the main page (Hero + composer, already mounted
    // underneath) first, so the two forms don't feel back-to-back. The
    // Sidebar's "+ New content" is locked for that whole wait (and through
    // the funnel itself) via funnelPending, so there's no window for a reset
    // to race this timer.
    patch({ toneOpen: false, funnelPending: true });
    funnelTimeoutRef.current = window.setTimeout(() => {
      funnelTimeoutRef.current = null;
      patch({ funnelOpen: true });
    }, FUNNEL_DELAY_MS);
  };

  const handleFunnelFinish = (result: InsightsFunnelResult) => {
    const updatedToneResponses: ToneResponses = { ...toneResponses, platforms: result.platforms };
    patch({ toneResponses: updatedToneResponses, funnelOpen: false, funnelPending: false });
    void capture(sessionId, {
      toneProfile: updatedToneResponses,
      postingFrequencyBefore: result.postingFrequencyBefore,
      postingFrequencyAfter: result.postingFrequencyAfter,
      changedMindOnFrequency: result.changedMindOnFrequency,
      platformBeliefBefore: result.platformBeliefBefore,
      estimatedHourlyRate: result.estimatedHourlyRate,
    });
  };

  const runGenerate = async (topic: string, contentType: ContentTypeId, qa: ClarifyingQa[]) => {
    patch({ isLoading: true, generateError: null });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          contentType,
          toneResponses,
          platforms: toneResponses["platforms"],
          clarifyingQa: qa,
        }),
      });
      const data = (await res.json()) as GenerateResponseBody;
      if (!res.ok || "error" in data) {
        patch({ isLoading: false, generateError: "error" in data ? data.error : "Something went wrong." });
        return;
      }
      if ("question" in data) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          messages: [...prev.messages, { role: "assistant", kind: "question", content: data.question }],
        }));
        return;
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, { role: "assistant", kind: "content", content: data.output }],
      }));
      void capture(sessionId, { clarifyingQa: qa, generatedOutput: data.output });
    } catch {
      patch({ isLoading: false, generateError: "Could not reach the content engine. Please try again." });
    }
  };

  const lastMessage = messages[messages.length - 1];
  const awaitingAnswer = lastMessage?.role === "assistant" && lastMessage.kind === "question";
  const hasContent = messages.some((m) => m.role === "assistant" && m.kind === "content");
  const composerMode: ComposerMode = hasContent ? "done" : awaitingAnswer ? "answer" : "topic";

  const handleComposerSubmit = (text: string, contentType: ContentTypeId) => {
    if (composerMode === "answer" && lastMessage?.role === "assistant" && lastMessage.kind === "question") {
      const updatedQa = [...clarifyingQa, { question: lastMessage.content, answer: text }];
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, { role: "user", content: text }],
        clarifyingQa: updatedQa,
      }));
      void runGenerate(pendingTopic, pendingContentType, updatedQa);
      return;
    }
    patch({
      messages: [...messages, { role: "user", content: text }],
      pendingTopic: text,
      pendingContentType: contentType,
    });
    void runGenerate(text, contentType, []);
  };

  const handleFeedback = (value: "GOOD" | "BAD") => {
    patch({ contentFeedback: value });
    void capture(sessionId, { contentFeedback: value });
  };

  const lastAssistantOutput =
    [...messages].reverse().find((m) => m.role === "assistant" && m.kind === "content")?.content ?? "";

  // Auto-open the waitlist dialog once the reader has scrolled the response
  // to the bottom, or after 60s of no scroll/mouse/keyboard activity —
  // whichever comes first. Only arms once actual content has landed — the
  // tone-of-voice questionnaire, the insights funnel, and any clarifying
  // follow-up questions must never trigger it, only the generated piece.
  const gate = useCallback(() => patch({ waitlistOpen: true }), []);
  useIdleOrScrollGate(hasContent && !waitlistOpen && !waitlistSubmitted, gate, 60000);

  const handleWaitlist = async (wl: WaitlistSubmission) => {
    setWaitlistSubmitting(true);
    setWaitlistError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: `${wl.firstName} ${wl.lastName}`.trim(),
          email: wl.email,
          company: wl.company || undefined,
          market: wl.country || undefined,
          expectedPrice: wl.expectedPrice || undefined,
          missingFeedback: wl.missingFeedback || undefined,
          hasAdvsrLogin: Boolean(wl.hasAdvsrLogin),
          toneProfile: toneResponses,
          generatedOutput: lastAssistantOutput,
        }),
      });
      const data = (await res.json()) as WaitlistResponseBody;
      if (!res.ok || "error" in data) {
        setWaitlistError("error" in data ? data.error : "Something went wrong.");
        return;
      }
      patch({ waitlistSubmitted: true });
    } catch {
      setWaitlistError("Could not reach the server. Please try again.");
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-advsr-bg">
      <Sidebar
        onNewContent={resetSession}
        onGetFullAccess={() => patch({ waitlistOpen: true })}
        newContentDisabled={funnelPending}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {generateError && (
          <p className="mx-auto w-full max-w-2xl px-6 pt-4 text-sm text-red-400">
            {generateError}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <Hero />
          ) : (
            <ChatTranscript
              messages={messages}
              isLoading={isLoading}
              contentFeedback={contentFeedback}
              onFeedback={handleFeedback}
            />
          )}
        </div>

        {/* Persistent composer: stays visible before the first topic, through
            the clarifying-question exchange, and after content generates. */}
        <ChatComposer mode={composerMode} onSubmit={handleComposerSubmit} disabled={isLoading} />
      </div>

      {toneOpen && (
        <ToneDialog
          responses={toneResponses}
          onChange={(updater) =>
            setState((prev) => ({ ...prev, toneResponses: updater(prev.toneResponses) }))
          }
          sectionIndex={toneSectionIndex}
          onSectionIndexChange={(next) => patch({ toneSectionIndex: next })}
          onFinish={handleToneFinish}
        />
      )}

      {funnelOpen && <InsightsFunnel onFinish={handleFunnelFinish} />}

      {waitlistOpen && (
        <WaitlistDialog
          onClose={() => patch({ waitlistOpen: false })}
          onSubmit={handleWaitlist}
          submitting={waitlistSubmitting}
          error={waitlistError}
          submitted={waitlistSubmitted}
        />
      )}
    </div>
  );
}
