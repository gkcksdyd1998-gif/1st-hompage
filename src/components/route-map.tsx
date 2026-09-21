"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { Maximize } from "lucide-react";
import type { PlaceGroup } from "@/data/trips";

export type MapPlace = PlaceGroup & { day: string; number: number };
export default function RouteMap({
  places,
  selected,
  onSelect,
}: {
  places: MapPlace[];
  selected: string | null;
  onSelect: (src: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const callback = useRef(onSelect);
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    if (!container.current || !places.length) return;
    const markerCollection = markers.current;
    const map = L.map(container.current, {
      scrollWheelZoom: false,
      zoomAnimation: false,
      maxZoom: 19,
    });
    mapRef.current = map;
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 35,
      animate: false,
      showCoverageOnHover: false,
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    ).addTo(map);
    tiles.on("tileerror", () => setTileError(true));
    tiles.on("tileload", () => setTileError(false));
    const colors = ["#28665a", "#b94e45", "#4f72a3", "#8a6740"];
    const days = [...new Set(places.map((place) => place.day))];
    for (const [index, day] of days.entries()) {
      const group = places.filter((place) => place.day === day);
      L.polyline(
        group.map((place) => [place.latitude, place.longitude]),
        {
          color: colors[index % colors.length],
          weight: 3,
          opacity: 0.8,
          dashArray: "6 8",
        },
      ).addTo(map);
    }
    for (const place of places) {
      const icon = L.divIcon({
        className: "route-pin",
        html: `<span>${place.number}</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const marker = L.marker([place.latitude, place.longitude], {
        icon,
        title: place.resolvedName ?? place.label,
        alt: `${place.number}. ${place.resolvedName ?? place.label}`,
      });
      cluster.addLayer(marker);
      const label = document.createElement("span");
      label.textContent = place.resolvedName ?? place.area ?? place.label;
      marker.bindTooltip(label, { direction: "top" });
      marker.on("click", () => callback.current(place.representative));
      markers.current.set(place.representative, marker);
    }
    map.fitBounds(
      L.latLngBounds(places.map((place) => [place.latitude, place.longitude])),
      { padding: [40, 40], maxZoom: 14 },
    );
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markerCollection.clear();
    };
  }, [places]);
  useEffect(() => {
    for (const [src, marker] of markers.current) {
      marker.getElement()?.classList.toggle("selected", src === selected);
      marker.setZIndexOffset(src === selected ? 1000 : 0);
      if (src === selected && mapRef.current)
        clusterRef.current?.zoomToShowLayer(marker, () => {
          marker.getElement()?.classList.add("selected");
          marker.openTooltip();
        });
    }
  }, [selected, places]);
  return (
    <div className="map-frame">
      <div ref={container} className="route-map" aria-label="촬영 장소 지도" />
      <button
        className="map-fit icon-button"
        aria-label="전체 장소 보기"
        title="전체 장소 보기"
        onClick={() => {
          if (places.length)
            mapRef.current?.fitBounds(
              L.latLngBounds(
                places.map((place) => [place.latitude, place.longitude]),
              ),
              { padding: [40, 40], maxZoom: 14 },
            );
        }}
      >
        <Maximize size={17} />
      </button>
      {tileError && (
        <p className="map-error" role="status">
          지도를 불러오지 못했습니다. 장소의 지도 링크를 이용해주세요.
        </p>
      )}
    </div>
  );
}
