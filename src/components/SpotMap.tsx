import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Spot, ModelForecast } from "../types";
import { QUICK_SPOTS } from "../spots";
import { getWindColor } from "../utils/colors";

function createArrowSvg(
  degrees: number,
  speed: number,
  color: string,
  label: string,
  length: number
): string {
  const bg = getWindColor(speed);
  const rad = ((degrees + 180) * Math.PI) / 180;
  const tipX = 150 + Math.sin(rad) * length;
  const tipY = 150 - Math.cos(rad) * length;
  const headLen = 8;
  const headAng = 0.4;
  const lx = tipX - headLen * Math.sin(rad - headAng);
  const ly = tipY + headLen * Math.cos(rad - headAng);
  const rx = tipX - headLen * Math.sin(rad + headAng);
  const ry = tipY + headLen * Math.cos(rad + headAng);
  const lblX = tipX + Math.sin(rad) * 14;
  const lblY = tipY - Math.cos(rad) * 14;

  return `<svg width="300" height="300" viewBox="0 0 300 300" style="overflow:visible;position:absolute;top:0;left:0">
    <line x1="150" y1="150" x2="${tipX}" y2="${tipY}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="${tipX},${tipY} ${lx},${ly} ${rx},${ry}" fill="${color}"/>
    <text x="${lblX}" y="${lblY}" text-anchor="middle" dominant-baseline="middle"
      font-size="7" font-weight="700" fill="#fff"
      style="text-shadow:0 0 3px #000,0 0 6px #000">${Math.round(speed)}</text>
    <text x="${lblX}" y="${lblY + 9}" text-anchor="middle" dominant-baseline="middle"
      font-size="5.5" fill="${bg}"
      style="text-shadow:0 0 3px #000">${label}</text>
  </svg>`;
}

interface SpotMapProps {
  current: Spot;
  customSpots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  forecasts: ModelForecast[];
  selectedHour: string | null;
}

function spotKey(s: Spot) {
  return `${s.latitude},${s.longitude}`;
}

export function SpotMap({
  current,
  customSpots,
  onSelectSpot,
  forecasts,
  selectedHour,
}: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const arrowLayerRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelectSpot);
  onSelectRef.current = onSelectSpot;

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([current.latitude, current.longitude], 10);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>')
      .addTo(map);

    // Custom pane for wind arrows (below markers)
    map.createPane("windArrows");
    map.getPane("windArrows")!.style.zIndex = "450";

    mapRef.current = map;

    // Create initial markers immediately + fix size after layout
    for (const spot of [...QUICK_SPOTS, ...customSpots]) {
      const key = spotKey(spot);
      const active =
        spot.latitude === current.latitude &&
        spot.longitude === current.longitude;
      const marker = L.circleMarker([spot.latitude, spot.longitude], {
        radius: active ? 10 : 7,
        color: active ? "#ffffff" : "#9ca3af",
        fillColor: active ? "#3b82f6" : "#6b7280",
        fillOpacity: active ? 0.9 : 0.6,
        weight: active ? 2 : 1,
        bubblingMouseEvents: false,
      })
        .bindTooltip(spot.name, {
          direction: "top",
          offset: [0, -10],
          className: "spot-tooltip",
        })
        .on("click", () => onSelectRef.current(spot))
        .addTo(map);
      markersRef.current.set(key, marker);
    }

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const allSpots = [...QUICK_SPOTS, ...customSpots];
    const desiredKeys = new Set(allSpots.map(spotKey));

    // Remove old markers
    for (const [key, marker] of markersRef.current) {
      if (!desiredKeys.has(key)) {
        marker.remove();
        markersRef.current.delete(key);
      }
    }

    // Add or update
    for (const spot of allSpots) {
      const key = spotKey(spot);
      const active =
        spot.latitude === current.latitude &&
        spot.longitude === current.longitude;
      const style = {
        radius: active ? 10 : 7,
        color: active ? "#ffffff" : "#9ca3af",
        fillColor: active ? "#3b82f6" : "#6b7280",
        fillOpacity: active ? 0.9 : 0.6,
        weight: active ? 2 : 1,
      };

      let marker = markersRef.current.get(key);
      if (!marker) {
        const s = spot; // capture for closure
        marker = L.circleMarker([s.latitude, s.longitude], {
          ...style,
          bubblingMouseEvents: false,
        })
          .bindTooltip(s.name, {
            direction: "top",
            offset: [0, -10],
            className: "spot-tooltip",
          })
          .on("click", () => onSelectRef.current(s))
          .addTo(map);
        markersRef.current.set(key, marker);
      } else {
        marker.setStyle(style);
      }
    }
  }, [current, customSpots]);

  // Sync markers on changes
  useEffect(() => {
    if (!mapRef.current) return;
    syncMarkers();
    mapRef.current.setView([current.latitude, current.longitude], 10, { animate: true });
  }, [current, customSpots, syncMarkers]);

  // Wind arrows
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (arrowLayerRef.current) {
      arrowLayerRef.current.remove();
      arrowLayerRef.current = null;
    }

    if (!selectedHour || forecasts.length === 0) return;

    let svgContent = "";
    for (const forecast of forecasts) {
      const timeIdx = forecast.hourly.time.indexOf(selectedHour);
      if (timeIdx === -1) continue;
      const dir = forecast.hourly.wind_direction_10m[timeIdx];
      const spd = forecast.hourly.wind_speed_10m[timeIdx];
      if (dir == null || spd == null) continue;
      const color = "#ffffff";
      const length = Math.min(36 + spd * 2.4, 120);
      svgContent += createArrowSvg(dir, spd, color, forecast.modelName, length);
    }

    if (!svgContent) return;

    const icon = L.divIcon({
      html: `<div style="position:relative;width:300px;height:300px;pointer-events:none">${svgContent}</div>`,
      className: "",
      iconSize: [300, 300],
      iconAnchor: [150, 150],
    });

    arrowLayerRef.current = L.marker([current.latitude, current.longitude], {
      icon,
      interactive: false,
      pane: "windArrows",
    }).addTo(map);
  }, [selectedHour, forecasts, current]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
    />
  );
}
