import type { Category, Feature, Listing, PremisesType } from "@/types/listing";
import { ALL_FEATURES, ALL_TYPES } from "@/lib/data/listings";
import { CITY_BY_SLUG } from "@/lib/data/cities";
import {
  DEMO_TODAY,
  formatMkr,
  formatNumber,
  isAvailableNow,
  monthlyRent,
  rentPerSqmYear,
  slugify,
} from "@/lib/format";

export type SortKey = "rek" | "nyast" | "pris-asc" | "pris-desc" | "yta-asc" | "yta-desc" | "kvm-asc";
export type ViewKey = "karta" | "galleri" | "jamfor";
export type Tilltrade = "nu" | "3man" | "datum";
export type PriceUnit = "man" | "kvm";
export type Deal = "hyra" | "kopa";

export interface Filters {
  kategori: Category | null;
  deal: Deal | null;
  ort: string | null;
  omrade: string | null;
  q: string | null;
  typ: PremisesType[];
  minYta: number | null;
  maxYta: number | null;
  minPris: number | null;
  maxPris: number | null;
  enhet: PriceUnit;
  tilltrade: Tilltrade | null;
  /** ISO date, used when tilltrade === "datum" */
  datum: string | null;
  egenskaper: Feature[];
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  kategori: null,
  deal: null,
  ort: null,
  omrade: null,
  q: null,
  typ: [],
  minYta: null,
  maxYta: null,
  minPris: null,
  maxPris: null,
  enhet: "man",
  tilltrade: null,
  datum: null,
  egenskaper: [],
  sort: "rek",
};

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "lokaler", label: "Lokaler" },
  { value: "fastigheter", label: "Fastigheter" },
  { value: "mark-och-skog", label: "Mark och skog" },
  { value: "foretag", label: "Företag" },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "rek", label: "Rekommenderade" },
  { value: "nyast", label: "Nyast" },
  { value: "pris-asc", label: "Lägst pris" },
  { value: "pris-desc", label: "Högst pris" },
  { value: "kvm-asc", label: "Lägst kr/m²" },
  { value: "yta-asc", label: "Minsta yta" },
  { value: "yta-desc", label: "Största yta" },
];

/* ---------------- Slider scales (non-linear so small sizes are usable) ---------------- */

export const SIZE_STEPS = [0, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000];
export const RENT_MONTH_STEPS = [0, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000];
export const RENT_SQM_STEPS = [0, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 5000, 6000];
export const SALE_STEPS = [0, 1e6, 2e6, 3e6, 5e6, 7.5e6, 10e6, 15e6, 20e6, 30e6, 50e6, 75e6, 100e6];

export function priceSteps(f: Pick<Filters, "deal" | "enhet">): number[] {
  if (f.deal === "kopa") return SALE_STEPS;
  return f.enhet === "kvm" ? RENT_SQM_STEPS : RENT_MONTH_STEPS;
}

export function formatPriceValue(v: number, f: Pick<Filters, "deal" | "enhet">): string {
  if (f.deal === "kopa") return formatMkr(v);
  return f.enhet === "kvm" ? `${formatNumber(v)} kr/m²/år` : `${formatNumber(v)} kr/mån`;
}

/* ---------------- URL <-> Filters ---------------- */

type ParamReader = { get(key: string): string | null };

