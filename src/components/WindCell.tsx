import { WindArrow } from "./WindArrow";
import { getWindColor, getTextColor } from "../utils/colors";

interface WindCellProps {
  speed: number | null;
  gusts: number | null;
  direction: number | null;
  selected: boolean;
  onSelect: () => void;
}

export function WindCell({ speed, gusts, direction, selected, onSelect }: WindCellProps) {
  if (speed == null) {
    return (
      <td
        className={`min-w-[28px] h-10 bg-gray-800/40 text-center text-gray-600 text-[7px] align-middle cursor-pointer ${
          selected ? "outline outline-2 outline-white -outline-offset-1" : ""
        }`}
        onClick={onSelect}
      >
        -
      </td>
    );
  }

  const bg = getWindColor(speed);
  const color = getTextColor(speed);

  return (
    <td
      className={`min-w-[28px] h-10 text-center align-middle p-0 cursor-pointer ${
        selected ? "outline outline-2 outline-white -outline-offset-1" : ""
      }`}
      style={{ backgroundColor: bg, color }}
      onClick={onSelect}
    >
      <div className="flex flex-col items-center leading-none gap-px">
        <div className="flex items-center gap-px">
          {direction != null && <WindArrow degrees={direction} />}
          <span className="text-[9px] font-bold">{Math.round(speed)}</span>
        </div>
        {gusts != null && (
          <span className="text-[7px] opacity-50">{Math.round(gusts)}</span>
        )}
      </div>
    </td>
  );
}
