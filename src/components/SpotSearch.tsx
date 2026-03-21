import { useState, useRef, useEffect } from "react";
import type { Spot, GeocodingResult } from "../types";
import { searchSpots } from "../api/openmeteo";

interface SpotSearchProps {
  onSelect: (spot: Spot) => void;
}

export function SpotSearch({ onSelect }: SpotSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(timerRef.current);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      const r = await searchSpots(value);
      setResults(r);
      setOpen(r.length > 0);
    }, 300);
  }

  function handleSelect(r: GeocodingResult) {
    onSelect({
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
    });
    setQuery(r.name);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Rechercher un spot..."
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
      />
      {open && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-20 shadow-lg">
          {results.map((r) => (
            <li
              key={r.id}
              onClick={() => handleSelect(r)}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm"
            >
              <span className="text-white">{r.name}</span>
              {r.admin1 && (
                <span className="text-gray-400">, {r.admin1}</span>
              )}
              <span className="text-gray-500"> - {r.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
