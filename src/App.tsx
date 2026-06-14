import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppRail } from "./components/AppRail";
import { MapCanvas } from "./components/MapCanvas";
import { RoutePanel } from "./components/RoutePanel";
import { seedRecentSearches, seedRoutePlan, seedSearchResults } from "./data/seedRoute";
import { searchPlaces } from "./services/geocoding";
import { locateCurrentPosition } from "./services/location";
import { getRoute } from "./services/routing";
import { defaultSettings, loadSettings, saveSettings } from "./services/settings";
import type { LayerId, LngLat, RouteSummary, SearchResult, TravelMode } from "./types";

type SearchState = "idle" | "loading" | "success" | "empty" | "error";
type RouteState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [activeRail, setActiveRail] = useState<"route" | "search" | "recents" | "layers">("route");
  const [activeLayer, setActiveLayer] = useState<LayerId>("standard");
  const [query, setQuery] = useState("Union Square");
  const [mode, setMode] = useState<TravelMode>("driving");
  const [origin, setOrigin] = useState<SearchResult>(seedRoutePlan.origin);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult>(seedRoutePlan.destination);
  const [route, setRoute] = useState<RouteSummary>(seedRoutePlan.route);
  const [routeState, setRouteState] = useState<RouteState>("idle");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>(seedSearchResults);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>(seedRecentSearches);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastViewport, setLastViewport] = useState<{ center: LngLat; zoom: number } | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);

  const routePlan = useMemo(
    () => ({
      ...seedRoutePlan,
      origin,
      destination: selectedPlace,
      mode,
      route,
    }),
    [mode, origin, route, selectedPlace],
  );

  useEffect(() => {
    let isMounted = true;

    loadSettings()
      .then((settings) => {
        if (!isMounted) {
          return;
        }
        setActiveLayer(settings.activeLayer);
        if (settings.recentSearches.length) {
          setRecentSearches(settings.recentSearches);
        }
        setLastViewport({
          center: settings.lastCenter,
          zoom: settings.lastZoom,
        });
      })
      .catch(() => {
        if (isMounted) {
          setLastViewport({
            center: defaultSettings.lastCenter,
            zoom: defaultSettings.lastZoom,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!lastViewport) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveSettings({
        activeLayer,
        showTrafficHints: true,
        lastCenter: lastViewport.center,
        lastZoom: lastViewport.zoom,
        recentSearches,
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [activeLayer, lastViewport, recentSearches]);

  const handleCenterChange = useCallback((center: LngLat, zoom: number) => {
    setLastViewport({ center, zoom });
  }, []);

  const handleSearchSubmit = useCallback(async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearchState("loading");
    setSearchError(null);

    try {
      const results = await searchPlaces(trimmedQuery, {
        origin: routePlan.origin.coordinate,
        signal: controller.signal,
      });
      setSearchResults(results);
      setSearchState(results.length ? "success" : "empty");

      if (results[0]) {
        setSelectedPlace(results[0]);
        setRecentSearches((current) => addRecentSearch(results[0], current));
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      setSearchState("error");
      setSearchError(error instanceof Error ? error.message : "Search failed");
    }
  }, [query, routePlan.origin.coordinate]);

  const handleSelectPlace = useCallback((place: SearchResult) => {
    setSelectedPlace(place);
    setRecentSearches((current) => addRecentSearch(place, current));
  }, []);

  const handleLocate = useCallback(async () => {
    setLocationError(null);

    try {
      const nextOrigin = await locateCurrentPosition();
      setOrigin(nextOrigin);
      setRecentSearches((current) => addRecentSearch(nextOrigin, current));
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Location permission was denied");
    }
  }, []);

  const handleRouteSubmit = useCallback(async () => {
    routeAbortRef.current?.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;
    setRouteState("loading");
    setRouteError(null);

    try {
      const nextRoute = await getRoute(routePlan.origin.coordinate, selectedPlace.coordinate, mode, {
        signal: controller.signal,
      });
      setRoute(nextRoute);
      setRouteState("success");
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      setRouteState("error");
      setRouteError(error instanceof Error ? error.message : "Route planning failed");
    }
  }, [mode, routePlan.origin.coordinate, selectedPlace.coordinate]);

  return (
    <main className="app-shell">
      <AppRail active={activeRail} onSelect={setActiveRail} />
      <RoutePanel
        plan={routePlan}
        selectedPlace={selectedPlace}
        searchResults={searchResults}
        recentSearches={recentSearches}
        activeQuery={query}
        searchState={searchState}
        searchError={searchError}
        routeState={routeState}
        routeError={routeError}
        locationError={locationError}
        onQueryChange={setQuery}
        onSearchSubmit={handleSearchSubmit}
        onRouteSubmit={handleRouteSubmit}
        onModeChange={setMode}
        onSelectPlace={handleSelectPlace}
      />
      <MapCanvas
        activeLayer={activeLayer}
        plan={routePlan}
        selectedPlace={selectedPlace}
        onCenterChange={handleCenterChange}
        onLocate={handleLocate}
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

function addRecentSearch(place: SearchResult, recentSearches: SearchResult[]) {
  return [place, ...recentSearches.filter((item) => item.id !== place.id)].slice(0, 5);
}
