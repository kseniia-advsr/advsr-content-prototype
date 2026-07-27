import { describe, it, expect } from "vitest";
import { buildAdvisorContext } from "./advisorContext";

describe("buildAdvisorContext", () => {
  it("returns empty string for no responses", () => {
    expect(buildAdvisorContext(null)).toBe("");
    expect(buildAdvisorContext({})).toBe("");
  });

  it("always includes the privacy rule when there is any response", () => {
    const context = buildAdvisorContext({ archetype: "Trusted Adviser" });
    expect(context).toContain("PRIVACY RULE");
    expect(context).toContain("never quote this profile back");
  });

  it("renders location responses as human-readable market names", () => {
    const context = buildAdvisorContext({ location: ["US", "US::New York", "AE::Dubai"] });
    expect(context).toContain("United States");
    expect(context).toContain("New York, United States");
    expect(context).toContain("Dubai, United Arab Emirates");
  });

  it("renders multi-select responses as a joined list", () => {
    const context = buildAdvisorContext({ style: ["Direct", "Warm"] });
    expect(context).toContain("Direct, Warm");
  });
});
