"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Building, Building2, Clock, Ruler, Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export const QUICK_CHIPS = [
  { label: "Ledigt nu", href: "/lokaler?ledigNu=1", icon: Clock },
  { label: "Kontor i Stockholm", href: "/lokaler?ort=stockholm&typ=kontor", icon: Building2 },
  { label: "Lager nära E4", href: "/lokaler?typ=lager,logistik", icon: Truck },
  { label: "Butik i gatuplan", href: "/lokaler?typ=butik&egenskaper=skyltlage", icon: Store },
  { label: "Kontorshotell", href: "/lokaler?typ=kontorshotell", icon: Building },
  { label: "Under 100 m²", href: "/lokaler?maxYta=100", icon: Ruler },
];

export function QuickChips({ className, tone = "light" }: { className?: string; tone?: "light" | "card" }) {
  return (
    <div className={cn("relative", className)}>
      <ul className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
        <li className="flex shrink-0 items-center pr-1 text-xs font-medium text-muted-foreground">Populärt:</li>
        {QUICK_CHIPS.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.li
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.05 }}
              className="shrink-0"
            >
              <Link
                href={c.href}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-soft active:scale-[0.97]",
                  tone === "card" ? "bg-card" : "bg-background",
                )}
              >
                <Icon className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                {c.label}
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
