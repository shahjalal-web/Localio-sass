"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CalendarDays, MapPin, Ruler, Wallet } from "lucide-react";
import type { Listing } from "@/types/listing";
import { formatAvailability, formatPrice, formatSqm, isAvailableNow } from "@/lib/format";
import { FEATURE_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { HeartButton } from "./HeartButton";
import { ImageCarousel } from "./ImageCarousel";

export function ListingBadges({ listing, className }: { listing: Listing; className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap gap-1.5", className)}>
      {listing.isFeatured && (
        <span className="rounded-full bg-forest px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft">Utvald</span>
      )}
      {listing.isNew && (
        <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-semibold text-ink shadow-soft">Ny</span>
      )}
      {isAvailableNow(listing) && listing.deal === "Hyra" && (
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-soft">Ledigt nu</span>
      )}
      {listing.deal === "Till salu" && (
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-soft">Till salu</span>
      )}
    </div>
  );
}

interface Props {
  listing: Listing;
  variant?: "default" | "gallery";
  onOpen?: (l: Listing) => void;
  highlighted?: boolean;
  onHoverChange?: (id: string | null) => void;
  sizes?: string;
  preload?: boolean;
  className?: string;
}

export function ListingCard({
  listing: l,
  variant = "default",
  onOpen,
  highlighted = false,
  onHoverChange,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw",
  preload = false,
  className,
}: Props) {
  const router = useRouter();
  const price = formatPrice(l);
  const where = l.area ? `${l.city}, ${l.area}` : l.city;
  const open = () => (onOpen ? onOpen(l) : router.push(`/lokaler?objekt=${l.id}`));

  const titleEl = onOpen ? (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        open();
      }}
      className="block w-full truncate text-left focus:outline-none"
    >
      {l.title}
    </button>
  ) : (
    <Link href={`/lokaler?objekt=${l.id}`} onClick={(e) => e.stopPropagation()} className="block truncate focus:outline-none">
      {l.title}
    </Link>
  );

  return (
    <motion.article
      onClick={open}
      onMouseEnter={() => onHoverChange?.(l.id)}
      onMouseLeave={() => onHoverChange?.(null)}
      className={cn(
        "group/card relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-lift has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
        highlighted ? "-translate-y-1 border-primary shadow-lift ring-2 ring-primary/70" : "border-border shadow-[0_1px_2px_rgb(14_26_21/0.04)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3]">
        <ImageCarousel images={l.images} alt={l.title} sizes={sizes} preloadFirst={preload} className="absolute inset-0" />
        <ListingBadges listing={l} />
        <HeartButton id={l.id} label={`${l.address}, ${l.city}`} className="absolute top-3 right-3" />
        {variant === "default" && (
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {l.type}
          </span>
        )}
      </div>

      {variant === "default" ? (
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="tabular truncate text-lg leading-tight font-semibold tracking-tight">{price.main}</p>
              {price.helper && <p className="tabular mt-0.5 truncate text-xs text-muted-foreground">{price.helper}</p>}
            </div>
            <span className="tabular shrink-0 rounded-lg bg-mint px-2 py-1 text-sm font-semibold text-primary">{formatSqm(l.sizeSqm)}</span>
          </div>
          <h3 className="mt-3 text-sm font-medium">{titleEl}</h3>
          <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {l.address} · {where}
            </span>
          </p>
          <div className="mt-auto flex items-center gap-1.5 pt-3">
            {l.features.slice(0, 3).map((f) => {
              const Icon = FEATURE_ICONS[f];
              return (
                <span key={f} title={f} className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-1 text-[11px] text-muted-foreground">
                  <Icon className="size-3" />
                  <span className="hidden sm:inline">{f}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-4 pb-3">
          <p className="text-xs font-medium text-muted-foreground">
            {l.type} · {where}
          </p>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold">{titleEl}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            <span className="tabular inline-flex items-center gap-1">
              <Ruler className="size-3.5 text-muted-foreground" /> {formatSqm(l.sizeSqm)}
            </span>
            <span className="tabular inline-flex items-center gap-1 font-semibold">
              <Wallet className="size-3.5 text-muted-foreground" /> {price.main}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <CalendarDays className="size-3.5" /> {formatAvailability(l)}
            </span>
          </div>
          <div className="mt-auto flex items-center gap-2 border-t pt-3">
            <span className="grid size-6 place-items-center rounded-md bg-forest text-[9px] font-bold text-white">{l.advertiser.logoText}</span>
            <span className="truncate text-xs text-muted-foreground">{l.advertiser.name}</span>
          </div>
        </div>
      )}
    </motion.article>
  );
}
