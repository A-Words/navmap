import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppRail } from "./components/AppRail";
import { MapCanvas } from "./components/MapCanvas";
import { RoutePanel } from "./components/RoutePanel";
import { getSeedRouteData } from "./data/seedRoute";
import { DEFAULT_LANGUAGE, getLayerLabel, translations } from "./i18n";
import { searchPlaces } from "./services/geocoding";
import { locateCurrentPosition } from "./services/location";
import { getRoute } from "./services/routing";
import { defaultSettings, loadSettings, saveSettings } from "./services/settings";
import type {
  ColorScheme,
  Language,
  LayerId,
  LngLat,
  PanelId,
  RoutePointTarget,
  RouteSummary,
  SearchResult,
  ThemePreference,
  TravelMode,
} from "./types";

type SearchState = "idle" | "loading" | "success" | "empty" | "error";
type RouteState = "idle" | "loading" | "success" | "error";

const DEFAULT_SEED = getSeedRouteData(DEFAULT_LANGUAGE);
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function getSystemColorScheme(): ColorScheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

export default function App() {
  const [activeRail, setActiveRail] = useState<PanelId>("route");
  const [activeLayer, setActiveLayer] = useState<LayerId>("standard");
  const [systemColorScheme, setSystemColorScheme] = useState<ColorScheme>(() => getSystemColorScheme());
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [query, setQuery] = useState("联合广场");
  const [mode, setMode] = useState<TravelMode>("driving");
  const [origin, setOrigin] = useState<SearchResult>(DEFAULT_SEED.origin);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult>(DEFAULT_SEED.destination);
  const [waypoints, setWaypoints] = useState<SearchResult[]>(DEFAULT_SEED.routePlan.waypoints);
  const [routeDrafts, setRouteDrafts] = useState({
    origin: DEFAULT_SEED.origin.name,
    destination: DEFAULT_SEED.destination.name,
    waypoints: DEFAULT_SEED.routePlan.waypoints.map((waypoint) => waypoint.name),
  });
  const [activeRouteTarget, setActiveRouteTarget] = useState<RoutePointTarget>("destination");
  const [route, setRoute] = useState<RouteSummary>(DEFAULT_SEED.routePlan.route);
  const [routeState, setRouteState] = useState<RouteState>("idle");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>(DEFAULT_SEED.searchResults);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>(DEFAULT_SEED.recentSearches);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastViewport, setLastViewport] = useState<{ center: LngLat; zoom: number } | null>(null);
  const [searchFocusToken, setSearchFocusToken] = useState(0);
  const searchAbortRef = useRef<AbortController | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);

  const routePlan = useMemo(
    () => ({
      origin,
      destination: selectedPlace,
      waypoints,
      mode,
      route,
    }),
    [mode, origin, route, selectedPlace, waypoints],
  );

  const copy = translations[language];
  const colorScheme = themePreference === "system" ? systemColorScheme : themePreference;

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
    const updateColorScheme = () => setSystemColorScheme(mediaQuery.matches ? "dark" : "light");

    updateColorScheme();
    mediaQuery.addEventListener("change", updateColorScheme);

    return () => mediaQuery.removeEventListener("change", updateColorScheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.colorScheme = colorScheme;
    document.documentElement.style.colorScheme = colorScheme;

    return () => {
      delete document.documentElement.dataset.colorScheme;
      document.documentElement.style.colorScheme = "";
    };
  }, [colorScheme]);

  useEffect(() => {
    let isMounted = true;

    loadSettings()
      .then((settings) => {
        if (!isMounted) {
          return;
        }
        setLanguage(settings.language);
        setThemePreference(settings.themePreference);
        if (settings.language !== DEFAULT_LANGUAGE) {
          const seed = getSeedRouteData(settings.language);
          setQuery("Union Square");
          setOrigin(seed.origin);
          setSelectedPlace(seed.destination);
          setWaypoints(seed.routePlan.waypoints);
          setRouteDrafts({
            origin: seed.origin.name,
            destination: seed.destination.name,
            waypoints: seed.routePlan.waypoints.map((waypoint) => waypoint.name),
          });
          setSearchResults(seed.searchResults);
          setRoute(seed.routePlan.route);
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
        language,
        themePreference,
        showTrafficHints: true,
        lastCenter: lastViewport.center,
        lastZoom: lastViewport.zoom,
        recentSearches,
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [activeLayer, language, lastViewport, recentSearches, themePreference]);

  const handleLanguageChange = useCallback((nextLanguage: Language) => {
    const seed = getSeedRouteData(nextLanguage);
    setLanguage(nextLanguage);
    setQuery(nextLanguage === "zh" ? "联合广场" : "Union Square");
    setOrigin((current) => (current.id === "my-location" ? seed.origin : current));
    setSelectedPlace((current) => seed.searchResults.find((place) => place.id === current.id) || current);
    setWaypoints(seed.routePlan.waypoints);
    setRouteDrafts({
      origin: seed.origin.name,
      destination: seed.destination.name,
      waypoints: seed.routePlan.waypoints.map((waypoint) => waypoint.name),
    });
    setSearchResults((current) =>
      current.every((place) => seed.searchResults.some((seedPlace) => seedPlace.id === place.id))
        ? seed.searchResults
        : current,
    );
    setRecentSearches((current) =>
      current.every((place) => seed.recentSearches.some((seedPlace) => seedPlace.id === place.id))
        ? seed.recentSearches
        : current,
    );
    setRoute((current) =>
      current.instructions.every((instruction) =>
        seed.routePlan.route.instructions.some((seedInstruction) => seedInstruction.id === instruction.id),
      )
        ? seed.routePlan.route
        : current,
    );
  }, []);

  const handleCenterChange = useCallback((center: LngLat, zoom: number) => {
    setLastViewport({ center, zoom });
  }, []);

  const applyPlaceToRouteTarget = useCallback((place: SearchResult, target: RoutePointTarget) => {
    if (target === "origin") {
      setOrigin(place);
      setRouteDrafts((current) => ({ ...current, origin: place.name }));
      return;
    }

    if (target === "destination") {
      setSelectedPlace(place);
      setRouteDrafts((current) => ({ ...current, destination: place.name }));
      return;
    }

    const waypointIndex = Number(target.replace("waypoint-", ""));
    if (Number.isNaN(waypointIndex)) {
      return;
    }

    setWaypoints((current) => current.map((waypoint, index) => (index === waypointIndex ? place : waypoint)));
    setRouteDrafts((current) => ({
      ...current,
      waypoints: current.waypoints.map((value, index) => (index === waypointIndex ? place.name : value)),
    }));
  }, []);

  const handleRoutePointChange = useCallback((target: RoutePointTarget, value: string) => {
    setActiveRouteTarget(target);
    setRouteDrafts((current) => {
      if (target === "origin" || target === "destination") {
        return { ...current, [target]: value };
      }

      const waypointIndex = Number(target.replace("waypoint-", ""));
      if (Number.isNaN(waypointIndex)) {
        return current;
      }

      const nextWaypoints = [...current.waypoints];
      nextWaypoints[waypointIndex] = value;
      return { ...current, waypoints: nextWaypoints };
    });
  }, []);

  const handleRoutePointSubmit = useCallback(async (target: RoutePointTarget) => {
    const waypointIndex = target.startsWith("waypoint-") ? Number(target.replace("waypoint-", "")) : -1;
    const targetQuery =
      target === "origin"
        ? routeDrafts.origin
        : target === "destination"
          ? routeDrafts.destination
          : routeDrafts.waypoints[waypointIndex];
    const trimmedQuery = targetQuery?.trim();

    if (!trimmedQuery) {
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearchState("loading");
    setSearchError(null);
    setActiveRouteTarget(target);

    try {
      const results = await searchPlaces(trimmedQuery, {
        language,
        origin: routePlan.origin.coordinate,
        signal: controller.signal,
      });
      setSearchResults(results);
      setSearchState(results.length ? "success" : "empty");

      if (results[0]) {
        applyPlaceToRouteTarget(results[0], target);
        setRecentSearches((current) => addRecentSearch(results[0], current));
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      setSearchState("error");
      setSearchError(error instanceof Error ? error.message : copy.route.searchFailed);
    }
  }, [applyPlaceToRouteTarget, copy.route.searchFailed, language, routeDrafts, routePlan.origin.coordinate]);

  const handleSwapRoutePoints = useCallback(() => {
    setOrigin(selectedPlace);
    setSelectedPlace(origin);
    setRouteDrafts((current) => ({
      ...current,
      origin: selectedPlace.name,
      destination: origin.name,
    }));
    setActiveRouteTarget("destination");
  }, [origin, selectedPlace]);

  const handleAddWaypoint = useCallback(() => {
    const waypoint = selectedPlace;
    setWaypoints((current) => [...current, waypoint]);
    setRouteDrafts((current) => ({ ...current, waypoints: [...current.waypoints, waypoint.name] }));
    setActiveRouteTarget(`waypoint-${waypoints.length}`);
  }, [selectedPlace, waypoints.length]);

  const handleRemoveWaypoint = useCallback((index: number) => {
    setWaypoints((current) => current.filter((_, waypointIndex) => waypointIndex !== index));
    setRouteDrafts((current) => ({
      ...current,
      waypoints: current.waypoints.filter((_, waypointIndex) => waypointIndex !== index),
    }));
    setActiveRouteTarget("destination");
  }, []);

  const handleOpenSearch = useCallback(() => {
    setActiveRail("search");
    setSearchFocusToken((current) => current + 1);
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
        language,
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
      setSearchError(error instanceof Error ? error.message : copy.route.searchFailed);
    }
  }, [copy.route.searchFailed, language, query, routePlan.origin.coordinate]);

  const handleSelectPlace = useCallback((place: SearchResult) => {
    applyPlaceToRouteTarget(place, activeRouteTarget);
    setRecentSearches((current) => addRecentSearch(place, current));
  }, [activeRouteTarget, applyPlaceToRouteTarget]);

  const handleLocate = useCallback(async () => {
    setLocationError(null);

    try {
      const nextOrigin = await locateCurrentPosition();
      setOrigin(nextOrigin);
      setRecentSearches((current) => addRecentSearch(nextOrigin, current));
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : copy.route.locationDenied);
    }
  }, [copy.route.locationDenied]);

  const handleRouteSubmit = useCallback(async () => {
    routeAbortRef.current?.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;
    setRouteState("loading");
    setRouteError(null);

    try {
      const nextRoute = await getRoute(routePlan.origin.coordinate, selectedPlace.coordinate, mode, {
        language,
        waypoints: waypoints.map((waypoint) => waypoint.coordinate),
        signal: controller.signal,
      });
      setRoute(nextRoute);
      setRouteState("success");
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      setRouteState("error");
      setRouteError(error instanceof Error ? error.message : copy.route.routeFailed);
    }
  }, [copy.route.routeFailed, language, mode, routePlan.origin.coordinate, selectedPlace.coordinate, waypoints]);

  return (
    <main className="app-shell" data-color-scheme={colorScheme}>
      <AppRail active={activeRail} language={language} onSelect={setActiveRail} />
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
        activePanel={activeRail}
        activeLayer={activeLayer}
        language={language}
        themePreference={themePreference}
        colorScheme={colorScheme}
        routeDrafts={routeDrafts}
        activeRouteTarget={activeRouteTarget}
        searchFocusToken={searchFocusToken}
        onQueryChange={setQuery}
        onSearchSubmit={handleSearchSubmit}
        onRouteSubmit={handleRouteSubmit}
        onModeChange={setMode}
        onSelectPlace={handleSelectPlace}
        onLayerChange={setActiveLayer}
        onLanguageChange={handleLanguageChange}
        onThemePreferenceChange={setThemePreference}
        onRoutePointFocus={setActiveRouteTarget}
        onRoutePointChange={handleRoutePointChange}
        onRoutePointSubmit={handleRoutePointSubmit}
        onSwapRoutePoints={handleSwapRoutePoints}
        onAddWaypoint={handleAddWaypoint}
        onRemoveWaypoint={handleRemoveWaypoint}
      />
      <MapCanvas
        activeLayer={activeLayer}
        language={language}
        plan={routePlan}
        selectedPlace={selectedPlace}
        onCenterChange={handleCenterChange}
        onLocate={handleLocate}
        onOpenSearch={handleOpenSearch}
      />
      <div className="layer-switcher" aria-label={copy.layers.baseMap}>
        {(["standard", "terrain", "transit"] as const).map((layer) => (
          <button
            key={layer}
            className={activeLayer === layer ? "is-active" : ""}
            type="button"
            onClick={() => setActiveLayer(layer)}
          >
            {getLayerLabel(language, layer)}
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        {lastViewport
          ? `${copy.map.centered} ${lastViewport.center.lat.toFixed(4)}, ${lastViewport.center.lng.toFixed(
              4,
            )}, zoom ${lastViewport.zoom.toFixed(1)}`
          : copy.map.ready}
      </span>
    </main>
  );
}

function addRecentSearch(place: SearchResult, recentSearches: SearchResult[]) {
  return [place, ...recentSearches.filter((item) => item.id !== place.id)].slice(0, 5);
}
