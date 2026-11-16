"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpDown, Bell, Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Category, Feature } from "@/types/listing";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RollingNumber } from "@/components/motion/AnimatedNumber";
import { DealToggle } from "@/components/search/CategoryTabs";
import { PricePanel, SizePanel, TypePanel, typeSummary } from "@/components/search/FilterPopovers";
import { ALL_FEATURES, LISTINGS } from "@/lib/data/listings";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  countListings,
  matches,
  priceLabel,
  sizeLabel,
  type Filters,
  type SortKey,
} from "@/lib/filters";
import { CATEGORY_ICONS, FEATURE_ICONS } from "@/lib/icons";
import { useMediaQuery } from "@/lib/stores";
import { cn } from "@/lib/utils";

type Panel = "kategori" | "typ" | "yta" | "pris" | "tilltrade" | "egenskaper";

/* ------------------------------------------------------------------ */
/* Panels that only exist on the results page                         */
/* ------------------------------------------------------------------ */

function CategoryPanel({ filters, onChange }: { filters: Filters; onChange: (p: Partial<Filters>) => void }) {
  return (
    <div className="space-y-4">
      <DealToggle id="rf-deal" value={filters.deal} onChange={(deal) => onChange({ deal, minPris: null, maxPris: null })} className="w-fit" />
      <div className="grid gap-1.5">
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.value];
          const on = (filters.kategori ?? null) === c.value;
          const n = countListings(LISTINGS, { ...filters, kategori: c.value });
          return (
            <button
              key={c.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ kategori: on ? null : (c.value as Category) })}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3 text-left text-sm transition-colors",
                on ? "border-primary bg-mint" : "hover:border-foreground/20",
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1 font-medium">{c.label}</span>
              <span className="tabular text-xs text-muted-foreground">{n}</span>
              {on && <Check className="size-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AvailabilityPanel({ filters, onChange }: { filters: Filters; onChange: (p: Partial<Filters>) => void }) {
  const opts = [
    { v: "nu" as const, label: "Ledigt nu", sub: "Tillträde direkt" },
    { v: "3man" as const, label: "Inom 3 månader", sub: "Tillträde senast i februari" },
    { v: "datum" as const, label: "Valfritt datum", sub: "Välj senaste tillträdesdag" },
  ];
  return (
    <div className="grid gap-1.5" role="radiogroup" aria-label="Tillträde">
      {opts.map((o) => {
        const on = filters.tilltrade === o.v;
        return (
          <div key={o.v} className={cn("rounded-2xl border p-3 transition-colors", on ? "border-primary bg-mint" : "hover:border-foreground/20")}>
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() =>
                onChange(on ? { tilltrade: null, datum: null } : { tilltrade: o.v, datum: o.v === "datum" ? (filters.datum ?? "2027-01-31") : null })
              }
              className="flex w-full items-center gap-3 text-left"
            >
              <span className={cn("grid size-5 place-items-center rounded-full border-2", on ? "border-primary" : "border-border")}>
                {on && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{o.label}</span>
                <span className="block text-xs text-muted-foreground">{o.sub}</span>
              </span>
            </button>
            {o.v === "datum" && on && (
              <input
                type="date"
                aria-label="Senaste tillträdesdatum"
                min="2026-11-16"
                value={filters.datum ?? ""}
                onChange={(e) => onChange({ datum: e.target.value || null })}
                className="mt-3 w-full rounded-xl border bg-card px-3 py-2 text-sm"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FeaturesPanel({ filters, onChange }: { filters: Filters; onChange: (p: Partial<Filters>) => void }) {
  const counts = useMemo(() => {
    const m = new Map<Feature, number>();
    for (const l of LISTINGS) if (matches(l, filters, { skip: ["egenskaper"] })) for (const f of l.features) m.set(f, (m.get(f) ?? 0) + 1);
    return m;
  }, [filters]);
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_FEATURES.map((f) => {
        const Icon = FEATURE_ICONS[f];
        const on = filters.egenskaper.includes(f);
        return (
          <motion.button
            key={f}
            type="button"
            whileTap={{ scale: 0.96 }}
            aria-pressed={on}
            onClick={() => onChange({ egenskaper: on ? filters.egenskaper.filter((x) => x !== f) : [...filters.egenskaper, f] })}
            className={cn(
              "flex items-center gap-2 rounded-2xl border p-2.5 text-left text-sm transition-colors",
              on ? "border-primary bg-mint" : "hover:border-foreground/20",
            )}
          >
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", on ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
              {on && <Check className="size-3" strokeWidth={3} />}
            </span>
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{f}</span>
            <span className="tabular text-xs text-muted-foreground">{counts.get(f) ?? 0}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function PanelFor({ panel, filters, onChange }: { panel: Panel; filters: Filters; onChange: (p: Partial<Filters>) => void }) {
  switch (panel) {
    case "kategori":
      return <CategoryPanel filters={filters} onChange={onChange} />;
    case "typ":
      return <TypePanel filters={filters} onChange={onChange} />;
    case "yta":
      return <SizePanel filters={filters} onChange={onChange} />;
    case "pris":
      return <PricePanel filters={filters} onChange={onChange} />;
    case "tilltrade":
      return <AvailabilityPanel filters={filters} onChange={onChange} />;
    case "egenskaper":
      return <FeaturesPanel filters={filters} onChange={onChange} />;
  }
}

const CLEAR: Record<Panel, Partial<Filters>> = {
  kategori: { kategori: null, deal: null },
  typ: { typ: [] },
  yta: { minYta: null, maxYta: null },
  pris: { minPris: null, maxPris: null },
  tilltrade: { tilltrade: null, datum: null },
  egenskaper: { egenskaper: [] },
};

function pillValue(panel: Panel, f: Filters): string | null {
  switch (panel) {
    case "kategori": {
      const parts = [f.kategori ? CATEGORIES.find((c) => c.value === f.kategori)?.label : null, f.deal ? (f.deal === "hyra" ? "Hyra" : "Köpa") : null];
      return parts.filter(Boolean).join(" · ") || null;
    }
    case "typ":
      return typeSummary(f);
    case "yta":
      return sizeLabel(f.minYta, f.maxYta);
    case "pris":
      return priceLabel(f);
    case "tilltrade":
      return f.tilltrade === "nu" ? "Ledigt nu" : f.tilltrade === "3man" ? "Inom 3 mån" : f.tilltrade === "datum" ? `Senast ${f.datum}` : null;
    case "egenskaper":
      return f.egenskaper.length ? `${f.egenskaper.length} valda` : null;
  }
}

const PILL_LABEL: Record<Panel, string> = {
  kategori: "Kategori",
  typ: "Typ",
  yta: "Yta",
  pris: "Pris",
  tilltrade: "Tillträde",
  egenskaper: "Egenskaper",
};

/* ------------------------------------------------------------------ */
/* Filter pill with local draft + "Visa X objekt"                     */
/* ------------------------------------------------------------------ */

function FilterPill({ panel, filters, onApply }: { panel: Panel; filters: Filters; onApply: (f: Filters) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const value = pillValue(panel, filters);
  const n = countListings(LISTINGS, draft);

  function onOpenChange(o: boolean) {
    if (o) setDraft(filters);
    else if (open) onApply(draft);
    setOpen(o);
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
          value ? "border-primary bg-mint text-primary" : "bg-card hover:border-foreground/30",
          open && "ring-2 ring-primary/20",
        )}
      >
        {value ? value : PILL_LABEL[panel]}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-[min(440px,calc(100vw-2rem))] gap-0 rounded-3xl p-0 shadow-float">
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <p className="mb-4 text-base font-semibold">{PILL_LABEL[panel]}</p>
          <PanelFor panel={panel} filters={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />
        </div>
        <div className="flex items-center justify-between border-t px-5 py-3">
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, ...CLEAR[panel] }))}
            className="text-sm font-semibold underline underline-offset-4"
          >
            Rensa
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Visa <RollingNumber value={n} /> objekt
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/* "Alla filter" sheet                                                */
/* ------------------------------------------------------------------ */

function AllFiltersSheet({ filters, onApply }: { filters: Filters; onApply: (f: Filters) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const n = countListings(LISTINGS, draft);
  const activeCount = (Object.keys(CLEAR) as Panel[]).filter((p) => pillValue(p, filters)).length;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraft(filters);
          setOpen(true);
        }}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold whitespace-nowrap hover:border-foreground/30"
      >
        <SlidersHorizontal className="size-4" />
        Alla filter
        {activeCount > 0 && (
          <span className="tabular grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">{activeCount}</span>
        )}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={cn(
            "gap-0 bg-background p-0",
            isDesktop ? "w-full sm:max-w-[480px]" : "h-[92dvh] rounded-t-3xl",
          )}
        >
          <div className="border-b px-6 py-5">
            <SheetTitle className="text-xl font-semibold">Alla filter</SheetTitle>
            <SheetDescription>Förfina din sökning – antalet träffar uppdateras direkt.</SheetDescription>
          </div>
          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            {(Object.keys(CLEAR) as Panel[]).map((p) => (
              <section key={p} aria-labelledby={`af-${p}`}>
                <h3 id={`af-${p}`} className="mb-4 text-base font-semibold">
                  {PILL_LABEL[p]}
                </h3>
                <PanelFor panel={p} filters={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
              </section>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur">
            <button
              type="button"
              onClick={() => setDraft({ ...DEFAULT_FILTERS, sort: draft.sort, ort: draft.ort, omrade: draft.omrade, q: draft.q })}
              className="text-sm font-semibold underline underline-offset-4"
            >
              Rensa filter
            </button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary-hover"
            >
              Visa <RollingNumber value={n} /> objekt
            </motion.button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Public components                                                  */
/* ------------------------------------------------------------------ */

export function FilterBar({ filters, onApply, children }: { filters: Filters; onApply: (f: Filters) => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="no-scrollbar -my-2 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-2">
        <AllFiltersSheet filters={filters} onApply={onApply} />
        <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
        {(["kategori", "typ", "yta", "pris", "tilltrade", "egenskaper"] as Panel[]).map((p) => (
          <FilterPill key={p} panel={p} filters={filters} onApply={onApply} />
        ))}
      </div>
      {children}
    </div>
  );
}

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
      <SelectTrigger aria-label="Sortera" className="h-10 gap-2 rounded-full bg-card px-4 text-sm font-medium">
        <ArrowUpDown className="size-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="rounded-2xl">
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="rounded-xl">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SaveSearchButton({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-deep"
    >
      <Bell className="size-4 text-lime transition-transform group-hover:rotate-12" />
      <span className={cn(compact && "hidden sm:inline")}>Bevaka sökningen</span>
    </motion.button>
  );
}
