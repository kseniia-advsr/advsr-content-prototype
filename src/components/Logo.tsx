/**
 * Approximation of the ADVSR "V" mark, hand-drawn from a screenshot — swap
 * this for the real asset (SVG/PNG) as soon as it's available on disk;
 * pass a file path and this component can be replaced with an <img>.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 28" className={className} aria-label="ADVSR" role="img">
      <path
        d="M2 1 L11 27 L13 27 L22 1 L18 1 L12 20 L6 1 Z"
        fill="var(--color-advsr-orange)"
      />
    </svg>
  );
}
