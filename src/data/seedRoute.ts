import { formatDistanceLabel, formatDurationLabel } from "../i18n";
import i18next from "../i18n/index";
import type { RoutePlan, SearchResult } from "../types";

export type SeedRouteData = {
  origin: SearchResult;
  destination: SearchResult;
  searchResults: SearchResult[];
  recentSearches: SearchResult[];
  routePlan: RoutePlan;
};

export function getSeedRouteData(language: string): SeedRouteData {
  const t = (key: string) => i18next.t(key, { lng: language });

  const origin: SearchResult = {
    id: "my-location",
    name: t("seed.myLocation"),
    address: t("seed.myLocationAddress"),
    coordinate: { lng: -122.3957, lat: 37.7666 },
    type: "location",
  };

  const destination: SearchResult = {
    id: "union-square",
    name: t("seed.unionSquare"),
    address: t("seed.unionSquareAddress"),
    distanceLabel: formatDistanceLabel(7400),
    coordinate: { lng: -122.4075, lat: 37.788 },
    type: "square",
  };

  const searchResults: SearchResult[] = [
    destination,
    {
      id: "union-square-park",
      name: t("seed.unionSquarePark"),
      address: t("seed.unionSquareParkAddress"),
      distanceLabel: formatDistanceLabel(7300),
      coordinate: { lng: -122.4077, lat: 37.7879 },
      type: "park",
    },
    {
      id: "union-square-garage",
      name: t("seed.unionSquareGarage"),
      address: t("seed.unionSquareGarageAddress"),
      distanceLabel: formatDistanceLabel(7200),
      coordinate: { lng: -122.4083, lat: 37.7885 },
      type: "parking",
    },
  ];

  const recentSearches: SearchResult[] = [];

  const routePlan: RoutePlan = {
    origin,
    destination,
    waypoints: [],
    mode: "driving",
    route: {
      distanceLabel: formatDistanceLabel(7400),
      durationLabel: formatDurationLabel(18 * 60),
      description: t("seed.routeDescription"),
      geometry: [
        origin.coordinate,
        { lng: -122.3959, lat: 37.7724 },
        { lng: -122.3993, lat: 37.7776 },
        { lng: -122.4038, lat: 37.7812 },
        { lng: -122.4054, lat: 37.785 },
        destination.coordinate,
      ],
      instructions: [
        {
          id: "start",
          icon: "start",
          title: t("routeSteps.start"),
          subtitle: origin.name,
          distanceLabel: formatDistanceLabel(0),
        },
        {
          id: "straight-7th",
          icon: "straight",
          title: t("seed.headNortheast"),
          distanceLabel: formatDistanceLabel(450),
        },
        {
          id: "right-brannan",
          icon: "right",
          title: t("seed.turnRightBrannan"),
          distanceLabel: formatDistanceLabel(600),
        },
        {
          id: "left-king",
          icon: "left",
          title: t("seed.turnLeftKing"),
          distanceLabel: formatDistanceLabel(1200),
        },
        {
          id: "merge-101",
          icon: "merge",
          title: t("seed.mergeUS101"),
          distanceLabel: formatDistanceLabel(2900),
        },
        {
          id: "highway-80",
          icon: "highway",
          title: t("seed.keepRightI80"),
          distanceLabel: formatDistanceLabel(2800),
        },
        {
          id: "exit-2c",
          icon: "right",
          title: t("seed.exit2C"),
          distanceLabel: formatDistanceLabel(350),
        },
        {
          id: "arrive",
          icon: "arrive",
          title: t("routeSteps.arrive"),
          subtitle: destination.name,
          distanceLabel: "--",
        },
      ],
    },
  };

  return {
    origin,
    destination,
    searchResults,
    recentSearches,
    routePlan,
  };
}
