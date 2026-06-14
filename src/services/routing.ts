import { MAP_SERVICE_CONFIG } from "../config/mapServices";
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
  options: { signal?: AbortSignal } = {},
): Promise<RouteSummary> {
  const profile = profileByMode[mode];
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
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
    distanceLabel: formatDistance(route.distance),
    durationLabel: formatDuration(route.duration),
    description: route.legs[0]?.summary ? `via ${route.legs[0].summary}` : `${mode} route`,
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
      distanceLabel: formatDistance(step.distance),
    }));

  if (!mappedSteps.length) {
    return [
      {
        id: "route-ready",
        icon: "straight",
        title: "Follow the highlighted route",
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
  if (step.maneuver.type === "depart") {
    return step.name ? `Start on ${step.name}` : "Start";
  }
  if (step.maneuver.type === "arrive") {
    return "Arrive";
  }

  const direction = step.maneuver.modifier ? ` ${step.maneuver.modifier}` : "";
  const road = step.name ? ` onto ${step.name}` : "";
  const verb = step.maneuver.type === "turn" ? "Turn" : capitalize(step.maneuver.type);
  return `${verb}${direction}${road}`;
}

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters / 10) * 10} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}
