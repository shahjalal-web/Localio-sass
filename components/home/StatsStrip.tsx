"use client";

import { CountUp } from "@/components/motion/AnimatedNumber";
import { Reveal } from "@/components/motion/Reveal";

const STATS = [
  { to: 1240, suffix: "+", label: "lediga objekt" },
  { to: 290, suffix: "", label: "kommuner" },
  { to: 850, suffix: "+", label: "annonsörer" },
];

export function StatsStrip() {
  return (
    <section aria-label="Lokalio i siffror" className="mx-auto mt-20 max-w-[1440px] px-4 sm:px-6 lg:mt-28 lg:px-10">
      <Reveal className="grid grid-cols-2 overflow-hidden rounded-3xl bg-card ring-1 ring-border lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col gap-1 p-6 sm:p-8 ${i > 0 ? "lg:border-l" : ""} ${i % 2 === 1 ? "border-l lg:border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""}`}
          >
            <span className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              <CountUp to={s.to} suffix={s.suffix} />
            </span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
        <div className="flex flex-col gap-1 border-t border-l bg-mint p-6 sm:p-8 lg:border-t-0">
          <span className="font-display text-4xl tracking-tight text-primary italic sm:text-5xl">Gratis</span>
          <span className="text-sm text-muted-foreground">att söka – alltid</span>
        </div>
      </Reveal>
    </section>
  );
}
