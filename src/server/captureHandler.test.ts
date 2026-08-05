import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { captureHandler } from "./captureHandler";
import { _resetSupabaseClientForTests } from "./supabaseClient";

describe("captureHandler", () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    _resetSupabaseClientForTests();
  });

  afterEach(() => {
    if (originalUrl) process.env.SUPABASE_URL = originalUrl;
    if (originalKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    _resetSupabaseClientForTests();
  });

  it("rejects a missing session id", async () => {
    const result = await captureHandler({ fields: { postingFrequencyBefore: "Daily" } });
    expect(result.statusCode).toBe(400);
    expect(result.body.error).toMatch(/session id/i);
  });

  it("rejects an empty fields object", async () => {
    const result = await captureHandler({ sessionId: "abc123", fields: {} });
    expect(result.statusCode).toBe(400);
    expect(result.body.error).toMatch(/no fields/i);
  });

  it("rejects a contentFeedback value that isn't GOOD or BAD", async () => {
    const result = await captureHandler({
      sessionId: "abc123",
      fields: { contentFeedback: "meh" },
    });
    expect(result.statusCode).toBe(400);
    expect(result.body.error).toMatch(/GOOD or BAD/i);
  });

  it("fails clearly when Supabase is not configured", async () => {
    const result = await captureHandler({
      sessionId: "abc123",
      fields: { postingFrequencyBefore: "Daily" },
    });
    expect(result.statusCode).toBe(500);
    expect(result.body.error).toMatch(/not configured/i);
  });

  it("accepts estimatedHourlyRate as its own field, not just an empty-fields no-op", async () => {
    const result = await captureHandler({
      sessionId: "abc123",
      fields: { estimatedHourlyRate: 75 },
    });
    // Supabase isn't configured in tests either, but this proves the field
    // was recognized (reached the storage call) rather than being silently
    // dropped and hitting the "no fields to save" 400 instead.
    expect(result.statusCode).toBe(500);
    expect(result.body.error).toMatch(/not configured/i);
  });
});
