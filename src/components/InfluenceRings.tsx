/**
 * Lightweight inline SVG for the "Influence scales" step: three concentric
 * rings (10,000 / 100,000 / 1,000,000) around a center avatar placeholder in
 * the style of a default "no profile photo" icon, representing an advisor
 * who hasn't built a following yet. Evenly spaced by design, not to linear
 * scale, same convention as AudienceRings.
 */
const RINGS = [
  { radius: 60, label: "10,000", stroke: "var(--color-advsr-orange)" },
  {
    radius: 95,
    label: "100,000",
    stroke: "color-mix(in srgb, var(--color-advsr-orange) 50%, var(--color-advsr-muted) 50%)",
  },
  { radius: 130, label: "1,000,000", stroke: "var(--color-advsr-muted)" },
];

export function InfluenceRings() {
  const size = 300;
  const center = size / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Three concentric rings labelled 10,000, 100,000 and 1,000,000, representing how influence compounds outward from a single advisor"
      className="mx-auto"
    >
      <defs>
        <clipPath id="influence-avatar-clip">
          <circle cx={center} cy={center} r={32} />
        </clipPath>
      </defs>

      {RINGS.map((ring) => (
        <circle
          key={ring.label}
          cx={center}
          cy={center}
          r={ring.radius}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          style={{ stroke: ring.stroke }}
        />
      ))}

      {RINGS.map((ring) => (
        <g key={`${ring.label}-label`}>
          <rect
            x={center - 38}
            y={center - ring.radius - 18}
            width={76}
            height={20}
            rx={10}
            fill="var(--color-advsr-surface)"
            strokeWidth={1}
            style={{ stroke: ring.stroke }}
          />
          <text
            x={center}
            y={center - ring.radius - 4}
            textAnchor="middle"
            style={{ fontSize: 11, fontWeight: 600, fill: ring.stroke }}
          >
            {ring.label}
          </text>
        </g>
      ))}

      {/* Center avatar placeholder: a plain person silhouette, not a real
          photo, since this represents an advisor with no following yet. The
          shoulder circle deliberately overlaps the head circle by a few
          pixels (rather than sitting flush below it) so the two shapes fuse
          into one continuous silhouette with no visible neck gap. */}
      <circle
        cx={center}
        cy={center}
        r={32}
        fill="none"
        strokeWidth={2}
        style={{ stroke: "var(--color-advsr-orange)" }}
      />
      <g clipPath="url(#influence-avatar-clip)">
        <circle cx={center} cy={center - 8} r={11} fill="var(--color-advsr-muted)" />
        <circle cx={center} cy={center + 25} r={25} fill="var(--color-advsr-muted)" />
      </g>
    </svg>
  );
}
