"use client";

import { motion } from "motion/react";
import { LayoutGrid, Map as MapIcon, Rows3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ViewKey } from "@/lib/filters";
import { cn } from "@/lib/utils";

export const VIEWS: { key: ViewKey; letter: string; label: string; icon: typeof MapIcon; idea: string }[] = [
  {
    key: "karta",
    letter: "A",
    label: "Karta + lista",
    icon: MapIcon,
    idea: "För den som tänker i läge: kartan och listan är synkade – hovra ett kort så lyser pinnen.",
  },
  {
    key: "galleri",
    letter: "B",
    label: "Galleri",
    icon: LayoutGrid,
    idea: "Bildfokuserat flöde för att snabbt få känsla för lokalerna – annonser smälter in i flödet.",
  },
  {
    key: "jamfor",
    letter: "C",
    label: "Jämför",
    icon: Rows3,
    idea: "Kompakt tabell för proffs: sortera på kr/m²/år och jämför 2–4 lokaler sida vid sida.",
  },
];

export function LayoutSwitcher({ value, onChange }: { value: ViewKey; onChange: (v: ViewKey) => void }) {
  return (
    <div role="radiogroup" aria-label="Välj layout" className="flex shrink-0 items-center rounded-full bg-card p-1 ring-1 ring-border">
      {VIEWS.map((v) => {
        const active = v.key === value;
        const Icon = v.icon;
        return (
          <Tooltip key={v.key}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`Koncept ${v.letter}: ${v.label}`}
                onClick={() => onChange(v.key)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span layoutId="layout-switch" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className={cn("relative grid size-5 place-items-center rounded-full text-[10px] font-bold", active ? "bg-lime text-ink" : "bg-muted")}>
                  {v.letter}
                </span>
                <Icon className="relative size-4 xl:hidden" />
                <span className="relative hidden xl:inline">{v.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px] text-center">
              <strong>Koncept {v.letter} · {v.label}</strong>
              <br />
              {v.idea}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
