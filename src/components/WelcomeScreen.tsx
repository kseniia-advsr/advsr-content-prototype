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
 * A one-time landing/welcome step shown before the tone-of-voice
 * questionnaire, gated the same way the questionnaire itself is (see
 * `welcomeOpen` in App.tsx's initialState) — it only changes what appears in
 * front of the existing flow, never the flow's own content or timings.
 */
export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-advsr-border bg-advsr-surface">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 text-center">
          {HERO_VIDEO_URL && (
            <div className="mx-auto mb-6 overflow-hidden rounded-xl border border-advsr-border">
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

          <h1 className="font-heading text-3xl font-bold text-advsr-text sm:text-4xl">
            We know why you're here.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-advsr-muted">
            Every deal you close deserves to be seen, and you shouldn't have to write it up five
            different ways to make that happen.
          </p>

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

          <p className="mt-6 text-sm font-medium text-advsr-text">Consider this your guardrails.</p>
          <p className="mt-1 text-sm text-advsr-muted">
            A place of comfort and a place to enable you to communicate freely.
          </p>
        </div>

        <div className="flex items-center justify-end border-t border-advsr-border px-6 py-4">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg bg-advsr-orange px-4 py-2 font-heading font-semibold text-black transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
