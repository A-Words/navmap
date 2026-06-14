import {
  ArrowDownUp,
  Bike,
  Car,
  ChevronRight,
  Circle,
  CornerDownRight,
  CornerUpLeft,
  Flag,
  Footprints,
  LocateFixed,
  MapPin,
  Menu,
  Plus,
  Route as RouteIcon,
  Search,
  Share2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getLayerLabel, LANGUAGES, translations } from "../i18n";
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
  language: Language;
  themePreference: ThemePreference;
  colorScheme: ColorScheme;
  routeDrafts: { origin: string; destination: string; waypoints: string[] };
  activeRouteTarget: RoutePointTarget;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onRouteSubmit: () => void;
  onModeChange: (mode: TravelMode) => void;
  onSelectPlace: (place: SearchResult) => void;
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
  language,
  themePreference,
  colorScheme,
  routeDrafts,
  activeRouteTarget,
  onQueryChange,
  onSearchSubmit,
  onRouteSubmit,
  onModeChange,
  onSelectPlace,
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
  const copy = translations[language];
  const title = getPanelTitle(language, activePanel);

  return (
    <aside className="route-panel" aria-label={title}>
      <PanelTopbar title={title} language={language} onClosePanel={onClosePanel} />
      <ScrollArea className="panel-scroll">
        <div className="panel-content">
          {activePanel === "route" ? (
            <RoutePlanner
              plan={plan}
              language={language}
              routeState={routeState}
              routeError={routeError}
              locationError={locationError}
              routeDrafts={routeDrafts}
              activeRouteTarget={activeRouteTarget}
              selectedPlace={selectedPlace}
              searchResults={searchResults}
              recentSearches={recentSearches}
              activeQuery={activeQuery}
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
              onQueryChange={onQueryChange}
              onSearchSubmit={onSearchSubmit}
              onSelectPlace={onSelectPlace}
            />
          ) : null}

          {activePanel === "search" ? (
            <SearchView
              language={language}
              selectedPlace={selectedPlace}
              searchResults={searchResults}
              recentSearches={recentSearches}
              activeQuery={activeQuery}
              searchState={searchState}
              searchError={searchError}
              onQueryChange={onQueryChange}
              onSearchSubmit={onSearchSubmit}
              onSelectPlace={onSelectPlace}
            />
          ) : null}

          {activePanel === "recents" ? (
            <RecentsSection recentSearches={recentSearches} language={language} onSelectPlace={onSelectPlace} />
          ) : null}

          {activePanel === "layers" ? (
            <LayersView
              activeLayer={activeLayer}
              language={language}
              onLayerChange={onLayerChange}
            />
          ) : null}

          {activePanel === "settings" ? (
            <SettingsView
              activeLayer={activeLayer}
              language={language}
              themePreference={themePreference}
              colorScheme={colorScheme}
              recentSearches={recentSearches}
              onLanguageChange={onLanguageChange}
              onThemePreferenceChange={onThemePreferenceChange}
            />
          ) : null}

          {activePanel === "about" ? <AboutView language={language} /> : null}
        </div>
      </ScrollArea>
    </aside>
  );
}

