/**
 * Simple in-memory per-IP rate limit for the public, no-auth generate
 * endpoint. Best-effort only: Netlify Functions are stateless between cold
 * starts, so this resets whenever a fresh function instance spins up. That's
 * an accepted tradeoff for the prototype (see build spec, "LLM call") — the
 * goal is to blunt casual abuse, not to be airtight.
 */
const WINDOW_MS = 60 * 60 * 1000;
// One visitor working through every platform (LinkedIn, Instagram, Facebook,
// YouTube / TikTok, X) fires a separate /api/generate call per platform pick
// rather than one combined call, and the retry-on-error button adds another
// call per timeout instead of silently reusing the failed one — so the cap
// needs headroom for a full run plus several retries, not just one generation.
const MAX_PER_WINDOW = 15;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  now: number = Date.now()
): { allowed: boolean; retryAfterSeconds: number } {
  const key = ip || "unknown";
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= MAX_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test-only: clear all buckets between test cases. */
export function _resetRateLimitForTests(): void {
  buckets.clear();
}
