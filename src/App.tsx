import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ToneDialog } from "./components/ToneDialog";
import { InsightsFunnel, type InsightsFunnelResult } from "./components/InsightsFunnel";
import { Hero } from "./components/Hero";
import { ChatComposer, type ComposerMode } from "./components/ChatComposer";
import { ChatTranscript, type ChatMessage } from "./components/ChatTranscript";
import { WaitlistDialog, type WaitlistSubmission } from "./components/WaitlistDialog";
import type { ToneResponses } from "./engine/toneProfile";
import { PLATFORM_CONTENT_TYPES, type ContentTypeId } from "./engine/contentTypes";
import type {
  CaptureFields,
  ClarifyingQa,
  GenerateResponseBody,
  WaitlistResponseBody,
} from "./lib/types";

const FUNNEL_DELAY_MS = 7000;

const initialState = () => ({
  // A one-time landing step shown before the tone dialog even opens. Purely
  // an added cover in front of the existing flow — toneOpen is still true
  // from the very start, it just doesn't render until this closes, so
  // nothing about the tone dialog's own content or timing changes.
  welcomeOpen: true,
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
  // True only when the waitlist was opened via the "Full Suite" teaser
  // (dropdown or picker) rather than earned by finishing the demo — that's
  // the one instance the visitor can dismiss without submitting.
  waitlistDismissable: false,
  waitlistSubmitted: false,
  clarifyingQa: [] as ClarifyingQa[],
  contentFeedback: null as "GOOD" | "BAD" | null,
  // The topic + content type the advisor originally submitted, held onto so
  // each clarifying-answer round-trip, and each subsequent platform pick,
  // can re-send the same topic.
  pendingTopic: "",
  pendingContentType: PLATFORM_CONTENT_TYPES[0]!.id as ContentTypeId,
  // Platforms not yet generated for this topic — starts full, one comes off
  // each time a generation for it lands. Once empty, the demo is done.
  remainingPlatformIds: PLATFORM_CONTENT_TYPES.map((p) => p.id) as ContentTypeId[],
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
    welcomeOpen,
    toneOpen,
    toneResponses,
    toneSectionIndex,
    funnelOpen,
    funnelPending,
    messages,
    isLoading,
    generateError,
    waitlistOpen,
    waitlistDismissable,
    waitlistSubmitted,
    clarifyingQa,
    contentFeedback,
    pendingTopic,
    pendingContentType,
    remainingPlatformIds,
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

  // Closes the new landing step only — toneOpen is already true underneath
  // (set in initialState, never touched here), so the tone dialog appears
  // exactly as it always did, just one step later than before.
  const handleWelcomeContinue = () => patch({ welcomeOpen: false });

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

  // Holds the exact args of the most recent runGenerate call so the error
  // banner's reload button can replay it verbatim — whether that was
  // sending a topic, answering a clarifying question, or picking another
  // platform — without needing to know which of those it was.
  const lastGenerateArgsRef = useRef<{
    topic: string;
    contentType: ContentTypeId;
    qa: ClarifyingQa[];
    alreadyValidated: boolean;
  } | null>(null);

  const runGenerate = async (
    topic: string,
    contentType: ContentTypeId,
    qa: ClarifyingQa[],
    alreadyValidated = false
  ) => {
    lastGenerateArgsRef.current = { topic, contentType, qa, alreadyValidated };
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
          alreadyValidated,
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
      const platformLabel = PLATFORM_CONTENT_TYPES.find((p) => p.id === contentType)?.label;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, { role: "assistant", kind: "content", content: data.output, platformLabel }],
        remainingPlatformIds: prev.remainingPlatformIds.filter((id) => id !== contentType),
      }));
      void capture(sessionId, { clarifyingQa: qa, generatedOutput: data.output });
    } catch {
      patch({ isLoading: false, generateError: "Could not reach the content engine. Please try again." });
    }
  };

  // Reported behavior: a timed-out generation often succeeds outright on a
  // second attempt, so the error banner's reload button just replays the
  // exact same call rather than making the visitor retype a prompt or
  // re-click a platform.
  const retryLastGenerate = () => {
    const last = lastGenerateArgsRef.current;
    if (!last) return;
    void runGenerate(last.topic, last.contentType, last.qa, last.alreadyValidated);
  };

  const lastMessage = messages[messages.length - 1];
  const awaitingAnswer = lastMessage?.role === "assistant" && lastMessage.kind === "question";
  const hasContent = messages.some((m) => m.role === "assistant" && m.kind === "content");
  const composerMode: ComposerMode = awaitingAnswer
    ? "answer"
    : !hasContent
      ? "topic"
      : remainingPlatformIds.length > 0
        ? "picking"
        : "done";

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

  // Picking another platform from the "picking" mode picker re-sends the
  // same original topic, already proven workable by the first generation —
  // alreadyValidated skips the clarify-turn call entirely for this request.
  const handlePickPlatform = (contentType: ContentTypeId) => {
    patch({ pendingContentType: contentType });
    void runGenerate(pendingTopic, contentType, [], true);
  };

  // "Full Suite" never generates (that single combined call is exactly what
  // risks the serverless timeout) — it's a teaser that opens the waitlist
  // instead, dismissable since the visitor hasn't actually earned/finished
  // the demo by clicking it.
  const handleFullSuiteRequested = () => {
    patch({ waitlistOpen: true, waitlistDismissable: true });
  };

  // The Sidebar's persistent "Get full access" shortcut — same dismissable
  // teaser behavior as "Full Suite" (the visitor hasn't earned/finished the
  // demo by clicking it either), just reachable at any time rather than
  // waiting for a specific trigger.
  const handleGetFullAccessRequested = () => {
    patch({ waitlistOpen: true, waitlistDismissable: true });
  };

  const handleFeedback = (value: "GOOD" | "BAD") => {
    patch({ contentFeedback: value });
    void capture(sessionId, { contentFeedback: value });
  };

  const lastAssistantOutput =
    [...messages].reverse().find((m) => m.role === "assistant" && m.kind === "content")?.content ?? "";

  // Auto-open the waitlist dialog a flat 30s after the generation lands,
  // regardless of what the visitor does in the meantime. Only arms once
  // actual content has landed — the tone-of-voice questionnaire, the
  // insights funnel, and any clarifying follow-up questions must never
  // trigger it, only the generated piece.
  useEffect(() => {
    if (!hasContent || waitlistOpen || waitlistSubmitted) return;
    const id = window.setTimeout(() => patch({ waitlistOpen: true, waitlistDismissable: false }), 30_000);
    return () => window.clearTimeout(id);
  }, [hasContent, waitlistOpen, waitlistSubmitted]);

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

  // Deliberately leaves waitlistSubmitted untouched: once actually submitted
  // it stays true for the rest of the session, so every later trigger (the
  // 30s auto-prompt, "Get Full Access", a second "Full Suite" click) shows
  // the "You're on the list" confirmation instead of the blank form again.
  // Only a dismiss *before* submitting leaves it false, so that case still
  // gets the real form back the next time the dialog opens.
  const handleWaitlistClose = () => {
    patch({ waitlistOpen: false });
    setWaitlistError(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-advsr-bg">
      <Sidebar
        onNewContent={resetSession}
        onGetFullAccess={handleGetFullAccessRequested}
        newContentDisabled={funnelPending}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Styled to blend in rather than alarm — most of these are a
            transient timeout that succeeds outright on the exact same retry,
            not a real failure, so it reads as a normal picker-style box
            with a reload action rather than a red warning. */}
        {generateError && (
          <div className="mx-auto w-full max-w-2xl px-6 pt-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-advsr-border bg-advsr-surface px-4 py-3 shadow-lg">
              <p className="text-sm text-advsr-muted">{generateError}</p>
              <button
                type="button"
                onClick={retryLastGenerate}
                aria-label="Try again"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-advsr-border text-advsr-muted transition-colors hover:border-advsr-orange-2 hover:text-advsr-text"
              >
                ↻
              </button>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <Hero />
          ) : (
            <ChatTranscript
              messages={messages}
              // While picking mode is up, the loading state now shows on the
              // platform pill itself (right where the visitor just clicked)
              // instead of duplicating here — this transcript spinner is for
              // the first-ever generation and clarifying answers, where no
              // picker exists yet to carry it.
              isLoading={isLoading && composerMode !== "picking"}
              contentFeedback={contentFeedback}
              onFeedback={handleFeedback}
            />
          )}
        </div>

        {/* Persistent bottom slot: composer before the first topic and
            through the clarifying-question exchange, then a platform picker
            once at least one platform has generated, then a Get Full Access
            button once every platform has. Locked once the insights funnel
            modal is actually open (it covers the screen anyway) but stays
            usable during the 7s funnelPending wait that precedes it — that
            wait no longer needs to lock the composer now that funnelOpen is
            the thing guarding against overlap. */}
        <ChatComposer
          mode={composerMode}
          onSubmit={handleComposerSubmit}
          onFullSuiteRequested={handleFullSuiteRequested}
          onPickPlatform={handlePickPlatform}
          remainingPlatforms={PLATFORM_CONTENT_TYPES.filter((p) => remainingPlatformIds.includes(p.id))}
          onGetFullAccess={() => patch({ waitlistOpen: true, waitlistDismissable: false })}
          disabled={isLoading || funnelOpen}
          generatingContentTypeId={isLoading ? pendingContentType : null}
        />
      </div>

      {welcomeOpen && <WelcomeScreen onContinue={handleWelcomeContinue} />}

      {!welcomeOpen && toneOpen && (
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
          onClose={handleWaitlistClose}
          onSubmit={handleWaitlist}
          submitting={waitlistSubmitting}
          error={waitlistError}
          submitted={waitlistSubmitted}
          dismissableBeforeSubmit={waitlistDismissable}
        />
      )}
    </div>
  );
}
