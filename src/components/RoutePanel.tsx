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
} from "lucide-react";
import type { RouteInstruction, RoutePlan, SearchResult, TravelMode } from "../types";

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
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onRouteSubmit: () => void;
  onModeChange: (mode: TravelMode) => void;
  onSelectPlace: (place: SearchResult) => void;
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
  onQueryChange,
  onSearchSubmit,
  onRouteSubmit,
  onModeChange,
  onSelectPlace,
}: RoutePanelProps) {
  return (
    <aside className="route-panel" aria-label="Route planning">
      <div className="route-inputs">
        <button className="drag-dots" type="button" aria-label="Reorder route">
          <MoreVertical size={18} aria-hidden="true" />
        </button>
        <div className="route-fields">
          <RouteField label="A" tone="origin" value={plan.origin.name} />
          <RouteField label="B" tone="destination" value={plan.destination.name} />
        </div>
        <button className="swap-button" type="button" aria-label="Swap origin and destination">
          <ArrowDownUp size={17} aria-hidden="true" />
        </button>
      </div>

      <div className="waypoint-row">
        <button type="button">
          <Plus size={17} aria-hidden="true" />
          <span>Add Waypoint</span>
        </button>
        <button type="button">
          <span>Options</span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mode-row">
        <label className="mode-select">
          <Car size={17} aria-hidden="true" />
          <select value={plan.mode} onChange={(event) => onModeChange(event.target.value as TravelMode)}>
            <option value="driving">Driving</option>
            <option value="walking">Walking</option>
            <option value="cycling">Cycling</option>
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </label>
        <button
          className="go-button"
          type="button"
          disabled={routeState === "loading"}
          onClick={onRouteSubmit}
        >
          {routeState === "loading" ? "Routing" : "Go"}
        </button>
      </div>
      {routeState === "error" ? <p className="panel-message">{routeError}</p> : null}
      {locationError ? <p className="panel-message">{locationError}</p> : null}

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
          <span>Fastest route, typical traffic</span>
        </div>
        <button type="button">
          Details
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>

      <section className="panel-section">
        <h2>Step-by-step</h2>
        <div className="instruction-list">
          {plan.route.instructions.map((instruction) => (
            <InstructionRow key={instruction.id} instruction={instruction} />
          ))}
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading-row">
          <h2>Search Results</h2>
          <button type="button">More</button>
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
            value={activeQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search nearby places"
          />
          <button type="submit" disabled={searchState === "loading"}>
            {searchState === "loading" ? "Searching" : "Search"}
          </button>
        </form>
        <PlaceDetail place={selectedPlace} />
        {searchState === "error" ? <p className="panel-message">{searchError}</p> : null}
        {searchState === "empty" ? <p className="panel-message">No places found. Try a broader search.</p> : null}
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

      <section className="panel-section recent-section">
        <div className="section-heading-row">
          <h2>Recent Searches</h2>
          <button type="button">Clear</button>
        </div>
        <div className="place-list">
          {recentSearches.map((place) => (
            <button key={place.id} className="recent-row" type="button" onClick={() => onSelectPlace(place)}>
              <LocateFixed size={16} aria-hidden="true" />
              <span>{place.name}, San Francisco, CA</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
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

function RouteField({ label, tone, value }: { label: "A" | "B"; tone: string; value: string }) {
  return (
    <label className="route-field">
      <span className={`field-pin ${tone}`}>{label}</span>
      <input value={value} readOnly />
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
