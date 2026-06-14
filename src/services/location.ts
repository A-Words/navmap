import type { SearchResult } from "../types";

export async function locateCurrentPosition(): Promise<SearchResult> {
  if (!("geolocation" in navigator)) {
    throw new Error("Location is not available in this environment");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });

  return {
    id: "current-location",
    name: "My Location",
    address: "Current device location",
    coordinate: {
      lng: position.coords.longitude,
      lat: position.coords.latitude,
    },
    type: "location",
  };
}

