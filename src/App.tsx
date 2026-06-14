import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppRail } from "./components/AppRail";
import { MapCanvas } from "./components/MapCanvas";
import { RoutePanel } from "./components/RoutePanel";
import { TooltipProvider } from "./components/ui/tooltip";
import { DEFAULT_CENTER } from "./config/mapServices";
import i18next, { DEFAULT_LANGUAGE } from "./i18n/index";
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

const EMPTY_ORIGIN: SearchResult = {
  id: "my-location",
  name: "",
  address: "",
  coordinate: DEFAULT_CENTER,
  type: "location",
};

const EMPTY_ROUTE: RouteSummary = {
  distanceLabel: "",
  durationLabel: "",
  description: "",
  geometry: [],
  instructions: [],
};

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function getSystemColorScheme(): ColorScheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

export default function App() {
  const { t } = useTranslation();
  const [activeRail, setActiveRail] = useState<PanelId>("route");
  const [railCollapsed, setRailCollapsed] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeLayer, setActiveLayer] = useState<LayerId>("standard");
  const [systemColorScheme, setSystemColorScheme] = useState<ColorScheme>(() => getSystemColorScheme());
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<TravelMode>("driving");
  const [origin, setOrigin] = useState<SearchResult>(EMPTY_ORIGIN);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult>(EMPTY_ORIGIN);
  const [waypoints, setWaypoints] = useState<SearchResult[]>([]);
  const [routeDrafts, setRouteDrafts] = useState({
    origin: "",
    destination: "",
    waypoints: [] as string[],
  });
  const [activeRouteTarget, setActiveRouteTarget] = useState<RoutePointTarget>("destination");
  const [route, setRoute] = useState<RouteSummary>(EMPTY_ROUTE);
  const [routeState, setRouteState] = useState<RouteState>("idle");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastViewport, setLastViewport] = useState<{ center: LngLat; zoom: number } | null>(null);
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
    document.documentElement.classList.toggle("dark", colorScheme === "dark");
    document.documentElement.style.colorScheme = colorScheme;

    return () => {
      delete document.documentElement.dataset.colorScheme;
      document.documentElement.classList.remove("dark");
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
        setThemePreference(settings.themePreference);
        if (settings.language !== DEFAULT_LANGUAGE) {
          void i18next.changeLanguage(settings.language);
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
        language: i18next.language as Language,
        themePreference,
        showTrafficHints: true,
        lastCenter: lastViewport.center,
        lastZoom: lastViewport.zoom,
        recentSearches,
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [activeLayer, lastViewport, recentSearches, themePreference, i18next.language]);

  const handleLanguageChange = useCallback((nextLanguage: string) => {
    void i18next.changeLanguage(nextLanguage);
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
      setSearchError(error instanceof Error ? error.message : t("route.searchFailed"));
    }
  }, [applyPlaceToRouteTarget, routeDrafts, routePlan.origin.coordinate, t]);

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
      setSearchError(error instanceof Error ? error.message : t("route.searchFailed"));
    }
  }, [query, routePlan.origin.coordinate, t]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchState("idle");
      return;
    }

    const timer = setTimeout(() => {
      handleSearchSubmit();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearchSubmit]);

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
      setLocationError(error instanceof Error ? error.message : t("route.locationDenied"));
    }
  }, [t]);

  const handleRouteSubmit = useCallback(async () => {
    routeAbortRef.current?.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;
    setRouteState("loading");
    setRouteError(null);

    try {
      const nextRoute = await getRoute(routePlan.origin.coordinate, selectedPlace.coordinate, mode, {
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
      setRouteError(error instanceof Error ? error.message : t("route.routeFailed"));
    }
  }, [mode, routePlan.origin.coordinate, selectedPlace.coordinate, t, waypoints]);

  const handleRailSelect = useCallback((panel: PanelId) => {
    setActiveRail(panel);
    setPanelOpen(true);
  }, []);

  return (
    <TooltipProvider>
      <main
        className={`app-shell ${railCollapsed ? "is-rail-collapsed" : ""} ${panelOpen ? "" : "is-panel-collapsed"}`}
        data-color-scheme={colorScheme}
      >
        <AppRail
          active={activeRail}
          railCollapsed={railCollapsed}
          onSelect={handleRailSelect}
          onToggleRail={() => setRailCollapsed((current) => !current)}
        />
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
          themePreference={themePreference}
          colorScheme={colorScheme}
          routeDrafts={routeDrafts}
          activeRouteTarget={activeRouteTarget}
          onQueryChange={setQuery}
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
          onClosePanel={() => {
            setPanelOpen(false);
            setRailCollapsed(true);
          }}
        />
        <MapCanvas
          activeLayer={activeLayer}
          plan={routePlan}
          selectedPlace={selectedPlace}
          onCenterChange={handleCenterChange}
          onLocate={handleLocate}
          railCollapsed={railCollapsed}
          panelOpen={panelOpen}
        />
        <div className="layer-switcher" aria-label={t("layers.baseMap")}>
          {(["standard", "terrain", "transit"] as const).map((layer) => (
            <button
              key={layer}
              className={activeLayer === layer ? "is-active" : ""}
              type="button"
              onClick={() => setActiveLayer(layer)}
            >
              {t(`layers.${layer}`)}
            </button>
          ))}
        </div>
        <span className="sr-only" aria-live="polite">
          {lastViewport
            ? `${t("map.centered")} ${lastViewport.center.lat.toFixed(4)}, ${lastViewport.center.lng.toFixed(
                4,
              )}, zoom ${lastViewport.zoom.toFixed(1)}`
            : t("map.ready")}
        </span>
      </main>
    </TooltipProvider>
  );
}

function addRecentSearch(place: SearchResult, recentSearches: SearchResult[]) {
  return [place, ...recentSearches.filter((item) => item.id !== place.id)].slice(0, 5);
}
