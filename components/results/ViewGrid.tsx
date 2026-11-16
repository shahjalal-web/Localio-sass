"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import type { Listing } from "@/types/listing";
import { unsplash } from "@/lib/data/images";
import { notInDemo } from "@/lib/demo";
import { cn } from "@/lib/utils";
import { ListingCard } from "./ListingCard";
import { CardSkeleton } from "./ResultsSkeleton";

const BATCH = 12;

function SponsoredCard() {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-forest text-white">
      <div className="relative aspect-[4/3]">
        <Image
          src={unsplash("1486406146926-c627a92ad1ab", 800)}
          alt="Kontorshus från Nordstaden Förvaltning"
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/30 to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur">Annons</span>
      </div>
      <div className="flex flex-1 flex-col p-5 pt-2">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-lime text-xs font-bold text-ink">NF</span>
          <span className="text-sm font-semibold">Nordstaden Förvaltning</span>
        </div>
        <p className="mt-3 text-lg leading-snug font-semibold">12 nya kontor i centrala lägen – flytta in redan i vår.</p>
        <p className="mt-1.5 text-sm text-white/65">Flexibla avtal från 6 månader. Fri parkering första året.</p>
        <button
          type="button"
          onClick={() => notInDemo("Annonsörssidan")}
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-sm font-semibold text-lime"
        >
          Se alla lediga lokaler <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </article>
  );
}

export function ViewGrid({
  listings,
  onOpen,
  loading,
  skeleton,
  empty,
  areas,
  activeArea,
  onAreaChange,
}: {
  listings: Listing[];
  onOpen: (l: Listing) => void;
  loading: boolean;
  skeleton: React.ReactNode;
  empty: React.ReactNode;
  areas: { name: string; count: number }[];
  activeArea: string | null;
  onAreaChange: (a: string | null) => void;
}) {
  const [visible, setVisible] = useState(BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = visible < listings.length;

  function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisible((v) => v + BATCH);
      setLoadingMore(false);
    }, 450);
  }

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  });

  const items: (Listing | "ad")[] = listings.slice(0, visible);
  if (items.length >= 4) items.splice(4, 0, "ad");

  return (
    <div>
      {areas.length > 0 && (
        <div className="no-scrollbar -mx-1 mb-6 flex items-center gap-2 overflow-x-auto px-1 py-1">
          <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Snabbval</span>
          {areas.map((a) => {
            const on = activeArea === a.name;
            return (
              <motion.button
                key={a.name}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onAreaChange(on ? null : a.name)}
                aria-pressed={on}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-foreground/30",
                )}
              >
                {a.name}
                <span className={cn("tabular text-xs", on ? "text-primary-foreground/70" : "text-muted-foreground")}>{a.count}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {loading ? (
        skeleton
      ) : listings.length === 0 ? (
        empty
      ) : (
        <>
          <motion.ul layout className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item, i) => (
                <motion.li
                  layout
                  key={item === "ad" ? "ad" : item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: (i % BATCH) * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.96 }}
                >
                  {item === "ad" ? (
                    <SponsoredCard />
                  ) : (
                    <ListingCard
                      listing={item}
                      variant="gallery"
                      onOpen={onOpen}
                      preload={i < 3}
                      sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                      className="h-full"
                    />
                  )}
                </motion.li>
              ))}
              {loadingMore &&
                Array.from({ length: Math.min(BATCH, listings.length - visible) }, (_, i) => (
                  <motion.li key={`sk-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CardSkeleton />
                  </motion.li>
                ))}
            </AnimatePresence>
          </motion.ul>
          <div ref={sentinel} className="h-px" />
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="tabular text-sm text-muted-foreground">
              Visar 1–{Math.min(visible, listings.length)} av {listings.length}
            </p>
            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                className="inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-semibold ring-1 ring-border hover:ring-foreground/30"
              >
                {loadingMore && <Loader2 className="size-4 animate-spin" />}
                Visa fler
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
