"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RollingNumber } from "@/components/motion/AnimatedNumber";
import { LISTINGS } from "@/lib/data/listings";
import { countListings, priceLabel, sizeLabel, toQuery, type Filters } from "@/lib/filters";
import { parseAiQuery, type AiChip } from "@/lib/parseAiQuery";
import { cn } from "@/lib/utils";
import { CategoryTabs, DealToggle } from "./CategoryTabs";
import { SegmentPopover, typeSummary } from "./FilterPopovers";
import { LocationCombobox, locationLabel } from "./LocationCombobox";
import { AiSearchInput } from "./AiSearchInput";
import { MobileSearchSheet } from "./MobileSearchSheet";
import type { SegmentKey } from "./segment";

interface Props {
  initial: Filters;
  mode?: "full" | "compact";
  /** Compact mode: apply filters in place instead of navigating. */
  onApply?: (f: Filters) => void;
  children?: React.ReactNode;
}

function Divider({ hidden }: { hidden: boolean }) {
  return <span aria-hidden="true" className={cn("h-8 w-px shrink-0 bg-border transition-opacity", hidden && "opacity-0")} />;
}

export function SmartSearch({ initial, mode = "full", onApply, children }: Props) {
  const router = useRouter();
  const compact = mode === "compact";
  const [draft, setDraft] = useState<Filters>(initial);
  const [active, setActive] = useState<SegmentKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiChips, setAiChips] = useState<AiChip[] | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSweep, setAiSweep] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const varRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  const count = useMemo(() => countListings(LISTINGS, draft), [draft]);
  const hasValues = Boolean(draft.ort || draft.q || draft.typ.length || draft.minYta || draft.maxYta || draft.minPris || draft.maxPris);
  const expanded = active != null || hasValues;

  const update = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));

  function submit(f: Filters = draft) {
    setActive(null);
    setMobileOpen(false);
    if (onApply) onApply(f);
    else router.push(`/lokaler?${toQuery(f)}`);
  }

  // Press "/" to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable=true]")) return;
      e.preventDefault();
      if (window.matchMedia("(min-width: 768px)").matches) {
        varRef.current?.focus();
        setActive("var");
      } else {
        setMobileOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    const pending = timers.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function runAi(text: string) {
    setAiBusy(true);
    setAiChips(null);
    timers.current.push(
      window.setTimeout(() => {
        const res = parseAiQuery(text, { ...draft, typ: [], egenskaper: [] });
        setAiBusy(false);
        if (res.empty) {
          toast("Jag förstod inte riktigt", {
            description: "Prova t.ex. ”Kontor för 8 personer i Göteborg, max 30 000 kr/mån”.",
          });
          return;
        }
        setAiChips(res.chips);
        setDraft(res.filters);
        setAiSweep((n) => n + 1);
        const n = countListings(LISTINGS, res.filters);
        toast.success(`AI hittade ${n} ${n === 1 ? "matchande lokal" : "matchande lokaler"}`, {
          description: res.chips.map((c) => c.label).join(" · "),
        });
        timers.current.push(window.setTimeout(() => submit(res.filters), 1500));
      }, 700),
    );
  }

  const segOpen = (k: SegmentKey) => (o: boolean) => setActive((cur) => (o ? k : cur === k ? null : cur));

  const bar = (
    <div
      data-search-bar
      className={cn(
        "relative flex items-center rounded-full transition-colors duration-300",
        compact ? "gap-0.5 border bg-card p-1 shadow-soft" : "p-1.5",
        !compact && (active ? "bg-mint" : "bg-muted/70 dark:bg-muted"),
      )}
    >
      {/* AI sweep highlight */}
      <AnimatePresence>
        {aiSweep > 0 && (
          <motion.span
            key={aiSweep}
            aria-hidden="true"
            initial={{ opacity: 1, backgroundPosition: "-100% 0" }}
            animate={{ opacity: 0, backgroundPosition: "200% 0" }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-20 rounded-full"
            style={{
              backgroundImage: "linear-gradient(100deg, transparent 20%, rgb(123 211 137 / 0.55) 50%, transparent 80%)",
              backgroundSize: "200% 100%",
            }}
          />
        )}
      </AnimatePresence>

      <LocationCombobox
        ref={varRef}
        compact={compact}
        value={{ ort: draft.ort, omrade: draft.omrade, q: draft.q }}
        onChange={(v) => update(v)}
        open={active === "var"}
        onOpenChange={segOpen("var")}
        onDone={() => setActive("typ")}
      />
      <Divider hidden={active === "var" || active === "typ"} />
      <SegmentPopover segment="typ" compact={compact} filters={draft} onChange={update} open={active === "typ"} onOpenChange={segOpen("typ")} />
      <Divider hidden={active === "typ" || active === "yta"} />
      <SegmentPopover segment="yta" compact={compact} filters={draft} onChange={update} open={active === "yta"} onOpenChange={segOpen("yta")} />
      <Divider hidden={active === "yta" || active === "pris"} />
      <SegmentPopover
        segment="pris"
        compact={compact}
        filters={draft}
        onChange={update}
        open={active === "pris"}
        onOpenChange={segOpen("pris")}
        className={compact ? "" : "pr-2"}
      />

      <motion.button
        layout
        type="button"
        onClick={() => submit()}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        aria-label={`Sök – ${count} träffar`}
        className={cn(
          "relative z-10 ml-1 flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary font-semibold text-primary-foreground shadow-lift hover:bg-primary-hover",
          compact ? "h-11 px-4 text-sm" : "h-14 text-[15px]",
          !compact && (expanded ? "px-6" : "w-14"),
        )}
      >
        <motion.span layout="position">
          <Search className={compact ? "size-4" : "size-5"} strokeWidth={2.4} />
        </motion.span>
        <AnimatePresence initial={false}>
          {(expanded || compact) && (
            <motion.span
              layout="position"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              Sök <span className="text-primary-foreground/50">·</span> <RollingNumber value={count} /> träffar
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );

  const mobileSummary = [locationLabel(draft), typeSummary(draft), sizeLabel(draft.minYta, draft.maxYta), priceLabel(draft)]
    .filter(Boolean)
    .join(" · ");

  const mobileTrigger = (
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      className={cn(
        "flex w-full items-center gap-3 rounded-full bg-card text-left shadow-lift ring-1 ring-border active:scale-[0.99] md:hidden",
        compact ? "p-1.5 pl-4" : "p-2 pl-5",
      )}
    >
      <Search className="size-5 shrink-0 text-primary" strokeWidth={2.4} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">{mobileSummary ? locationLabel(draft) || "Alla orter" : "Var vill du söka?"}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {mobileSummary ? [typeSummary(draft), sizeLabel(draft.minYta, draft.maxYta), priceLabel(draft)].filter(Boolean).join(" · ") || "Alla typer" : "Ort · Typ · Yta · Hyra"}
        </span>
      </span>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <SlidersHorizontal className="size-4" />
      </span>
    </button>
  );

  const mobileSheet = (
    <MobileSearchSheet
      open={mobileOpen}
      onOpenChange={setMobileOpen}
      filters={draft}
      onChange={update}
      count={count}
      onSubmit={() => submit()}
    />
  );

  if (compact) {
    return (
      <div className="flex w-full items-center gap-2">
        <div className="hidden min-w-0 flex-1 md:block">{bar}</div>
        <div className="min-w-0 flex-1 md:hidden">{mobileTrigger}</div>
        <Popover open={aiOpen} onOpenChange={setAiOpen}>
          <PopoverTrigger
            aria-label="Sök med AI"
            className="group relative grid size-12 shrink-0 place-items-center rounded-full bg-forest text-lime shadow-soft transition-transform hover:scale-105 active:scale-95 md:h-[58px] md:w-auto md:grid-flow-col md:gap-2 md:px-5"
          >
            <Sparkles className="size-[18px]" />
            <span className="hidden text-sm font-semibold text-white md:inline">Sök med AI</span>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={10} className="w-[min(560px,calc(100vw-2rem))] rounded-3xl p-4 shadow-float">
            <p className="mb-1 text-sm font-semibold">Beskriv vad du behöver</p>
            <p className="mb-3 text-xs text-muted-foreground">Vi tolkar texten och fyller i filtren åt dig.</p>
            <AiSearchInput compact autoFocus onSubmit={runAi} chips={aiChips} busy={aiBusy} />
          </PopoverContent>
        </Popover>
        {mobileSheet}
      </div>
    );
  }

  return (
    <div className="relative rounded-[28px] bg-card p-3 shadow-float ring-1 ring-black/[0.03] sm:p-4 dark:ring-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3 sm:pb-4">
        <CategoryTabs id="home-cat" value={draft.kategori} onChange={(kategori) => update({ kategori })} className="-mx-1 px-1" />
        <DealToggle id="home-deal" value={draft.deal} onChange={(deal) => update({ deal, minPris: null, maxPris: null })} className="hidden sm:flex" />
      </div>

      <div className="hidden md:block">{bar}</div>
      <div className="md:hidden">{mobileTrigger}</div>

      <AiSearchInput className="mt-3" onSubmit={runAi} chips={aiChips} busy={aiBusy} />
      {children}
      {mobileSheet}
    </div>
  );
}
