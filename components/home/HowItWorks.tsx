"use client";

import { motion } from "motion/react";
import { Bell, MessageCircle, Search } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { icon: Search, title: "Sök", text: "Välj plats, typ, yta och pris – eller beskriv behovet med egna ord." },
  { icon: Bell, title: "Jämför & bevaka", text: "Spara favoriter, jämför sida vid sida och få notis om nya lokaler." },
  { icon: MessageCircle, title: "Kontakta annonsören", text: "Ställ frågor och boka visning direkt – helt kostnadsfritt." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto mt-28 max-w-[1440px] px-4 sm:px-6 lg:mt-36 lg:px-10">
      <SectionHeading eyebrow="Så fungerar det" title="Tre steg till" italic="rätt lokal" className="md:justify-center md:text-center [&>div]:mx-auto" />
      <div className="relative mt-16">
        {/* connecting line */}
        <svg aria-hidden="true" className="absolute top-8 left-[16.6%] hidden h-1 w-[66.8%] md:block" preserveAspectRatio="none" viewBox="0 0 100 2">
          <line x1="0" y1="1" x2="100" y2="1" stroke="var(--border)" strokeWidth="2" strokeDasharray="2 2" />
          <motion.line
            x1="0"
            y1="1"
            x2="100"
            y2="1"
            stroke="var(--primary)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
          />
        </svg>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.2 + i * 0.35, duration: 0.6 }}
                className="relative flex gap-5 md:flex-col md:items-center md:text-center"
              >
                <span className="relative z-10 grid size-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift ring-8 ring-background">
                  <Icon className="size-6" />
                  <span className="tabular absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-lime text-xs font-bold text-ink">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight md:mt-6">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-muted-foreground">{s.text}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
