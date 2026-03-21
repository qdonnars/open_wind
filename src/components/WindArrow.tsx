export function WindArrow({ degrees }: { degrees: number }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 16 16"
      style={{ transform: `rotate(${degrees + 180}deg)` }}
    >
      <polygon points="8,1 13,15 8,10 3,15" fill="currentColor" />
    </svg>
  );
}
