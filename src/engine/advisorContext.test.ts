import { describe, it, expect } from "vitest";
import { buildAdvisorContext } from "./advisorContext";
import { TONE_SECTIONS, type ToneResponses } from "./toneProfile";

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

  it("adds a SPELLING directive for American English and never lists it as a generic bullet", () => {
    const context = buildAdvisorContext({ english_variant: "American English" });
    expect(context).toContain("SPELLING");
    expect(context).toContain("American English spelling");
    expect(context).not.toContain("English for your content");
  });

  it("adds a SPELLING directive for British English", () => {
    const context = buildAdvisorContext({ english_variant: "British English" });
    expect(context).toContain("British English spelling");
  });

  it("adds no SPELLING directive when the advisor doesn't mind", () => {
    const context = buildAdvisorContext({ english_variant: "Don't mind" });
    expect(context).not.toContain("SPELLING");
  });

  it("feeds every single field in the questionnaire schema into the system prompt when answered — regression guard so the model actually writes with the sign-off, guardrails, specialism etc every time", () => {
    const responses: ToneResponses = {};
    for (const section of TONE_SECTIONS) {
      for (const field of section.fields) {
        if (field.id === "english_variant") {
          responses[field.id] = "American English";
          continue;
        }
        switch (field.type) {
          case "multi":
          case "location":
            responses[field.id] = [`${field.id}-answer`];
            break;
          case "rating10":
            responses[field.id] = 7;
            break;
          case "channels":
            responses[field.id] = { Email: 4 };
            break;
          default:
            responses[field.id] = `${field.id}-answer`;
        }
      }
    }

    const context = buildAdvisorContext(responses);

    for (const section of TONE_SECTIONS) {
      for (const field of section.fields) {
        // english_variant is deliberately excluded from the generic bullet
        // list — it becomes its own hard SPELLING instruction instead (see
        // the dedicated tests above), so it's checked separately here.
        if (field.id === "english_variant") {
          expect(context, "english_variant should drive the SPELLING directive").toContain("SPELLING");
          continue;
        }
        expect(context, `missing label for field "${field.id}" (section "${section.id}")`).toContain(
          field.label
        );
        if (field.type === "rating10") {
          expect(context, `missing rating value for field "${field.id}"`).toContain("7/10");
        } else if (field.type === "channels") {
          expect(context, `missing channel rating for field "${field.id}"`).toContain("Email (4/5)");
        } else {
          expect(context, `missing answer text for field "${field.id}"`).toContain(`${field.id}-answer`);
        }
      }
    }
  });
});
