"use client";

import { motion } from "motion/react";
import { ArrowRight, Eye, MessageSquare, TrendingUp } from "lucide-react";
import { notInDemo } from "@/lib/demo";
import { Reveal } from "@/components/motion/Reveal";

const BARS = [32, 45, 38, 56, 48, 64, 58, 72, 66, 84, 78, 96];

export function CtaAdvertisers() {
  return (
    <section id="annonsorer" className="mx-auto mt-28 max-w-[1440px] scroll-mt-24 px-4 sm:px-6 lg:mt-36 lg:px-10">
      <Reveal className="relative isolate overflow-hidden rounded-[32px] bg-forest px-6 py-14 text-white sm:px-12 lg:px-16 lg:py-20">
        <div className="noise absolute inset-0 -z-10 opacity-10 mix-blend-overlay" />
        <div className="absolute -top-32 -right-24 -z-10 size-[420px] rounded-full bg-lime/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 -z-10 size-[360px] rounded-full bg-[#2c6b52]/60 blur-3xl" />

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15">
              För fastighetsägare & mäklare
            </p>
            <h2 className="mt-6 text-4xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
              Har du en lokal att <em className="font-display font-normal text-lime">hyra ut?</em>
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/70">
              Nå tusentals företag som letar lokal just nu. Följ visningar och leads i realtid – och fyll dina vakanser snabbare.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => notInDemo("Annonsering")}
                className="group inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3.5 font-semibold text-ink transition-transform active:scale-[0.97]"
              >
                Annonsera nu
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => notInDemo("Prissidan")}
                className="rounded-full px-6 py-3.5 font-semibold ring-1 ring-white/25 transition-colors hover:bg-white/10"
              >
                Se priser
              </button>
            </div>
          </div>

          {/* Floating mock dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="rounded-3xl bg-white p-5 text-ink shadow-[0_40px_80px_-20px_rgb(0_0_0/0.5)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#5b6660]">Kanalgatan 6 · Kontorshotell</p>
                  <p className="text-lg font-semibold">Annonsstatistik</p>
                </div>
                <span className="rounded-full bg-[#e4efe8] px-2.5 py-1 text-xs font-semibold text-[#163a2e]">Senaste 30 dagarna</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { icon: Eye, label: "Visningar", value: "4 812", delta: "+38%" },
                  { icon: MessageSquare, label: "Leads", value: "27", delta: "+12" },
                  { icon: TrendingUp, label: "Sparad", value: "196", delta: "+21%" },
                ].map((k) => (
                  <div key={k.label} className="rounded-2xl bg-[#f4f2ed] p-3">
                    <k.icon className="size-4 text-[#5b6660]" />
                    <p className="tabular mt-2 text-lg font-semibold">{k.value}</p>
                    <p className="text-[11px] text-[#5b6660]">
                      {k.label} <span className="font-semibold text-[#2f8a46]">{k.delta}</span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex h-28 items-end gap-1.5" aria-hidden="true">
                {BARS.map((h, i) => (
                  <motion.span
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.05, type: "spring", stiffness: 140, damping: 18 }}
                    className={i === BARS.length - 1 ? "flex-1 rounded-t-md bg-[#7bd389]" : "flex-1 rounded-t-md bg-[#163a2e]/85"}
                  />
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.1 }}
              className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 text-ink shadow-lift sm:-left-10"
            >
              <span className="grid size-9 place-items-center rounded-full bg-[#7bd389] text-xs font-bold">+1</span>
              <div>
                <p className="text-sm font-semibold">Ny intresseanmälan</p>
                <p className="text-xs text-[#5b6660]">Tech AB vill boka visning</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
