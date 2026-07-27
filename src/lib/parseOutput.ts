export type OutputSection = { heading: string; body: string };

/**
 * Splits the engine's markdown output into per-heading sections (## Heading)
 * so the full-suite response can render as one card per platform. Falls back
 * to a single "Output" section for single-format responses with no headings.
 */
export function parseOutputSections(text: string): OutputSection[] {
  const lines = text.split("\n");
  const sections: OutputSection[] = [];
  let current: OutputSection | null = null;

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      if (current) sections.push(current);
      current = { heading: (match[1] ?? "").trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    } else if (line.trim().length > 0) {
      current = { heading: "Output", body: line + "\n" };
    }
  }
  if (current) sections.push(current);

  return sections.length > 0
    ? sections.map((s) => ({ ...s, body: s.body.trim() }))
    : [{ heading: "Output", body: text.trim() }];
}

/** Escapes HTML, converts **bold** to <strong>, and newlines to <br/>. */
export function formatOutputHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return withBold.replace(/\n/g, "<br/>");
}
