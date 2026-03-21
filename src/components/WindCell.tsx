import { WindArrow } from "./WindArrow";
import { getWindColor, getTextColor } from "../utils/colors";

interface WindCellProps {
  speed: number | null;
  gusts: number | null;
  direction: number | null;
}

export function WindCell({ speed, gusts, direction }: WindCellProps) {
  if (speed == null) {
    return (
      <td className="min-w-[40px] h-12 bg-gray-800/50 border border-gray-800 text-center text-gray-600 text-[10px] align-middle">
        -
      </td>
    );
  }

  const bg = getWindColor(speed);
  const color = getTextColor(speed);

  return (
    <td
      className="min-w-[40px] h-12 border border-gray-800/30 text-center align-middle"
      style={{ backgroundColor: bg, color }}
    >
      <div className="flex flex-col items-center leading-none gap-px">
        {direction != null && <WindArrow degrees={direction} />}
        <span className="text-[11px] font-bold">{Math.round(speed)}</span>
        {gusts != null && (
          <span className="text-[9px] opacity-60">{Math.round(gusts)}</span>
        )}
      </div>
    </td>
  );
}
