import { MAP_SERVICE_CONFIG } from "../config/mapServices";
import { formatDistanceLabel } from "../i18n";
import type { Language, LngLat, SearchResult } from "../types";

type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
};

type CacheEntry = {
  expiresAt: number;
  results: SearchResult[];
};

const CACHE_PREFIX = "navmap.search.";

export async function searchPlaces(
  query: string,
  options: { language: Language; origin?: LngLat; signal?: AbortSignal },
): Promise<SearchResult[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) {
    return [];
  }

  const cacheKey = `${CACHE_PREFIX}${options.language}.${normalizedQuery.toLowerCase()}`;
  const cached = readSearchCache(cacheKey);
  if (cached) {
    return cached;
  }

  const url = new URL("/search", MAP_SERVICE_CONFIG.nominatimBaseUrl);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("q", normalizedQuery);

  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      Accept: "application/json",
      "Accept-Language": options.language === "zh" ? "zh-CN,zh;q=0.9,en;q=0.5" : "en",
    },
  });

  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`);
  }

  const payload = (await response.json()) as NominatimPlace[];
  const results = payload.map((place) => mapNominatimPlace(place, options.language, options.origin));
  writeSearchCache(cacheKey, results);
  return results;
}

function mapNominatimPlace(place: NominatimPlace, language: Language, origin?: LngLat): SearchResult {
  const coordinate = {
    lng: Number(place.lon),
    lat: Number(place.lat),
  };
  const title = place.name || place.address?.road || place.display_name.split(",")[0] || "Unnamed place";

  return {
    id: String(place.place_id),
    name: title,
    address: place.display_name,
    coordinate,
    distanceLabel: origin ? formatDistanceLabel(distanceMeters(origin, coordinate), language) : undefined,
    type: place.type || place.class,
  };
}

function readSearchCache(key: string): SearchResult[] | null {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return null;
    }

    const entry = JSON.parse(rawValue) as CacheEntry;
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.results;
  } catch {
    return null;
  }
}

function writeSearchCache(key: string, results: SearchResult[]) {
  try {
    const entry: CacheEntry = {
      expiresAt: Date.now() + MAP_SERVICE_CONFIG.searchCacheTtlMs,
      results,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Cache failures should not block search results.
  }
}

function distanceMeters(a: LngLat, b: LngLat) {
  const earthRadiusMeters = 6371000;
  const latA = toRadians(a.lat);
  const latB = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

