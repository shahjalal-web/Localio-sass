"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Heart, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import type { Listing } from "@/types/listing";
import { SmartSearch } from "@/components/search/SmartSearch";
import { ActiveFilterChips } from "@/components/search/ActiveFilterChips";
import { RollingNumber } from "@/components/motion/AnimatedNumber";
import { LISTINGS, LISTINGS_BY_ID } from "@/lib/data/listings";
import { CITY_BY_SLUG } from "@/lib/data/cities";
import { activeChips, filterKey, filterListings, matches, parseFilters, toQuery, type Filters, type ViewKey } from "@/lib/filters";
import { recentlyViewedStore, useFavorites } from "@/lib/stores";
import { FilterBar, SaveSearchButton, SortSelect } from "./ResultsToolbar";
import { LayoutSwitcher, VIEWS } from "./LayoutSwitcher";
import { ViewSplitMap } from "./ViewSplitMap";
import { ViewGrid } from "./ViewGrid";
import { ViewCompare } from "./ViewCompare";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { EmptyState } from "./EmptyState";
import { QuickViewSheet } from "./QuickViewSheet";
import { CompareTray } from "./CompareTray";
import { RecentlyViewed } from "./RecentlyViewed";
import type { Bounds } from "./ListingMap";
import Link from "next/link";

const VIEW_KEYS: ViewKey[] = ["karta", "galleri", "jamfor"];

