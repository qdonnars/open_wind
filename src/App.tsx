import { useState, useEffect } from "react";
import type { Spot, ModelForecast } from "./types";
import { fetchAllModels } from "./api/openmeteo";
import { QUICK_SPOTS } from "./spots";
import { useCustomSpots } from "./hooks/useCustomSpots";
import { Header } from "./components/Header";
import { WindTable } from "./components/WindTable";
import { SpotMap } from "./components/SpotMap";

const DEFAULT_SPOT: Spot = QUICK_SPOTS[0]; // Pointe Rouge

function isBuiltIn(spot: Spot) {
  return QUICK_SPOTS.some(
    (s) => s.latitude === spot.latitude && s.longitude === spot.longitude
  );
}

function App() {
  const [spot, setSpot] = useState<Spot>(DEFAULT_SPOT);
  const [forecasts, setForecasts] = useState<ModelForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const { customSpots, addSpot, removeSpot, isCustom } = useCustomSpots();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setSelectedHour(null);
    fetchAllModels(spot.latitude, spot.longitude).then((data) => {
      if (!cancelled) {
        setForecasts(data);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [spot]);

  const canSave = !isBuiltIn(spot) && !isCustom(spot);
  const isSaved = isCustom(spot);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      <Header
        onSelectSpot={setSpot}
        canSave={canSave}
        isSaved={isSaved}
        onSave={() => addSpot(spot)}
        onRemove={() => removeSpot(spot)}
      />

      <div className="flex-1 min-h-0">
        <SpotMap
          current={spot}
          customSpots={customSpots}
          onSelectSpot={setSpot}
          forecasts={forecasts}
          selectedHour={selectedHour}
        />
      </div>

      <div className="shrink-0">
        <WindTable
          forecasts={forecasts}
          isLoading={isLoading}
          selectedHour={selectedHour}
          onSelectHour={setSelectedHour}
        />
        <footer className="text-center text-gray-600 text-[10px] py-1 border-t border-gray-800">
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-400"
          >
            Open-Meteo.com
          </a>{" "}
          (CC BY 4.0)
        </footer>
      </div>
    </div>
  );
}

export default App;
