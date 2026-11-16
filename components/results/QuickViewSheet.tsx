"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  GitCompareArrows,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Share2,
  Tag,
  Wallet,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import type { Listing } from "@/types/listing";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAvailability, formatNumber, formatPrice, formatSqm, rentPerSqmYear } from "@/lib/format";
import { FEATURE_ICONS } from "@/lib/icons";
import { useMediaQuery } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { HeartButton } from "./HeartButton";
import { ListingBadges } from "./ListingCard";

const MiniMap = dynamic(() => import("./ListingMap").then((m) => m.MiniMap), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

function Gallery({ listing }: { listing: Listing }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted sm:rounded-2xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image src={listing.images[i]} alt={`${listing.title} – bild ${i + 1}`} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <ListingBadges listing={listing} />
        <span className="tabular absolute right-3 bottom-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {i + 1} / {listing.images.length}
        </span>
      </div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-5 sm:px-0">
        {listing.images.map((src, idx) => (
          <button
            key={src}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`Visa bild ${idx + 1}`}
            className={cn(
              "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition-all",
              idx === i ? "ring-primary" : "opacity-70 ring-transparent hover:opacity-100",
            )}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ContactForm({ listing, onSent }: { listing: Listing; onSent: () => void }) {
  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Meddelandet är skickat!", { description: `${listing.advertiser.name} brukar svara inom 24 timmar.` });
        onSent();
      }}
    >
      <div className="space-y-2 pt-4">
        <label className="sr-only" htmlFor="qv-email">
          Din e-post
        </label>
        <input id="qv-email" type="email" required placeholder="Din e-post" className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
        <label className="sr-only" htmlFor="qv-msg">
          Meddelande
        </label>
        <textarea
          id="qv-msg"
          rows={3}
          defaultValue={`Hej! Jag är intresserad av lokalen på ${listing.address} och vill gärna veta mer.`}
          className="w-full resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
        <button type="submit" className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
          Skicka meddelande
        </button>
      </div>
    </motion.form>
  );
}

export function QuickViewSheet({
  listing,
  onClose,
  inCompare,
  onToggleCompare,
}: {
  listing: Listing | null;
  onClose: () => void;
  inCompare: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const [contactOpen, setContactOpen] = useState(false);
  const l = listing;
  const price = l ? formatPrice(l) : null;
  const kvm = l ? rentPerSqmYear(l) : undefined;

  return (
    <Sheet
      open={l != null}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setContactOpen(false);
        }
      }}
    >
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={cn("gap-0 overflow-y-auto bg-background p-0", isDesktop ? "w-full sm:max-w-[600px]" : "h-[92dvh] rounded-t-3xl")}
      >
        {l && price && (
          <>
            {!isDesktop && <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-border" />}
            <div className="sm:p-5 sm:pb-0">
              <Gallery key={l.id} listing={l} />
            </div>
            <div className="space-y-6 p-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {l.type} · {l.category === "lokaler" ? "Lokal" : l.category === "fastigheter" ? "Fastighet" : l.category === "foretag" ? "Företag" : "Mark"} · {l.deal}
                    </p>
                    <SheetTitle className="mt-1 text-2xl leading-tight font-semibold tracking-tight">{l.title}</SheetTitle>
                    <SheetDescription className="mt-1.5 flex items-center gap-1 text-sm">
                      <MapPin className="size-3.5" /> {l.address}, {l.area ? `${l.area}, ` : ""}
                      {l.city}
                    </SheetDescription>
                  </div>
                  <div className="flex shrink-0 gap-1.5 pt-1 pr-8">
                    <button
                      type="button"
                      aria-label="Dela"
                      onClick={() => {
                        const url = `${window.location.origin}/lokaler?objekt=${l.id}`;
                        navigator.clipboard?.writeText(url).then(
                          () => toast.success("Länk kopierad", { description: url }),
                          () => toast("Kopiera länken", { description: url }),
                        );
                      }}
                      className="grid size-9 place-items-center rounded-full ring-1 ring-border hover:bg-muted"
                    >
                      <Share2 className="size-4" />
                    </button>
                    <HeartButton id={l.id} label={`${l.address}, ${l.city}`} className="ring-1 ring-border" />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-mint p-4">
                  <div>
                    <p className="tabular text-2xl font-semibold tracking-tight">{price.main}</p>
                    {price.helper && <p className="tabular text-sm text-muted-foreground">{price.helper}</p>}
                  </div>
                  <span className="tabular rounded-xl bg-card px-3 py-1.5 text-lg font-semibold text-primary">{formatSqm(l.sizeSqm)}</span>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { icon: Ruler, k: "Yta", v: formatSqm(l.sizeSqm) },
                  { icon: Building2, k: "Typ", v: l.type },
                  { icon: Wallet, k: "kr/m²/år", v: kvm ? `${formatNumber(kvm)} kr` : "–" },
                  { icon: CalendarDays, k: "Tillträde", v: formatAvailability(l) },
                  { icon: Leaf, k: "Energiklass", v: l.energyClass ?? "–" },
                  { icon: Tag, k: "Objekt-ID", v: l.id.toUpperCase() },
                ].map((f) => (
                  <div key={f.k} className="rounded-2xl border bg-card p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <f.icon className="size-3.5" /> {f.k}
                    </dt>
                    <dd className="tabular mt-1 text-sm font-semibold">{f.v}</dd>
                  </div>
                ))}
              </dl>

              <section>
                <h3 className="text-base font-semibold">Om lokalen</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.description}</p>
              </section>

              <section>
                <h3 className="text-base font-semibold">Egenskaper</h3>
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {l.features.map((f) => {
                    const Icon = FEATURE_ICONS[f];
                    return (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <span className="grid size-8 place-items-center rounded-lg bg-muted">
                          <Icon className="size-4" />
                        </span>
                        {f}
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold">Läge</h3>
                <div className="relative mt-3 h-48 overflow-hidden rounded-2xl ring-1 ring-border">
                  <MiniMap key={l.id} lat={l.lat} lng={l.lng} label={l.address} />
                </div>
              </section>

              <button
                type="button"
                onClick={() => onToggleCompare(l.id)}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ring-1 transition-colors",
                  inCompare ? "bg-mint text-primary ring-primary" : "ring-border hover:bg-muted",
                )}
              >
                {inCompare ? <Check className="size-4" /> : <GitCompareArrows className="size-4" />}
                {inCompare ? "Tillagd i jämförelse" : "Lägg till i jämförelse"}
              </button>
            </div>

            {/* Advertiser contact – sticky */}
            <div className="sticky bottom-0 mt-auto border-t bg-background/95 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest text-sm font-bold text-white">{l.advertiser.logoText}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{l.advertiser.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-lime" /> Svarar oftast inom 24 h
                  </p>
                </div>
                <a href="tel:+46000000000" aria-label="Ring annonsören" className="grid size-10 place-items-center rounded-full ring-1 ring-border hover:bg-muted">
                  <Phone className="size-4" />
                </a>
              </div>
              <AnimatePresence>{contactOpen && <ContactForm listing={l} onSent={() => setContactOpen(false)} />}</AnimatePresence>
              {!contactOpen && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    <Mail className="size-4" /> Kontakta annonsör
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.success("Förfrågan om visning skickad", {
                        description: `${l.advertiser.name} återkommer med förslag på tider.`,
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ring-1 ring-border hover:bg-muted"
                  >
                    <CalendarCheck className="size-4" /> Boka visning
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
