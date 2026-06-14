import { MAP_SERVICE_CONFIG } from "../config/mapServices";
import { formatDistanceLabel, formatDurationLabel, translations } from "../i18n";
import type { Language, LngLat, RouteInstruction, RouteSummary, TravelMode } from "../types";

type OsrmRouteResponse = {
  code: string;
  message?: string;
  routes?: OsrmRoute[];
};

type OsrmRoute = {
  distance: number;
  duration: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  legs: Array<{
    summary: string;
    steps: OsrmStep[];
  }>;
};

type OsrmStep = {
  name: string;
  distance: number;
  maneuver: {
    type: string;
    modifier?: string;
  };
};

const profileByMode: Record<TravelMode, string> = {
  driving: "driving",
  walking: "foot",
  cycling: "bike",
};

export async function getRoute(
  origin: LngLat,
  destination: LngLat,
  mode: TravelMode,
  options: { language: Language; waypoints?: LngLat[]; signal?: AbortSignal },
): Promise<RouteSummary> {
  const profile = profileByMode[mode];
  const coordinates = [origin, ...(options.waypoints || []), destination]
    .map((coordinate) => `${coordinate.lng},${coordinate.lat}`)
    .join(";");
  const url = new URL(`/route/v1/${profile}/${coordinates}`, MAP_SERVICE_CONFIG.osrmBaseUrl);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "true");
  url.searchParams.set("alternatives", "false");

  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Route failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OsrmRouteResponse;
  const route = payload.routes?.[0];

  if (payload.code !== "Ok" || !route) {
    throw new Error(payload.message || "No route found");
  }

  const copy = translations[options.language];
  return {
    distanceLabel: formatDistanceLabel(route.distance, options.language),
    durationLabel: formatDurationLabel(route.duration, options.language),
    description: route.legs[0]?.summary
      ? `${copy.route.via} ${route.legs[0].summary}`
      : `${copy.modes[mode]} ${copy.route.routeDescriptionFallback}`,
    geometry: route.geometry.coordinates.map(([lng, lat]) => ({ lng, lat })),
    instructions: mapSteps(route.legs.flatMap((leg) => leg.steps), options.language),
  };
}

function mapSteps(steps: OsrmStep[], language: Language): RouteInstruction[] {
  const copy = translations[language];
  const mappedSteps = steps
    .filter((step) => step.distance > 1 || step.maneuver.type === "arrive")
    .map((step, index) => ({
      id: `${step.maneuver.type}-${index}`,
      icon: getInstructionIcon(step.maneuver.type, step.maneuver.modifier),
      title: getInstructionTitle(step, language),
      distanceLabel: formatDistanceLabel(step.distance, language),
    }));

  if (!mappedSteps.length) {
    return [
      {
        id: "route-ready",
        icon: "straight",
        title: copy.route.routeReady,
        distanceLabel: "--",
      },
    ];
  }

  return mappedSteps;
}

function getInstructionIcon(
  type: string,
  modifier?: string,
): RouteInstruction["icon"] {
  if (type === "depart") {
    return "start";
  }
  if (type === "arrive") {
    return "arrive";
  }
  if (type === "merge" || type === "on ramp") {
    return "merge";
  }
  if (modifier?.includes("left")) {
    return "left";
  }
  if (modifier?.includes("right")) {
    return "right";
  }
  return "straight";
}

function getInstructionTitle(step: OsrmStep, language: Language) {
  const copy = translations[language].routeSteps;
  if (step.maneuver.type === "depart") {
    return step.name ? copy.startOn.replace("{road}", step.name) : copy.start;
  }
  if (step.maneuver.type === "arrive") {
    return copy.arrive;
  }

  if (language === "zh") {
    const direction = getModifierLabel(step.maneuver.modifier, language);
    const verb = getManeuverVerb(step.maneuver.type, language);
    const road = step.name ? `${copy.onto} ${step.name}` : "";
    return [direction || verb, road].filter(Boolean).join("");
  }

  const direction = step.maneuver.modifier ? ` ${getModifierLabel(step.maneuver.modifier, language)}` : "";
  const road = step.name ? ` ${copy.onto} ${step.name}` : "";
  const verb = getManeuverVerb(step.maneuver.type, language);
  return `${verb}${direction}${road}`;
}

function getManeuverVerb(type: string, language: Language) {
  const copy = translations[language].routeSteps;
  if (type === "turn") {
    return copy.turn;
  }
  if (type === "merge") {
    return copy.merge;
  }
  if (type === "on ramp") {
    return copy.onRamp;
  }
  if (type === "depart") {
    return copy.depart;
  }
  if (type === "continue") {
    return copy.continue;
  }
  return language === "zh" ? copy.continue : capitalize(type);
}

function getModifierLabel(modifier: string | undefined, language: Language) {
  if (!modifier) {
    return "";
  }

  const copy = translations[language].routeSteps;
  const normalized = modifier.replace(/ /g, "");
  const labels: Record<string, string> = {
    left: copy.left,
    right: copy.right,
    slightleft: copy.slightLeft,
    slightright: copy.slightRight,
    sharpleft: copy.sharpLeft,
    sharpright: copy.sharpRight,
    straight: copy.straight,
  };

  return labels[normalized] || modifier;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}
