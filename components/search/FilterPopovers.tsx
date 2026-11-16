"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { PremisesType } from "@/types/listing";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { ALL_TYPES, LISTINGS } from "@/lib/data/listings";
import {
  SIZE_STEPS,
  matches,
  priceLabel,
  priceSteps,
  sizeLabel,
  type Filters,
} from "@/lib/filters";
import { formatNumber, monthlyRent, rentPerSqmYear } from "@/lib/format";
import { TYPE_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { segmentClass, segmentLabel, segmentValue, type SegmentKey } from "./segment";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function nearestIndex(steps: number[], v: number | null, fallback: number) {
  if (v == null) return fallback;
  let best = 0;
  for (let i = 0; i < steps.length; i++) if (Math.abs(steps[i] - v) < Math.abs(steps[best] - v)) best = i;
  return best;
}

type Update = (patch: Partial<Filters>) => void;

/* ------------------------------------------------------------------ */
/* Type panel                                                         */
/* ------------------------------------------------------------------ */

export function TypePanel({ filters, onChange, columns = 2 }: { filters: Filters; onChange: Update; columns?: 2 | 4 }) {
  const counts = useMemo(() => {
    const m = new Map<PremisesType, number>();
    for (const t of ALL_TYPES) m.set(t, 0);
    for (const l of LISTINGS) if (matches(l, filters, { skip: ["typ"] })) m.set(l.type, (m.get(l.type) ?? 0) + 1);
    return m;
  }, [filters]);

  function toggle(t: PremisesType) {
    const has = filters.typ.includes(t);
    onChange({ typ: has ? filters.typ.filter((x) => x !== t) : [...filters.typ, t] });
  }

  return (
    <div>
      <div className={cn("grid gap-2", columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
        {ALL_TYPES.map((t) => {
          const Icon = TYPE_ICONS[t];
          const on = filters.typ.includes(t);
          const n = counts.get(t) ?? 0;
          return (
            <motion.button
              key={t}
              type="button"
              whileTap={{ scale: 0.96 }}
              aria-pressed={on}
              onClick={() => toggle(t)}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                on ? "border-primary bg-mint" : "border-border bg-card hover:border-foreground/20",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                  on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{t}</span>
                <span className="tabular block text-xs text-muted-foreground">{n} st</span>
              </span>
              {on && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <Check className="size-2.5" strokeWidth={3} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Histogram                                                          */
/* ------------------------------------------------------------------ */

function Histogram({ values, steps, lo, hi }: { values: number[]; steps: number[]; lo: number; hi: number }) {
  const buckets = useMemo(() => {
    const b = new Array(steps.length - 1).fill(0) as number[];
    for (const v of values) {
      let idx = steps.findIndex((s, i) => i < steps.length - 1 && v >= s && v < steps[i + 1]);
      if (idx === -1) idx = steps.length - 2;
      b[idx]++;
    }
    return b;
  }, [values, steps]);
  const max = Math.max(1, ...buckets);
  return (
    <div aria-hidden="true" className="flex h-16 items-end gap-[3px] px-[6px]">
      {buckets.map((n, i) => {
        const inRange = i >= lo && i < hi;
        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ height: `${Math.max(6, (n / max) * 100)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn("flex-1 rounded-t-[3px] transition-colors", inRange ? "bg-primary" : "bg-border")}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Range panel (shared by size & price)                               */
/* ------------------------------------------------------------------ */

function RangePanel({
  steps,
  min,
  max,
  values,
  onChange,
  format,
  unit,
  presets,
  label,
}: {
  steps: number[];
  min: number | null;
  max: number | null;
  values: number[];
  onChange: (min: number | null, max: number | null) => void;
  format: (v: number) => string;
  unit: string;
  presets: { label: string; min: number | null; max: number | null }[];
  label: string;
}) {
  const last = steps.length - 1;
  const lo = nearestIndex(steps, min, 0);
  const hi = nearestIndex(steps, max, last);
  const [minText, setMinText] = useState<string | null>(null);
  const [maxText, setMaxText] = useState<string | null>(null);

  function commit(which: "min" | "max", text: string) {
    const n = Number(text.replace(/\s/g, ""));
    const v = text.trim() === "" || !Number.isFinite(n) ? null : n;
    if (which === "min") onChange(v === 0 ? null : v, max);
    else onChange(min, v);
    if (which === "min") setMinText(null);
    else setMaxText(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <Histogram values={values} steps={steps} lo={lo} hi={hi} />
        <Slider
          aria-label={label}
          min={0}
          max={last}
          step={1}
          minStepsBetweenThumbs={1}
          value={[lo, hi]}
          onValueChange={([a, b]) => onChange(a === 0 ? null : steps[a], b === last ? null : steps[b])}
          className="[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:shadow-lift [&_[data-slot=slider-track]]:h-1.5"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{format(steps[0])}</span>
          <span>{format(steps[last])}+</span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <label className="rounded-2xl border bg-card px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <span className="block text-[11px] text-muted-foreground">Min ({unit})</span>
          <input
            inputMode="numeric"
            value={minText ?? (min != null ? formatNumber(min) : "")}
            placeholder="Ingen min"
            onChange={(e) => setMinText(e.target.value)}
            onBlur={(e) => commit("min", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit("min", e.currentTarget.value)}
            className="tabular w-full bg-transparent text-sm font-medium focus:outline-none"
          />
        </label>
        <span className="text-muted-foreground">–</span>
        <label className="rounded-2xl border bg-card px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <span className="block text-[11px] text-muted-foreground">Max ({unit})</span>
          <input
            inputMode="numeric"
            value={maxText ?? (max != null ? formatNumber(max) : "")}
            placeholder="Ingen max"
            onChange={(e) => setMaxText(e.target.value)}
            onBlur={(e) => commit("max", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit("max", e.currentTarget.value)}
            className="tabular w-full bg-transparent text-sm font-medium focus:outline-none"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const on = p.min === min && p.max === max;
          return (
            <motion.button
              key={p.label}
              type="button"
              whileTap={{ scale: 0.95 }}
              aria-pressed={on}
              onClick={() => (on ? onChange(null, null) : onChange(p.min, p.max))}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-foreground/30",
              )}
            >
              {p.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function SizePanel({ filters, onChange }: { filters: Filters; onChange: Update }) {
  const values = useMemo(
    () => LISTINGS.filter((l) => matches(l, filters, { skip: ["minYta", "maxYta"] })).map((l) => l.sizeSqm),
    [filters],
  );
  return (
    <RangePanel
      label="Yta i kvadratmeter"
      steps={SIZE_STEPS}
      min={filters.minYta}
      max={filters.maxYta}
      values={values}
      unit="m²"
      format={(v) => `${formatNumber(v)} m²`}
      onChange={(minYta, maxYta) => onChange({ minYta, maxYta })}
      presets={[
        { label: "< 100 m²", min: null, max: 100 },
        { label: "100–300", min: 100, max: 300 },
        { label: "300–1 000", min: 300, max: 1000 },
        { label: "1 000+", min: 1000, max: null },
      ]}
    />
  );
}

export function PricePanel({ filters, onChange }: { filters: Filters; onChange: Update }) {
  const steps = priceSteps(filters);
  const isSale = filters.deal === "kopa";
  const values = useMemo(
    () =>
      LISTINGS.filter((l) => matches(l, filters, { skip: ["minPris", "maxPris"] }))
        .map((l) =>
          isSale ? (l.price.kind === "sale" ? l.price.amount : undefined) : filters.enhet === "kvm" ? rentPerSqmYear(l) : monthlyRent(l),
        )
        .filter((v): v is number => v != null),
    [filters, isSale],
  );
  const presets = isSale
    ? [
        { label: "< 5 mkr", min: null, max: 5e6 },
        { label: "5–20 mkr", min: 5e6, max: 20e6 },
        { label: "20 mkr+", min: 20e6, max: null },
      ]
    : filters.enhet === "kvm"
      ? [
          { label: "< 1 000", min: null, max: 1000 },
          { label: "1 000–2 000", min: 1000, max: 2000 },
          { label: "2 000+", min: 2000, max: null },
        ]
      : [
          { label: "< 10 000", min: null, max: 10000 },
          { label: "10–25 tkr", min: 10000, max: 25000 },
          { label: "25–50 tkr", min: 25000, max: 50000 },
          { label: "50 tkr+", min: 50000, max: null },
        ];

  return (
    <div className="space-y-4">
      {!isSale && (
        <div role="radiogroup" aria-label="Prisenhet" className="grid grid-cols-2 rounded-full bg-muted p-1">
          {(["man", "kvm"] as const).map((u) => {
            const on = filters.enhet === u;
            return (
              <button
                key={u}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange({ enhet: u, minPris: null, maxPris: null })}
                className={cn("relative rounded-full py-1.5 text-sm font-medium", on ? "text-foreground" : "text-muted-foreground")}
              >
                {on && <motion.span layoutId="price-unit" className="absolute inset-0 rounded-full bg-card shadow-soft" />}
                <span className="relative">{u === "man" ? "kr/mån" : "kr/m²/år"}</span>
              </button>
            );
          })}
        </div>
      )}
      <RangePanel
        key={`${filters.deal}-${filters.enhet}`}
        label="Prisintervall"
        steps={steps}
        min={filters.minPris}
        max={filters.maxPris}
        values={values}
        unit={isSale ? "kr" : filters.enhet === "kvm" ? "kr/m²/år" : "kr/mån"}
        format={(v) => (isSale ? `${formatNumber(v / 1e6)} mkr` : formatNumber(v))}
        onChange={(minPris, maxPris) => onChange({ minPris, maxPris })}
        presets={presets}
      />
      <p className="text-xs text-muted-foreground">
        {isSale
          ? "Visar objekt till salu inom prisintervallet."
          : "Vi räknar om alla priser så att du kan jämföra – oavsett om annonsören angett kr/mån eller kr/m²/år."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Segment popovers for the unified search bar                        */
/* ------------------------------------------------------------------ */

export function typeSummary(f: Filters): string | null {
  if (!f.typ.length) return null;
  if (f.typ.length <= 2) return f.typ.join(", ");
  return `${f.typ[0]} +${f.typ.length - 1}`;
}

interface SegmentPopoverProps {
  segment: Exclude<SegmentKey, "var">;
  filters: Filters;
  onChange: Update;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compact?: boolean;
  className?: string;
}

export function SegmentPopover({ segment, filters, onChange, open, onOpenChange, compact = false, className }: SegmentPopoverProps) {
  const meta = {
    typ: { label: "Typ", placeholder: "Alla typer", value: typeSummary(filters), width: "w-[min(440px,calc(100vw-2rem))]", title: "Typ av lokal" },
    yta: { label: "Yta", placeholder: "Valfri storlek", value: sizeLabel(filters.minYta, filters.maxYta), width: "w-[min(420px,calc(100vw-2rem))]", title: "Yta" },
    pris: {
      label: filters.deal === "kopa" ? "Pris" : "Hyra",
      placeholder: "Valfritt pris",
      value: priceLabel(filters),
      width: "w-[min(420px,calc(100vw-2rem))]",
      title: filters.deal === "kopa" ? "Pris" : "Hyra",
    },
  }[segment];

  const clear = () => {
    if (segment === "typ") onChange({ typ: [] });
    if (segment === "yta") onChange({ minYta: null, maxYta: null });
    if (segment === "pris") onChange({ minPris: null, maxPris: null });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
          className={segmentClass(open, compact, cn("flex-1", className))}
        >
          <span className={cn(segmentLabel, compact && "sr-only")}>{meta.label}</span>
          <span className={cn(segmentValue, meta.value ? "font-medium text-foreground" : "text-muted-foreground")}>
            {meta.value ?? (compact ? `${meta.label}: ${meta.placeholder.toLowerCase()}` : meta.placeholder)}
          </span>
        </button>
      </PopoverAnchor>
      <PopoverContent
        align={segment === "pris" ? "end" : "center"}
        sideOffset={12}
        onInteractOutside={(e) => {
          const t = e.target as HTMLElement | null;
          if (t?.closest?.("[data-search-bar]")) e.preventDefault();
        }}
        className={cn(meta.width, "rounded-3xl p-5 shadow-float")}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base font-semibold">{meta.title}</p>
          {meta.value && (
            <button type="button" onClick={clear} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Rensa
            </button>
          )}
        </div>
        {segment === "typ" && <TypePanel filters={filters} onChange={onChange} />}
        {segment === "yta" && <SizePanel filters={filters} onChange={onChange} />}
        {segment === "pris" && <PricePanel filters={filters} onChange={onChange} />}
      </PopoverContent>
    </Popover>
  );
}

