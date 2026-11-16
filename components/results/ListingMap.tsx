"use client";

import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Listing } from "@/types/listing";
import { formatPinLabel, formatPrice, formatSqm } from "@/lib/format";
import { SWEDEN_CENTER } from "@/lib/data/cities";

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface Props {
  listings: Listing[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onOpen: (l: Listing) => void;
  favorites: string[];
  /** Change this to re-fit the map to the listings. */
  fitKey: string;
  searchOnMove: boolean;
  onBoundsChange: (b: Bounds) => void;
  /** Changing this triggers invalidateSize (e.g. fullscreen toggle). */
  sizeKey?: string | number;
}

type Cluster = { id: string; lat: number; lng: number; items: Listing[] };

// CARTO Positron now requires an API key, so we use Esri's keyless Light Gray Canvas
// (visually equivalent) with its label layer on top.
const BASE_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const LABEL_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}";
const ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors";

function Tiles() {
  return (
    <>
      <TileLayer url={BASE_TILES} attribution={ATTRIBUTION} maxZoom={16} maxNativeZoom={16} />
      <TileLayer url={LABEL_TILES} maxZoom={16} maxNativeZoom={16} />
    </>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function pinIcon(l: Listing, active: boolean, fav: boolean) {
  return L.divIcon({
    className: "lk-marker",
    html: `<div class="lk-pin${active ? " is-active" : ""}${fav ? " is-fav" : ""}">${escapeHtml(formatPinLabel(l))}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -34],
  });
}

function clusterIcon(n: number) {
  const size = n < 5 ? 40 : n < 10 ? 48 : 56;
  return L.divIcon({
    className: "lk-marker",
    html: `<div class="lk-cluster" style="width:${size}px;height:${size}px">${n}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** Greedy pixel-distance clustering at the current zoom. */
function useClusters(listings: Listing[]) {
  const map = useMap();
  const zoom = useSyncExternalStore(
    useCallback(
      (cb: () => void) => {
        map.on("zoomend viewreset", cb);
        return () => {
          map.off("zoomend viewreset", cb);
        };
      },
      [map],
    ),
    () => map.getZoom(),
    () => map.getZoom(),
  );
  return useMemo<Cluster[]>(() => {
    const radius = 46;
    const clusters: (Cluster & { px: L.Point })[] = [];
    for (const l of listings) {
      const p = map.project([l.lat, l.lng], zoom);
      const hit = clusters.find((c) => c.px.distanceTo(p) < radius);
      if (hit) {
        hit.items.push(l);
        const n = hit.items.length;
        hit.lat = (hit.lat * (n - 1) + l.lat) / n;
        hit.lng = (hit.lng * (n - 1) + l.lng) / n;
        hit.px = map.project([hit.lat, hit.lng], zoom);
      } else {
        clusters.push({ id: l.id, lat: l.lat, lng: l.lng, items: [l], px: p });
      }
    }
    return clusters;
  }, [listings, zoom, map]);
}

function FitToListings({ listings, fitKey }: { listings: Listing[]; fitKey: string }) {
  const map = useMap();
  const latest = useRef(listings);
  useEffect(() => {
    latest.current = listings;
  });
  useEffect(() => {
    function fit(animate: boolean) {
      map.invalidateSize({ animate: false });
      const ls = latest.current;
      if (!ls.length) {
        map.setView([SWEDEN_CENTER.lat, SWEDEN_CENTER.lng], SWEDEN_CENTER.zoom, { animate });
        return;
      }
      const b = L.latLngBounds(ls.map((l) => [l.lat, l.lng] as [number, number]));
      map.fitBounds(b, { padding: [60, 60], maxZoom: 14, animate });
    }
    fit(false);
    // The container may still be animating in (view transitions) – fit again once it has settled.
    const t = window.setTimeout(() => fit(true), 450);
    return () => window.clearTimeout(t);
  }, [fitKey, map]);
  return null;
}

function BoundsWatcher({ enabled, onChange }: { enabled: boolean; onChange: (b: Bounds) => void }) {
  const map = useMap();
  useMapEvents({
    moveend: () => {
      if (!enabled) return;
      const b = map.getBounds();
      onChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
  });
  useEffect(() => {
    if (!enabled) return;
    const b = map.getBounds();
    onChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    // only when toggled on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return null;
}

function SizeWatcher({ sizeKey }: { sizeKey?: string | number }) {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize({ animate: true }), 320);
    return () => window.clearTimeout(t);
  }, [sizeKey, map]);
  return null;
}

function Markers({ listings, hoveredId, onHover, onOpen, favorites }: Omit<Props, "fitKey" | "searchOnMove" | "onBoundsChange">) {
  const map = useMap();
  const clusters = useClusters(listings);
  return (
    <>
      {clusters.map((c) => {
        if (c.items.length > 1) {
          const containsHovered = hoveredId != null && c.items.some((i) => i.id === hoveredId);
          return (
            <Marker
              key={`c-${c.id}-${c.items.length}`}
              position={[c.lat, c.lng]}
              icon={clusterIcon(c.items.length)}
              zIndexOffset={containsHovered ? 1000 : 0}
              title={`${c.items.length} objekt – zooma in`}
              eventHandlers={{
                click: () => {
                  const b = L.latLngBounds(c.items.map((i) => [i.lat, i.lng] as [number, number]));
                  map.fitBounds(b, { padding: [80, 80], maxZoom: 16 });
                },
              }}
            />
          );
        }
        const l = c.items[0];
        const active = l.id === hoveredId;
        const price = formatPrice(l);
        return (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={pinIcon(l, active, favorites.includes(l.id))}
            zIndexOffset={active ? 1000 : 0}
            title={`${l.address}, ${l.city}`}
            eventHandlers={{
              mouseover: () => onHover(l.id),
              mouseout: () => onHover(null),
            }}
          >
            <Popup className="lk-popup" closeButton>
              <button type="button" onClick={() => onOpen(l)} className="block w-full text-left">
                <div className="relative h-[130px] w-full">
                  <Image src={l.images[0]} alt="" fill sizes="240px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-3 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-ink">{l.type}</span>
                </div>
                <div className="space-y-0.5 bg-card p-3 text-foreground">
                  <p className="text-[15px] font-semibold">{price.main}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSqm(l.sizeSqm)} · {l.address}, {l.city}
                  </p>
                  <p className="pt-1 text-xs font-semibold text-primary">Visa detaljer →</p>
                </div>
              </button>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default function ListingMap(props: Props) {
  return (
    <MapContainer
      center={[SWEDEN_CENTER.lat, SWEDEN_CENTER.lng]}
      zoom={SWEDEN_CENTER.zoom}
      scrollWheelZoom
      zoomControl={false}
      className="size-full"
      attributionControl
    >
      <Tiles />
      <ZoomControl />
      <FitToListings listings={props.listings} fitKey={props.fitKey} />
      <BoundsWatcher enabled={props.searchOnMove} onChange={props.onBoundsChange} />
      <SizeWatcher sizeKey={props.sizeKey} />
      <Markers
        listings={props.listings}
        hoveredId={props.hoveredId}
        onHover={props.onHover}
        onOpen={props.onOpen}
        favorites={props.favorites}
      />
    </MapContainer>
  );
}

function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const c = L.control.zoom({ position: "bottomright", zoomInTitle: "Zooma in", zoomOutTitle: "Zooma ut" });
    c.addTo(map);
    return () => {
      c.remove();
    };
  }, [map]);
  return null;
}

/** Small static-ish map for the quick view. */
export function MiniMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const icon = useMemo(
    () => L.divIcon({ className: "lk-marker", html: `<div class="lk-dot" title="${escapeHtml(label)}"></div>`, iconSize: [0, 0] }),
    [label],
  );
  return (
    <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} zoomControl={false} dragging className="size-full">
      <Tiles />
      <Marker position={[lat, lng]} icon={icon} />
    </MapContainer>
  );
}
