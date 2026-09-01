import { describe, it, expect } from "vitest";
import { calculateTimeSaved, HOURS_SAVED_PER_POST, RECOMMENDED_POSTS_PER_WEEK } from "./timeSaved";

describe("calculateTimeSaved", () => {
  it("scales the default constants to week/month/year", () => {
    const result = calculateTimeSaved();
    const expectedHoursPerWeek = HOURS_SAVED_PER_POST * RECOMMENDED_POSTS_PER_WEEK;
    expect(result.hoursPerWeek).toBeCloseTo(expectedHoursPerWeek, 1);
    // Rounded to 1 decimal place, so allow the rounding step itself some room.
    expect(result.hoursPerMonth).toBeCloseTo(expectedHoursPerWeek * 4.33, 0);
    expect(result.hoursPerYear).toBeCloseTo(expectedHoursPerWeek * 52, 1);
  });

  it("matches the real product pitch at the recommended cadence: 3.3/week, ~14.4/month, 173.3/year", () => {
    const result = calculateTimeSaved();
    expect(result.hoursPerWeek).toBe(3.3);
    expect(result.hoursPerMonth).toBeCloseTo(14.4, 1);
    expect(result.hoursPerYear).toBe(173.3);
  });

  it("scales correctly with custom inputs", () => {
    const result = calculateTimeSaved(1, 7);
    expect(result.hoursPerWeek).toBe(7);
    expect(result.hoursPerYear).toBe(364);
  });
});