function num(v: string | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function list<T extends string>(v: string | null, allowed: readonly T[]): T[] {
  if (!v) return [];
  const byNorm = new Map(allowed.map((a) => [slugify(a), a]));
  return v
    .split(",")
    .map((s) => byNorm.get(slugify(s)))
    .filter((x): x is T => Boolean(x));
}

export function parseFilters(sp: ParamReader): Filters {
  const kategori = sp.get("kategori");
  const deal = sp.get("deal");
  const enhet = sp.get("enhet");
  const sort = sp.get("sort");
  const tilltrade = sp.get("tilltrade");
  const rawDatum = sp.get("datum");
  const datum = rawDatum && /^\d{4}-\d{2}-\d{2}$/.test(rawDatum) ? rawDatum : null;
  return {
    kategori: CATEGORIES.some((c) => c.value === kategori) ? (kategori as Category) : null,
    deal: deal === "hyra" || deal === "kopa" ? deal : null,
    ort: sp.get("ort") || null,
    omrade: sp.get("omrade") || null,
    q: sp.get("q") || null,
    typ: list(sp.get("typ"), ALL_TYPES),
    minYta: num(sp.get("minYta")),
    maxYta: num(sp.get("maxYta")),
    minPris: num(sp.get("minPris")),
    maxPris: num(sp.get("maxPris")),
    enhet: enhet === "kvm" ? "kvm" : "man",
    tilltrade:
      sp.get("ledigNu") === "1" ? "nu" : tilltrade === "3man" ? "3man" : tilltrade === "datum" && datum ? "datum" : null,
    datum: tilltrade === "datum" ? datum : null,
    egenskaper: list(sp.get("egenskaper"), ALL_FEATURES),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortKey) : "rek",
  };
}

/** Serialize filters to a query string (without "?"). `extra` keeps non-filter params like `vy`. */
export function toQuery(f: Filters, extra: Record<string, string | null | undefined> = {}): string {
  const p = new URLSearchParams();
  if (f.kategori) p.set("kategori", f.kategori);
  if (f.deal) p.set("deal", f.deal);
  if (f.ort) p.set("ort", f.ort);
  if (f.omrade) p.set("omrade", f.omrade);
  if (f.q) p.set("q", f.q);
  if (f.typ.length) p.set("typ", f.typ.map(slugify).join(","));
  if (f.minYta != null) p.set("minYta", String(f.minYta));
  if (f.maxYta != null) p.set("maxYta", String(f.maxYta));
  if (f.minPris != null) p.set("minPris", String(f.minPris));
  if (f.maxPris != null) p.set("maxPris", String(f.maxPris));
  if ((f.minPris != null || f.maxPris != null) && f.enhet === "kvm") p.set("enhet", "kvm");
  if (f.tilltrade === "nu") p.set("ledigNu", "1");
  if (f.tilltrade === "3man") p.set("tilltrade", "3man");
  if (f.tilltrade === "datum" && f.datum) {
    p.set("tilltrade", "datum");
    p.set("datum", f.datum);
  }
  if (f.egenskaper.length) p.set("egenskaper", f.egenskaper.map(slugify).join(","));
  if (f.sort !== "rek") p.set("sort", f.sort);
  for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  return p.toString();
}

/** Stable key of the parts that affect the result set (used to trigger skeletons). */
export function filterKey(f: Filters): string {
  return toQuery({ ...f, sort: "rek" });
}

/* ---------------- Filtering & sorting ---------------- */

const THREE_MONTHS = 92 * 86_400_000;

function norm(s: string): string {
  return slugify(s).replace(/-/g, " ");
}

function priceForFilter(l: Listing, f: Filters): number | undefined {
  if (l.price.kind === "onRequest") return undefined;
  if (l.price.kind === "sale") return f.deal === "kopa" ? l.price.amount : undefined;
  if (f.deal === "kopa") return undefined;
  return f.enhet === "kvm" ? rentPerSqmYear(l) : monthlyRent(l);
}

export interface FilterOptions {
  /** Skip one filter dimension (used for "remove this filter" suggestions & histograms). */
  skip?: (keyof Filters)[];
  bounds?: { north: number; south: number; east: number; west: number } | null;
}

