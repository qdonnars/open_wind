import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Spot } from "../types";
import { QUICK_SPOTS } from "../spots";

interface SpotMapProps {
  current: Spot;
  customSpots: Spot[];
  onSelectSpot: (spot: Spot) => void;
}

export function SpotMap({ current, customSpots, onSelectSpot }: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());

  const allSpots = [...QUICK_SPOTS, ...customSpots];

  function spotKey(s: Spot) {
    return `${s.latitude},${s.longitude}`;
  }

  function isActive(s: Spot) {
    return s.latitude === current.latitude && s.longitude === current.longitude;
  }

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([current.latitude, current.longitude], 10);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>')
      .addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers with allSpots + current
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const desiredKeys = new Set(allSpots.map(spotKey));

    // Remove markers no longer in list
    for (const [key, marker] of markersRef.current) {
      if (!desiredKeys.has(key)) {
        marker.remove();
        markersRef.current.delete(key);
      }
    }

    // Add or update markers
    for (const spot of allSpots) {
      const key = spotKey(spot);
      const active = isActive(spot);
      const style = {
        radius: active ? 10 : 6,
        color: active ? "#3b82f6" : "#6b7280",
        fillColor: active ? "#3b82f6" : "#6b7280",
        fillOpacity: active ? 0.8 : 0.5,
      };

      let marker = markersRef.current.get(key);
      if (!marker) {
        marker = L.circleMarker([spot.latitude, spot.longitude], {
          ...style,
          weight: 2,
        })
          .bindTooltip(spot.name, {
            direction: "top",
            offset: [0, -8],
            className: "spot-tooltip",
          })
          .on("click", () => onSelectSpot(spot))
          .addTo(map);
        markersRef.current.set(key, marker);
      } else {
        marker.setStyle(style);
      }
    }

    map.setView([current.latitude, current.longitude], 10, { animate: true });
  }, [current, customSpots]);

  return (
    <div
      ref={containerRef}
      className="w-full h-48 sm:h-64 rounded-lg overflow-hidden border border-gray-800"
    />
  );
}
