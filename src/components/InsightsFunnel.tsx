import { useState } from "react";
import { SingleSelectField } from "./fields/SingleSelectField";
import { InfluenceRings } from "./InfluenceRings";
import { Testimonials } from "./Testimonials";
import type { ToneField } from "../engine/toneProfile";
import { RECOMMENDED_POSTS_PER_WEEK, calculateTimeSaved } from "../lib/timeSaved";

/** Best-for line for each platform on the platform-breakdown step, in the same order they're offered in the platform-selection step below. */
const PLATFORM_BREAKDOWN: { name: string; bestFor: string }[] = [
  { name: "LinkedIn", bestFor: "Best for: market updates, career news, buyer and seller tips" },
  { name: "Instagram", bestFor: "Best for: property walkthroughs, listing reels, quick Stories" },
  { name: "Facebook", bestFor: "Best for: client success stories, local updates, easy shares" },
  { name: "YouTube / TikTok", bestFor: "Best for: quick vertical hooks and listing teasers, built to cross-post to TikTok, YouTube Shorts, and Reels" },
  { name: "X", bestFor: "Best for: quick market takes, quick thoughts" },
];

const FREQUENCY_FIELD: ToneField = {
  id: "posting_frequency",
  label: "How often do you think you should be posting?",
  type: "single",
  options: [
    "2-3 times a day",
    "Daily",
    "2-3 times a week",
    "Weekly",
    "A few times a month",
  ],
};

const PLATFORM_BELIEF_FIELD: ToneField = {
  id: "platform_belief",
  label: "Which single platform do you think matters most for you?",
  type: "single",
  options: ["LinkedIn", "Instagram", "Facebook", "YouTube / TikTok", "X", "Not sure"],
};

const RECOMMENDED_FREQUENCY_LABEL = `about ${RECOMMENDED_POSTS_PER_WEEK} times a week`;

type Step =
  | "frequency_before"
  | "frequency_interstitial"
  | "frequency_after"
  | "platform_belief_before"
  | "platform_insight"
  | "influence_scale"
  | "value_props";

const STEP_ORDER: Step[] = [
  "frequency_before",
  "frequency_interstitial",
  "frequency_after",
  "platform_belief_before",
  "platform_insight",
  "influence_scale",
  "value_props",
];

export type InsightsFunnelResult = {
  postingFrequencyBefore: string;
  postingFrequencyAfter: string;
  changedMindOnFrequency: boolean;
  platformBeliefBefore: string;
  platforms: string[];
  estimatedHourlyRate: number;
};

