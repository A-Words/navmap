import { MAP_SERVICE_CONFIG } from "../config/mapServices";
import { formatDistanceLabel, formatDurationLabel } from "../i18n";
import i18next from "../i18n/index";
import type { LngLat, RouteInstruction, RouteSummary, TravelMode } from "../types";

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
  options: { waypoints?: LngLat[]; signal?: AbortSignal },
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

  return {
    distanceLabel: formatDistanceLabel(route.distance),
    durationLabel: formatDurationLabel(route.duration),
    description: route.legs[0]?.summary
      ? `${i18next.t("route.via")} ${route.legs[0].summary}`
      : `${i18next.t(`modes.${mode}`)} ${i18next.t("route.routeDescriptionFallback")}`,
    geometry: route.geometry.coordinates.map(([lng, lat]) => ({ lng, lat })),
    instructions: mapSteps(route.legs.flatMap((leg) => leg.steps)),
  };
}

function mapSteps(steps: OsrmStep[]): RouteInstruction[] {
  const mappedSteps = steps
    .filter((step) => step.distance > 1 || step.maneuver.type === "arrive")
    .map((step, index) => ({
      id: `${step.maneuver.type}-${index}`,
      icon: getInstructionIcon(step.maneuver.type, step.maneuver.modifier),
      title: getInstructionTitle(step),
      distanceLabel: formatDistanceLabel(step.distance),
    }));

  if (!mappedSteps.length) {
    return [
      {
        id: "route-ready",
        icon: "straight",
        title: i18next.t("route.routeReady"),
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

function getInstructionTitle(step: OsrmStep) {
  const language = i18next.language;
  if (step.maneuver.type === "depart") {
    return step.name
      ? i18next.t("routeSteps.startOn", { road: step.name })
      : i18next.t("routeSteps.start");
  }
  if (step.maneuver.type === "arrive") {
    return i18next.t("routeSteps.arrive");
  }

  if (language === "zh") {
    const direction = getModifierLabel(step.maneuver.modifier);
    const verb = getManeuverVerb(step.maneuver.type);
    const road = step.name ? `${i18next.t("routeSteps.onto")} ${step.name}` : "";
    return [direction || verb, road].filter(Boolean).join("");
  }

  const direction = step.maneuver.modifier ? ` ${getModifierLabel(step.maneuver.modifier)}` : "";
  const road = step.name ? ` ${i18next.t("routeSteps.onto")} ${step.name}` : "";
  const verb = getManeuverVerb(step.maneuver.type);
  return `${verb}${direction}${road}`;
}

function getManeuverVerb(type: string) {
  const language = i18next.language;
  const verbs: Record<string, string> = {
    turn: i18next.t("routeSteps.turn"),
    merge: i18next.t("routeSteps.merge"),
    "on ramp": i18next.t("routeSteps.onRamp"),
    depart: i18next.t("routeSteps.depart"),
    continue: i18next.t("routeSteps.continue"),
  };

  const verb = verbs[type];
  if (verb) {
    return verb;
  }

  return language === "zh" ? i18next.t("routeSteps.continue") : capitalize(type);
}

function getModifierLabel(modifier: string | undefined) {
  if (!modifier) {
    return "";
  }

  const normalized = modifier.replace(/ /g, "");
  const labels: Record<string, string> = {
    left: i18next.t("routeSteps.left"),
    right: i18next.t("routeSteps.right"),
    slightleft: i18next.t("routeSteps.slightLeft"),
    slightright: i18next.t("routeSteps.slightRight"),
    sharpleft: i18next.t("routeSteps.sharpLeft"),
    sharpright: i18next.t("routeSteps.sharpRight"),
    straight: i18next.t("routeSteps.straight"),
  };

  return labels[normalized] || modifier;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}
