"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Info } from "lucide-react";
import type { Listing } from "@/types/listing";
import type { SortKey } from "@/lib/filters";
import { cn } from "@/lib/utils";
import { ListingRow, ListingRowMobile } from "./ListingRow";
import { Pagination, PAGE_SIZE } from "./Pagination";

type Col = { label: string; asc?: SortKey; desc?: SortKey; align?: "right" };

const COLS: Col[] = [
  { label: "Objekt" },
  { label: "Typ" },
  { label: "Yta", asc: "yta-asc", desc: "yta-desc", align: "right" },
  { label: "Pris", asc: "pris-asc", desc: "pris-desc", align: "right" },
  { label: "kr/m²/år", asc: "kvm-asc", align: "right" },
  { label: "Tillträde" },
];

export function ViewCompare({
  listings,
  onOpen,
  sort,
  onSortChange,
  compare,
  onToggleCompare,
  loading,
  skeleton,
  empty,
}: {
  listings: Listing[];
  onOpen: (l: Listing) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  compare: string[];
  onToggleCompare: (id: string) => void;
  loading: boolean;
  skeleton: React.ReactNode;
  empty: React.ReactNode;
}) {
  const [page, setPage] = useState(1);
  const items = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const full = compare.length >= 4;

  if (loading) return <>{skeleton}</>;
  if (listings.length === 0) return <>{empty}</>;

  return (
    <div>
      <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="size-4 text-primary" />
        Alla priser är omräknade till <strong className="font-semibold text-foreground">kr/m²/år</strong> så att du kan jämföra rättvist. Markera 2–4 objekt för att jämföra.
      </p>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <caption className="sr-only">Lediga objekt – sorterbar tabell</caption>
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="w-10 border-b py-3 pl-4 text-left font-medium">
                  <span className="sr-only">Jämför</span>
                </th>
                {COLS.map((c) => {
                  const sortable = c.asc != null;
                  const isAsc = sort === c.asc;
                  const isDesc = sort === c.desc;
                  const ariaSort = isAsc ? "ascending" : isDesc ? "descending" : "none";
                  return (
                    <th
                      key={c.label}
                      aria-sort={sortable ? ariaSort : undefined}
                      className={cn("border-b py-3 pr-4 font-medium whitespace-nowrap", c.align === "right" ? "text-right" : "text-left")}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() => onSortChange(isAsc && c.desc ? c.desc : isAsc || isDesc ? "rek" : (c.asc as SortKey))}
                          className={cn("inline-flex items-center gap-1 hover:text-foreground", (isAsc || isDesc) && "font-semibold text-foreground")}
                        >
                          {c.label}
                          {isAsc ? <ArrowUp className="size-3.5" /> : isDesc ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3 opacity-50" />}
                        </button>
                      ) : (
                        c.label
                      )}
                    </th>
                  );
                })}
                <th className="border-b py-3 pr-4">
                  <span className="sr-only">Spara</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <ListingRow
                  key={l.id}
                  listing={l}
                  onOpen={onOpen}
                  inCompare={compare.includes(l.id)}
                  compareDisabled={full}
                  onToggleCompare={onToggleCompare}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile list */}
      <ul className="overflow-hidden rounded-2xl border bg-card md:hidden">
        {items.map((l) => (
          <ListingRowMobile
            key={l.id}
            listing={l}
            onOpen={onOpen}
            inCompare={compare.includes(l.id)}
            compareDisabled={full}
            onToggleCompare={onToggleCompare}
          />
        ))}
      </ul>

      <Pagination page={page} total={listings.length} onChange={setPage} />
    </div>
  );
}
