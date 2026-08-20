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
 * WaitlistDialog) — deliberately different at the advisor's request, so it
 * has its own solid background rather than a dimmed backdrop over a card.
 */
export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-advsr-bg">
      <div className="flex items-center gap-3 px-8 py-6">
        <img src="/logo.png" alt="ADVSR" className="h-9 w-auto" />
        <span className="font-heading text-2xl font-bold text-advsr-text">Content Engine</span>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-12">
        <h1 className="text-center font-heading text-3xl font-bold text-advsr-text sm:text-4xl">
          We know why you're here.
        </h1>
        <p className="mt-4 text-left text-base leading-relaxed text-advsr-muted">
          Most real estate advisors want to post online. They're just short on time, and nervous
          about what to say.
        </p>

        {HERO_VIDEO_URL && (
          <div className="mt-6 overflow-hidden rounded-xl border border-advsr-border">
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

        <p className="mt-6 text-left text-base leading-relaxed text-advsr-text">
          We asked 100 of them what gets in the way, and got the same answer again and again.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {BLOCKERS.map((blocker) => (
            <span
              key={blocker}
              className="rounded-full border border-advsr-border bg-advsr-surface px-4 py-2 text-sm text-advsr-text"
            >
              {blocker}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-black p-4 text-left">
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

        <p className="mt-6 text-left text-sm text-advsr-muted">
          Consider this tool your guardrails; a place to communicate freely and comfortably
          online.
        </p>

        <div className="mt-8 flex justify-center">
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
  );
}
