import {
  ArrowDownUp,
  Car,
  ChevronDown,
  ChevronRight,
  Circle,
  CornerDownRight,
  CornerUpLeft,
  Flag,
  LocateFixed,
  MapPin,
  MoreVertical,
  Plus,
  Route as RouteIcon,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  searchFocusToken: number;
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
  searchFocusToken,
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
}: RoutePanelProps) {
  const copy = translations[language];
  const [showOptions, setShowOptions] = useState(false);
  const [routeOptions, setRouteOptions] = useState({
    avoidHighways: false,
    avoidTolls: false,
    avoidFerries: false,
  });

  return (
    <aside className="route-panel" aria-label={copy.panel.routePlanning}>
      {activePanel === "route" ? (
        <>
          <div className="route-inputs">
            <button className="drag-dots" type="button" aria-label={copy.routeFields.reorder}>
              <MoreVertical size={18} aria-hidden="true" />
            </button>
            <div className="route-fields">
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
                  <div className="waypoint-field-row" key={`${waypoint.id}-${index}`}>
                    <RouteField
                      label={String(index + 1)}
                      tone="waypoint"
                      value={routeDrafts.waypoints[index] || waypoint.name}
                      placeholder={`${copy.route.waypoint} ${index + 1}`}
                      active={activeRouteTarget === target}
                      onFocus={() => onRoutePointFocus(target)}
                      onChange={(value) => onRoutePointChange(target, value)}
                      onSubmit={() => onRoutePointSubmit(target)}
                    />
                    <button
                      className="remove-waypoint-button"
                      type="button"
                      aria-label={copy.route.removeWaypoint}
                      onClick={() => onRemoveWaypoint(index)}
                    >
                      ×
                    </button>
                  </div>
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
            </div>
            <button className="swap-button" type="button" aria-label={copy.routeFields.swap} onClick={onSwapRoutePoints}>
              <ArrowDownUp size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="waypoint-row">
            <button type="button" onClick={onAddWaypoint}>
              <Plus size={17} aria-hidden="true" />
              <span>{copy.route.addWaypoint}</span>
            </button>
            <button type="button" aria-expanded={showOptions} onClick={() => setShowOptions((value) => !value)}>
              <span>{showOptions ? copy.route.hideOptions : copy.route.options}</span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>
          {showOptions ? (
            <section className="route-options-panel" aria-label={copy.route.routeOptions}>
              <h2>{copy.route.routeOptions}</h2>
              {([
                ["avoidHighways", copy.route.avoidHighways],
                ["avoidTolls", copy.route.avoidTolls],
                ["avoidFerries", copy.route.avoidFerries],
              ] as const).map(([key, label]) => (
                <label className="route-option-toggle" key={key}>
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={routeOptions[key]}
                    onChange={(event) => setRouteOptions((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                </label>
              ))}
              <p>{copy.route.routeOptionHint}</p>
            </section>
          ) : null}

          <div className="mode-row">
            <label className="mode-select">
              <Car size={17} aria-hidden="true" />
              <select value={plan.mode} onChange={(event) => onModeChange(event.target.value as TravelMode)}>
                <option value="driving">{copy.modes.driving}</option>
                <option value="walking">{copy.modes.walking}</option>
                <option value="cycling">{copy.modes.cycling}</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
            <button
              className="go-button"
              type="button"
              disabled={routeState === "loading"}
              onClick={onRouteSubmit}
            >
              {routeState === "loading" ? copy.route.routing : copy.route.go}
            </button>
          </div>
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
          <RecentsSection
            recentSearches={recentSearches}
            language={language}
            onSelectPlace={onSelectPlace}
            compact
          />
        </>
      ) : null}

      {activePanel === "search" ? (
        <>
          <PanelHeader title={copy.panel.searchTitle} description={copy.panel.searchDescription} />
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
            focusToken={searchFocusToken}
          />
        </>
      ) : null}

      {activePanel === "recents" ? (
        <>
          <PanelHeader title={copy.panel.recentsTitle} description={copy.panel.recentsDescription} />
          <RecentsSection recentSearches={recentSearches} language={language} onSelectPlace={onSelectPlace} />
        </>
      ) : null}

      {activePanel === "layers" ? (
        <>
          <PanelHeader title={copy.panel.layersTitle} description={copy.panel.layersDescription} />
          <section className="panel-section layer-panel">
            <h2>{copy.layers.baseMap}</h2>
            <div className="panel-segmented" role="group" aria-label={copy.layers.baseMap}>
              {(["standard", "terrain", "transit"] as const).map((layer) => (
                <button
                  key={layer}
                  className={activeLayer === layer ? "is-active" : ""}
                  type="button"
                  onClick={() => onLayerChange(layer)}
                >
                  {getLayerLabel(language, layer)}
                </button>
              ))}
            </div>
          </section>
          <section className="panel-section layer-panel">
            <h2>{copy.layers.visibleOverlays}</h2>
            <div className="layer-option-row">
              <span>
                <strong>{copy.layers.activeRoute}</strong>
                <small>{copy.layers.activeRouteDescription}</small>
              </span>
              <span className="layer-status">{copy.layers.on}</span>
            </div>
            <div className="layer-option-row">
              <span>
                <strong>{copy.layers.scaleAttribution}</strong>
                <small>{copy.layers.scaleAttributionDescription}</small>
              </span>
              <span className="layer-status">{copy.layers.on}</span>
            </div>
          </section>
        </>
      ) : null}

      {activePanel === "settings" ? (
        <>
          <PanelHeader title={copy.panel.settingsTitle} description={copy.panel.settingsDescription} />
          <section className="panel-section settings-panel">
            <div className="setting-row">
              <span>
                <strong>{copy.settings.defaultLayer}</strong>
                <small>{getLayerLabel(language, activeLayer)}</small>
              </span>
              <SlidersHorizontal size={17} aria-hidden="true" />
            </div>
            <div className="setting-row language-setting">
              <span>
                <strong>{copy.settings.language}</strong>
                <small>{copy.settings.languageDescription}</small>
              </span>
              <div className="language-toggle" role="group" aria-label={copy.settings.language}>
                {LANGUAGES.map((item) => (
                  <button
                    key={item.id}
                    className={language === item.id ? "is-active" : ""}
                    type="button"
                    onClick={() => onLanguageChange(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row language-setting">
              <span>
                <strong>{copy.settings.appearance}</strong>
                <small>
                  {copy.settings.appearanceDescription} ·{" "}
                  {colorScheme === "dark" ? copy.settings.themeDark : copy.settings.themeLight}
                </small>
              </span>
              <div className="preference-toggle" role="group" aria-label={copy.settings.appearance}>
                {(
                  [
                    ["system", copy.settings.themeSystem],
                    ["light", copy.settings.themeLight],
                    ["dark", copy.settings.themeDark],
                  ] as const
                ).map(([preference, label]) => (
                  <button
                    key={preference}
                    className={themePreference === preference ? "is-active" : ""}
                    type="button"
                    onClick={() => onThemePreferenceChange(preference)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <span>
                <strong>{copy.settings.recentSearches}</strong>
                <small>
                  {language === "zh"
                    ? `${recentSearches.length} ${copy.settings.savedLocally}`
                    : `${recentSearches.length} ${copy.settings.savedLocally}`}
                </small>
              </span>
              <span className="layer-status">{copy.settings.auto}</span>
            </div>
            <div className="setting-row">
              <span>
                <strong>{copy.settings.location}</strong>
                <small>{copy.settings.locationDescription}</small>
              </span>
              <span className="layer-status">{copy.settings.ask}</span>
            </div>
          </section>
        </>
      ) : null}

      {activePanel === "about" ? (
        <>
          <PanelHeader title={copy.panel.aboutTitle} description={copy.panel.aboutDescription} />
          <section className="panel-section about-panel">
            <p>{copy.about.body}</p>
            <div className="about-stat">
              <strong>{copy.about.mapData}</strong>
              <span>{copy.about.attribution}</span>
            </div>
            <div className="about-stat">
              <strong>{copy.about.version}</strong>
              <span>0.1.0</span>
            </div>
          </section>
        </>
      ) : null}
    </aside>
  );
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="panel-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function RouteSummaryCard({ plan, language }: { plan: RoutePlan; language: Language }) {
  const copy = translations[language];
  return (
    <div className="route-card" aria-label="Active route summary">
      <div className="route-card-icon">
        <Car size={20} aria-hidden="true" />
      </div>
      <div>
        <div className="route-card-metrics">
          <strong>{plan.route.distanceLabel}</strong>
          <strong>{plan.route.durationLabel}</strong>
        </div>
        <p>{plan.route.description}</p>
        <span>{copy.route.fastest}</span>
      </div>
      <button type="button">
        {copy.route.details}
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

function StepsSection({ instructions, language }: { instructions: RouteInstruction[]; language: Language }) {
  const copy = translations[language];
  return (
    <section className="panel-section">
      <h2>{copy.route.stepByStep}</h2>
      <div className="instruction-list">
        {instructions.map((instruction) => (
          <InstructionRow key={instruction.id} instruction={instruction} />
        ))}
      </div>
    </section>
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
  focusToken = 0,
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
  focusToken?: number;
  compact?: boolean;
}) {
  const copy = translations[language];
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (focusToken > 0) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [focusToken]);

  return (
    <section className="panel-section">
      <div className="section-heading-row">
        <h2>{compact ? copy.route.searchResults : copy.route.places}</h2>
        <button type="button">{copy.route.more}</button>
      </div>
      <form
        className="inline-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
      >
        <Search size={16} aria-hidden="true" />
        <input
          ref={inputRef}
          value={activeQuery}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={compact ? copy.search.inputPlaceholder : copy.search.topPlaceholder}
        />
        <button type="submit" disabled={searchState === "loading"}>
          {searchState === "loading" ? copy.search.searching : copy.search.submit}
        </button>
      </form>
      <PlaceDetail place={selectedPlace} />
      {searchState === "error" ? <p className="panel-message">{searchError}</p> : null}
      {searchState === "empty" ? <p className="panel-message">{copy.route.noPlaces}</p> : null}
      {compact ? <p className="panel-hint">{copy.route.useSearchResult}</p> : null}
      <div className="place-list">
        {searchResults.map((place) => (
          <button key={place.id} className="place-row" type="button" onClick={() => onSelectPlace(place)}>
            <MapPin size={18} aria-hidden="true" />
            <span>
              <strong>{place.name}</strong>
              <small>{place.address}</small>
            </span>
            <em>{place.distanceLabel}</em>
          </button>
        ))}
      </div>
    </section>
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

  return (
    <section className="panel-section recent-section">
      <div className="section-heading-row">
        <h2>{compact ? copy.route.recentSearches : copy.route.recentPlaces}</h2>
        <button type="button">{copy.route.clear}</button>
      </div>
      <div className="place-list">
        {recentSearches.map((place) => (
          <button key={place.id} className="recent-row" type="button" onClick={() => onSelectPlace(place)}>
            <LocateFixed size={16} aria-hidden="true" />
            <span>{place.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PlaceDetail({ place }: { place: SearchResult }) {
  return (
    <article className="place-detail" aria-label="Selected place">
      <span className="place-detail-pin">
        <MapPin size={16} aria-hidden="true" />
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

function RouteField({
  label,
  tone,
  value,
  placeholder,
  active,
  onFocus,
  onChange,
  onSubmit,
}: {
  label: string;
  tone: string;
  value: string;
  placeholder: string;
  active: boolean;
  onFocus: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <label className={`route-field ${active ? "is-active" : ""}`}>
      <span className={`field-pin ${tone}`}>{label}</span>
      <input
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
    </label>
  );
}

function InstructionRow({ instruction }: { instruction: RouteInstruction }) {
  const Icon = instructionIcon[instruction.icon];
  return (
    <div className="instruction-row">
      <Icon size={17} aria-hidden="true" />
      <span>
        <strong>{instruction.title}</strong>
        {instruction.subtitle ? <small>{instruction.subtitle}</small> : null}
      </span>
      <em>{instruction.distanceLabel}</em>
    </div>
  );
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
