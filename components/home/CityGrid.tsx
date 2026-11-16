"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CITIES } from "@/lib/data/cities";
import { staggerChild, staggerParent } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const LAYOUT: Record<string, string> = {
  jonkoping: "col-span-2 row-span-2 min-h-[340px] lg:min-h-0",
  stockholm: "",
  goteborg: "",
  malmo: "",
  norrkoping: "",
  linkoping: "col-span-2",
  orebro: "col-span-2",
};

export function CityGrid() {
  const cities = CITIES.filter((c) => c.slug in LAYOUT);
  return (
    <section className="mx-auto mt-28 max-w-[1440px] px-4 sm:px-6 lg:mt-36 lg:px-10">
      <SectionHeading
        eyebrow="Populära orter"
        title="Där företag"
        italic="växer"
        after="just nu"
        description="Utforska lediga lokaler i Sveriges mest efterfrågade städer – från logistiknav till innerstadskontor."
        action={
          <Link href="/lokaler" className="group inline-flex items-center gap-2 self-start rounded-full bg-card px-5 py-3 text-sm font-semibold ring-1 ring-border transition-all hover:ring-foreground/30 md:self-auto">
            Alla orter
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        }
      />
      <motion.ul
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 lg:grid-cols-4"
      >
        {cities.map((c, i) => {
          const big = c.slug === "jonkoping";
          return (
            <motion.li key={c.slug} variants={staggerChild} className={cn("relative", LAYOUT[c.slug])}>
              <Link
                href={`/lokaler?ort=${c.slug}`}
                className="group absolute inset-0 overflow-hidden rounded-3xl bg-forest focus-visible:outline-offset-4"
              >
                <Image
                  src={c.image}
                  alt={`Lediga lokaler i ${c.name}`}
                  fill
                  sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover grayscale-[85%] transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-6">
                  <div className="min-w-0">
                    {big && <p className="mb-2 hidden text-sm text-white/75 sm:block">{c.tagline}</p>}
                    <h3 className={cn("font-semibold tracking-[-0.03em]", big ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl")}>{c.name}</h3>
                    <p className="tabular mt-1 text-sm text-white/80">
                      {c.count} lediga objekt
                    </p>
                  </div>
                  <span
                    className={cn(
                      "grid shrink-0 place-items-center overflow-hidden rounded-full bg-white text-ink transition-all duration-300 group-hover:bg-lime",
                      big ? "size-14" : "size-10",
                    )}
                  >
                    <span className="relative block size-5">
                      <ArrowUpRight className="absolute inset-0 size-5 transition-transform duration-300 group-hover:translate-x-5 group-hover:-translate-y-5" />
                      <ArrowUpRight className="absolute inset-0 size-5 -translate-x-5 translate-y-5 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </span>
                  </span>
                </div>
                {i === 0 && (
                  <span className="absolute top-4 left-4 rounded-full bg-lime px-3 py-1 text-xs font-semibold text-ink sm:top-6 sm:left-6">
                    Flest lediga lokaler
                  </span>
                )}
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
