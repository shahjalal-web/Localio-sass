"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, Check, GitCompareArrows, Minus, X } from "lucide-react";
import type { Feature, Listing } from "@/types/listing";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ALL_FEATURES } from "@/lib/data/listings";
import { formatAvailability, formatNumber, formatPrice, formatSqm, isAvailableNow, rentPerSqmYear } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CompareTray({
  items,
  onRemove,
  onClear,
  onOpen,
}: {
  items: Listing[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpen: (l: Listing) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-2xl sm:bottom-5"
            role="region"
            aria-label="Jämförelse"
          >
            <div className="flex items-center gap-3 rounded-3xl bg-ink p-2.5 pl-4 text-white shadow-float ring-1 ring-white/10 dark:bg-card">
              <GitCompareArrows className="hidden size-5 shrink-0 text-lime sm:block" />
              <ul className="flex min-w-0 flex-1 gap-2">
                <AnimatePresence initial={false}>
                  {items.map((l) => (
                    <motion.li
                      key={l.id}
                      layout
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="relative"
                    >
                      <Image src={l.images[0]} alt={l.address} width={64} height={48} className="h-11 w-14 rounded-lg object-cover sm:h-12 sm:w-16" />
                      <button
                        type="button"
                        aria-label={`Ta bort ${l.address} från jämförelsen`}
                        onClick={() => onRemove(l.id)}
                        className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-white text-ink shadow"
                      >
                        <X className="size-3" strokeWidth={3} />
                      </button>
                    </motion.li>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - items.length) }, (_, i) => (
                    <li key={`empty-${i}`} className="hidden h-12 w-16 rounded-lg border border-dashed border-white/25 sm:block" />
                  ))}
                </AnimatePresence>
              </ul>
              <button type="button" onClick={onClear} className="hidden px-2 text-sm text-white/60 hover:text-white sm:block">
                Rensa
              </button>
              <button
                type="button"
                disabled={items.length < 2}
                onClick={() => setOpen(true)}
                className="shrink-0 rounded-full bg-lime px-4 py-3 text-sm font-semibold text-ink transition-opacity disabled:opacity-50"
              >
                {items.length < 2 ? "Välj minst 2" : `Jämför (${items.length})`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CompareDialog open={open && items.length >= 2} onOpenChange={setOpen} items={items} onRemove={onRemove} onOpen={onOpen} />
    </>
  );
}

function CompareDialog({
  open,
  onOpenChange,
  items,
  onRemove,
  onOpen,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  items: Listing[];
  onRemove: (id: string) => void;
  onOpen: (l: Listing) => void;
}) {
  const kvms = items.map((l) => rentPerSqmYear(l));
  const validKvm = kvms.filter((v): v is number => v != null);
  const bestKvm = validKvm.length ? Math.min(...validKvm) : null;
  const maxSize = Math.max(...items.map((l) => l.sizeSqm));
  const features = ALL_FEATURES.filter((f) => items.some((l) => l.features.includes(f)));

  type Row = { label: string; values: React.ReactNode[]; raw: string[] };
  const rows: Row[] = [
    { label: "Pris", values: items.map((l) => formatPrice(l).main), raw: items.map((l) => formatPrice(l).main) },
    {
      label: "kr/m²/år",
      values: items.map((l, i) => (
        <span key={l.id} className="inline-flex flex-wrap items-center gap-1.5">
          {kvms[i] != null ? `${formatNumber(kvms[i] ?? 0)} kr` : "–"}
          {kvms[i] != null && kvms[i] === bestKvm && (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime px-2 py-0.5 text-[11px] font-semibold text-ink">
              <Award className="size-3" /> Bäst pris/m²
            </span>
          )}
        </span>
      )),
      raw: kvms.map((v) => String(v ?? "")),
    },
    {
      label: "Yta",
      values: items.map((l) => (
        <span key={l.id} className="inline-flex flex-wrap items-center gap-1.5">
          {formatSqm(l.sizeSqm)}
          {l.sizeSqm === maxSize && <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-primary">Störst</span>}
        </span>
      )),
      raw: items.map((l) => String(l.sizeSqm)),
    },
    { label: "Typ", values: items.map((l) => l.type), raw: items.map((l) => l.type) },
    { label: "Ort", values: items.map((l) => (l.area ? `${l.area}, ${l.city}` : l.city)), raw: items.map((l) => l.city) },
    {
      label: "Tillträde",
      values: items.map((l) => (
        <span key={l.id} className={cn(isAvailableNow(l) && "font-semibold text-primary")}>
          {formatAvailability(l)}
        </span>
      )),
      raw: items.map((l) => formatAvailability(l)),
    },
    { label: "Energiklass", values: items.map((l) => l.energyClass ?? "–"), raw: items.map((l) => l.energyClass ?? "") },
    { label: "Annonsör", values: items.map((l) => l.advertiser.name), raw: items.map((l) => l.advertiser.name) },
  ];
  const featureRows: { f: Feature; has: boolean[] }[] = features.map((f) => ({ f, has: items.map((l) => l.features.includes(f)) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:h-[92dvh] sm:w-[min(1200px,96vw)] sm:max-w-none sm:rounded-3xl">
        <div className="border-b px-5 py-4 pr-14 sm:px-8">
          <DialogTitle className="text-xl font-semibold tracking-tight">Jämför {items.length} lokaler</DialogTitle>
          <DialogDescription>Skillnader är markerade. Bäst pris per kvadratmeter får en grön etikett.</DialogDescription>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10 bg-background">
              <tr>
                <th className="w-40 border-b p-4 text-left align-bottom text-xs font-medium text-muted-foreground sm:w-48">Objekt</th>
                {items.map((l) => (
                  <th key={l.id} className="border-b p-4 text-left align-top font-normal">
                    <div className="relative">
                      <button type="button" onClick={() => onOpen(l)} className="block w-full text-left">
                        <span className="relative block aspect-[4/3] overflow-hidden rounded-xl">
                          <Image src={l.images[0]} alt={l.title} fill sizes="260px" className="object-cover" />
                        </span>
                        <span className="mt-2 block font-semibold">{l.address}</span>
                        <span className="block truncate text-xs text-muted-foreground">{l.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(l.id)}
                        aria-label={`Ta bort ${l.address}`}
                        className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 text-ink shadow"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const differs = new Set(r.raw).size > 1;
                return (
                  <tr key={r.label} className={cn(differs && "bg-mint/50")}>
                    <th scope="row" className="border-b px-4 py-3.5 text-left text-xs font-medium text-muted-foreground">
                      {r.label}
                      {differs && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-primary align-middle" title="Skiljer sig" />}
                    </th>
                    {r.values.map((v, i) => (
                      <td key={i} className="tabular border-b px-4 py-3.5 font-medium">
                        {v}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <th colSpan={items.length + 1} className="px-4 pt-6 pb-2 text-left text-sm font-semibold">
                  Egenskaper
                </th>
              </tr>
              {featureRows.map((r) => {
                const differs = new Set(r.has).size > 1;
                return (
                  <tr key={r.f} className={cn(differs && "bg-mint/50")}>
                    <th scope="row" className="border-b px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {r.f}
                    </th>
                    {r.has.map((h, i) => (
                      <td key={i} className="border-b px-4 py-3">
                        {h ? (
                          <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3.5" strokeWidth={3} />
                            <span className="sr-only">Ja</span>
                          </span>
                        ) : (
                          <span className="grid size-6 place-items-center rounded-full bg-muted text-muted-foreground">
                            <Minus className="size-3.5" />
                            <span className="sr-only">Nej</span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
