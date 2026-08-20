/**
 * Public Supabase Storage URL for the hero intro video. Re-wrapped from the
 * originally uploaded .mov (video/quicktime, unreliable outside Safari) to
 * MP4 via `ffmpeg -c copy` (stream copy, no re-encode, no quality loss) plus
 * `-movflags +faststart` so playback can start before the whole file
 * downloads, then uploaded as a new file in the same bucket rather than
 * overwriting the original. Source has no audio track, confirming the
 * muted/decorative treatment below rather than needing playback controls.
 */
const HERO_VIDEO_URL =
  "https://mhiwonnhxlwvwelwyvgn.supabase.co/storage/v1/object/public/welcome_video/hero-demo.mp4";

/** The same recurring blocker, heard from 100 advisors, in their own words. */
const BLOCKERS: string[] = ["Not enough time", "Not sure what to say", "Fear of judgement"];

type Quote = { name: string; quote: string; headshot: string };

/**
 * Real, verbatim quotes about content as the actual asset, not paraphrased.
 * Same headshot-plus-quote treatment as Testimonials.tsx (the insights
 * funnel's interstitial), kept separate rather than shared since this one
 * has no highlight-substring logic and different people entirely.
 */
const QUOTES: Quote[] = [
  {
    name: "Bill Gates",
    quote: "Content is where I expect most of the real money to be made on the internet.",
    headshot: "/bill-gates.jpg",
  },
  {
    name: "Seth Godin",
    quote: "Marketing is no longer about stuff that you make. It's about stories that you tell.",
    headshot: "/seth-godin.jpg",
  },
];

/**
 * A one-time, full-screen landing/welcome step shown before the tone-of-voice
 * questionnaire, gated the same way the questionnaire itself is (see
 * `welcomeOpen` in App.tsx's initialState) — it only changes what appears in
 * front of the existing flow, never the flow's own content or timings.
 *
 * A true full-screen takeover rather than the centered-modal-card pattern
 * every other step in this app uses (ToneDialog, InsightsFunnel,
 * WaitlistDialog) — deliberately different at the advisor's request. Two
 * columns at lg+ (text on the left, video/quotes/button on the right, sized
 * to fit one laptop-height viewport with no scroll), collapsing to a single
 * scrollable column below that, since a two-column split makes no sense on
 * a narrow screen.
 */
export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-advsr-bg">
      <div className="flex items-center gap-3 px-8 py-5">
        <img src="/logo.png" alt="ADVSR" className="h-8 w-auto" />
        <span className="font-heading text-2xl font-bold text-advsr-text">Content Engine</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-8 lg:overflow-hidden">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* Left: the pitch */}
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-3xl font-bold text-advsr-text sm:text-4xl">
              We know why you're here.
            </h1>
            <p className="text-base leading-relaxed text-advsr-muted">
              You <strong className="font-semibold text-advsr-text">want</strong> to post online.
              You're just short on time, and nervous about what to say.
            </p>

            <div className="border-t border-advsr-border" />

            <p className="text-base leading-relaxed text-advsr-text">
              We asked 100 real estate advisors what gets in the way, and got the same answer
              again and again.
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {BLOCKERS.map((blocker) => (
                <span
                  key={blocker}
                  className="rounded-full border border-advsr-border bg-advsr-surface px-4 py-2 text-sm text-advsr-text"
                >
                  {blocker}
                </span>
              ))}
            </div>

            <p className="text-lg font-bold text-advsr-text">
              Consider this tool your guardrails; a place to communicate freely and comfortably
              online.
            </p>
          </div>

          {/* Right: proof — the video, the quotes, then the way in */}
          <div className="flex flex-col gap-4">
            {HERO_VIDEO_URL && (
              <div className="overflow-hidden rounded-xl border border-advsr-border">
                <video
                  src={HERO_VIDEO_URL}
                  aria-hidden="true"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full"
                />
              </div>
            )}

            <div className="rounded-xl bg-black p-4 text-left">
              {QUOTES.map((q, i) => (
                <div
                  key={q.name}
                  className={
                    "flex gap-4 py-4 first:pt-0 last:pb-0 " +
                    (i < QUOTES.length - 1 ? "border-b border-advsr-border" : "")
                  }
                >
                  <img
                    src={q.headshot}
                    alt={q.name}
                    className="size-14 shrink-0 rounded-full border-2 border-advsr-orange object-cover"
                  />
                  <div className="min-w-0 flex-1 self-center">
                    <p className="text-sm font-semibold text-white">{q.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white">"{q.quote}"</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={onContinue}
                className="rounded-lg bg-advsr-orange px-6 py-3 font-heading font-semibold text-black transition-opacity hover:opacity-90"
              >
                About you
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
