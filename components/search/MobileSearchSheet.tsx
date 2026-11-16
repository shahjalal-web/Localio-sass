"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, MapPin, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { RollingNumber } from "@/components/motion/AnimatedNumber";
import { DEFAULT_FILTERS, priceLabel, sizeLabel, type Filters } from "@/lib/filters";
import { cn } from "@/lib/utils";
import { CategoryTabs, DealToggle } from "./CategoryTabs";
import { PricePanel, SizePanel, TypePanel, typeSummary } from "./FilterPopovers";
import { Highlight, locationLabel, useLocationOptions, type LocationValue } from "./LocationCombobox";
import { recentSearchesStore } from "@/lib/stores";

type Step = "var" | "typ" | "yta" | "pris";
const STEPS: Step[] = ["var", "typ", "yta", "pris"];

export function MobileSearchSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  count,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  count: number;
  onSubmit: () => void;
}) {
  const [step, setStep] = useState<Step>("var");
  const [query, setQuery] = useState("");
  const options = useLocationOptions(query);
  const stepIndex = STEPS.indexOf(step);

  const summaries: Record<Step, { title: string; value: string | null; placeholder: string }> = {
    var: { title: "Var?", value: locationLabel(filters) || null, placeholder: "Hela Sverige" },
    typ: { title: "Typ av lokal", value: typeSummary(filters), placeholder: "Alla typer" },
    yta: { title: "Yta", value: sizeLabel(filters.minYta, filters.maxYta), placeholder: "Valfri" },
    pris: { title: filters.deal === "kopa" ? "Pris" : "Hyra", value: priceLabel(filters), placeholder: "Valfritt" },
  };

  function next() {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
    else onSubmit();
  }

  function pickLocation(v: LocationValue | "near-me") {
    if (v === "near-me") return;
    const value = v;
    onChange(value);
    recentSearchesStore.push(JSON.stringify({ ...value, label: locationLabel(value) }));
    setQuery("");
    setStep("typ");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[100dvh] max-h-[100dvh] gap-0 rounded-none border-0 bg-background p-0"
      >
        <SheetTitle className="sr-only">Sök lokaler</SheetTitle>
        <SheetDescription className="sr-only">Steg för steg-sökning</SheetDescription>

        <div className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={() => (stepIndex > 0 ? setStep(STEPS[stepIndex - 1]) : onOpenChange(false))}
            aria-label={stepIndex > 0 ? "Föregående steg" : "Stäng"}
            className={cn("grid size-10 place-items-center rounded-full ring-1 ring-border", stepIndex === 0 && "invisible")}
          >
            {stepIndex > 0 ? <ArrowLeft className="size-4" /> : <X className="size-4" />}
          </button>
          <div className="flex gap-1.5" aria-label={`Steg ${stepIndex + 1} av ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <motion.span
                key={s}
                animate={{ width: i === stepIndex ? 24 : 8, opacity: i <= stepIndex ? 1 : 0.35 }}
                className="h-2 rounded-full bg-primary"
              />
            ))}
          </div>
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Stäng" className="grid size-10 place-items-center rounded-full ring-1 ring-border">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-4 pt-4">
          <CategoryTabs id="m-cat" value={filters.kategori} onChange={(kategori) => onChange({ kategori })} />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pt-4 pb-32">
          {STEPS.map((s) => {
            const active = s === step;
            const sum = summaries[s];
            return (
              <motion.section
                key={s}
                layout
                className={cn("overflow-hidden rounded-3xl bg-card", active ? "p-5 shadow-lift" : "px-5 py-4 ring-1 ring-border")}
              >
                {!active ? (
                  <button type="button" onClick={() => setStep(s)} className="flex w-full items-center justify-between text-sm">
                    <span className="text-muted-foreground">{sum.title}</span>
                    <span className="font-semibold">{sum.value ?? sum.placeholder}</span>
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-2xl font-semibold tracking-tight">{sum.title}</h3>
                      {s === "pris" && (
                        <DealToggle id="m-deal" value={filters.deal} onChange={(deal) => onChange({ deal, minPris: null, maxPris: null })} />
                      )}
                    </div>
                    {s === "var" && (
                      <div>
                        <label className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3.5 focus-within:border-primary">
                          <Search className="size-4 text-muted-foreground" />
                          <span className="sr-only">Sök ort, område eller adress</span>
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={locationLabel(filters) || "Ort, område eller adress"}
                            className="w-full bg-transparent text-base focus:outline-none"
                          />
                        </label>
                        <ul className="mt-3 space-y-1">
                          {options.filter((o) => o.value !== "near-me").slice(0, 7).map((o) => (
                            <li key={o.id}>
                              <button
                                type="button"
                                onClick={() => pickLocation(o.value)}
                                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left active:bg-mint"
                              >
                                <span className="grid size-10 place-items-center rounded-xl bg-muted">
                                  <MapPin className="size-4" />
                                </span>
                                <span className="flex-1">
                                  <span className="block text-sm font-medium">
                                    <Highlight text={o.label} query={query} />
                                  </span>
                                  {o.sub && <span className="block text-xs text-muted-foreground">{o.sub}</span>}
                                </span>
                                {o.count != null && <span className="text-xs text-muted-foreground">{o.count} st</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {s === "typ" && <TypePanel filters={filters} onChange={onChange} />}
                    {s === "yta" && <SizePanel filters={filters} onChange={onChange} />}
                    {s === "pris" && <PricePanel filters={filters} onChange={onChange} />}
                    {s !== "var" && (
                      <button
                        type="button"
                        onClick={next}
                        className="mt-5 w-full rounded-full py-3 text-sm font-semibold ring-1 ring-border active:scale-[0.98]"
                      >
                        {s === "pris" ? "Klar" : "Nästa"}
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.section>
            );
          })}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t bg-background/90 px-4 py-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTERS, kategori: filters.kategori, deal: filters.deal })}
            className="text-sm font-semibold underline underline-offset-4"
          >
            Rensa allt
          </button>
          <AnimatePresence mode="wait">
            <motion.button
              type="button"
              onClick={onSubmit}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift"
            >
              <Search className="size-4" />
              Visa <RollingNumber value={count} /> objekt
            </motion.button>
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
