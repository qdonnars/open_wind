export function getWindColor(knots: number): string {
  if (knots < 1) return "#78909C";
  if (knots < 4) return "#E8F5E9";
  if (knots < 7) return "#C8E6C9";
  if (knots < 11) return "#A5D6A7";
  if (knots < 17) return "#81C784";
  if (knots < 22) return "#FFEB3B";
  if (knots < 28) return "#FFC107";
  if (knots < 34) return "#FF9800";
  if (knots < 41) return "#FF5722";
  if (knots < 48) return "#D32F2F";
  return "#7B1FA2";
}

export function getTextColor(knots: number): string {
  if (knots < 1) return "#fff";
  if (knots < 17) return "#1a1a1a";
  if (knots < 28) return "#1a1a1a";
  return "#fff";
}