export function matches(l: Listing, f: Filters, opts: FilterOptions = {}): boolean {
  const skip = new Set(opts.skip ?? []);
  if (!skip.has("kategori") && f.kategori && l.category !== f.kategori) return false;
  if (!skip.has("deal") && f.deal) {
    if (f.deal === "hyra" && l.deal !== "Hyra") return false;
    if (f.deal === "kopa" && l.deal !== "Till salu") return false;
  }
  if (!skip.has("ort") && f.ort) {
    const city = CITY_BY_SLUG.get(f.ort);
    const name = city?.name ?? f.ort;
    if (slugify(l.city) !== slugify(name) && slugify(l.area ?? "") !== slugify(name)) return false;
  }
  if (!skip.has("omrade") && f.omrade && slugify(l.area ?? "") !== slugify(f.omrade)) return false;
  if (!skip.has("q") && f.q) {
    const hay = norm(`${l.title} ${l.address} ${l.area ?? ""} ${l.city} ${l.type}`);
    const words = norm(f.q).split(" ").filter(Boolean);
    if (!words.every((w) => hay.includes(w))) return false;
  }
  if (!skip.has("typ") && f.typ.length && !f.typ.includes(l.type)) return false;
  const skipYta = skip.has("minYta") || skip.has("maxYta");
  if (!skipYta && f.minYta != null && l.sizeSqm < f.minYta) return false;
  if (!skipYta && f.maxYta != null && l.sizeSqm > f.maxYta) return false;
  if (!skip.has("maxPris") && !skip.has("minPris") && (f.minPris != null || f.maxPris != null)) {
    const p = priceForFilter(l, f);
    if (p == null) return false;
    if (f.minPris != null && p < f.minPris) return false;
    if (f.maxPris != null && p > f.maxPris) return false;
  }
  if (!skip.has("tilltrade") && f.tilltrade) {
    if (f.tilltrade === "nu" && !isAvailableNow(l)) return false;
    if (f.tilltrade === "3man" && !isAvailableNow(l)) {
      if (new Date(l.availableFrom).getTime() - DEMO_TODAY.getTime() > THREE_MONTHS) return false;
    }
    if (f.tilltrade === "datum" && f.datum && !isAvailableNow(l) && l.availableFrom > f.datum) return false;
  }
  if (!skip.has("egenskaper") && f.egenskaper.length && !f.egenskaper.every((x) => l.features.includes(x))) return false;
  if (opts.bounds) {
    const b = opts.bounds;
    if (l.lat > b.north || l.lat < b.south || l.lng > b.east || l.lng < b.west) return false;
  }
  return true;
}

function priceSortValue(l: Listing): number {
  if (l.price.kind === "sale") return (l.price.amount ?? 0) / 120; // rough monthly-equivalent for mixed lists
  return monthlyRent(l) ?? Number.POSITIVE_INFINITY;
}

export function sortListings(list: Listing[], sort: SortKey): Listing[] {
  const arr = [...list];
  const byPublished = (a: Listing, b: Listing) => b.published.localeCompare(a.published);
  switch (sort) {
    case "nyast":
      return arr.sort(byPublished);
    case "pris-asc":
      return arr.sort((a, b) => priceSortValue(a) - priceSortValue(b));
    case "pris-desc":
      return arr.sort((a, b) => {
        const av = priceSortValue(a), bv = priceSortValue(b);
        if (!Number.isFinite(av)) return 1;
        if (!Number.isFinite(bv)) return -1;
        return bv - av;
      });
    case "kvm-asc":
      return arr.sort((a, b) => (rentPerSqmYear(a) ?? Infinity) - (rentPerSqmYear(b) ?? Infinity));
    case "yta-asc":
      return arr.sort((a, b) => a.sizeSqm - b.sizeSqm);
    case "yta-desc":
      return arr.sort((a, b) => b.sizeSqm - a.sizeSqm);
    default:
      return arr.sort((a, b) => {
        const fa = (a.isFeatured ? 2 : 0) + (a.isNew ? 1 : 0);
        const fb = (b.isFeatured ? 2 : 0) + (b.isNew ? 1 : 0);
        return fb - fa || byPublished(a, b);
      });
  }
}

