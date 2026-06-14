import { formatDistanceLabel, formatDurationLabel, translations } from "../i18n";
import type { Language, RoutePlan, SearchResult } from "../types";

export type SeedRouteData = {
  origin: SearchResult;
  destination: SearchResult;
  searchResults: SearchResult[];
  recentSearches: SearchResult[];
  routePlan: RoutePlan;
};

export function getSeedRouteData(language: Language): SeedRouteData {
  const copy = translations[language];
  const origin: SearchResult = {
    id: "my-location",
    name: language === "zh" ? "我的位置" : "My Location",
    address: language === "zh" ? "旧金山 7th Street" : "7th Street, San Francisco, CA",
    coordinate: { lng: -122.3957, lat: 37.7666 },
    type: "location",
  };

  const destination: SearchResult = {
    id: "union-square",
    name: language === "zh" ? "联合广场" : "Union Square",
    address: language === "zh" ? "美国加利福尼亚州旧金山 94108" : "San Francisco, CA 94108, USA",
    distanceLabel: formatDistanceLabel(7400, language),
    coordinate: { lng: -122.4075, lat: 37.788 },
    type: "square",
  };

  const searchResults: SearchResult[] = [
    destination,
    {
      id: "union-square-park",
      name: language === "zh" ? "联合广场公园" : "Union Square Park",
      address: language === "zh" ? "旧金山 Post St 333 号" : "333 Post St, San Francisco, CA 94108, USA",
      distanceLabel: formatDistanceLabel(7300, language),
      coordinate: { lng: -122.4077, lat: 37.7879 },
      type: "park",
    },
    {
      id: "union-square-garage",
      name: language === "zh" ? "联合广场车库" : "Union Square Garage",
      address: language === "zh" ? "旧金山 Post St 333 号" : "333 Post St, San Francisco, CA 94108, USA",
      distanceLabel: formatDistanceLabel(7200, language),
      coordinate: { lng: -122.4083, lat: 37.7885 },
      type: "parking",
    },
  ];

  const recentSearches: SearchResult[] = [
    {
      id: "ferry-building",
      name: language === "zh" ? "渡轮大厦" : "Ferry Building",
      address: language === "zh" ? "旧金山 Ferry Building 1 号" : "1 Ferry Building, San Francisco, CA",
      coordinate: { lng: -122.3937, lat: 37.7955 },
      type: "landmark",
    },
    {
      id: "golden-gate-bridge",
      name: language === "zh" ? "金门大桥" : "Golden Gate Bridge",
      address: language === "zh" ? "旧金山金门大桥" : "Golden Gate Bridge, San Francisco, CA",
      coordinate: { lng: -122.4783, lat: 37.8199 },
      type: "bridge",
    },
  ];

  const routePlan: RoutePlan = {
    origin,
    destination,
    waypoints: [],
    mode: "driving",
    route: {
      distanceLabel: formatDistanceLabel(7400, language),
      durationLabel: formatDurationLabel(18 * 60, language),
      description:
        language === "zh"
          ? `${copy.route.via} US-101 S 和 I-80 E`
          : `${copy.route.via} US-101 S and I-80 E`,
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
          title: copy.routeSteps.start,
          subtitle: origin.name,
          distanceLabel: formatDistanceLabel(0, language),
        },
        {
          id: "straight-7th",
          icon: "straight",
          title: language === "zh" ? "沿 7th St 向东北行驶" : "Head northeast on 7th St",
          distanceLabel: formatDistanceLabel(450, language),
        },
        {
          id: "right-brannan",
          icon: "right",
          title: language === "zh" ? "右转进入 Brannan St" : "Turn right onto Brannan St",
          distanceLabel: formatDistanceLabel(600, language),
        },
        {
          id: "left-king",
          icon: "left",
          title: language === "zh" ? "左转进入 King St" : "Turn left onto King St",
          distanceLabel: formatDistanceLabel(1200, language),
        },
        {
          id: "merge-101",
          icon: "merge",
          title: language === "zh" ? "通过匝道汇入 US-101 S" : "Use the ramp to merge onto US-101 S",
          distanceLabel: formatDistanceLabel(2900, language),
        },
        {
          id: "highway-80",
          icon: "highway",
          title: language === "zh" ? "靠右继续沿 I-80 E 行驶" : "Keep right to continue on I-80 E",
          distanceLabel: formatDistanceLabel(2800, language),
        },
        {
          id: "exit-2c",
          icon: "right",
          title: language === "zh" ? "从 2C 出口驶向 7th St" : "Take exit 2C toward 7th St",
          distanceLabel: formatDistanceLabel(350, language),
        },
        {
          id: "arrive",
          icon: "arrive",
          title: copy.routeSteps.arrive,
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
