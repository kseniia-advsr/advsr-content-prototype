import { calculateTimeSaved } from "../lib/timeSaved";

/** Landing heading shown only before the visitor has submitted a topic. */
export function Hero() {
  const { hoursPerWeek } = calculateTimeSaved();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="font-heading text-3xl font-bold text-advsr-text sm:text-4xl">
        <span className="block">Content for every platform,</span>
        <span className="block">in one prompt.</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-advsr-muted">
        <span className="block">One thought becomes 5 social media posts.</span>
        <span className="block">No marketing team and up to {hoursPerWeek} hours saved weekly.</span>
      </p>
    </div>
  );
}
