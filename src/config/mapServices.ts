import type { StyleSpecification } from "maplibre-gl";
import type { LngLat } from "../types";

export const DEFAULT_CENTER: LngLat = {
  lng: 113.2644,
  lat: 23.1291,
};

export const MAP_SERVICE_CONFIG = {
  nominatimBaseUrl: "https://nominatim.openstreetmap.org",
  osrmBaseUrl: "https://router.project-osrm.org",
  searchCacheTtlMs: 1000 * 60 * 60 * 12,
  requestDebounceMs: 350,
  userAgent: "NavMap/0.1 (OpenStreetMap desktop navigation prototype)",
};

export const osmRasterStyle: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};
