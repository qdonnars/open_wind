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
      <td className="min-w-[20px] h-7 bg-gray-800/50 border border-gray-800 text-center text-gray-600 text-[7px] align-middle">
        -
      </td>
    );
  }

  const bg = getWindColor(speed);
  const color = getTextColor(speed);

  return (
    <td
      className="min-w-[20px] h-7 border border-gray-800/30 text-center align-middle p-0"
      style={{ backgroundColor: bg, color }}
    >
      <div className="flex flex-col items-center leading-none">
        {direction != null && <WindArrow degrees={direction} />}
        <span className="text-[8px] font-bold">{Math.round(speed)}</span>
        {gusts != null && (
          <span className="text-[6px] opacity-60">{Math.round(gusts)}</span>
        )}
      </div>
    </td>
  );
}
