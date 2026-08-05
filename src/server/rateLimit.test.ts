import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, _resetRateLimitForTests } from "./rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => _resetRateLimitForTests());

  it("allows the first few requests from an IP", () => {
    const now = 1_000_000;
    for (let i = 0; i < 15; i++) {
      expect(checkRateLimit("1.2.3.4", now).allowed).toBe(true);
    }
  });

  it("blocks once the per-IP window limit is exceeded", () => {
    const now = 1_000_000;
    for (let i = 0; i < 15; i++) {
      checkRateLimit("5.6.7.8", now);
    }
    const result = checkRateLimit("5.6.7.8", now);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const start = 1_000_000;
    for (let i = 0; i < 15; i++) {
      checkRateLimit("9.9.9.9", start);
    }
    expect(checkRateLimit("9.9.9.9", start).allowed).toBe(false);

    const later = start + 61 * 60 * 1000;
    expect(checkRateLimit("9.9.9.9", later).allowed).toBe(true);
  });

  it("tracks different IPs independently", () => {
    const now = 1_000_000;
    for (let i = 0; i < 15; i++) {
      checkRateLimit("1.1.1.1", now);
    }
    expect(checkRateLimit("1.1.1.1", now).allowed).toBe(false);
    expect(checkRateLimit("2.2.2.2", now).allowed).toBe(true);
  });
});
