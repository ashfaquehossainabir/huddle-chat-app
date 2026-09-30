/** Three overlapping circles: the Huddle mark. */
export default function Mark({ size = 34 }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="24" cy="34" r="16" fill="var(--brand)" />
      <circle cx="42" cy="28" r="14" fill="var(--sun)" />
      <circle cx="36" cy="44" r="11" fill="var(--coral)" />
    </svg>
  );
}
