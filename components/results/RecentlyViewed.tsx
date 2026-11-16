"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { History } from "lucide-react";
import type { Listing } from "@/types/listing";
import { LISTINGS_BY_ID } from "@/lib/data/listings";
import { formatPrice, formatSqm } from "@/lib/format";
import { recentlyViewedStore, useListStore } from "@/lib/stores";

export function RecentlyViewed({ onOpen }: { onOpen: (l: Listing) => void }) {
  const ids = useListStore(recentlyViewedStore);
  const items = ids.map((id) => LISTINGS_BY_ID.get(id)).filter((l): l is Listing => l != null);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="recent-heading" className="mt-20 border-t pt-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 id="recent-heading" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <History className="size-5 text-primary" /> Nyligen visade
        </h2>
        <button type="button" onClick={() => recentlyViewedStore.clear()} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Rensa historik
        </button>
      </div>
      <ul className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {items.map((l, i) => (
          <motion.li key={l.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }} className="shrink-0">
            <button
              type="button"
              onClick={() => onOpen(l)}
              className="flex w-[260px] items-center gap-3 rounded-2xl bg-card p-2 pr-3 text-left ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <Image src={l.images[0]} alt="" width={72} height={56} className="h-14 w-[72px] shrink-0 rounded-xl object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{l.address}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {l.type} · {l.city}
                </span>
                <span className="tabular block truncate text-xs font-medium">
                  {formatSqm(l.sizeSqm)} · {formatPrice(l).main}
                </span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
