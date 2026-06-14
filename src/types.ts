export type LngLat = {
  lng: number;
  lat: number;
};

export type TravelMode = "driving" | "walking" | "cycling";

export type LayerId = "standard" | "terrain" | "transit";

export type PanelId = "route" | "search" | "recents" | "layers" | "settings" | "about";

export type Language = "zh" | "en";

export type RoutePointTarget = "origin" | "destination" | `waypoint-${number}`;

export type SearchResult = {
  id: string;
  name: string;
  address: string;
  distanceLabel?: string;
  coordinate: LngLat;
  type?: string;
};

export type RouteInstruction = {
  id: string;
  icon: "start" | "straight" | "right" | "left" | "merge" | "highway" | "arrive";
  title: string;
  subtitle?: string;
  distanceLabel: string;
};

export type RouteSummary = {
  distanceLabel: string;
  durationLabel: string;
  description: string;
  geometry: LngLat[];
  instructions: RouteInstruction[];
};

export type RoutePlan = {
  origin: SearchResult;
  destination: SearchResult;
  waypoints: SearchResult[];
  mode: TravelMode;
  route: RouteSummary;
};

export type AppSettings = {
  activeLayer: LayerId;
  language: Language;
  showTrafficHints: boolean;
  lastCenter: LngLat;
  lastZoom: number;
  recentSearches: SearchResult[];
};
