"use client";

import { motion } from "motion/react";
import type { Category } from "@/types/listing";
import { CATEGORIES, type Deal } from "@/lib/filters";
import { CATEGORY_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function CategoryTabs({
  value,
  onChange,
  id = "cat",
  className,
}: {
  value: Category | null;
  onChange: (c: Category) => void;
  id?: string;
  className?: string;
}) {
  const current = value ?? "lokaler";
  return (
    <div role="tablist" aria-label="Kategori" className={cn("no-scrollbar flex gap-1 overflow-x-auto", className)}>
      {CATEGORIES.map((c) => {
        const Icon = CATEGORY_ICONS[c.value];
        const active = current === c.value;
        return (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c.value)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-tab-bg`}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon className="relative size-4" />
            <span className="relative whitespace-nowrap">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function DealToggle({
  value,
  onChange,
  id = "deal",
  className,
}: {
  value: Deal | null;
  onChange: (d: Deal) => void;
  id?: string;
  className?: string;
}) {
  const current = value ?? "hyra";
  return (
    <div role="radiogroup" aria-label="Hyra eller köpa" className={cn("flex rounded-full bg-muted p-1", className)}>
      {(["hyra", "kopa"] as const).map((d) => {
        const active = current === d;
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(d)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-deal-bg`}
                className="absolute inset-0 rounded-full bg-card shadow-soft"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{d === "hyra" ? "Hyra" : "Köpa"}</span>
          </button>
        );
      })}
    </div>
  );
}
