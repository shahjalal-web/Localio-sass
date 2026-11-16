"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Bell, Check, Heart, Send, SlidersHorizontal, Sparkles } from "lucide-react";
import { RollingNumber } from "@/components/motion/AnimatedNumber";
import { staggerChild, staggerParent } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

function useTicker(ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-60px" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [inView, ms]);
  return { ref, tick };
}

function Card({
  title,
  text,
  className,
  children,
  dark = false,
}: {
  title: string;
  text: string;
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <motion.li
      variants={staggerChild}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl p-6 ring-1 transition-shadow duration-500 hover:shadow-lift sm:p-7",
        dark ? "bg-forest text-white ring-white/5" : "bg-card ring-border",
        className,
      )}
    >
      <div className="relative flex min-h-[200px] flex-1 items-center justify-center">{children}</div>
      <div className="relative mt-6">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className={cn("mt-1.5 text-sm", dark ? "text-white/65" : "text-muted-foreground")}>{text}</p>
      </div>
    </motion.li>
  );
}

/* 1. Filters ------------------------------------------------------- */
const FILTER_CHIPS = ["Kontor", "Jönköping", "100–300 m²", "Ledig nu"];
const FILTER_COUNTS = [1240, 186, 42, 12, 8];

function FiltersDemo() {
  const { ref, tick } = useTicker(1300);
  const step = tick % (FILTER_CHIPS.length + 2);
  const on = Math.min(step, FILTER_CHIPS.length);
  return (
    <div ref={ref} className="w-full max-w-md">
      <div className="flex items-center gap-2 rounded-2xl bg-muted/60 p-3">
        <SlidersHorizontal className="size-4 text-muted-foreground" />
        <div className="flex flex-wrap gap-1.5">
          {FILTER_CHIPS.map((c, i) => (
            <motion.span
              key={c}
              animate={{ scale: i < on ? [1, 1.12, 1] : 1 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-300",
                i < on ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border",
              )}
            >
              {c}
            </motion.span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between px-1">
        <div>
          <p className="text-xs text-muted-foreground">Matchande lokaler</p>
          <p className="text-5xl font-semibold tracking-[-0.04em]">
            <RollingNumber value={FILTER_COUNTS[on]} />
          </p>
        </div>
        <div className="flex h-14 items-end gap-1">
          {[40, 65, 30, 90, 55, 75, 45, 60, 35].map((h, i) => (
            <motion.span
              key={i}
              animate={{ height: `${Math.max(12, h - on * (8 + (i % 3) * 4))}%` }}
              className={cn("w-2.5 rounded-t-sm", i % 3 === on % 3 ? "bg-lime" : "bg-mint")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* 2. Save & compare ------------------------------------------------ */
function SaveCompareDemo() {
  const { ref, tick } = useTicker(1500);
  const phase = tick % 4;
  return (
    <div ref={ref} className="relative flex w-full max-w-xs justify-center gap-3">
      {[0, 1].map((i) => {
        const liked = phase >= i + 1;
        const checked = phase >= 3;
        return (
          <motion.div
            key={i}
            animate={{ rotate: i === 0 ? -4 : 4, y: checked ? -6 : 0 }}
            className="w-[130px] overflow-hidden rounded-2xl bg-card shadow-lift ring-1 ring-border"
          >
            <div className={cn("relative h-20", i === 0 ? "bg-[linear-gradient(135deg,#cfe3d6,#9cc5aa)]" : "bg-[linear-gradient(135deg,#e8e1d3,#c9bba0)]")}>
              <motion.span
                animate={{ scale: liked ? [1, 1.35, 1] : 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white shadow-soft"
              >
                <Heart className={cn("size-3.5 text-ink transition-colors", liked && "fill-[#E5484D] text-[#E5484D]")} />
              </motion.span>
            </div>
            <div className="space-y-1.5 p-2.5">
              <span className="block h-2 w-16 rounded-full bg-foreground/80" />
              <span className="block h-1.5 w-20 rounded-full bg-muted" />
              <span className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className={cn("grid size-3.5 place-items-center rounded-[4px] ring-1 ring-border transition-colors", checked && "bg-primary ring-primary")}>
                  {checked && <Check className="size-2.5 text-white" strokeWidth={3} />}
                </span>
                Jämför
              </span>
            </div>
          </motion.div>
        );
      })}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-6 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lift"
          >
            Jämför (2)
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 3. Saved search alerts ------------------------------------------ */
function AlertDemo() {
  const { ref, tick } = useTicker(2600);
  return (
    <div ref={ref} className="relative flex w-full max-w-xs flex-col items-center">
      <motion.span
        key={tick}
        animate={{ rotate: [0, -18, 16, -12, 8, 0] }}
        transition={{ duration: 0.9 }}
        className="relative grid size-16 place-items-center rounded-2xl bg-lime text-ink shadow-lift"
        style={{ transformOrigin: "50% 10%" }}
      >
        <Bell className="size-7" />
        <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[#E5484D] text-[10px] font-bold text-white ring-2 ring-forest">
          3
        </span>
      </motion.span>
      <div className="relative mt-6 h-[70px] w-full">
        {[2, 1, 0].map((i) => (
          <motion.div
            key={`${tick}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1 - i * 0.3, y: i * -8, scale: 1 - i * 0.05 }}
            transition={{ delay: 0.25 + (2 - i) * 0.1 }}
            className="absolute inset-x-0 top-0 rounded-2xl bg-white/10 p-3 text-xs ring-1 ring-white/15 backdrop-blur"
            style={{ zIndex: 3 - i }}
          >
            <p className="font-semibold">3 nya lokaler matchar din bevakning</p>
            <p className="text-white/60">Kontor · Jönköping · 100–300 m²</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* 4. AI ------------------------------------------------------------ */
const AI_CHIPS = ["Göteborg", "Lager", "Lastkaj", "≥ 2 000 m²"];

function AiDemo() {
  const { ref, tick } = useTicker(900);
  const phase = tick % 9;
  return (
    <div ref={ref} className="w-full max-w-md space-y-4">
      <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground shadow-soft">
        Lager med lastkaj i Göteborg, minst 2 000 m²
      </div>
      <div className="flex items-start gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-forest text-lime">
          <Sparkles className="size-4" />
        </span>
        <div className="flex min-h-[40px] flex-wrap gap-1.5 rounded-2xl rounded-tl-md bg-muted/70 p-2.5">
          {phase < 2 ? (
            <span className="flex items-center gap-1 px-1 py-1.5">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.15 }}
                  className="size-1.5 rounded-full bg-foreground/60"
                />
              ))}
            </span>
          ) : (
            AI_CHIPS.slice(0, Math.min(AI_CHIPS.length, phase - 1)).map((c) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
              >
                <span className="shimmer-bg absolute inset-0" />
                <span className="relative">{c}</span>
              </motion.span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* 5. Map ----------------------------------------------------------- */
const PINS = [
  { x: 22, y: 30, label: "1 600 kr/m²" },
  { x: 58, y: 22, label: "23 tkr/mån" },
  { x: 40, y: 58, label: "2 200 kr/m²" },
  { x: 74, y: 64, label: "432 m²" },
];

function MapDemo() {
  const { ref, tick } = useTicker(1400);
  const active = tick % PINS.length;
  return (
    <div ref={ref} className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-[#e9ece6] ring-1 ring-border dark:bg-[#1a2a23]">
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 400 220" preserveAspectRatio="none">
        <path d="M0 150 C 80 130, 160 170, 240 140 S 360 100, 400 120 L400 220 L0 220Z" fill="#cfe0ea" className="dark:opacity-30" />
        <g stroke="#fff" strokeWidth="6" fill="none" className="dark:opacity-20">
          <path d="M0 70 L400 90" />
          <path d="M120 0 L150 220" />
          <path d="M260 0 L240 220" />
          <path d="M0 190 L400 30" strokeWidth="3" />
        </g>
        <g fill="#d7e6d2" className="dark:opacity-20">
          <rect x="170" y="100" width="50" height="30" rx="6" />
          <rect x="300" y="20" width="60" height="40" rx="6" />
        </g>
      </svg>
      {PINS.map((p, i) => (
        <div key={p.label} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          {i === active && <span className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-lime/50" />}
          <motion.span
            animate={{ scale: i === active ? 1.12 : 1 }}
            className={cn(
              "relative block -translate-x-1/2 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shadow-lift transition-colors",
              i === active ? "bg-forest text-white" : "bg-white text-ink",
            )}
          >
            {p.label}
          </motion.span>
        </div>
      ))}
      <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink shadow-soft">
        <span className="size-3 rounded-[4px] bg-primary" /> Sök när jag flyttar kartan
      </span>
    </div>
  );
}

/* 6. Contact ------------------------------------------------------- */
function ContactDemo() {
  const { ref, tick } = useTicker(1800);
  const phase = tick % 4;
  return (
    <div ref={ref} className="w-full max-w-sm space-y-2.5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-[linear-gradient(135deg,#7BD389,#163A2E)] text-sm font-bold text-white">AL</span>
        <div>
          <p className="text-sm font-semibold">Anna Lindqvist</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-lime" /> Svarar oftast inom 2 h
          </p>
        </div>
      </div>
      <motion.div layout className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
        Hej! Går det att boka visning på torsdag?
      </motion.div>
      <AnimatePresence mode="popLayout">
        {phase >= 1 && phase < 2 && (
          <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-fit gap-1 rounded-2xl bg-muted px-3 py-3">
            {[0, 1, 2].map((d) => (
              <motion.span key={d} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: d * 0.12 }} className="size-1.5 rounded-full bg-foreground/50" />
            ))}
          </motion.div>
        )}
        {phase >= 2 && (
          <motion.div
            key="reply"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 text-sm"
          >
            Absolut! Torsdag kl. 10 fungerar fint 👋
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2 rounded-full bg-muted/60 py-1.5 pr-1.5 pl-4 text-xs text-muted-foreground">
        <span className="flex-1">Skriv ett meddelande…</span>
        <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
          <Send className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

export function FeatureBento() {
  return (
    <section className="mx-auto mt-28 max-w-[1440px] px-4 sm:px-6 lg:mt-36 lg:px-10">
      <SectionHeading
        eyebrow="Allt på ett ställe"
        title="Från första sökning till rätt lokal –"
        italic="på ett ställe."
      />
      <motion.ul
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6"
      >
        <Card title="Filtrera på det som spelar roll" text="Yta, pris, tillträde och egenskaper – se antalet träffar uppdateras direkt." className="lg:col-span-4">
          <FiltersDemo />
        </Card>
        <Card title="Karta i realtid" text="Priser direkt på kartan. Flytta kartan så följer listan med." className="lg:col-span-2 lg:row-span-2">
          <MapDemo />
        </Card>
        <Card title="Spara & jämför" text="Spara favoriter och jämför upp till fyra lokaler sida vid sida." className="lg:col-span-2">
          <SaveCompareDemo />
        </Card>
        <Card title="Bevaka sökningen" text="Få en notis så fort en ny lokal matchar dina krav." className="lg:col-span-2" dark>
          <AlertDemo />
        </Card>
        <Card title="Sök med AI" text="Beskriv behovet med egna ord – vi översätter det till filter." className="lg:col-span-3">
          <AiDemo />
        </Card>
        <Card title="Direktkontakt med annonsör" text="Ställ frågor och boka visning utan mellanhänder." className="lg:col-span-3">
          <ContactDemo />
        </Card>
      </motion.ul>
    </section>
  );
}

