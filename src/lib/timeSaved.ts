/**
 * Hours given back per post the advisor no longer has to write by hand. This
 * is the real product pitch (an hour back per post), not a smaller unrelated
 * assumption. Named constant so it's easy to tune later without hunting
 * through prose.
 */
export const HOURS_SAVED_PER_POST = 1;

/**
 * Recommended posting cadence, in posts per week. Used both for the "actual
 * recommended frequency" stated after the daily-posting interstitial, and to
 * scale the time-saved calculation to a realistic week.
 */
export const RECOMMENDED_POSTS_PER_WEEK = 5;

export type TimeSaved = {
  hoursPerWeek: number;
  hoursPerMonth: number;
  hoursPerYear: number;
};

const WEEKS_PER_MONTH = 4.33;
const WEEKS_PER_YEAR = 52;

/** Scales a per-post time saving to week/month/year, rounded to one decimal place. */
export function calculateTimeSaved(
  hoursPerPost: number = HOURS_SAVED_PER_POST,
  postsPerWeek: number = RECOMMENDED_POSTS_PER_WEEK
): TimeSaved {
  const hoursPerWeek = hoursPerPost * postsPerWeek;
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    hoursPerWeek: round(hoursPerWeek),
    hoursPerMonth: round(hoursPerWeek * WEEKS_PER_MONTH),
    hoursPerYear: round(hoursPerWeek * WEEKS_PER_YEAR),
  };
}
