import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateHandler } from "./generateHandler";
import { _resetRateLimitForTests } from "./rateLimit";

describe("generateHandler", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    _resetRateLimitForTests();
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    if (originalKey) process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it("rejects a missing topic before touching the API key", async () => {
    const result = await generateHandler({}, "10.0.0.1");
    expect(result.statusCode).toBe(400);
    expect(result.body.error).toMatch(/topic is required/i);
  });

  it("rejects a topic over the length ceiling", async () => {
    const result = await generateHandler({ topic: "x".repeat(2001) }, "10.0.0.2");
    expect(result.statusCode).toBe(400);
  });

  it("fails clearly when ANTHROPIC_API_KEY is not configured", async () => {
    const result = await generateHandler({ topic: "Market update for Miami" }, "10.0.0.3");
    expect(result.statusCode).toBe(500);
    expect(result.body.error).toMatch(/not configured/i);
  });

  it("rate-limits repeated requests from the same IP", async () => {
    const ip = "10.0.0.4";
    await generateHandler({ topic: "a" }, ip);
    await generateHandler({ topic: "a" }, ip);
    await generateHandler({ topic: "a" }, ip);
    const fourth = await generateHandler({ topic: "a" }, ip);
    expect(fourth.statusCode).toBe(429);
  });
});
