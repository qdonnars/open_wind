export function WindArrow({ degrees }: { degrees: number }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      style={{ transform: `rotate(${degrees + 180}deg)` }}
    >
      <polygon points="8,2 12,14 8,10 4,14" fill="currentColor" />
    </svg>
  );
}
