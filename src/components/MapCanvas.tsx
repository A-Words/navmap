import maplibregl, { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_CENTER, osmRasterStyle } from "../config/mapServices";
import type { LayerId, LngLat, RoutePlan, SearchResult } from "../types";

type MapCanvasProps = {
  activeLayer: LayerId;
  plan: RoutePlan;
  selectedPlace: SearchResult;
  detailPlace: SearchResult | null;
  onCenterChange: (center: LngLat, zoom: number) => void;
  onLayerChange: (layer: LayerId) => void;
  onLocate: () => Promise<SearchResult | null>;
  railCollapsed: boolean;
  panelOpen: boolean;
};

const layerOrder: LayerId[] = ["standard", "terrain", "transit"];

export function MapCanvas({
  activeLayer,
  plan,
  selectedPlace,
  detailPlace,
  onCenterChange,
  onLayerChange,
  onLocate,
  railCollapsed,
  panelOpen,
}: MapCanvasProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const detailMarkerRef = useRef<Marker | null>(null);
  const [zoom, setZoom] = useState(12);
  const [center, setCenter] = useState<LngLat>(DEFAULT_CENTER);
  const [routePath, setRoutePath] = useState("");

  const routeCoordinates = useMemo(
    () => plan.route.geometry.map((point) => [point.lng, point.lat]),
    [plan.route.geometry],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: osmRasterStyle,
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.ScaleControl({ maxWidth: 170, unit: "metric" }), "bottom-left");

    map.on("moveend", () => {
      const nextCenter = map.getCenter();
      const nextZoom = map.getZoom();
      const lngLat = { lng: nextCenter.lng, lat: nextCenter.lat };
      setCenter(lngLat);
      setZoom(nextZoom);
      onCenterChange(lngLat, nextZoom);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [onCenterChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const applyRoute = () => {
      const routeData: Parameters<GeoJSONSource["setData"]>[0] = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates,
        },
      };

      if (!map.getSource("active-route")) {
        map.addSource("active-route", {
          type: "geojson",
          data: routeData,
        });
        map.addLayer({
          id: "active-route-casing",
          type: "line",
          source: "active-route",
          paint: {
            "line-color": "#ffffff",
            "line-width": 12,
            "line-opacity": 0.95,
          },
        });
        map.addLayer({
          id: "active-route",
          type: "line",
          source: "active-route",
          paint: {
            "line-color": "#2d7be8",
            "line-width": 7,
            "line-opacity": 0.96,
          },
        });
      } else {
        const source = map.getSource("active-route");
        if (source && "setData" in source) {
          (source as GeoJSONSource).setData(routeData);
        }
      }

      if (map.getLayer("active-route-casing")) {
        map.moveLayer("active-route-casing");
      }
      if (map.getLayer("active-route")) {
        map.moveLayer("active-route");
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [
        createMapMarker("A", "origin", plan.origin.coordinate).addTo(map),
        ...plan.waypoints.map((waypoint, index) =>
          createMapMarker(String(index + 1), "waypoint", waypoint.coordinate).addTo(map),
        ),
        createMapMarker("B", "destination", selectedPlace.coordinate).addTo(map),
      ];

      if (routeCoordinates.length > 0) {
        const bounds = routeCoordinates.reduce(
          (nextBounds, coordinate) => nextBounds.extend(coordinate as [number, number]),
          new maplibregl.LngLatBounds(routeCoordinates[0] as [number, number], routeCoordinates[0] as [
            number,
            number,
          ]),
        );
        const sidebarWidth = (railCollapsed ? 68 : 208) + (panelOpen ? 400 : 0);
        map.fitBounds(bounds, { padding: { top: 84, right: 124, bottom: 90, left: sidebarWidth + 20 }, maxZoom: 13.4 });
      }
      window.requestAnimationFrame(() => {
        setRoutePath(projectRoutePath(map, routeCoordinates));
      });
    };

    if (map.isStyleLoaded()) {
      applyRoute();
    } else {
      map.once("load", applyRoute);
    }
  }, [plan.origin.coordinate, plan.waypoints, routeCoordinates, selectedPlace.coordinate]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (detailPlace) {
      detailMarkerRef.current?.remove();
      const element = document.createElement("div");
      element.className = "detail-marker";
      const marker = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([detailPlace.coordinate.lng, detailPlace.coordinate.lat])
        .addTo(map);
      detailMarkerRef.current = marker;

      const sidebarWidth = (railCollapsed ? 68 : 208) + (panelOpen ? 400 : 0);
      map.flyTo({
        center: [detailPlace.coordinate.lng, detailPlace.coordinate.lat],
        zoom: 15,
        offset: [sidebarWidth / 2, 0],
        essential: true,
      });
    } else {
      detailMarkerRef.current?.remove();
      detailMarkerRef.current = null;
    }

    return () => {
      detailMarkerRef.current?.remove();
      detailMarkerRef.current = null;
    };
  }, [detailPlace, railCollapsed, panelOpen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const updateRoutePath = () => setRoutePath(projectRoutePath(map, routeCoordinates));
    updateRoutePath();
    map.on("move", updateRoutePath);
    map.on("zoom", updateRoutePath);
    map.on("resize", updateRoutePath);

    return () => {
      map.off("move", updateRoutePath);
      map.off("zoom", updateRoutePath);
      map.off("resize", updateRoutePath);
    };
  }, [routeCoordinates]);

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const cycleLayer = () => {
    const currentIndex = layerOrder.indexOf(activeLayer);
    onLayerChange(layerOrder[(currentIndex + 1) % layerOrder.length]);
  };
  const recenter = async () => {
    const location = await onLocate();
    if (!location) {
      return;
    }

    mapRef.current?.flyTo({
      center: [location.coordinate.lng, location.coordinate.lat],
      zoom: 13,
      essential: true,
    });
  };

  return (
    <section className={`map-area layer-${activeLayer}`} aria-label={t("map.interactive")}>
      <div className="map-frame" ref={containerRef} />
      <svg className="route-overlay" aria-hidden="true">
        {routePath ? (
          <>
            <path className="route-overlay-casing" d={routePath} />
            <path className="route-overlay-line" d={routePath} />
          </>
        ) : null}
      </svg>
      <div className="map-top-controls" aria-label={t("map.controls")}>
        <button type="button" aria-label={`${t("layers.switch")}: ${t(`layers.${activeLayer}`)}`} onClick={cycleLayer}>
          <Layers aria-hidden="true" />
        </button>
        <button type="button" aria-label={t("map.currentLocation")} onClick={recenter}>
          <LocateFixed aria-hidden="true" />
        </button>
      </div>
      <div className="map-zoom-controls" role="group" aria-label={t("map.zoomControls")}>
        <button type="button" aria-label={t("map.zoomIn")} onClick={zoomIn}>
          <Plus aria-hidden="true" />
        </button>
        <button type="button" aria-label={t("map.zoomOut")} onClick={zoomOut}>
          <Minus aria-hidden="true" />
        </button>
      </div>
      <footer className="map-status">
        <span className="online-dot" aria-hidden="true" />
        <span>{t("map.online")}</span>
        <span>{t("map.mapData")}</span>
        <strong>
          {center.lat.toFixed(4)}° N, {Math.abs(center.lng).toFixed(4)}° W
        </strong>
        <span>{Math.round(zoom * 10)} m</span>
      </footer>
    </section>
  );
}

function createMapMarker(label: string, variant: "origin" | "waypoint" | "destination", coordinate: LngLat) {
  const element = document.createElement("div");
  element.className = `route-marker ${variant}`;
  element.textContent = label;

  return new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([
    coordinate.lng,
    coordinate.lat,
  ]);
}

function projectRoutePath(map: MapLibreMap, routeCoordinates: number[][]) {
  return routeCoordinates
    .map((coordinate, index) => {
      const point = map.project(coordinate as [number, number]);
      return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}
