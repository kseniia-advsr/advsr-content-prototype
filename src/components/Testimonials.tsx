type Testimonial = {
  name: string;
  company: string;
  quote: string;
  /** Exact substrings of `quote` to visually highlight, 2 to 3 per quote. */
  highlights: string[];
  headshot: string;
};

/**
 * Two real, verbatim testimonials, quoted exactly as given, not paraphrased.
 * Headshots live directly in public/ (not public/testimonials/ as
 * originally described), referenced here with their actual root-relative
 * paths.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    name: "Daniel Daggers",
    company: "DDRE Global",
    quote:
      "The agents who've actually built influence post constantly, that's not new. What's new is giving every advisor in the network that edge, without the hours it used to cost.",
    highlights: ["without the hours it used to cost"],
    headshot: "/daniel-daggers.png",
  },
  {
    name: "Ryan Serhant",
    company: "SERHANT.",
    quote: "Let everyone know about it... post on social media, talk about it every chance you get.",
    highlights: ["talk about it every chance you get"],
    headshot: "/ryan-serhant.jpg",
  },
];

/** Wraps each highlight substring in an orange, bold span; longest first so overlapping matches don't get cut short. */
function renderHighlightedQuote(quote: string, highlights: string[]) {
  if (highlights.length === 0) return quote;
  const escaped = [...highlights]
    .sort((a, b) => b.length - a.length)
    .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  return quote.split(pattern).map((part, i) =>
    highlights.includes(part) ? (
      <strong key={i} className="font-semibold text-advsr-orange">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/**
 * Both testimonials stacked in a single panel, not a carousel: every quote
 * is visible at once so the reader can compare "same tool, two different
 * results" without waiting on rotation.
 */
export function Testimonials() {
  return (
    <div className="rounded-xl bg-black p-4">
      {TESTIMONIALS.map((testimonial, i) => (
        <div
          key={testimonial.name}
          className={
            "flex gap-4 py-4 first:pt-0 last:pb-0 " +
            (i < TESTIMONIALS.length - 1 ? "border-b border-advsr-border" : "")
          }
        >
          <img
            src={testimonial.headshot}
            alt={testimonial.name}
            className="size-14 shrink-0 rounded-full border-2 border-advsr-orange object-cover"
          />
          <div className="min-w-0 flex-1 self-center">
            <p className="text-sm">
              <span className="font-semibold text-white">{testimonial.name}</span>{" "}
              <span className="text-xs text-gray-400">{testimonial.company}</span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white">
              "{renderHighlightedQuote(testimonial.quote, testimonial.highlights)}"
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
