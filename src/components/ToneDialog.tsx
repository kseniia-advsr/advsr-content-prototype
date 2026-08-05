import {
  TONE_SECTIONS,
  type ToneResponses,
  type ToneField,
  type ChannelRatingField as ChannelRatingFieldSchema,
  type ToneResponseValue,
  type ToneSection,
} from "../engine/toneProfile";
import { MultiSelectField } from "./fields/MultiSelectField";
import { SingleSelectField } from "./fields/SingleSelectField";
import { TextField } from "./fields/TextField";
import { LocationField } from "./fields/LocationField";
import { ChannelRatingField } from "./fields/ChannelRatingField";

/**
 * All 16 pages of the tone-of-voice questionnaire, in original source order.
 * Two deliberate amendments from the source schema stay as designed: the
 * location field targets global countries/cities instead of UK postcodes
 * (see countries.ts), and "platforms" is asked by InsightsFunnel's
 * belief-then-actual-choice flow instead of here (see visibleFieldsForSection
 * below), so it is skipped in this list of rendered pages, not removed from
 * the underlying schema.
 */
const PROTOTYPE_SECTION_IDS = [
  "communication_style",
  "client_experience",
  "archetype",
  "negotiation",
  "expertise",
  "visibility",
  "channels",
  "positioning",
  "language",
  "guardrails",
  "ai_support",
  "ideal_client",
  "personal",
  "trust_profile",
  "examples",
  "free_context",
];

function isAnswered(value: ToneResponseValue | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (value && typeof value === "object") {
    return Object.values(value).some((rating) => typeof rating === "number" && rating > 0);
  }
  return false;
}

/** Fields actually rendered for a section, given the current responses (e.g. the personal-life follow-ups only show once opted in). */
function visibleFieldsForSection(section: ToneSection, responses: ToneResponses) {
  const sharePersonal = responses["share_personal"];
  const optedIntoPersonal = typeof sharePersonal === "string" && sharePersonal.startsWith("Yes");
  return section.fields.filter((field) => {
    // Asked instead by InsightsFunnel's platform-belief step (belief ->
    // insight -> actual choice), which writes into this same responses.platforms
    // field, rendering it here too would ask the advisor twice.
    if (field.id === "platforms") return false;
    if ((field.id === "personal_ok" || field.id === "personal_offlimits") && !optedIntoPersonal) {
      return false;
    }
    return true;
  });
}

function isSectionComplete(section: ToneSection, responses: ToneResponses) {
  return visibleFieldsForSection(section, responses).every((field) => isAnswered(responses[field.id]));
}

