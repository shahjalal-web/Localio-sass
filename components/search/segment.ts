import { cn } from "@/lib/utils";

export type SegmentKey = "var" | "typ" | "yta" | "pris";

/** Shared look for a segment of the unified search bar. */
export function segmentClass(active: boolean, compact: boolean, className?: string) {
  return cn(
    "group/seg relative flex min-w-0 flex-col justify-center rounded-full text-left transition-all duration-200 outline-none",
    compact ? "h-12 px-4" : "h-[68px] px-6",
    active
      ? "z-10 bg-card shadow-lift ring-1 ring-black/[0.04] dark:ring-white/10"
      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.05]",
    "focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );
}

export const segmentLabel = "text-[11px] font-semibold tracking-wide text-foreground uppercase";
export const segmentValue = "truncate text-sm";
