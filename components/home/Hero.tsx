"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Building2, Sparkles, TrendingUp } from "lucide-react";
import { HERO_IMAGE } from "@/lib/data/images";
import { DEFAULT_FILTERS } from "@/lib/filters";
import { SmartSearch } from "@/components/search/SmartSearch";
import { QuickChips } from "./QuickChips";

const LINE_1 = ["Hitta", "rätt", "plats"];
const LINE_2 = ["för", "ditt"];

const word = {
  hidden: { opacity: 0, y: "60%", filter: "blur(10px)" },
  show: (i: number) => ({
    opacity: 1,
    y: "0%",
    filter: "blur(0px)",
    transition: { delay: 0.15 + i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative">
      <div className="relative isolate flex min-h-[640px] flex-col overflow-hidden bg-forest pb-40 text-white sm:min-h-[84vh] md:pb-44">
        {/* Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Flygbild över Stockholm i solnedgång"
            fill
            preload
            sizes="100vw"
            quality={75}
            className="animate-ken-burns object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(35deg,#0b1f18_8%,rgb(15_43_34/0.88)_38%,rgb(22_58_46/0.35)_70%,rgb(22_58_46/0.15))]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b1f18]/70 to-transparent" />
          <div className="noise absolute inset-0 opacity-[0.12] mix-blend-overlay" />
        </div>

        <div className="mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-10 px-4 pt-28 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-10 lg:pt-32">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 rounded-full bg-white/10 py-1.5 pr-4 pl-2 text-xs font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-md sm:text-sm"
            >
              <span className="relative flex size-2.5 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-lime" />
              </span>
              <span className="tabular">1&nbsp;240</span> lediga lokaler i hela Sverige just nu
            </motion.p>

            <h1 className="mt-6 text-[3.1rem] leading-[0.95] font-semibold tracking-[-0.045em] text-balance sm:text-7xl md:text-8xl">
              <span className="block overflow-hidden pb-[0.08em]">
                {LINE_1.map((w, i) => (
                  <motion.span key={w} custom={i} variants={word} initial="hidden" animate="show" className="mr-[0.22em] inline-block">
                    {w}
                  </motion.span>
                ))}
              </span>
              <span className="block overflow-hidden pb-[0.12em]">
                {LINE_2.map((w, i) => (
                  <motion.span key={w} custom={i + 3} variants={word} initial="hidden" animate="show" className="mr-[0.22em] inline-block">
                    {w}
                  </motion.span>
                ))}
                <motion.span custom={5} variants={word} initial="hidden" animate="show" className="relative inline-block">
                  <em className="font-display font-normal tracking-[-0.02em] text-[1.08em]">företag</em>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 300 24"
                    preserveAspectRatio="none"
                    className="absolute -bottom-[0.06em] left-0 h-[0.18em] w-full overflow-visible"
                  >
                    <motion.path
                      d="M4 16 C 60 6, 120 4, 170 10 S 260 20, 296 8"
                      fill="none"
                      stroke="#7BD389"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 1, duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                    />
                  </svg>
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.7 }}
              className="mt-6 max-w-xl text-base text-white/75 sm:text-lg"
            >
              Sök bland lediga kontor, butiker, lager och andra kommersiella lokaler i hela Sverige.
            </motion.p>
          </div>

          {/* Floating glass cards (desktop) */}
          <div aria-hidden="true" className="relative hidden h-[340px] w-[300px] lg:block">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0"
            >
              <div style={{ ["--r" as string]: "-4deg" }} className="w-[270px] animate-float rounded-3xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-white text-forest">
                    <Building2 className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Kontor · Jönköping</p>
                    <p className="text-xs text-white/70">Västra Storgatan 9</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="tabular font-semibold">145 m²</span>
                  <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-semibold text-ink">Ledig nu</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[150px] left-0"
            >
              <div style={{ ["--r" as string]: "3deg", animationDelay: "-2.5s" }} className="flex w-[230px] animate-float items-center gap-3 rounded-3xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur-xl">
                <span className="grid size-10 place-items-center rounded-2xl bg-lime text-ink">
                  <TrendingUp className="size-5" />
                </span>
                <div>
                  <p className="text-lg leading-tight font-semibold">+12</p>
                  <p className="text-xs text-white/70">nya lokaler idag</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-4 bottom-0"
            >
              <div style={{ ["--r" as string]: "-2deg", animationDelay: "-4s" }} className="flex w-[220px] animate-float items-center gap-2 rounded-2xl bg-forest/70 px-3.5 py-3 text-xs ring-1 ring-lime/30 backdrop-blur-xl">
                <Sparkles className="size-4 shrink-0 text-lime" />
                <span>”Kontor för 10 pers i Jönköping” → 1 träff</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SmartSearch overlapping the hero */}
      <div className="relative z-20 mx-auto -mt-32 max-w-[1180px] px-3 sm:px-6 md:-mt-40">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <SmartSearch initial={{ ...DEFAULT_FILTERS, kategori: "lokaler", deal: "hyra" }}>
            <QuickChips className="mt-3" />
          </SmartSearch>
        </motion.div>
        <p className="mt-3 hidden text-center text-xs text-muted-foreground md:block">
          Tips: tryck <kbd className="rounded-md border bg-card px-1.5 py-0.5 font-sans text-[11px] font-semibold">/</kbd> för att börja söka
        </p>
      </div>
    </section>
  );
}