export function InsightsFunnel({ onFinish }: { onFinish: (result: InsightsFunnelResult) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  // Tracks the furthest step reached, independent of stepIndex, so clicking
  // an earlier progress segment (or Back) can revisit a step without ever
  // allowing a forward jump past what's actually been answered.
  const [maxReachedIndex, setMaxReachedIndex] = useState(0);
  const step = STEP_ORDER[stepIndex]!;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEP_ORDER.length - 1;

  const goNext = () => {
    setStepIndex((i) => {
      const next = Math.min(STEP_ORDER.length - 1, i + 1);
      setMaxReachedIndex((m) => Math.max(m, next));
      return next;
    });
  };
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const [frequencyBefore, setFrequencyBefore] = useState("");
  const [frequencyAfter, setFrequencyAfter] = useState("");
  const [platformBelief, setPlatformBelief] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState(75);

  const timeSaved = calculateTimeSaved();
  // The savings step's monthly figure intentionally assumes a round 5-week
  // month for the headline stat, not calculateTimeSaved's own hoursPerMonth
  // (which uses 4.33 weeks/month for ~21.7) — a cleaner number for this one
  // display.
  const monthlyHoursForSavings = timeSaved.hoursPerWeek * 5;
  const monthlySavings = hourlyRate * monthlyHoursForSavings;

  const finish = () => {
    onFinish({
      postingFrequencyBefore: frequencyBefore,
      postingFrequencyAfter: frequencyAfter,
      changedMindOnFrequency: frequencyBefore !== frequencyAfter,
      platformBeliefBefore: platformBelief,
      platforms,
      estimatedHourlyRate: hourlyRate,
    });
  };

  const togglePlatform = (name: string) => {
    setPlatforms((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));
  };

  const canContinue =
    step === "frequency_before"
      ? Boolean(frequencyBefore)
      : step === "frequency_after"
        ? Boolean(frequencyAfter)
        : step === "platform_belief_before"
          ? Boolean(platformBelief)
          : step === "platform_insight"
            ? platforms.length > 0
            : true;

  // frequency_interstitial and influence_scale are pure information with no
  // input to give, so "Continue" doesn't fit — "Got it" does. platform_insight
  // also displays information, but it doubles as platform selection (an
  // actual choice the advisor has to make, gated by canContinue), so it keeps
  // "Continue" like every other input step. The final step keeps "Let's create".
  const primaryLabel = isLast
    ? "Let's create"
    : step === "frequency_interstitial" || step === "influence_scale"
      ? "Got it"
      : "Continue";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-advsr-border bg-advsr-surface">
        <div className="border-b border-advsr-border px-6 py-4">
          <h2 className="font-heading text-xl font-semibold text-advsr-text">Before we start</h2>
          <p className="mt-1.5 text-sm text-advsr-muted">
            A few quick things, then we'll get to your content.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-6 pt-4">
          {STEP_ORDER.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => i <= maxReachedIndex && setStepIndex(i)}
              disabled={i > maxReachedIndex}
              aria-label={`Go to step ${i + 1}`}
              className={
                "h-1.5 flex-1 rounded-full transition-colors " +
                (i <= stepIndex ? "bg-advsr-orange " : "bg-advsr-border ") +
                (i > maxReachedIndex ? "cursor-not-allowed" : "")
              }
            />
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {step === "frequency_before" && (
            <>
              <h3 className="mb-1 font-heading text-lg font-semibold text-advsr-text">
                First, a quick gut check
              </h3>
              <p className="mb-5 text-sm text-advsr-muted">
                No wrong answer. We'll come back to this in a second.
              </p>
              <SingleSelectField field={FREQUENCY_FIELD} value={frequencyBefore} onChange={setFrequencyBefore} />
            </>
          )}

          {step === "frequency_interstitial" && (
            <>
              <h3 className="mb-4 font-heading text-lg font-semibold text-advsr-text">
                What the people who've built real audiences say
              </h3>
              <p className="mb-4 text-sm text-advsr-muted">Same tool, three different results.</p>
              <Testimonials />
              <p className="mt-5 text-sm text-advsr-muted">
                Our recommendation: {RECOMMENDED_FREQUENCY_LABEL}. That's 60 posts a week for the
                whole agency.
              </p>
            </>
          )}

          {step === "frequency_after" && (
            <>
              <h3 className="mb-1 font-heading text-lg font-semibold text-advsr-text">
                Knowing that
              </h3>
              <p className="mb-5 text-sm text-advsr-muted">How often will you aim to post?</p>
              <SingleSelectField field={FREQUENCY_FIELD} value={frequencyAfter} onChange={setFrequencyAfter} />
            </>
          )}

          {step === "platform_belief_before" && (
            <>
              <h3 className="mb-1 font-heading text-lg font-semibold text-advsr-text">
                Your priority platform
              </h3>
              <p className="mb-5 text-sm text-advsr-muted">Just your honest instinct, no research.</p>
              <SingleSelectField field={PLATFORM_BELIEF_FIELD} value={platformBelief} onChange={setPlatformBelief} />
            </>
          )}

          {step === "platform_insight" && (
            <>
              <h3 className="mb-1 font-heading text-lg font-semibold text-advsr-text">
                Here's what each platform is actually for
              </h3>
              <p className="mb-5 text-sm text-advsr-muted">
                A quick reality check. Pick the ones you'd like to post on regularly
              </p>
              {/* Selecting a platform here writes directly into the same
                  `platforms` array the tone-of-voice questionnaire's
                  "platforms" field would otherwise ask for, so ToneDialog.tsx
                  skips rendering that field to avoid asking twice. This step
                  used to be purely informational, with a separate step after
                  it for the actual selection — merged into one since reading
                  what a platform is for and picking it are the same decision. */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PLATFORM_BREAKDOWN.map((platform) => {
                  const selected = platforms.includes(platform.name);
                  return (
                    <button
                      key={platform.name}
                      type="button"
                      onClick={() => togglePlatform(platform.name)}
                      aria-pressed={selected}
                      className={
                        "rounded-xl border p-4 text-left transition-colors " +
                        (selected
                          ? "border-advsr-orange bg-advsr-orange/10"
                          : "border-advsr-border bg-advsr-bg hover:border-advsr-orange-2")
                      }
                    >
                      <p className="font-heading text-sm font-semibold text-advsr-text">
                        {platform.name}
                      </p>
                      <p className="mt-1 text-sm text-advsr-muted">{platform.bestFor}</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-advsr-muted">
                Most advisors run two or three that fit how they work.
              </p>
            </>
          )}

          {step === "influence_scale" && (
            <>
              <h3 className="mb-1 font-heading text-lg font-semibold text-advsr-text">
                Influence scales
              </h3>
              <p className="mb-5 text-sm text-advsr-muted">
                The algorithms changed. It's not about how many people are watching today. It's
                about how consistently you show up.
              </p>
              <div className="my-6">
                <InfluenceRings />
              </div>
              <p className="text-center text-sm font-semibold text-advsr-text">
                Ten people talking about you reaches a hundred. A hundred reaches thousands.
                <br />
                Growth compounds from there.
              </p>
            </>
          )}

          {step === "value_props" && (
            <>
              <h3 className="mb-4 font-heading text-lg font-semibold text-advsr-text">
                What this saves you
              </h3>
              <p className="text-sm leading-relaxed text-advsr-text">
                Every post you don't write by hand is an hour saved.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-advsr-border bg-advsr-bg p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-advsr-text">
                    {timeSaved.hoursPerWeek}
                  </p>
                  <p className="mt-1 text-xs text-advsr-muted">hrs / week</p>
                </div>
                <div className="rounded-xl border border-advsr-border bg-advsr-bg p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-advsr-orange">
                    {monthlyHoursForSavings}
                  </p>
                  <p className="mt-1 text-xs text-advsr-muted">hrs / month</p>
                </div>
                <div className="rounded-xl border border-advsr-border bg-advsr-bg p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-advsr-text">
                    {timeSaved.hoursPerYear}
                  </p>
                  <p className="mt-1 text-xs text-advsr-muted">hrs / year</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-advsr-border bg-advsr-bg p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-advsr-muted">
                  Put a number on it
                </p>
                <p className="mt-2 text-sm font-semibold text-advsr-text">
                  What does an hour of marketing cost you?
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="range"
                    min={20}
                    max={300}
                    step={5}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    aria-label="What does an hour of marketing cost you?"
                    className="h-1.5 flex-1 accent-advsr-orange"
                  />
                  <span className="font-heading text-sm font-semibold text-advsr-orange">
                    ${hourlyRate}
                  </span>
                </div>
                <p className="mt-4 font-heading text-lg font-semibold text-advsr-text">
                  That's{" "}
                  <span className="text-advsr-orange">${monthlySavings.toLocaleString("en-US")}</span>{" "}
                  back this month.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-advsr-border px-6 py-4">
          {isFirst ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg px-3 py-2 text-sm text-advsr-muted transition-colors hover:text-advsr-text"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={isLast ? finish : goNext}
            disabled={!canContinue}
            className="rounded-lg bg-advsr-orange px-4 py-2 font-heading font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
