"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, Map as MapIcon, Maximize2, Minimize2, Loader2 } from "lucide-react";
import type { Listing } from "@/types/listing";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { ListingCard } from "./ListingCard";
import { Pagination, PAGE_SIZE } from "./Pagination";
import type { Bounds } from "./ListingMap";

const ListingMap = dynamic(() => import("./ListingMap"), {
  ssr: false,
  loading: () => (
    <div className="relative size-full">
      <Skeleton className="size-full rounded-none" />
      <Loader2 className="absolute top-1/2 left-1/2 size-6 -translate-1/2 animate-spin text-muted-foreground" />
    </div>
  ),
});

export function ViewSplitMap({
  listings,
  mapListings,
  onOpen,
  fitKey,
  searchOnMove,
  onSearchOnMoveChange,
  onBoundsChange,
  loading,
  skeleton,
  empty,
}: {
  listings: Listing[];
  /** Listings shown on the map (not bounds-filtered, so pins don't vanish while panning). */
  mapListings: Listing[];
  onOpen: (l: Listing) => void;
  fitKey: string;
  searchOnMove: boolean;
  onSearchOnMoveChange: (v: boolean) => void;
  onBoundsChange: (b: Bounds) => void;
  loading: boolean;
  skeleton: React.ReactNode;
  empty: React.ReactNode;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [mobileMap, setMobileMap] = useState(false);
  // Reset to page 1 whenever the filter set changes (without remounting the map).
  const [pageState, setPageState] = useState({ key: fitKey, page: 1 });
  const page = pageState.key === fitKey ? pageState.page : 1;
  const setPage = (p: number) => setPageState({ key: fitKey, page: p });
  const { ids: favorites } = useFavorites();
  const pageItems = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]">
      {/* List */}
      <div className={cn("min-w-0", mobileMap && "hidden lg:block")}>
        {loading ? (
          skeleton
        ) : listings.length === 0 ? (
          empty
        ) : (
          <>
            <motion.ul layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {pageItems.map((l, i) => (
                  <motion.li
                    layout
                    key={l.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.04 } }}
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <ListingCard
                      listing={l}
                      onOpen={onOpen}
                      highlighted={hovered === l.id}
                      onHoverChange={setHovered}
                      preload={i < 2}
                      sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw"
                      className="h-full"
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            <Pagination
              page={page}
              total={listings.length}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </div>

      {/* Map */}
      <div
        className={cn(
          "lg:block",
          mobileMap ? "block" : "hidden",
          fullscreen
            ? "fixed inset-0 z-50 bg-background p-3"
            : "sticky top-[calc(var(--results-sticky,136px)+16px)] h-[calc(100dvh-var(--results-sticky,136px)-32px)] max-lg:h-[calc(100dvh-180px)]",
        )}
      >
        <div className="relative size-full overflow-hidden rounded-3xl ring-1 ring-border">
          <ListingMap
            listings={mapListings}
            hoveredId={hovered}
            onHover={setHovered}
            onOpen={onOpen}
            favorites={favorites}
            fitKey={fitKey}
            searchOnMove={searchOnMove}
            onBoundsChange={onBoundsChange}
            sizeKey={`${fullscreen}-${mobileMap}`}
          />
          <label className="absolute top-3 left-3 z-[500] flex cursor-pointer items-center gap-2 rounded-full bg-card py-2 pr-4 pl-2.5 text-sm font-medium shadow-lift ring-1 ring-border select-none">
            <input
              type="checkbox"
              checked={searchOnMove}
              onChange={(e) => onSearchOnMoveChange(e.target.checked)}
              className="size-4 accent-[#163A2E]"
            />
            Sök när jag flyttar kartan
          </label>
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? "Stäng helskärm" : "Visa kartan i helskärm"}
            className="absolute top-3 right-3 z-[500] hidden size-10 place-items-center rounded-full bg-card shadow-lift ring-1 ring-border hover:bg-muted lg:grid"
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          {searchOnMove && (
            <span className="tabular absolute top-16 left-3 z-[500] rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white shadow-lift">
              {listings.length} objekt i kartområdet
            </span>
          )}
        </div>
      </div>

      {/* Mobile map/list toggle */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileMap((m) => !m)}
        className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-float lg:hidden dark:bg-primary dark:text-primary-foreground"
      >
        {mobileMap ? <List className="size-4" /> : <MapIcon className="size-4" />}
        {mobileMap ? "Lista" : "Karta"}
      </motion.button>
    </div>
  );
}
