"use client";

import { forwardRef, useId, useMemo, useState } from "react";
import { Clock, LocateFixed, MapPin, Building2, Navigation, X } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { ADDRESSES, AREAS, CITIES } from "@/lib/data/cities";
import { recentSearchesStore, useListStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { segmentClass, segmentLabel, segmentValue } from "./segment";

export interface LocationValue {
  ort: string | null;
  omrade: string | null;
  q: string | null;
}

interface Option {
  id: string;
  group: "Nära dig" | "Senaste sökningar" | "Städer" | "Områden" | "Adresser";
  label: string;
  sub?: string;
  count?: number;
  value: LocationValue | "near-me";
}

function fold(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

/** Bold the matched part of `text` (accent-insensitive; NFD+strip keeps indices for å/ä/ö). */
export function Highlight({ text, query }: { text: string; query: string }) {
  const q = fold(query.trim());
  if (!q) return <>{text}</>;
  const i = fold(text).indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-lime/40 px-px text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function locationLabel(v: LocationValue): string {
  const city = CITIES.find((c) => c.slug === v.ort)?.name;
  if (v.q) return city ? `${v.q}, ${city}` : v.q;
  if (v.omrade) return city ? `${v.omrade}, ${city}` : v.omrade;
  return city ?? "";
}

function distance(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dx = (aLng - bLng) * Math.cos(((aLat + bLat) / 2) * (Math.PI / 180));
  const dy = aLat - bLat;
  return Math.sqrt(dx * dx + dy * dy);
}

export function useLocationOptions(query: string) {
  const recentRaw = useListStore(recentSearchesStore);
  return useMemo<Option[]>(() => {
    const q = fold(query.trim());
    if (!q) {
      const recent: Option[] = recentRaw
        .map((r, i) => {
          try {
            const v = JSON.parse(r) as LocationValue & { label: string };
            return { id: `recent-${i}`, group: "Senaste sökningar" as const, label: v.label, value: { ort: v.ort, omrade: v.omrade, q: v.q } };
          } catch {
            return null;
          }
        })
        .filter((x): x is NonNullable<typeof x> => x != null)
        .slice(0, 3);
      return [
        { id: "near", group: "Nära dig", label: "Nära mig", sub: "Använd din position", value: "near-me" },
        ...recent,
        ...CITIES.slice(0, 6).map<Option>((c) => ({
          id: `city-${c.slug}`,
          group: "Städer",
          label: c.name,
          count: c.count,
          value: { ort: c.slug, omrade: null, q: null },
        })),
      ];
    }
    const cities = CITIES.filter((c) => fold(c.name).includes(q)).map<Option>((c) => ({
      id: `city-${c.slug}`,
      group: "Städer",
      label: c.name,
      count: c.count,
      value: { ort: c.slug, omrade: null, q: null },
    }));
    const areas = AREAS.filter((a) => fold(a.name).includes(q) || fold(a.city).includes(q))
      .slice(0, 5)
      .map<Option>((a) => ({
        id: `area-${a.citySlug}-${a.name}`,
        group: "Områden",
        label: a.name,
        sub: a.city,
        count: a.count,
        value: { ort: a.citySlug, omrade: a.name, q: null },
      }));
    const addresses =
      q.length >= 2
        ? ADDRESSES.filter((a) => fold(a.address).includes(q))
            .slice(0, 4)
            .map<Option>((a) => ({
              id: `addr-${a.id}`,
              group: "Adresser",
              label: a.address,
              sub: a.city,
              value: { ort: a.citySlug, omrade: null, q: a.address },
            }))
        : [];
    return [...cities, ...areas, ...addresses];
  }, [query, recentRaw]);
}

const GROUP_ICON = {
  "Nära dig": LocateFixed,
  "Senaste sökningar": Clock,
  Städer: Building2,
  Områden: MapPin,
  Adresser: Navigation,
};

interface Props {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone?: () => void;
  compact?: boolean;
  className?: string;
}

export const LocationCombobox = forwardRef<HTMLInputElement, Props>(function LocationCombobox(
  { value, onChange, open, onOpenChange, onDone, compact = false, className },
  ref,
) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const options = useLocationOptions(typing ? query : "");
  const label = locationLabel(value);

  function select(opt: Option) {
    if (opt.value === "near-me") {
      locate();
      return;
    }
    const v = opt.value;
    onChange(v);
    recentSearchesStore.push(JSON.stringify({ ...v, label: locationLabel(v) }));
    setTyping(false);
    setQuery("");
    onDone?.();
  }

  function locate() {
    if (!("geolocation" in navigator)) {
      toast.error("Din webbläsare stöder inte platstjänster");
      return;
    }
    const tid = toast.loading("Hämtar din position…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = [...CITIES].sort(
          (a, b) => distance(latitude, longitude, a.lat, a.lng) - distance(latitude, longitude, b.lat, b.lng),
        )[0];
        toast.success(`Närmaste ort: ${nearest.name}`, { id: tid });
        onChange({ ort: nearest.slug, omrade: null, q: null });
        setTyping(false);
        onDone?.();
      },
      () => {
        toast.error("Kunde inte hämta din position", { id: tid, description: "Vi visar Jönköping som exempel." });
        onChange({ ort: "jonkoping", omrade: null, q: null });
        setTyping(false);
        onDone?.();
      },
      { timeout: 6000 },
    );
  }

  const safeIndex = Math.min(activeIndex, Math.max(0, options.length - 1));

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div
          className={segmentClass(open, compact, cn("flex-[1.4] cursor-text", className))}
          onClick={(e) => {
            (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus();
            onOpenChange(true);
          }}
        >
          <label htmlFor={`${listId}-input`} className={cn(segmentLabel, compact && "sr-only")}>
            Var?
          </label>
          <div className="flex items-center gap-2">
            {compact && <MapPin className="size-4 shrink-0 text-muted-foreground" />}
            <input
              ref={ref}
              id={`${listId}-input`}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${listId}-list`}
              aria-autocomplete="list"
              aria-activedescendant={open && options[safeIndex] ? `${listId}-${options[safeIndex].id}` : undefined}
              autoComplete="off"
              placeholder="Ort, område eller adress"
              value={typing ? query : label}
              onFocus={() => onOpenChange(true)}
              onChange={(e) => {
                setTyping(true);
                setQuery(e.target.value);
                setActiveIndex(0);
                if (!open) onOpenChange(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (!open) onOpenChange(true);
                  setActiveIndex((i) => Math.min(i + 1, options.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  if (open && options[safeIndex]) {
                    e.preventDefault();
                    select(options[safeIndex]);
                  }
                } else if (e.key === "Escape") {
                  onOpenChange(false);
                } else if (e.key === "Tab") {
                  onOpenChange(false);
                }
              }}
              className={cn(
                segmentValue,
                "w-full min-w-0 bg-transparent placeholder:text-muted-foreground focus:outline-none",
                label && !typing ? "font-medium text-foreground" : "",
              )}
            />
            {label && (
              <button
                type="button"
                aria-label="Rensa plats"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ort: null, omrade: null, q: null });
                  setTyping(false);
                  setQuery("");
                }}
                className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground opacity-0 transition-opacity group-hover/seg:opacity-100 hover:text-foreground focus-visible:opacity-100"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          const t = e.target as HTMLElement | null;
          if (t?.closest?.("[data-search-bar]")) e.preventDefault();
        }}
        className="w-[min(420px,calc(100vw-2rem))] rounded-3xl p-2 shadow-float"
      >
        <ul id={`${listId}-list`} role="listbox" aria-label="Förslag på platser" className="max-h-[380px] overflow-y-auto">
          {options.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Inga platser matchar ”{query}”.
              <br />
              Prova en stad som Jönköping eller Stockholm.
            </li>
          )}
          {options.map((opt, i) => {
            const showHeader = opt.group !== options[i - 1]?.group && opt.group !== "Nära dig";
            const Icon = GROUP_ICON[opt.group];
            const active = i === safeIndex;
            return (
              <li key={opt.id} role="presentation">
                {showHeader && (
                  <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {opt.group}
                  </p>
                )}
                <div
                  id={`${listId}-${opt.id}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(opt)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                    active ? "bg-mint" : "",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl",
                      opt.group === "Nära dig" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      <Highlight text={opt.label} query={typing ? query : ""} />
                    </span>
                    {opt.sub && <span className="block truncate text-xs text-muted-foreground">{opt.sub}</span>}
                  </span>
                  {opt.count != null && (
                    <span className="tabular shrink-0 text-xs text-muted-foreground">
                      {opt.count} {opt.count === 1 ? "lokal" : "lokaler"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
});