export function ResultsPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const filters = useMemo(() => parseFilters(sp), [sp]);
  const vyParam = sp.get("vy") as ViewKey | null;
  const view: ViewKey = vyParam && VIEW_KEYS.includes(vyParam) ? vyParam : "karta";
  const objektId = sp.get("objekt");
  const sparade = sp.get("sparade") === "1";
  const fKey = `${filterKey(filters)}${sparade ? "|sparade" : ""}`;

  const { ids: favorites } = useFavorites();
  const [compare, setCompare] = useState<string[]>([]);
  const [searchOnMove, setSearchOnMove] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);

  // Simulated loading (skeleton) whenever the result set changes.
  const [shownKey, setShownKey] = useState(fKey);
  const loading = shownKey !== fKey;
  useEffect(() => {
    if (shownKey === fKey) return;
    const t = window.setTimeout(() => setShownKey(fKey), 400);
    return () => window.clearTimeout(t);
  }, [fKey, shownKey]);

  // Track recently viewed when a listing is opened (also via shared links).
  useEffect(() => {
    if (objektId && LISTINGS_BY_ID.has(objektId)) recentlyViewedStore.push(objektId);
  }, [objektId]);

  const url = useCallback(
    (f: Filters, extra: { vy?: ViewKey; objekt?: string | null } = {}) => {
      const vy = extra.vy ?? view;
      return `/lokaler?${toQuery(f, {
        vy: vy !== "karta" ? vy : null,
        sparade: sparade ? "1" : null,
        objekt: extra.objekt === undefined ? objektId : extra.objekt,
      })}`;
    },
    [view, sparade, objektId],
  );

  const setFilters = (f: Filters) => router.replace(url(f, { objekt: null }), { scroll: false });
  const setView = (v: ViewKey) => router.replace(url(filters, { vy: v }), { scroll: false });
  const openListing = (l: Listing) => router.push(url(filters, { objekt: l.id }), { scroll: false });
  const closeListing = () => router.replace(url(filters, { objekt: null }), { scroll: false });

  const base = useMemo(() => {
    const all = filterListings(LISTINGS, filters);
    return sparade ? all.filter((l) => favorites.includes(l.id)) : all;
  }, [filters, sparade, favorites]);

  const listings = useMemo(
    () => (view === "karta" && searchOnMove && bounds ? base.filter((l) => matches(l, filters, { bounds })) : base),
    [base, view, searchOnMove, bounds, filters],
  );

  const areas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of LISTINGS) {
      if (!l.area || !matches(l, filters, { skip: ["omrade"] })) continue;
      counts.set(l.area, (counts.get(l.area) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [filters]);

  function toggleCompare(id: string) {
    setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= 4) {
        toast("Du kan jämföra max 4 objekt", { description: "Ta bort ett objekt i jämförelsen först." });
        return c;
      }
      return [...c, id];
    });
  }

  function saveSearch() {
    const chips = activeChips(filters).map((c) => c.label);
    toast.success("Bevakning sparad – vi meddelar dig när nya lokaler matchar", {
      description: chips.length ? chips.join(" · ") : "Alla lediga objekt i Sverige",
    });
  }

  const city = filters.ort ? CITY_BY_SLUG.get(filters.ort) : undefined;
  const where = filters.omrade ? `${filters.omrade}, ${city?.name ?? ""}` : city?.name;
  const concept = VIEWS.find((v) => v.key === view) ?? VIEWS[0];
  const selected = objektId ? (LISTINGS_BY_ID.get(objektId) ?? null) : null;
  const compareItems = compare.map((id) => LISTINGS_BY_ID.get(id)).filter((l): l is Listing => l != null);

  const skeleton = <ResultsSkeleton view={view} count={view === "jamfor" ? 8 : 6} />;
  const empty =
    sparade && favorites.length === 0 ? (
      <div className="mx-auto max-w-md rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint">
          <Heart className="size-6 text-primary" />
        </span>
        <h2 className="mt-4 text-xl font-semibold">Inga sparade objekt ännu</h2>
        <p className="mt-2 text-sm text-muted-foreground">Tryck på hjärtat på en lokal för att spara den här.</p>
        <Link href="/lokaler" className="mt-6 inline-block rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Visa alla lokaler
        </Link>
      </div>
    ) : (
      <EmptyState filters={filters} onChange={setFilters} onSaveSearch={saveSearch} />
    );

  return (
    <div className="pt-16 lg:pt-[72px]" style={{ ["--results-sticky" as string]: "136px" }}>
      <h1 className="sr-only">Lediga lokaler</h1>
      <div className="mx-auto max-w-[1600px] px-4 pt-5 sm:px-6 lg:px-10">
        <SmartSearch key={fKey} mode="compact" initial={filters} onApply={setFilters} />
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 mt-4 border-y bg-background/85 backdrop-blur-xl lg:top-[72px]">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-10">
          <FilterBar filters={filters} onApply={setFilters}>
            <LayoutSwitcher value={view} onChange={setView} />
          </FilterBar>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-10">
        {/* Heading + toolbar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl" aria-live="polite">
              {sparade ? (
                <>
                  Dina sparade objekt <span className="text-muted-foreground">({listings.length})</span>
                </>
              ) : (
                <>
                  <RollingNumber value={listings.length} /> lediga objekt{" "}
                  <span className="text-muted-foreground">{where ? `i ${where}` : "i hela Sverige"}</span>
                </>
              )}
            </p>
            <ActiveFilterChips filters={filters} onChange={setFilters} className="mt-3" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SortSelect value={filters.sort} onChange={(sort) => setFilters({ ...filters, sort })} />
            <SaveSearchButton onClick={saveSearch} compact />
          </div>
        </div>

        {/* Design concept explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={concept.key}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="mt-5 mb-6 flex items-start gap-2.5 rounded-2xl border border-dashed border-primary/30 bg-mint/50 px-4 py-2.5 text-sm"
          >
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              <span className="font-semibold">
                Designkoncept {concept.letter} · {concept.label}:
              </span>{" "}
              <span className="text-muted-foreground">{concept.idea}</span>
            </p>
            <span className="ml-auto hidden shrink-0 gap-1 sm:flex">
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setView(v.key)}
                  aria-label={`Visa koncept ${v.letter}`}
                  className={`grid size-6 place-items-center rounded-full text-[11px] font-bold transition-colors ${v.key === view ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground"}`}
                >
                  {v.letter}
                </button>
              ))}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Views */}
        <LayoutGroup>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {view === "karta" && (
                <ViewSplitMap
                  listings={listings}
                  mapListings={base}
                  onOpen={openListing}
                  fitKey={fKey}
                  searchOnMove={searchOnMove}
                  onSearchOnMoveChange={(v) => {
                    setSearchOnMove(v);
                    if (!v) setBounds(null);
                  }}
                  onBoundsChange={setBounds}
                  loading={loading}
                  skeleton={skeleton}
                  empty={empty}
                />
              )}
              {view === "galleri" && (
                <ViewGrid
                  key={fKey}
                  listings={listings}
                  onOpen={openListing}
                  loading={loading}
                  skeleton={skeleton}
                  empty={empty}
                  areas={areas}
                  activeArea={filters.omrade}
                  onAreaChange={(a) => {
                    const areaCity = a ? LISTINGS.find((l) => l.area === a)?.city : null;
                    const slug = areaCity ? [...CITY_BY_SLUG.values()].find((c) => c.name === areaCity)?.slug : filters.ort;
                    setFilters({ ...filters, omrade: a, ort: a ? (slug ?? filters.ort) : filters.ort });
                  }}
                />
              )}
              {view === "jamfor" && (
                <ViewCompare
                  key={fKey}
                  listings={listings}
                  onOpen={openListing}
                  sort={filters.sort}
                  onSortChange={(sort) => setFilters({ ...filters, sort })}
                  compare={compare}
                  onToggleCompare={toggleCompare}
                  loading={loading}
                  skeleton={skeleton}
                  empty={empty}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </LayoutGroup>

        <RecentlyViewed onOpen={openListing} />
      </div>

      <QuickViewSheet
        listing={selected}
        onClose={closeListing}
        inCompare={selected ? compare.includes(selected.id) : false}
        onToggleCompare={toggleCompare}
      />
      <CompareTray items={compareItems} onRemove={toggleCompare} onClear={() => setCompare([])} onOpen={openListing} />
    </div>
  );
}
