import type { Spot } from "../types";
import { SpotSearch } from "./SpotSearch";

interface HeaderProps {
  onSelectSpot: (spot: Spot) => void;
  canSave: boolean;
  isSaved: boolean;
  onSave: () => void;
  onRemove: () => void;
}

export function Header({
  onSelectSpot,
  canSave,
  isSaved,
  onSave,
  onRemove,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-3 py-2">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-white shrink-0">OpenWind</h1>
        <SpotSearch onSelect={onSelectSpot} />
        {isSaved && (
          <button
            onClick={onRemove}
            className="shrink-0 text-xs px-2 py-1.5 rounded-md bg-gray-800 text-red-400 hover:bg-red-900 transition-colors"
            title="Supprimer ce spot"
          >
            x
          </button>
        )}
        {canSave && (
          <button
            onClick={onSave}
            className="shrink-0 text-xs px-2 py-1.5 rounded-md bg-gray-800 text-green-400 hover:bg-green-900 transition-colors whitespace-nowrap"
          >
            + Save
          </button>
        )}
      </div>
    </header>
  );
}