export function ToneDialog({
  responses,
  onChange,
  sectionIndex,
  onSectionIndexChange,
  onFinish,
}: {
  responses: ToneResponses;
  onChange: (updater: (prev: ToneResponses) => ToneResponses) => void;
  sectionIndex: number;
  onSectionIndexChange: (next: number) => void;
  onFinish: () => void;
}) {
  const sections = TONE_SECTIONS.filter((s) => PROTOTYPE_SECTION_IDS.includes(s.id));
  const section = sections[sectionIndex];
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === sections.length - 1;

  // Functional update: React applies queued updater functions in order
  // against the latest state, so rapid/concurrent field changes in the same
  // render tick can no longer overwrite each other via a stale `responses`
  // closure.
  const setValue = (fieldId: string, value: ToneResponses[string]) => {
    onChange((prev) => ({ ...prev, [fieldId]: value }));
  };

  const sharePersonal = responses["share_personal"];
  const optedIntoPersonal =
    typeof sharePersonal === "string" && sharePersonal.startsWith("Yes");

  const sectionComplete = section ? isSectionComplete(section, responses) : false;
  const firstIncompleteIndex = sections.findIndex((s) => !isSectionComplete(s, responses));
  const maxReachableIndex = firstIncompleteIndex === -1 ? sections.length - 1 : firstIncompleteIndex;

  if (!section) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-advsr-border bg-advsr-surface">
        <div className="border-b border-advsr-border px-6 py-4">
          <h2 className="font-heading text-xl font-semibold text-advsr-text">
            Set up your tone of voice
          </h2>
          <p className="mt-1.5 text-sm text-advsr-muted">
            Mostly multiple choice, about 5 to 10 minutes. Every answer becomes permanent context
            for content created for you.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-6 pt-4">
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => i <= maxReachableIndex && onSectionIndexChange(i)}
              disabled={i > maxReachableIndex}
              aria-label={`Go to ${s.title}`}
              className={
                "h-1.5 flex-1 rounded-full transition-colors " +
                (i <= sectionIndex ? "bg-advsr-orange " : "bg-advsr-border ") +
                (i > maxReachableIndex ? "cursor-not-allowed" : "")
              }
            />
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-advsr-muted">
            Page {sectionIndex + 1} of {sections.length}
          </div>
          <h3 className="mb-5 font-heading text-lg font-semibold text-advsr-text">
            {section.title}
          </h3>

          <div className="space-y-7">
            {section.fields.map((field) => {
              // Asked instead by InsightsFunnel's platform-belief step.
              if (field.id === "platforms") return null;

              if (field.type === "channels") {
                const channelField = field as ChannelRatingFieldSchema;
                return (
                  <ChannelRatingField
                    key={channelField.id}
                    field={channelField}
                    value={(responses[channelField.id] as Record<string, number>) ?? {}}
                    onChange={(v) => setValue(channelField.id, v)}
                  />
                );
              }
              const toneField = field as ToneField;

              if (
                (toneField.id === "personal_ok" || toneField.id === "personal_offlimits") &&
                !optedIntoPersonal
              ) {
                return null;
              }

              if (toneField.type === "multi") {
                return (
                  <MultiSelectField
                    key={toneField.id}
                    field={toneField}
                    value={(responses[toneField.id] as string[]) ?? []}
                    onChange={(v) => setValue(toneField.id, v)}
                  />
                );
              }
              if (toneField.type === "single") {
                return (
                  <SingleSelectField
                    key={toneField.id}
                    field={toneField}
                    value={(responses[toneField.id] as string) ?? ""}
                    onChange={(v) => setValue(toneField.id, v)}
                  />
                );
              }
              if (toneField.type === "location") {
                return (
                  <LocationField
                    key={toneField.id}
                    label={toneField.label}
                    help={toneField.help}
                    value={(responses[toneField.id] as string[]) ?? []}
                    onChange={(v) => setValue(toneField.id, v)}
                  />
                );
              }
              if (toneField.type === "text") {
                return (
                  <TextField
                    key={toneField.id}
                    field={toneField}
                    value={(responses[toneField.id] as string) ?? ""}
                    onChange={(v) => setValue(toneField.id, v)}
                    multiline
                  />
                );
              }
              if (toneField.type === "rating10") {
                return (
                  <SingleSelectField
                    key={toneField.id}
                    field={{
                      ...toneField,
                      options: Array.from({ length: 10 }, (_, i) => String(i + 1)),
                    }}
                    value={
                      typeof responses[toneField.id] === "number"
                        ? String(responses[toneField.id])
                        : ""
                    }
                    onChange={(v) => setValue(toneField.id, Number(v))}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-advsr-border px-6 py-4">
          <button
            type="button"
            onClick={() => onSectionIndexChange(Math.max(0, sectionIndex - 1))}
            disabled={isFirst}
            className="rounded-lg px-3 py-2 text-sm text-advsr-muted transition-colors hover:text-advsr-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹ Back
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={onFinish}
              disabled={!sectionComplete}
              className="rounded-lg bg-advsr-orange px-4 py-2 font-heading font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSectionIndexChange(Math.min(sections.length - 1, sectionIndex + 1))}
              disabled={!sectionComplete}
              className="rounded-lg bg-advsr-orange px-4 py-2 font-heading font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