function PanelTopbar({
  title,
  language,
  onClosePanel,
}: {
  title: string;
  language: Language;
  onClosePanel: () => void;
}) {
  const copy = translations[language];

  return (
    <header className="panel-topbar">
      <h1>{title}</h1>
      <div className="panel-actions">
        <Button variant="ghost" size="icon-sm" type="button" aria-label={copy.panel.share}>
          <Share2 aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" type="button" aria-label={copy.nav.collapse} onClick={onClosePanel}>
          <X aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

function RoutePlanner({
  plan,
  language,
  routeState,
  routeError,
  locationError,
  routeDrafts,
  activeRouteTarget,
  selectedPlace,
  searchResults,
  recentSearches,
  activeQuery,
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
  onQueryChange,
  onSearchSubmit,
  onSelectPlace,
}: {
  plan: RoutePlan;
  language: Language;
  routeState: RouteState;
  routeError: string | null;
  locationError: string | null;
  routeDrafts: { origin: string; destination: string; waypoints: string[] };
  activeRouteTarget: RoutePointTarget;
  selectedPlace: SearchResult;
  searchResults: SearchResult[];
  recentSearches: SearchResult[];
  activeQuery: string;
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
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSelectPlace: (place: SearchResult) => void;
}) {
  const copy = translations[language];
  const [showOptions, setShowOptions] = useState(false);
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
        <ToggleGroupItem value="driving" aria-label={copy.modes.driving}>
          <Car aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="walking" aria-label={copy.modes.walking}>
          <Footprints aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="cycling" aria-label={copy.modes.cycling}>
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
            placeholder={copy.routeFields.origin}
            active={activeRouteTarget === "origin"}
            onFocus={() => onRoutePointFocus("origin")}
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
                placeholder={`${copy.route.waypoint} ${index + 1}`}
                active={activeRouteTarget === target}
                removable
                onFocus={() => onRoutePointFocus(target)}
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
            placeholder={copy.routeFields.destination}
            active={activeRouteTarget === "destination"}
            onFocus={() => onRoutePointFocus("destination")}
            onChange={(value) => onRoutePointChange("destination", value)}
            onSubmit={() => onRoutePointSubmit("destination")}
          />
          <Button className="route-add-stop" variant="ghost" type="button" onClick={onAddWaypoint}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {copy.route.addWaypoint}
          </Button>
          <Button className="route-swap" variant="ghost" size="icon-sm" type="button" aria-label={copy.routeFields.swap} onClick={onSwapRoutePoints}>
            <ArrowDownUp aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      <div className="route-command-row">
        <Select defaultValue="now">
          <SelectTrigger aria-label={copy.route.departure}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="now">{copy.route.departNow}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Collapsible open={showOptions} onOpenChange={setShowOptions}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" type="button">
              <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
              {copy.route.options}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="route-options-popover">
            <FieldSet>
              {([
                ["avoidHighways", copy.route.avoidHighways],
                ["avoidTolls", copy.route.avoidTolls],
                ["avoidFerries", copy.route.avoidFerries],
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
            <p>{copy.route.routeOptionHint}</p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Button className="route-go-button" type="button" disabled={routeState === "loading"} onClick={onRouteSubmit}>
        <RouteIcon data-icon="inline-start" aria-hidden="true" />
        {routeState === "loading" ? copy.route.routing : copy.route.go}
      </Button>

      {routeState === "error" ? <p className="panel-message">{routeError}</p> : null}
      {locationError ? <p className="panel-message">{locationError}</p> : null}

      <RouteSummaryCard plan={plan} language={language} />
      <StepsSection instructions={plan.route.instructions} language={language} />
      <SearchSection
        language={language}
        selectedPlace={selectedPlace}
        searchResults={searchResults}
        activeQuery={activeQuery}
        searchState={searchState}
        searchError={searchError}
        onQueryChange={onQueryChange}
        onSearchSubmit={onSearchSubmit}
        onSelectPlace={onSelectPlace}
        compact
      />
      <RecentsSection recentSearches={recentSearches} language={language} onSelectPlace={onSelectPlace} compact />
    </>
  );
}

function SearchView({
  language,
  selectedPlace,
  searchResults,
  recentSearches,
  activeQuery,
  searchState,
  searchError,
  onQueryChange,
  onSearchSubmit,
  onSelectPlace,
}: {
  language: Language;
  selectedPlace: SearchResult;
  searchResults: SearchResult[];
  recentSearches: SearchResult[];
  activeQuery: string;
  searchState: SearchState;
  searchError: string | null;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSelectPlace: (place: SearchResult) => void;
}) {
  return (
    <>
      <SearchSection
        language={language}
        selectedPlace={selectedPlace}
        searchResults={searchResults}
        activeQuery={activeQuery}
        searchState={searchState}
        searchError={searchError}
        onQueryChange={onQueryChange}
        onSearchSubmit={onSearchSubmit}
        onSelectPlace={onSelectPlace}
      />
      <RecentsSection recentSearches={recentSearches} language={language} onSelectPlace={onSelectPlace} />
    </>
  );
}

function RouteSummaryCard({ plan, language }: { plan: RoutePlan; language: Language }) {
  const copy = translations[language];

  return (
    <Card className="route-summary-card" size="sm">
      <CardHeader>
        <CardTitle>
          <Car aria-hidden="true" />
          <span>{copy.route.fastest}</span>
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

function StepsSection({ instructions, language }: { instructions: RouteInstruction[]; language: Language }) {
  const copy = translations[language];
  return (
    <Card className="panel-card" size="sm">
      <CardHeader>
        <CardTitle>{copy.route.stepByStep}</CardTitle>
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
  language,
  selectedPlace,
  searchResults,
  activeQuery,
  searchState,
  searchError,
  onQueryChange,
  onSearchSubmit,
  onSelectPlace,
  compact = false,
}: {
  language: Language;
  selectedPlace: SearchResult;
  searchResults: SearchResult[];
  activeQuery: string;
  searchState: SearchState;
  searchError: string | null;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSelectPlace: (place: SearchResult) => void;
  compact?: boolean;
}) {
  const copy = translations[language];

  return (
    <Card className="panel-card" size="sm">
      <CardHeader>
        <CardTitle>{compact ? copy.route.searchResults : copy.route.places}</CardTitle>
      </CardHeader>
      <CardContent className="search-section-content">
        <form
          className="panel-search-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <Search aria-hidden="true" />
          <Input
            value={activeQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={copy.search.inputPlaceholder}
          />
          <Button type="submit" disabled={searchState === "loading"}>
            {searchState === "loading" ? copy.search.searching : copy.search.submit}
          </Button>
        </form>
        <PlaceDetail place={selectedPlace} />
        {searchState === "error" ? <p className="panel-message">{searchError}</p> : null}
        {searchState === "empty" ? <p className="panel-message">{copy.route.noPlaces}</p> : null}
        {compact ? <p className="panel-hint">{copy.route.useSearchResult}</p> : null}
        <div className="place-list">
          {searchResults.map((place) => (
            <PlaceRow key={place.id} place={place} onSelectPlace={onSelectPlace} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentsSection({
  recentSearches,
  language,
  onSelectPlace,
  compact = false,
}: {
  recentSearches: SearchResult[];
  language: Language;
  onSelectPlace: (place: SearchResult) => void;
  compact?: boolean;
}) {
  const copy = translations[language];

  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <Card className="panel-card recent-section" size="sm">
      <CardHeader>
        <CardTitle>{compact ? copy.route.recentSearches : copy.route.recentPlaces}</CardTitle>
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

function LayersView({
  activeLayer,
  language,
  onLayerChange,
}: {
  activeLayer: LayerId;
  language: Language;
  onLayerChange: (layer: LayerId) => void;
}) {
  const copy = translations[language];
  return (
    <>
      <Tabs value={activeLayer} onValueChange={(value) => onLayerChange(value as LayerId)}>
        <TabsList className="layer-tabs">
          {(["standard", "terrain", "transit"] as const).map((layer) => (
            <TabsTrigger key={layer} value={layer}>
              {getLayerLabel(language, layer)}
            </TabsTrigger>
          ))}
        </TabsList>
        {(["standard", "terrain", "transit"] as const).map((layer) => (
          <TabsContent key={layer} value={layer}>
            <Card className="panel-card" size="sm">
              <CardHeader>
                <CardTitle>{getLayerLabel(language, layer)}</CardTitle>
                <CardDescription>{copy.layers.layersHint}</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      <Card className="panel-card" size="sm">
        <CardHeader>
          <CardTitle>{copy.layers.visibleOverlays}</CardTitle>
        </CardHeader>
        <CardContent className="settings-list">
          <InfoRow title={copy.layers.activeRoute} description={copy.layers.activeRouteDescription} value={copy.layers.on} />
          <InfoRow title={copy.layers.scaleAttribution} description={copy.layers.scaleAttributionDescription} value={copy.layers.on} />
        </CardContent>
      </Card>
    </>
  );
}

function SettingsView({
  activeLayer,
  language,
  themePreference,
  colorScheme,
  recentSearches,
  onLanguageChange,
  onThemePreferenceChange,
}: {
  activeLayer: LayerId;
  language: Language;
  themePreference: ThemePreference;
  colorScheme: ColorScheme;
  recentSearches: SearchResult[];
  onLanguageChange: (language: Language) => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
}) {
  const copy = translations[language];

  return (
    <Card className="panel-card" size="sm">
      <CardContent className="settings-list">
        <InfoRow title={copy.settings.defaultLayer} description={getLayerLabel(language, activeLayer)} value={copy.settings.auto} />
        <div className="setting-control-row">
          <span>
            <strong>{copy.settings.language}</strong>
            <small>{copy.settings.languageDescription}</small>
          </span>
          <ToggleGroup
            type="single"
            value={language}
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
            <strong>{copy.settings.appearance}</strong>
            <small>
              {copy.settings.appearanceDescription} ·{" "}
              {colorScheme === "dark" ? copy.settings.themeDark : copy.settings.themeLight}
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
            <ToggleGroupItem value="system">{copy.settings.themeSystem}</ToggleGroupItem>
            <ToggleGroupItem value="light">{copy.settings.themeLight}</ToggleGroupItem>
            <ToggleGroupItem value="dark">{copy.settings.themeDark}</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <InfoRow
          title={copy.settings.recentSearches}
          description={`${recentSearches.length} ${copy.settings.savedLocally}`}
          value={copy.settings.auto}
        />
        <InfoRow title={copy.settings.location} description={copy.settings.locationDescription} value={copy.settings.ask} />
      </CardContent>
    </Card>
  );
}

function AboutView({ language }: { language: Language }) {
  const copy = translations[language];

  return (
    <Card className="panel-card" size="sm">
      <CardHeader>
        <CardTitle>NavMap</CardTitle>
        <CardDescription>{copy.about.body}</CardDescription>
      </CardHeader>
      <CardContent className="settings-list">
        <InfoRow title={copy.about.mapData} description={copy.about.attribution} value="OSM" />
        <InfoRow title={copy.about.version} description="Desktop preview" value="0.1.0" />
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

function PlaceDetail({ place }: { place: SearchResult }) {
  return (
    <article className="place-detail" aria-label="Selected place">
      <span className="place-detail-pin">
        <MapPin aria-hidden="true" />
      </span>
      <div>
        <strong>{place.name}</strong>
        <p>{place.address}</p>
        <small>
          {place.coordinate.lat.toFixed(5)}, {place.coordinate.lng.toFixed(5)}
        </small>
      </div>
    </article>
  );
}

function PlaceRow({ place, onSelectPlace }: { place: SearchResult; onSelectPlace: (place: SearchResult) => void }) {
  return (
    <Button className="place-row" variant="ghost" type="button" onClick={() => onSelectPlace(place)}>
      <MapPin data-icon="inline-start" aria-hidden="true" />
      <span>
        <strong>{place.name}</strong>
        <small>{place.address}</small>
      </span>
      {place.distanceLabel ? <em>{place.distanceLabel}</em> : null}
    </Button>
  );
}

function RouteField({
  label,
  tone,
  value,
  placeholder,
  active,
  removable = false,
  onFocus,
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

function getPanelTitle(language: Language, activePanel: PanelId) {
  const copy = translations[language];

  if (activePanel === "route") {
    return copy.panel.routePlanning;
  }
  if (activePanel === "search") {
    return copy.panel.searchTitle;
  }
  if (activePanel === "recents") {
    return copy.panel.recentsTitle;
  }
  if (activePanel === "layers") {
    return copy.panel.layersTitle;
  }
  if (activePanel === "settings") {
    return copy.panel.settingsTitle;
  }

  return copy.panel.aboutTitle;
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
