"use client";

import { motion } from "motion/react";
import { Bell, MapPin, X } from "lucide-react";
import { LISTINGS } from "@/lib/data/listings";
import { CITIES, CITY_BY_SLUG } from "@/lib/data/cities";
import { activeChips, countListings, DEFAULT_FILTERS, type Filters } from "@/lib/filters";

const GROUP_NAMES: Partial<Record<keyof Filters, string>> = {
  minYta: "Yta",
  maxPris: "Pris",
  typ: "Typ",
  egenskaper: "Egenskaper",
  tilltrade: "Tillträde",
  ort: "Ort",
  omrade: "Område",
  q: "Sökord",
  kategori: "Kategori",
  deal: "Hyra/Köpa",
};

export function EmptyState({
  filters,
  onChange,
  onSaveSearch,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onSaveSearch: () => void;
}) {
  // Suggest removing single filter groups that would yield results.
  const groups = Array.from(new Map(activeChips(filters).map((c) => [c.group, c])).values());
  const suggestions = groups
    .map((c) => {
      const next = activeChips(filters)
        .filter((x) => x.group === c.group)
        .reduce((f, x) => x.remove(f), filters);
      return { label: GROUP_NAMES[c.group] ?? c.label, next, n: countListings(LISTINGS, next) };
    })
    .filter((s) => s.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);

  const city = CITY_BY_SLUG.get(filters.ort ?? "");
  const nearby = (city?.nearby ?? [])
    .map((name) => {
      const c = CITIES.find((x) => x.name === name);
      const asArea = !c ? CITIES.find((x) => x.areas.includes(name)) : undefined;
      const next: Filters = c
        ? { ...filters, ort: c.slug, omrade: null }
        : asArea
          ? { ...filters, ort: asArea.slug, omrade: name }
          : filters;
      return { name, next, n: countListings(LISTINGS, next) };
    })
    .filter((x) => x.n > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-14 text-center"
    >
      <div aria-hidden="true" className="relative mb-6 h-28 w-40">
        <svg viewBox="0 0 160 112" className="size-full">
          <rect x="18" y="30" width="56" height="70" rx="8" fill="var(--mint)" />
          <rect x="84" y="14" width="58" height="86" rx="8" fill="var(--muted)" />
          {[0, 1, 2].map((r) =>
            [0, 1].map((c) => <rect key={`${r}${c}`} x={28 + c * 22} y={42 + r * 18} width="14" height="10" rx="2" fill="var(--card)" />),
          )}
          {[0, 1, 2, 3].map((r) =>
            [0, 1].map((c) => <rect key={`b${r}${c}`} x={94 + c * 22} y={26 + r * 17} width="14" height="10" rx="2" fill="var(--card)" />),
          )}
          <line x1="6" y1="100" x2="154" y2="100" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="absolute -top-2 right-2 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift"
        >
          <MapPin className="size-5" />
        </motion.span>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Inga lokaler matchar just nu</h2>
      <p className="mt-2 text-muted-foreground">Justera filtren eller bevaka sökningen så hör vi av oss när något dyker upp.</p>

      {(suggestions.length > 0 || nearby.length > 0) && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onChange(s.next)}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
            >
              <X className="size-3.5" /> Ta bort filtret ’{s.label}’ <span className="text-muted-foreground">({s.n})</span>
            </button>
          ))}
          {nearby.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3.5 py-2 text-sm">
              Visa närliggande orter:
              {nearby.map((x, i) => (
                <button key={x.name} type="button" onClick={() => onChange(x.next)} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {x.name}
                  {i < nearby.length - 1 ? "," : ""}
                </button>
              ))}
            </span>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onSaveSearch}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Bell className="size-4" /> Bevaka sökningen
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_FILTERS })}
          className="rounded-full px-5 py-3 text-sm font-semibold ring-1 ring-border hover:bg-muted"
        >
          Rensa alla filter
        </button>
      </div>
    </motion.div>
  );
}
