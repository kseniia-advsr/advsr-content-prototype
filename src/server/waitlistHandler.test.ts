import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { waitlistHandler, buildToneColumns } from "./waitlistHandler";
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

describe("buildToneColumns", () => {
  it("returns null for every column when there are no responses", () => {
    const columns = buildToneColumns(null);
    expect(columns.style).toBeNull();
    expect(columns.archetype).toBeNull();
    expect(columns.visibility_level).toBeNull();
  });

  it("maps array fields to string arrays and drops non-string/empty entries", () => {
    const columns = buildToneColumns({
      style: ["Direct", "Consultative", ""],
      known_for: [],
      location: ["ES::Marbella"],
    });
    expect(columns.style).toEqual(["Direct", "Consultative"]);
    expect(columns.known_for).toBeNull();
    expect(columns.location).toEqual(["ES::Marbella"]);
  });

  it("maps text fields and trims them", () => {
    const columns = buildToneColumns({
      archetype: "Market Expert",
      display_name: "  Alex Whitfield  ",
    });
    expect(columns.archetype).toBe("Market Expert");
    expect(columns.display_name).toBe("Alex Whitfield");
  });

  it("maps the `visibility` response field to the `visibility_level` column", () => {
    const columns = buildToneColumns({ visibility: "Industry Visible" });
    expect(columns.visibility_level).toBe("Industry Visible");
    expect(columns.visibility).toBeUndefined();
  });
});
