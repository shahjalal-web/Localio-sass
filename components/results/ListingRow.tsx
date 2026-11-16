"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Check, MapPin } from "lucide-react";
import type { Listing } from "@/types/listing";
import { formatAvailability, formatNumber, formatPrice, formatSqm, isAvailableNow, rentPerSqmYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HeartButton } from "./HeartButton";

export function CompareCheckbox({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled && !checked}
      title={disabled && !checked ? "Max 4 objekt kan jämföras" : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "relative z-10 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors disabled:opacity-30",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary",
      )}
    >
      {checked && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <Check className="size-3" strokeWidth={3.5} />
        </motion.span>
      )}
    </button>
  );
}

/** Dense row for concept C (table on desktop, compact card on mobile). */
export function ListingRow({
  listing: l,
  onOpen,
  inCompare,
  compareDisabled,
  onToggleCompare,
}: {
  listing: Listing;
  onOpen: (l: Listing) => void;
  inCompare: boolean;
  compareDisabled: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const price = formatPrice(l);
  const kvm = rentPerSqmYear(l);
  return (
    <tr
      onClick={() => onOpen(l)}
      className={cn("group cursor-pointer transition-colors hover:bg-muted/50", inCompare && "bg-mint/60 hover:bg-mint")}
    >
      <td className="border-b py-3 pr-2 pl-4">
        <CompareCheckbox
          checked={inCompare}
          disabled={compareDisabled}
          onChange={() => onToggleCompare(l.id)}
          label={`Jämför ${l.address}`}
        />
      </td>
      <td className="border-b py-3 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
            <Image src={l.images[0]} alt="" fill sizes="80px" className="object-cover transition-transform duration-300 group-hover:scale-110" />
            {l.isNew && <span className="absolute top-1 left-1 rounded bg-lime px-1 text-[9px] font-bold text-ink">NY</span>}
          </div>
          <div className="min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(l);
              }}
              className="block max-w-[320px] truncate text-left font-semibold focus:outline-none focus-visible:underline"
            >
              {l.address}
            </button>
            <p className="flex max-w-[320px] items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {l.area ? `${l.area}, ` : ""}
              {l.city} · <span className="truncate">{l.title}</span>
            </p>
          </div>
        </div>
      </td>
      <td className="border-b py-3 pr-4 text-sm whitespace-nowrap">{l.type}</td>
      <td className="tabular border-b py-3 pr-4 text-right text-sm font-semibold whitespace-nowrap">{formatSqm(l.sizeSqm)}</td>
      <td className="tabular border-b py-3 pr-4 text-right text-sm whitespace-nowrap">{price.main}</td>
      <td className="tabular border-b py-3 pr-4 text-right text-sm font-semibold whitespace-nowrap">
        {kvm ? formatNumber(kvm) : <span className="text-muted-foreground">–</span>}
      </td>
      <td className="border-b py-3 pr-4 text-sm whitespace-nowrap">
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", isAvailableNow(l) ? "bg-mint text-primary" : "bg-muted text-muted-foreground")}>
          {formatAvailability(l)}
        </span>
      </td>
      <td className="border-b py-3 pr-4 text-right">
        <HeartButton id={l.id} label={`${l.address}, ${l.city}`} size="sm" className="ml-auto bg-transparent shadow-none ring-1 ring-border" />
      </td>
    </tr>
  );
}

/** Mobile version of the dense row. */
export function ListingRowMobile({
  listing: l,
  onOpen,
  inCompare,
  compareDisabled,
  onToggleCompare,
}: {
  listing: Listing;
  onOpen: (l: Listing) => void;
  inCompare: boolean;
  compareDisabled: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const price = formatPrice(l);
  const kvm = rentPerSqmYear(l);
  return (
    <li
      onClick={() => onOpen(l)}
      className={cn("flex cursor-pointer gap-3 border-b p-3 last:border-0", inCompare && "bg-mint/60")}
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
        <Image src={l.images[0]} alt="" fill sizes="96px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold">{l.address}</p>
          <CompareCheckbox checked={inCompare} disabled={compareDisabled} onChange={() => onToggleCompare(l.id)} label={`Jämför ${l.address}`} />
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {l.type} · {l.city}
        </p>
        <div className="tabular mt-1.5 flex flex-wrap gap-x-3 text-sm">
          <span className="font-semibold">{formatSqm(l.sizeSqm)}</span>
          <span>{price.main}</span>
          {kvm && <span className="text-muted-foreground">{formatNumber(kvm)} kr/m²/år</span>}
        </div>
      </div>
    </li>
  );
}
