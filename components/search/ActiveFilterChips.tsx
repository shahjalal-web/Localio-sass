"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { activeChips, DEFAULT_FILTERS, type Filters } from "@/lib/filters";
import { cn } from "@/lib/utils";

export function ActiveFilterChips({
  filters,
  onChange,
  className,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  className?: string;
}) {
  const chips = activeChips(filters);
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {chips.map((c) => (
          <motion.button
            layout
            key={c.id}
            type="button"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 520, damping: 30 }}
            onClick={() => onChange(c.remove(filters))}
            aria-label={`Ta bort filter ${c.label}`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-primary py-1 pr-1.5 pl-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {c.label}
            <span className="grid size-4 place-items-center rounded-full bg-white/15 transition-colors group-hover:bg-white/30">
              <X className="size-2.5" strokeWidth={3} />
            </span>
          </motion.button>
        ))}
        {chips.length > 1 && (
          <motion.button
            layout
            key="clear-all"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort })}
            className="px-1.5 text-xs font-semibold text-foreground underline underline-offset-4 hover:text-primary"
          >
            Rensa alla
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
