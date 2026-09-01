/** One person silhouette, reused at different positions/scales for the group and crowd icons below. */
function PersonSilhouette({
  cx,
  cy,
  scale = 1,
  fill,
}: {
  cx: number;
  cy: number;
  scale?: number;
  fill: string;
}) {
  const headR = 4.5 * scale;
  const shoulderW = 7 * scale;
  const shoulderTop = cy + 2 * scale;
  const shoulderBottom = cy + 13 * scale;
  return (
    <g>
      <circle cx={cx} cy={cy - 6 * scale} r={headR} fill={fill} />
      <path
        d={`M${cx - shoulderW} ${shoulderBottom} Q${cx - shoulderW} ${shoulderTop} ${cx} ${shoulderTop} Q${cx + shoulderW} ${shoulderTop} ${cx + shoulderW} ${shoulderBottom} Z`}
        fill={fill}
      />
    </g>
  );
}

/** A single person, centered — the "10 followers" tier. */
function PersonIcon() {
  return (
    <svg viewBox="0 0 44 34" width={36} height={28}>
      <PersonSilhouette cx={22} cy={16} scale={1.1} fill="var(--color-advsr-muted)" />
    </svg>
  );
}

/** Three people, the middle one slightly larger and higher — the "100 followers" tier. */
function GroupIcon() {
  return (
    <svg viewBox="0 0 64 34" width={48} height={28}>
      <PersonSilhouette cx={14} cy={17} scale={0.9} fill="var(--color-advsr-muted)" />
      <PersonSilhouette cx={32} cy={14} scale={1.05} fill="var(--color-advsr-text)" />
      <PersonSilhouette cx={50} cy={17} scale={0.9} fill="var(--color-advsr-muted)" />
    </svg>
  );
}

/** Five people in a shallow arc — the "1,000 followers" tier. */
function CrowdIcon() {
  const positions = [
    { cx: 8, cy: 19, scale: 0.7 },
    { cx: 22, cy: 15, scale: 0.85 },
    { cx: 36, cy: 13, scale: 0.95 },
    { cx: 50, cy: 15, scale: 0.85 },
    { cx: 64, cy: 19, scale: 0.7 },
  ];
  return (
    <svg viewBox="0 0 72 34" width={58} height={28}>
      {positions.map((p, i) => (
        <PersonSilhouette key={i} {...p} fill="var(--color-advsr-text)" />
      ))}
    </svg>
  );
}

/** A five-point star — the "10,000 followers" tier. Styled the same neutral tone as every card before the payoff one, not orange; only the 100,000+ card is meant to stand out. */
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--color-advsr-text)" strokeWidth={1.5}>
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z" strokeLinejoin="round" />
    </svg>
  );
}

/** A globe, stroked in brand orange — the one payoff tier meant to stand out. */
function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="var(--color-advsr-orange)" strokeWidth={1.4}>
      <circle cx={12} cy={12} r={9} />
      <path d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18" />
    </svg>
  );
}

type Stage = {
  followers: string;
  caption: string;
  Icon: () => React.JSX.Element;
  /** The payoff tier: orange border plus a warm gradient and glow, set apart from every stage before it. */
  highlight?: boolean;
};

const STAGES: Stage[] = [
  { followers: "10", caption: "It starts with a few.", Icon: PersonIcon },
  { followers: "100", caption: "It grows with consistency.", Icon: GroupIcon },
  { followers: "1,000", caption: "It builds momentum.", Icon: CrowdIcon },
  { followers: "10,000", caption: "It becomes influence.", Icon: StarIcon },
  { followers: "100,000+", caption: "It creates impact.", Icon: GlobeIcon, highlight: true },
];

/**
 * Five growth-stage cards, 10 through 100,000+ followers, replacing the old
 * concentric-rings visual (InfluenceRings.tsx) with a more literal "here's
 * the ladder" progression. Styled to match the value_props step's stat
 * boxes (same border/bg/rounding, same font-heading number treatment) so it
 * reads as one consistent questionnaire rather than a one-off design. Only
 * the 100,000+ card gets the highlighted (orange border, warm gradient,
 * glow) treatment — every other card, including the star tier, shares the
 * exact same plain styling.
 *
 * A row at sm+ (not lg+, unlike most responsive splits in this app, e.g.
 * WelcomeScreen.tsx): this renders inside InsightsFunnel's modal, which is
 * capped at max-w-2xl regardless of viewport, so the relevant breakpoint is
 * real narrow phones (below sm), not desktop-vs-mobile — past that width
 * the row already fits.
 */
export function GrowthMultiplier() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
      {STAGES.map(({ followers, caption, Icon, highlight }) => (
        <div
          key={followers}
          className={
            "flex flex-col items-center justify-between gap-2 rounded-xl border p-3 text-center " +
            (highlight
              ? "border-advsr-orange bg-gradient-to-b from-[#1f160a] to-advsr-bg shadow-[0_0_24px_rgba(255,107,0,0.25)]"
              : "border-advsr-border bg-advsr-bg")
          }
        >
          <div>
            <p
              className={
                "font-heading text-xl font-bold " + (highlight ? "text-advsr-orange" : "text-advsr-text")
              }
            >
              {followers}
            </p>
            <p className={"text-xs " + (highlight ? "text-advsr-orange" : "text-advsr-muted")}>Followers</p>
          </div>
          <Icon />
          <p className={"text-xs leading-snug " + (highlight ? "text-advsr-orange" : "text-advsr-muted")}>
            {caption}
          </p>
        </div>
      ))}
    </div>
  );
}
