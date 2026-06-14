import { useCallback, useMemo, useState } from "react";
import { AppRail } from "./components/AppRail";
import { MapCanvas } from "./components/MapCanvas";
import { RoutePanel } from "./components/RoutePanel";
import { seedRecentSearches, seedRoutePlan, seedSearchResults } from "./data/seedRoute";
import type { LayerId, LngLat, SearchResult, TravelMode } from "./types";

export default function App() {
  const [activeRail, setActiveRail] = useState<"route" | "search" | "recents" | "layers">("route");
  const [activeLayer, setActiveLayer] = useState<LayerId>("standard");
  const [query, setQuery] = useState("Union Square");
  const [mode, setMode] = useState<TravelMode>("driving");
  const [selectedPlace, setSelectedPlace] = useState<SearchResult>(seedRoutePlan.destination);
  const [lastViewport, setLastViewport] = useState<{ center: LngLat; zoom: number } | null>(null);

  const routePlan = useMemo(
    () => ({
      ...seedRoutePlan,
      destination: selectedPlace,
      mode,
    }),
    [mode, selectedPlace],
  );

  const handleCenterChange = useCallback((center: LngLat, zoom: number) => {
    setLastViewport({ center, zoom });
  }, []);

  return (
    <main className="app-shell">
      <AppRail active={activeRail} onSelect={setActiveRail} />
      <RoutePanel
        plan={routePlan}
        searchResults={seedSearchResults}
        recentSearches={seedRecentSearches}
        activeQuery={query}
        onQueryChange={setQuery}
        onModeChange={setMode}
        onSelectPlace={setSelectedPlace}
      />
      <MapCanvas
        activeLayer={activeLayer}
        plan={routePlan}
        selectedPlace={selectedPlace}
        onCenterChange={handleCenterChange}
        onLocate={() => setActiveLayer("standard")}
      />
      <div className="layer-switcher" aria-label="Layer switcher">
        {(["standard", "terrain", "transit"] as const).map((layer) => (
          <button
            key={layer}
            className={activeLayer === layer ? "is-active" : ""}
            type="button"
            onClick={() => setActiveLayer(layer)}
          >
            {layer}
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        {lastViewport
          ? `Map centered at ${lastViewport.center.lat.toFixed(4)}, ${lastViewport.center.lng.toFixed(
              4,
            )}, zoom ${lastViewport.zoom.toFixed(1)}`
          : "Map ready"}
      </span>
    </main>
  );
}
