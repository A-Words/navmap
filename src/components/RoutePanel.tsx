import {
  ArrowDownUp,
  Bike,
  Building2,
  Car,
  ChevronRight,
  Circle,
  Coffee,
  CornerDownRight,
  CornerUpLeft,
  Crosshair,
  Flag,
  Footprints,
  LocateFixed,
  MapPin,
  Menu,
  ParkingCircle,
  Plus,
  Route as RouteIcon,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  TrainFront,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LANGUAGES } from "../i18n/index";
import type {
  ColorScheme,
  Language,
  LayerId,
  PanelId,
  RouteInstruction,
  RoutePlan,
  RoutePointTarget,
  SearchResult,
  ThemePreference,
  TravelMode,
} from "../types";

type SearchState = "idle" | "loading" | "success" | "empty" | "error";
type RouteState = "idle" | "loading" | "success" | "error";

type RoutePanelProps = {
  plan: RoutePlan;
  selectedPlace: SearchResult;
  detailPlace: SearchResult | null;
  searchResults: SearchResult[];
  recentSearches: SearchResult[];
  activeQuery: string;
  searchState: SearchState;
  searchError: string | null;
  routeState: RouteState;
  routeError: string | null;
  locationError: string | null;
  activePanel: PanelId;
  activeLayer: LayerId;
  themePreference: ThemePreference;
  colorScheme: ColorScheme;
  routeDrafts: { origin: string; destination: string; waypoints: string[] };
  activeRouteTarget: RoutePointTarget;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onRouteSubmit: () => void;
  onModeChange: (mode: TravelMode) => void;
  onSelectPlace: (place: SearchResult) => void;
  onDirectionsFromDetail: () => void;
  onCloseDetail: () => void;
  onLocate: () => void;
  onLayerChange: (layer: LayerId) => void;
  onLanguageChange: (language: Language) => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
  onRoutePointFocus: (target: RoutePointTarget) => void;
  onRoutePointChange: (target: RoutePointTarget, value: string) => void;
  onRoutePointSubmit: (target: RoutePointTarget) => void;
  onSwapRoutePoints: () => void;
  onAddWaypoint: () => void;
  onRemoveWaypoint: (index: number) => void;
  onClosePanel: () => void;
};

export function RoutePanel({
  plan,
  selectedPlace,
  detailPlace,
  searchResults,
  recentSearches,
  activeQuery,
  searchState,
  searchError,
  routeState,
  routeError,
  locationError,
  activePanel,
  activeLayer,
  themePreference,
  colorScheme,
  routeDrafts,
  activeRouteTarget,
  onQueryChange,
  onSearchSubmit,
  onRouteSubmit,
  onModeChange,
  onSelectPlace,
  onDirectionsFromDetail,
  onCloseDetail,
  onLocate,
  onLayerChange,
  onLanguageChange,
  onThemePreferenceChange,
  onRoutePointFocus,
  onRoutePointChange,
  onRoutePointSubmit,
  onSwapRoutePoints,
  onAddWaypoint,
  onRemoveWaypoint,
  onClosePanel,
}: RoutePanelProps) {
  const { t } = useTranslation();
  const title = getPanelTitle(t, activePanel);

  return (
    <aside className="route-panel" aria-label={title}>
      <PanelTopbar title={title} onClosePanel={onClosePanel} />
      <ScrollArea className="panel-scroll">
        <div className="panel-content">
          {activePanel === "route" ? (
            <RoutePlanner
              plan={plan}
              routeState={routeState}
              routeError={routeError}
              locationError={locationError}
              routeDrafts={routeDrafts}
              activeRouteTarget={activeRouteTarget}
              searchResults={searchResults}
              searchState={searchState}
              searchError={searchError}
              onModeChange={onModeChange}
              onRouteSubmit={onRouteSubmit}
              onRoutePointFocus={onRoutePointFocus}
              onRoutePointChange={onRoutePointChange}
              onRoutePointSubmit={onRoutePointSubmit}
              onSwapRoutePoints={onSwapRoutePoints}
              onAddWaypoint={onAddWaypoint}
              onRemoveWaypoint={onRemoveWaypoint}
              onLocate={onLocate}
              onSelectPlace={onSelectPlace}
            />
          ) : null}

          {activePanel === "search" && detailPlace ? (
            <PlaceDetailView
              place={detailPlace}
              onBack={onCloseDetail}
              onDirections={onDirectionsFromDetail}
            />
          ) : null}

          {activePanel === "search" && !detailPlace ? (
            <SearchView
              searchResults={searchResults}
              activeQuery={activeQuery}
              searchState={searchState}
              searchError={searchError}
              recentSearches={recentSearches}
              onQueryChange={onQueryChange}
              onSearchSubmit={onSearchSubmit}
              onSelectPlace={onSelectPlace}
            />
          ) : null}

          {activePanel === "recents" ? (
            <RecentsSection recentSearches={recentSearches} onSelectPlace={onSelectPlace} />
          ) : null}

          {activePanel === "settings" ? (
            <SettingsView
              activeLayer={activeLayer}
              themePreference={themePreference}
              colorScheme={colorScheme}
              recentSearches={recentSearches}
              onLanguageChange={onLanguageChange}
              onThemePreferenceChange={onThemePreferenceChange}
            />
          ) : null}

          {activePanel === "about" ? <AboutView /> : null}
        </div>
      </ScrollArea>
    </aside>
  );
}

