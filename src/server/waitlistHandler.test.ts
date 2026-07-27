import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { waitlistHandler } from "./waitlistHandler";
import { _resetSupabaseClientForTests } from "./supabaseClient";

describe("waitlistHandler", () => {
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

  it("rejects a missing name", async () => {
    const result = await waitlistHandler({ email: "a@b.com" });
    expect(result.statusCode).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const result = await waitlistHandler({ name: "Jordan", email: "not-an-email" });
    expect(result.statusCode).toBe(400);
  });

  it("fails clearly when Supabase is not configured", async () => {
    const result = await waitlistHandler({ name: "Jordan", email: "jordan@example.com" });
    expect(result.statusCode).toBe(500);
    expect(result.body.error).toMatch(/not configured/i);
  });
});
