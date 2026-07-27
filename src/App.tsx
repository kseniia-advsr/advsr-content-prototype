import { useCallback, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ToneDialog } from "./components/ToneDialog";
import { ChatComposer } from "./components/ChatComposer";
import { ChatTranscript, type ChatMessage } from "./components/ChatTranscript";
import { WaitlistDialog, type WaitlistSubmission } from "./components/WaitlistDialog";
import { useIdleOrScrollGate } from "./lib/useIdleOrScrollGate";
import type { ToneResponses } from "./engine/toneProfile";
import type { ContentTypeId } from "./engine/contentTypes";
import type { GenerateResponseBody, WaitlistResponseBody } from "./lib/types";

const initialState = () => ({
  toneOpen: true,
  toneResponses: {} as ToneResponses,
  toneSectionIndex: 0,
  messages: [] as ChatMessage[],
  isLoading: false,
  generateError: null as string | null,
  waitlistOpen: false,
  waitlistSubmitted: false,
});

export default function App() {
  const [state, setState] = useState(initialState);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);

  const {
    toneOpen,
    toneResponses,
    toneSectionIndex,
    messages,
    isLoading,
    generateError,
    waitlistOpen,
    waitlistSubmitted,
  } = state;

  const patch = (next: Partial<ReturnType<typeof initialState>>) =>
    setState((prev) => ({ ...prev, ...next }));

  const resetSession = () => {
    setState(initialState());
    setWaitlistError(null);
    setWaitlistSubmitting(false);
  };

  const handleGenerate = async (topic: string, contentType: ContentTypeId) => {
    patch({
      messages: [...messages, { role: "user", content: topic }],
      isLoading: true,
      generateError: null,
    });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, contentType, toneResponses, platforms: toneResponses["platforms"] }),
      });
      const data = (await res.json()) as GenerateResponseBody;
      if (!res.ok || "error" in data) {
        patch({
          isLoading: false,
          generateError: "error" in data ? data.error : "Something went wrong.",
          messages,
        });
        return;
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, { role: "assistant", content: data.output }],
      }));
    } catch {
      patch({
        isLoading: false,
        generateError: "Could not reach the content engine. Please try again.",
        messages,
      });
    }
  };

  const lastAssistantOutput =
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";

  // Auto-open the waitlist dialog once the reader has scrolled the response
  // to the bottom, or after 90s of no scroll/mouse/keyboard activity —
  // whichever comes first. Only arms after the one premium generation lands.
  const gate = useCallback(() => patch({ waitlistOpen: true }), []);
  const hasAssistantReply = messages.some((m) => m.role === "assistant");
  useIdleOrScrollGate(hasAssistantReply && !waitlistOpen && !waitlistSubmitted, gate, 90000);

  const handleWaitlist = async (wl: WaitlistSubmission) => {
    setWaitlistSubmitting(true);
    setWaitlistError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${wl.firstName} ${wl.lastName}`.trim(),
          email: wl.email,
          company: wl.company || undefined,
          market: wl.country || undefined,
          expectedPrice: wl.expectedPrice || undefined,
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
      <Sidebar onNewContent={resetSession} onGetFullAccess={() => patch({ waitlistOpen: true })} />

      <div className="flex min-w-0 flex-1 flex-col">
        {generateError && (
          <p className="mx-auto w-full max-w-2xl px-6 pt-4 text-sm text-red-400">
            {generateError}
          </p>
        )}
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto py-10">
            <ChatComposer onSubmit={handleGenerate} disabled={isLoading} />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ChatTranscript messages={messages} isLoading={isLoading} />
          </div>
        )}
      </div>

      {toneOpen && (
        <ToneDialog
          responses={toneResponses}
          onChange={(next) => patch({ toneResponses: next })}
          sectionIndex={toneSectionIndex}
          onSectionIndexChange={(next) => patch({ toneSectionIndex: next })}
          onFinish={() => patch({ toneOpen: false })}
        />
      )}

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