export function filterListings(all: Listing[], f: Filters, opts?: FilterOptions): Listing[] {
  return sortListings(
    all.filter((l) => matches(l, f, opts)),
    f.sort,
  );
}

export function countListings(all: Listing[], f: Filters, opts?: FilterOptions): number {
  let n = 0;
  for (const l of all) if (matches(l, f, opts)) n++;
  return n;
}

/* ---------------- Active filter chips ---------------- */

export interface Chip {
  id: string;
  label: string;
  /** Which filter group this chip belongs to (for "remove this filter" suggestions). */
  group: keyof Filters;
  remove: (f: Filters) => Filters;
}

export function sizeLabel(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${formatNumber(min)}–${formatNumber(max)} m²`;
  if (min != null) return `Från ${formatNumber(min)} m²`;
  return `Upp till ${formatNumber(max ?? 0)} m²`;
}

export function priceLabel(f: Filters): string | null {
  if (f.minPris == null && f.maxPris == null) return null;
  const fmt = (v: number) => formatPriceValue(v, f);
  if (f.minPris != null && f.maxPris != null) {
    const short = f.deal === "kopa" ? fmt(f.minPris).replace(" mkr", "") : formatNumber(f.minPris);
    return `${short}–${fmt(f.maxPris)}`;
  }
  if (f.maxPris != null) return `≤ ${fmt(f.maxPris)}`;
  return `≥ ${fmt(f.minPris ?? 0)}`;
}

export function activeChips(f: Filters): Chip[] {
  const chips: Chip[] = [];
  if (f.kategori && f.kategori !== "lokaler") {
    chips.push({
      id: "kategori",
      group: "kategori",
      label: CATEGORIES.find((c) => c.value === f.kategori)?.label ?? f.kategori,
      remove: (x) => ({ ...x, kategori: null }),
    });
  }
  if (f.deal) {
    chips.push({ id: "deal", group: "deal", label: f.deal === "hyra" ? "Hyra" : "Köpa", remove: (x) => ({ ...x, deal: null, minPris: null, maxPris: null }) });
  }
  if (f.ort) {
    chips.push({ id: "ort", group: "ort", label: CITY_BY_SLUG.get(f.ort)?.name ?? f.ort, remove: (x) => ({ ...x, ort: null, omrade: null }) });
  }
  if (f.omrade) chips.push({ id: "omrade", group: "omrade", label: f.omrade, remove: (x) => ({ ...x, omrade: null }) });
  if (f.q) chips.push({ id: "q", group: "q", label: `”${f.q}”`, remove: (x) => ({ ...x, q: null }) });
  for (const t of f.typ) {
    chips.push({ id: `typ-${t}`, group: "typ", label: t, remove: (x) => ({ ...x, typ: x.typ.filter((y) => y !== t) }) });
  }
  const size = sizeLabel(f.minYta, f.maxYta);
  if (size) chips.push({ id: "yta", group: "minYta", label: size, remove: (x) => ({ ...x, minYta: null, maxYta: null }) });
  const price = priceLabel(f);
  if (price) chips.push({ id: "pris", group: "maxPris", label: price, remove: (x) => ({ ...x, minPris: null, maxPris: null }) });
  if (f.tilltrade) {
    chips.push({
      id: "tilltrade",
      group: "tilltrade",
      label: f.tilltrade === "nu" ? "Ledigt nu" : f.tilltrade === "3man" ? "Inom 3 mån" : `Tillträde senast ${f.datum}`,
      remove: (x) => ({ ...x, tilltrade: null, datum: null }),
    });
  }
  for (const e of f.egenskaper) {
    chips.push({ id: `eg-${e}`, group: "egenskaper", label: e, remove: (x) => ({ ...x, egenskaper: x.egenskaper.filter((y) => y !== e) }) });
  }
  return chips;
}

export function hasActiveFilters(f: Filters): boolean {
  return activeChips(f).length > 0;
}