function PanelTopbar({
  title,
  onClosePanel,
}: {
  title: string;
  onClosePanel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <header className="panel-topbar">
      <h1>{title}</h1>
      <div className="panel-actions">
        <Button variant="ghost" size="icon-sm" type="button" aria-label={t("panel.share")}>
          <Share2 aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" type="button" aria-label={t("nav.collapse")} onClick={onClosePanel}>
          <X aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

function RoutePlanner({
  plan,
  routeState,
  routeError,
  locationError,
  routeDrafts,
  activeRouteTarget,
  searchResults,
  searchState,
  searchError,
  onModeChange,
  onRouteSubmit,
  onRoutePointFocus,
  onRoutePointChange,
  onRoutePointSubmit,
  onSwapRoutePoints,
  onAddWaypoint,
  onRemoveWaypoint,
  onLocate,
  onSelectPlace,
}: {
  plan: RoutePlan;
  routeState: RouteState;
  routeError: string | null;
  locationError: string | null;
  routeDrafts: { origin: string; destination: string; waypoints: string[] };
  activeRouteTarget: RoutePointTarget;
  searchResults: SearchResult[];
  searchState: SearchState;
  searchError: string | null;
  onModeChange: (mode: TravelMode) => void;
  onRouteSubmit: () => void;
  onRoutePointFocus: (target: RoutePointTarget) => void;
  onRoutePointChange: (target: RoutePointTarget, value: string) => void;
  onRoutePointSubmit: (target: RoutePointTarget) => void;
  onSwapRoutePoints: () => void;
  onAddWaypoint: () => void;
  onRemoveWaypoint: (index: number) => void;
  onLocate: () => void;
  onSelectPlace: (place: SearchResult) => void;
}) {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [routeFieldFocused, setRouteFieldFocused] = useState(false);
  const [routeOptions, setRouteOptions] = useState({
    avoidHighways: false,
    avoidTolls: false,
    avoidFerries: false,
  });

  return (
    <>
      <ToggleGroup
        className="mode-toggle"
        type="single"
        variant="outline"
        value={plan.mode}
        onValueChange={(value) => {
          if (value) {
            onModeChange(value as TravelMode);
          }
        }}
      >
        <ToggleGroupItem value="driving" aria-label={t("modes.driving")}>
          <Car aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="walking" aria-label={t("modes.walking")}>
          <Footprints aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="cycling" aria-label={t("modes.cycling")}>
          <Bike aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Card className="route-editor-card">
        <CardContent className="route-editor-content">
          <div className="route-lines" aria-hidden="true" />
          <RouteField
            label="A"
            tone="origin"
            value={routeDrafts.origin}
            placeholder={t("routeFields.origin")}
            active={activeRouteTarget === "origin"}
            onFocus={() => { onRoutePointFocus("origin"); setRouteFieldFocused(true); }}
            onBlur={() => setRouteFieldFocused(false)}
            onChange={(value) => onRoutePointChange("origin", value)}
            onSubmit={() => onRoutePointSubmit("origin")}
          />
          {plan.waypoints.map((waypoint, index) => {
            const target = `waypoint-${index}` as const;
            return (
              <RouteField
                key={`${waypoint.id}-${index}`}
                label={String(index + 1)}
                tone="waypoint"
                value={routeDrafts.waypoints[index] || waypoint.name}
                placeholder={`${t("route.waypoint")} ${index + 1}`}
                active={activeRouteTarget === target}
                removable
                onFocus={() => { onRoutePointFocus(target); setRouteFieldFocused(true); }}
                onBlur={() => setRouteFieldFocused(false)}
                onChange={(value) => onRoutePointChange(target, value)}
                onSubmit={() => onRoutePointSubmit(target)}
                onRemove={() => onRemoveWaypoint(index)}
              />
            );
          })}
          <RouteField
            label="B"
            tone="destination"
            value={routeDrafts.destination}
            placeholder={t("routeFields.destination")}
            active={activeRouteTarget === "destination"}
            onFocus={() => { onRoutePointFocus("destination"); setRouteFieldFocused(true); }}
            onBlur={() => setRouteFieldFocused(false)}
            onChange={(value) => onRoutePointChange("destination", value)}
            onSubmit={() => onRoutePointSubmit("destination")}
          />
          <Button className="route-add-stop" variant="ghost" type="button" onClick={onAddWaypoint}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {t("route.addWaypoint")}
          </Button>
          <Button className="route-swap" variant="ghost" size="icon-sm" type="button" aria-label={t("routeFields.swap")} onClick={onSwapRoutePoints}>
            <ArrowDownUp aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      {routeFieldFocused &&
      ((activeRouteTarget === "origin" && !routeDrafts.origin.trim()) ||
        (activeRouteTarget === "destination" && !routeDrafts.destination.trim())) ? (
        <Button className="route-locate-btn" variant="ghost" type="button" onClick={onLocate}>
          <LocateFixed data-icon="inline-start" aria-hidden="true" />
          {t("route.currentLocation")}
        </Button>
      ) : null}

      {getActiveDraft(routeDrafts, activeRouteTarget).trim() && searchResults.length ? (
        <div className="search-results-card route-search-results">
          <div className="place-list">
            {searchResults.map((place) => (
              <SearchResultRow key={place.id} place={place} onSelectPlace={onSelectPlace} />
            ))}
          </div>
        </div>
      ) : null}

      {searchState === "loading" ? <p className="panel-message">{t("search.searching")}</p> : null}
      {searchState === "error" ? <p className="panel-message">{searchError}</p> : null}
      {searchState === "empty" ? <p className="panel-message">{t("route.noPlaces")}</p> : null}

      <div className="route-command-row">
        <Select defaultValue="now">
          <SelectTrigger aria-label={t("route.departure")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="now">{t("route.departNow")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Collapsible open={showOptions} onOpenChange={setShowOptions}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" type="button">
              <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
              {t("route.options")}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="route-options-popover">
            <FieldSet>
              {([
                ["avoidHighways", t("route.avoidHighways")],
                ["avoidTolls", t("route.avoidTolls")],
                ["avoidFerries", t("route.avoidFerries")],
              ] as const).map(([key, label]) => (
                <Field key={key} orientation="horizontal">
                  <FieldLabel>{label}</FieldLabel>
                  <Switch
                    size="sm"
                    checked={routeOptions[key]}
                    onCheckedChange={(checked) => setRouteOptions((current) => ({ ...current, [key]: checked }))}
                  />
                </Field>
              ))}
            </FieldSet>
            <p>{t("route.routeOptionHint")}</p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Button className="route-go-button" type="button" disabled={routeState === "loading"} onClick={onRouteSubmit}>
        <RouteIcon data-icon="inline-start" aria-hidden="true" />
        {routeState === "loading" ? t("route.routing") : t("route.go")}
      </Button>

      {routeState === "error" ? <p className="panel-message">{routeError}</p> : null}
      {locationError ? <p className="panel-message">{locationError}</p> : null}

      <RouteSummaryCard plan={plan} />
      <StepsSection instructions={plan.route.instructions} />
    </>
  );
}

function SearchView({
  searchResults,
  activeQuery,
  searchState,
  searchError,
  recentSearches,
  onQueryChange,
  onSearchSubmit,
  onSelectPlace,
}: {
  searchResults: SearchResult[];
  activeQuery: string;
  searchState: SearchState;
  searchError: string | null;
  recentSearches: SearchResult[];
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSelectPlace: (place: SearchResult) => void;
}) {
  return (
    <>
      <SearchSection
        searchResults={searchResults}
        activeQuery={activeQuery}
        searchState={searchState}
        searchError={searchError}
        onQueryChange={onQueryChange}
        onSearchSubmit={onSearchSubmit}
        onSelectPlace={onSelectPlace}
      />
      {!activeQuery.trim() && recentSearches.length ? (
        <RecentsSection recentSearches={recentSearches} onSelectPlace={onSelectPlace} />
      ) : null}
    </>
  );
}

function PlaceDetailView({
  place,
  onBack,
  onDirections,
}: {
  place: SearchResult;
  onBack: () => void;
  onDirections: () => void;
}) {
  const { t, i18n } = useTranslation();
  const typeLabel = getPlaceTypeLabel(place, i18n.language);
  const locality = extractPlaceLocality(place.address);

  return (
    <div className="place-detail-view">
      <div className="place-detail-header">
        <Button
          className="place-detail-back"
          variant="ghost"
          size="icon-sm"
          type="button"
          onClick={onBack}
          aria-label={t("search.backToResults")}
        >
          <ChevronRight aria-hidden="true" style={{ transform: "rotate(180deg)" }} />
        </Button>
        <span className="place-detail-header-title">{t("search.details")}</span>
      </div>

      <div className="place-detail-hero">
        <PlaceGlyph place={place} featured />
        <div className="place-detail-hero-text">
          <h2>{place.name}</h2>
          <p className="place-detail-meta">
            {typeLabel ? <span>{typeLabel}</span> : null}
            {typeLabel && locality ? <span className="place-detail-dot">·</span> : null}
            {locality ? <span>{locality}</span> : null}
          </p>
        </div>
      </div>

      <div className="place-detail-actions">
        <Button
          className="place-detail-directions-btn"
          type="button"
          onClick={onDirections}
        >
          <RouteIcon data-icon="inline-start" aria-hidden="true" />
          {t("search.directions")}
        </Button>
      </div>

      <div className="place-detail-info">
        {place.address ? (
          <div className="place-detail-info-row">
            <MapPin aria-hidden="true" />
            <span>{place.address}</span>
          </div>
        ) : null}
        <div className="place-detail-info-row">
          <LocateFixed aria-hidden="true" />
          <span>
            {place.coordinate.lat.toFixed(5)}, {place.coordinate.lng.toFixed(5)}
          </span>
        </div>
        {place.distanceLabel ? (
          <div className="place-detail-info-row">
            <Crosshair aria-hidden="true" />
            <span>{place.distanceLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RouteSummaryCard({ plan }: { plan: RoutePlan }) {
  const { t } = useTranslation();

  return (
    <Card className="route-summary-card" size="sm">
      <CardHeader>
        <CardTitle>
          <Car aria-hidden="true" />
          <span>{t("route.fastest")}</span>
        </CardTitle>
        <CardDescription>{plan.route.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="route-metrics">
          <strong>{plan.route.durationLabel}</strong>
          <span>{plan.route.distanceLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StepsSection({ instructions }: { instructions: RouteInstruction[] }) {
  const { t } = useTranslation();
  return (
    <Card className="panel-card" size="sm">
      <CardHeader>
        <CardTitle>{t("route.stepByStep")}</CardTitle>
      </CardHeader>
      <CardContent className="instruction-list">
        {instructions.map((instruction) => (
          <InstructionRow key={instruction.id} instruction={instruction} />
        ))}
      </CardContent>
    </Card>
  );
}

function SearchSection({
  searchResults,
  activeQuery,
  searchState,
  searchError,
  onQueryChange,
  onSearchSubmit,
  onSelectPlace,
  compact = false,
}: {
  searchResults: SearchResult[];
  activeQuery: string;
  searchState: SearchState;
  searchError: string | null;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSelectPlace: (place: SearchResult) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const hasActiveQuery = Boolean(activeQuery.trim());
  const visibleResults = hasActiveQuery ? searchResults : [];

  return (
    <section className="search-section-content" aria-label={compact ? t("route.searchResults") : t("route.places")}>
      <div className="panel-search-form">
        <Search aria-hidden="true" />
        <Input
          value={activeQuery}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearchSubmit();
            }
          }}
          placeholder={t("search.inputPlaceholder")}
        />
        {activeQuery ? (
          <Button
            className="search-clear-button"
            variant="ghost"
            size="icon-xs"
            type="button"
            aria-label={t("search.clearInput")}
            onClick={() => onQueryChange("")}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {visibleResults.length ? (
        <div className="search-results-card">
          <div className="place-list">
            {visibleResults.map((place) => (
              <SearchResultRow key={place.id} place={place} onSelectPlace={onSelectPlace} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="search-status-stack">
        {searchState === "error" ? <p className="panel-message">{searchError}</p> : null}
        {searchState === "empty" ? <p className="panel-message">{t("route.noPlaces")}</p> : null}
        {searchState === "loading" ? <p className="panel-message">{t("search.searching")}</p> : null}
        {compact ? <p className="panel-hint">{t("route.useSearchResult")}</p> : null}
      </div>
    </section>
  );
}

function RecentsSection({
  recentSearches,
  onSelectPlace,
  compact = false,
}: {
  recentSearches: SearchResult[];
  onSelectPlace: (place: SearchResult) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();

  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <Card className="panel-card recent-section" size="sm">
      <CardHeader>
        <CardTitle>{compact ? t("route.recentSearches") : t("route.recentPlaces")}</CardTitle>
      </CardHeader>
      <CardContent className="place-list">
        {recentSearches.map((place) => (
          <Button key={place.id} className="recent-row" variant="ghost" type="button" onClick={() => onSelectPlace(place)}>
            <LocateFixed data-icon="inline-start" aria-hidden="true" />
            <span>{place.name}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function SettingsView({
  activeLayer,
  themePreference,
  colorScheme,
  recentSearches,
  onLanguageChange,
  onThemePreferenceChange,
}: {
  activeLayer: LayerId;
  themePreference: ThemePreference;
  colorScheme: ColorScheme;
  recentSearches: SearchResult[];
  onLanguageChange: (language: Language) => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
}) {
  const { t, i18n } = useTranslation();

  return (
    <Card className="panel-card" size="sm">
      <CardContent className="settings-list">
        <InfoRow title={t("settings.defaultLayer")} description={t(`layers.${activeLayer}`)} value={t("settings.auto")} />
        <div className="setting-control-row">
          <span>
            <strong>{t("settings.language")}</strong>
            <small>{t("settings.languageDescription")}</small>
          </span>
          <ToggleGroup
            type="single"
            value={i18n.language}
            variant="outline"
            size="sm"
            onValueChange={(value) => {
              if (value) {
                onLanguageChange(value as Language);
              }
            }}
          >
            {LANGUAGES.map((item) => (
              <ToggleGroupItem key={item.id} value={item.id}>
                {item.shortLabel}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="setting-control-row is-stacked">
          <span>
            <strong>{t("settings.appearance")}</strong>
            <small>
              {t("settings.appearanceDescription")} ·{" "}
              {colorScheme === "dark" ? t("settings.themeDark") : t("settings.themeLight")}
            </small>
          </span>
          <ToggleGroup
            className="theme-toggle"
            type="single"
            value={themePreference}
            variant="outline"
            size="sm"
            onValueChange={(value) => {
              if (value) {
                onThemePreferenceChange(value as ThemePreference);
              }
            }}
          >
            <ToggleGroupItem value="system">{t("settings.themeSystem")}</ToggleGroupItem>
            <ToggleGroupItem value="light">{t("settings.themeLight")}</ToggleGroupItem>
            <ToggleGroupItem value="dark">{t("settings.themeDark")}</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <InfoRow
          title={t("settings.recentSearches")}
          description={`${recentSearches.length} ${t("settings.savedLocally")}`}
          value={t("settings.auto")}
        />
        <InfoRow title={t("settings.location")} description={t("settings.locationDescription")} value={t("settings.ask")} />
      </CardContent>
    </Card>
  );
}

function AboutView() {
  const { t } = useTranslation();

  return (
    <Card className="panel-card" size="sm">
      <CardHeader>
        <CardTitle>NavMap</CardTitle>
        <CardDescription>{t("about.body")}</CardDescription>
      </CardHeader>
      <CardContent className="settings-list">
        <InfoRow title={t("about.mapData")} description={t("about.attribution")} value="OSM" />
        <InfoRow title={t("about.version")} description="Desktop preview" value="0.1.0" />
      </CardContent>
    </Card>
  );
}

function InfoRow({ title, description, value }: { title: string; description: string; value: string }) {
  return (
    <div className="info-row">
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <Badge variant="secondary">{value}</Badge>
    </div>
  );
}

function SearchResultRow({ place, onSelectPlace }: { place: SearchResult; onSelectPlace: (place: SearchResult) => void }) {
  const { i18n } = useTranslation();
  const primaryMeta = formatPlacePrimaryMeta(place, i18n.language);
  const secondaryMeta = formatPlaceSecondaryMeta(place);

  return (
    <Button className="place-row apple-place-row" variant="ghost" type="button" onClick={() => onSelectPlace(place)}>
      <PlaceGlyph place={place} />
      <span className="place-row-copy">
        <strong>{place.name}</strong>
        {primaryMeta ? <small>{primaryMeta}</small> : null}
        {secondaryMeta ? <small className="place-row-secondary">{secondaryMeta}</small> : null}
        <PlaceBadges place={place} />
      </span>
    </Button>
  );
}

function PlaceGlyph({ place, featured = false }: { place: SearchResult; featured?: boolean }) {
  const kind = getPlaceKind(place);
  const Icon = getPlaceIcon(place);

  return (
    <span className={`place-glyph ${kind} ${featured ? "featured" : ""}`} aria-hidden="true">
      <Icon aria-hidden="true" />
    </span>
  );
}

function PlaceBadges({ place }: { place: SearchResult }) {
  const { t } = useTranslation();
  const badges = getPlaceBadges(getPlaceKind(place), t);

  if (!badges.length) {
    return null;
  }

  return (
    <span className="place-badges" aria-hidden="true">
      {badges.map((badge) => (
        <span key={badge.label} className={`place-badge ${badge.tone}`}>
          {badge.label}
        </span>
      ))}
    </span>
  );
}

type PlaceKind = "landmark" | "station" | "entrance" | "parking" | "food" | "coffee" | "building" | "place";
type PlaceBadge = { label: string; tone: "red" | "orange" | "blue" | "green" | "neutral" };

function getPlaceIcon(place: SearchResult) {
  const kind = getPlaceKind(place);

  if (kind === "station") {
    return TrainFront;
  }
  if (kind === "landmark") {
    return Star;
  }
  if (kind === "parking") {
    return ParkingCircle;
  }
  if (kind === "coffee") {
    return Coffee;
  }
  if (kind === "food") {
    return Utensils;
  }
  if (kind === "building") {
    return Building2;
  }

  return MapPin;
}

function getPlaceKind(place: SearchResult): PlaceKind {
  const type = `${place.type || ""} ${place.name}`.toLowerCase();

  if (/(entrance|exit|gate|出入口|进站口|出站口|入口|出口)/i.test(type)) {
    return "entrance";
  }
  if (/(station|rail|train|subway|metro|车站|火车|地铁|站)/i.test(type)) {
    return "station";
  }
  if (/(parking|car_park|停车|停车场)/i.test(type)) {
    return "parking";
  }
  if (/(cafe|coffee|luckin|咖啡|茶)/i.test(type)) {
    return "coffee";
  }
  if (/(restaurant|food|餐|饭|食|茶百道)/i.test(type)) {
    return "food";
  }
  if (/(building|commercial|office|shop|mall|plaza|广场|楼|大厦)/i.test(type)) {
    return "building";
  }
  if (/(tower|attraction|tourism|viewpoint|monument|museum|景点|塔$)/i.test(type)) {
    return "landmark";
  }

  return "place";
}

function getPlaceBadges(kind: PlaceKind, t: (key: string) => string): PlaceBadge[] {
  if (kind === "station" || kind === "entrance") {
    return [
      { label: "Y", tone: "red" },
      { label: "3", tone: "orange" },
      { label: "APM", tone: "blue" },
    ];
  }
  if (kind === "parking") {
    return [{ label: "P", tone: "blue" }];
  }
  if (kind === "coffee") {
    return [{ label: t("search.badgeCoffee"), tone: "orange" }];
  }
  if (kind === "food") {
    return [{ label: t("search.badgeFood"), tone: "orange" }];
  }

  return [];
}

function formatPlacePrimaryMeta(place: SearchResult, language: string) {
  return [getPlaceTypeLabel(place, language), extractPlaceLocality(place.address)].filter(Boolean).join(" · ");
}

function formatPlaceSecondaryMeta(place: SearchResult) {
  return [place.distanceLabel, formatShortAddress(place)].filter(Boolean).join(" · ");
}

function getPlaceTypeLabel(place: SearchResult, language: string) {
  const kind = getPlaceKind(place);
  const zhLabels: Record<PlaceKind, string> = {
    landmark: "景点",
    station: "车站",
    entrance: "车站入口",
    parking: "停车场",
    food: "餐饮",
    coffee: "咖啡店",
    building: "地点",
    place: "地点",
  };
  const enLabels: Record<PlaceKind, string> = {
    landmark: "Landmark",
    station: "Station",
    entrance: "Station entrance",
    parking: "Parking",
    food: "Food",
    coffee: "Coffee",
    building: "Place",
    place: "Place",
  };

  return language.startsWith("zh") ? zhLabels[kind] : enLabels[kind];
}

function extractPlaceLocality(address: string) {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const city = parts.find((part) => /市$|city$/i.test(part));
  const locality = city || parts.find((part) => /区$|县$|镇$|town$|village$|county$/i.test(part));

  return locality || parts[1] || "";
}

function formatShortAddress(place: SearchResult) {
  const parts = place.address
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part !== place.name);

  return parts.slice(0, 2).join(" · ");
}

function RouteField({
  label,
  tone,
  value,
  placeholder,
  active,
  removable = false,
  onFocus,
  onBlur,
  onChange,
  onSubmit,
  onRemove,
}: {
  label: string;
  tone: "origin" | "waypoint" | "destination";
  value: string;
  placeholder: string;
  active: boolean;
  removable?: boolean;
  onFocus: () => void;
  onBlur?: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="route-field-row" data-active={active}>
      <span className={`route-pin ${tone}`}>{label}</span>
      <Input
        value={value}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      {removable ? (
        <Button variant="ghost" size="icon-xs" type="button" aria-label="Remove waypoint" onClick={onRemove}>
          <X aria-hidden="true" />
        </Button>
      ) : (
        <Menu aria-hidden="true" />
      )}
    </div>
  );
}

function InstructionRow({ instruction }: { instruction: RouteInstruction }) {
  const Icon = instructionIcon[instruction.icon];
  return (
    <>
      <div className="instruction-row">
        <Icon aria-hidden="true" />
        <span>
          <strong>{instruction.title}</strong>
          {instruction.subtitle ? <small>{instruction.subtitle}</small> : null}
        </span>
        <em>{instruction.distanceLabel}</em>
      </div>
      <Separator />
    </>
  );
}

function getPanelTitle(t: (key: string) => string, activePanel: PanelId) {
  const panelKeys: Record<PanelId, string> = {
    route: "panel.routePlanning",
    search: "panel.searchTitle",
    recents: "panel.recentsTitle",
    settings: "panel.settingsTitle",
    about: "panel.aboutTitle",
  };

  return t(panelKeys[activePanel]);
}

const instructionIcon = {
  start: Circle,
  straight: RouteIcon,
  right: CornerDownRight,
  left: CornerUpLeft,
  merge: RouteIcon,
  highway: Car,
  arrive: Flag,
} satisfies Record<RouteInstruction["icon"], typeof Circle>;

function getActiveDraft(
  routeDrafts: { origin: string; destination: string; waypoints: string[] },
  activeRouteTarget: RoutePointTarget,
): string {
  if (activeRouteTarget === "origin") return routeDrafts.origin;
  if (activeRouteTarget === "destination") return routeDrafts.destination;
  const index = Number(activeRouteTarget.replace("waypoint-", ""));
  return routeDrafts.waypoints[index] || "";
}
