"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Lightweight swipeable image carousel (CSS scroll-snap) with dots + hover arrows. */
export function ImageCarousel({
  images,
  alt,
  sizes,
  className,
  preloadFirst = false,
}: {
  images: string[];
  alt: string;
  sizes: string;
  className?: string;
  preloadFirst?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function go(dir: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, index + dir));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className={cn("group/carousel relative overflow-hidden", className)}>
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          if (i !== index) setIndex(i);
        }}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((src, i) => (
          <div key={src} className="relative h-full w-full shrink-0 snap-start">
            <Image
              src={src}
              alt={i === 0 ? alt : `${alt} – bild ${i + 1}`}
              fill
              sizes={sizes}
              preload={preloadFirst && i === 0}
              loading={preloadFirst && i === 0 ? undefined : "lazy"}
              className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Föregående bild"
            onClick={(e) => go(-1, e)}
            className={cn(
              "absolute top-1/2 left-2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100",
              index === 0 && "invisible",
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Nästa bild"
            onClick={(e) => go(1, e)}
            className={cn(
              "absolute top-1/2 right-2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100",
              index === images.length - 1 && "invisible",
            )}
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1">
            {images.map((src, i) => (
              <span
                key={src}
                className={cn("h-1.5 rounded-full bg-white transition-all", i === index ? "w-4" : "w-1.5 opacity-60")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
