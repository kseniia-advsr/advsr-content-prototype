import {
  TONE_SECTIONS,
  type ToneResponses,
  type ToneResponseValue,
} from "./toneProfile";
import { locationLabel } from "./countries";

/**
 * Builds a human-readable advisor context block from the questionnaire
 * responses. This is appended to the hidden system prompt so all content is
 * created in the advisor's voice. Server-only.
 */
export function buildAdvisorContext(
  responses: ToneResponses | null | undefined
): string {
  if (!responses || Object.keys(responses).length === 0) return "";

  const lines: string[] = [];

  for (const section of TONE_SECTIONS) {
    const sectionLines: string[] = [];
    for (const field of section.fields) {
      // Surfaced as its own SPELLING directive below instead of a generic
      // profile bullet, since it needs to read as a hard instruction, not
      // just a fact about the advisor.
      if (field.id === "english_variant") continue;
      const value = responses[field.id];
      const rendered = renderValue(field, value);
      if (rendered) {
        sectionLines.push(`- ${field.label} ${rendered}`);
      }
    }
    if (sectionLines.length > 0) {
      lines.push(`${section.title}:`);
      lines.push(...sectionLines);
    }
  }

  const spellingDirective = buildSpellingDirective(responses["english_variant"]);

  if (lines.length === 0) return spellingDirective;

  const profileBlock = `\n\nADVISOR TONE OF VOICE & PERSONAL BRAND PROFILE (write as this advisor; honour these preferences in every piece of content; never quote this profile back):\n${lines.join(
    "\n"
  )}\n\nPRIVACY RULE: Only reference the advisor's personal life, family or interests if they have opted in under Personal & family, and only within what they marked as fair to reference. Never use anything listed as off limits. If they chose to keep it strictly professional, do not reference personal or family details at all.`;

  return `${profileBlock}${spellingDirective}`;
}

/**
 * The advisor's American/British English choice is a hard spelling
 * instruction, not stored in Supabase as its own column, only baked into the
 * system prompt so generation actually uses the right spelling.
 */
function buildSpellingDirective(value: ToneResponseValue | undefined): string {
  if (value === "American English") {
    return "\n\nSPELLING: Use American English spelling and conventions throughout (color, favorite, organize, center).";
  }
  if (value === "British English") {
    return "\n\nSPELLING: Use British English spelling and conventions throughout (colour, favourite, organise, centre).";
  }
  return "";
}

function renderValue(
  field: { type: string; channels?: string[] },
  value: ToneResponseValue | undefined
): string | null {
  if (value === undefined || value === null) return null;

  if (field.type === "channels" && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, number>)
      .filter(([, score]) => typeof score === "number" && score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([channel, score]) => `${channel} (${score}/5)`);
    return entries.length ? `→ ${entries.join(", ")}` : null;
  }

  if (Array.isArray(value)) {
    const items = value.filter((v) => typeof v === "string" && v.trim().length > 0);
    if (!items.length) return null;
    if (field.type === "location") {
      return `→ ${items.map((v) => locationLabel(v)).join(", ")}`;
    }
    return `→ ${items.join(", ")}`;
  }

  if (typeof value === "number") {
    return `→ ${value}/10`;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return `→ ${value.trim()}`;
  }

  return null;
}
