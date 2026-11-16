"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LISTINGS } from "@/lib/data/listings";
import { sortListings } from "@/lib/filters";
import { ListingCard } from "@/components/results/ListingCard";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "./SectionHeading";

const FEATURED = sortListings(
  LISTINGS.filter((l) => l.isFeatured || l.isNew),
  "rek",
).slice(0, 10);

export function FeaturedCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  function scrollBy(dir: number) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 16) * 2, behavior: "smooth" });
  }

  return (
    <section className="mt-28 lg:mt-36">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="Utvalda lokaler"
          title="Nytt och"
          italic="handplockat"
          after="för dig"
          action={
            <div className="flex items-center gap-2">
              <Link href="/lokaler" className="mr-2 hidden text-sm font-semibold underline-offset-4 hover:underline sm:block">
                Visa alla
              </Link>
              <button
                type="button"
                aria-label="Föregående"
                disabled={edges.start}
                onClick={() => scrollBy(-1)}
                className="grid size-12 place-items-center rounded-full bg-card ring-1 ring-border transition-all hover:ring-foreground/30 active:scale-95 disabled:opacity-35"
              >
                <ArrowLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Nästa"
                disabled={edges.end}
                onClick={() => scrollBy(1)}
                className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-35"
              >
                <ArrowRight className="size-5" />
              </button>
            </div>
          }
        />
      </div>
      <Reveal delay={0.1}>
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            const start = el.scrollLeft < 8;
            const end = el.scrollLeft + el.clientWidth > el.scrollWidth - 8;
            if (start !== edges.start || end !== edges.end) setEdges({ start, end });
          }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") return;
            drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            if (Math.abs(dx) > 5) {
              d.moved = true;
              e.currentTarget.style.scrollSnapType = "none";
              e.currentTarget.scrollLeft = d.left - dx;
            }
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.scrollSnapType = "";
            window.setTimeout(() => (drag.current = null), 0);
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.scrollSnapType = "";
            drag.current = null;
          }}
          onClickCapture={(e) => {
            if (drag.current?.moved) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className="no-scrollbar mt-10 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-6 select-none active:cursor-grabbing sm:px-6 lg:px-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))]"
        >
          {FEATURED.map((l) => (
            <div key={l.id} data-card className="w-[78vw] shrink-0 snap-start sm:w-[340px]">
              <ListingCard listing={l} sizes="340px" className="h-full" />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
