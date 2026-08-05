import { describe, it, expect } from "vitest";
import { buildToneColumns } from "./toneColumns";
import { TONE_SECTIONS, type ToneResponses } from "../engine/toneProfile";

/** A synthetic answer for every field in the schema, regardless of type. */
function synthesizeFullResponses(): ToneResponses {
  const responses: ToneResponses = {};
  for (const section of TONE_SECTIONS) {
    for (const field of section.fields) {
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
          // "single" and "text"
          responses[field.id] = `${field.id}-answer`;
      }
    }
  }
  return responses;
}

describe("buildToneColumns", () => {
  it("returns null for every column when there are no responses", () => {
    const columns = buildToneColumns(null);
    expect(Object.values(columns).every((v) => v === null)).toBe(true);
  });

  it("gives every single field in the questionnaire schema its own non-null column when answered — regression guard against schema drift", () => {
    const columns = buildToneColumns(synthesizeFullResponses());

    for (const section of TONE_SECTIONS) {
      for (const field of section.fields) {
        // `visibility` is intentionally stored under `visibility_level` to
        // avoid colliding with this table's row-visibility-ish naming.
        const columnKey = field.id === "visibility" ? "visibility_level" : field.id;
        expect(columns, `missing/null column for "${field.id}" (section "${section.id}")`).toHaveProperty(
          columnKey
        );
        expect(columns[columnKey], `column "${columnKey}" for field "${field.id}" is null`).not.toBeNull();
      }
    }
  });

  it("stores channel_personality as a {channel: rating} object, not flattened", () => {
    const columns = buildToneColumns({ channel_personality: { Email: 4, LinkedIn: 2, WhatsApp: 0 } });
    // A 0 rating means "not rated" per the UI (ChannelRatingField only ever
    // sets a rating of 1-5), so it's dropped rather than stored as a zero.
    expect(columns.channel_personality).toEqual({ Email: 4, LinkedIn: 2 });
  });

  it("stores rating10 fields as numbers, not text", () => {
    const columns = buildToneColumns({ trust: 9 });
    expect(columns.trust).toBe(9);
  });
});
