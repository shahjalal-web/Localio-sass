"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Loader2, Sparkles, Wand2 } from "lucide-react";
import { AI_EXAMPLES, type AiChip } from "@/lib/parseAiQuery";
import { cn } from "@/lib/utils";

function useTypewriter(enabled: boolean) {
  const [state, setState] = useState({ i: 0, n: 0, deleting: false });
  useEffect(() => {
    if (!enabled) return;
    const full = AI_EXAMPLES[state.i];
    let delay = state.deleting ? 14 : 38;
    if (!state.deleting && state.n === full.length) delay = 2200;
    if (state.deleting && state.n === 0) delay = 300;
    const t = window.setTimeout(() => {
      setState((s) => {
        const text = AI_EXAMPLES[s.i];
        if (!s.deleting && s.n < text.length) return { ...s, n: s.n + 1 };
        if (!s.deleting) return { ...s, deleting: true };
        if (s.n > 0) return { ...s, n: s.n - 1 };
        return { i: (s.i + 1) % AI_EXAMPLES.length, n: 0, deleting: false };
      });
    }, delay);
    return () => window.clearTimeout(t);
  }, [state, enabled]);
  return AI_EXAMPLES[state.i].slice(0, state.n);
}

export function AiSearchInput({
  onSubmit,
  chips,
  busy,
  compact = false,
  autoFocus = false,
  className,
}: {
  onSubmit: (text: string) => void;
  chips: AiChip[] | null;
  busy: boolean;
  compact?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const typed = useTypewriter(!value && !focused);

  return (
    <div className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onSubmit(value.trim());
        }}
        className={cn(
          "group relative flex items-center gap-3 rounded-2xl border border-dashed bg-gradient-to-r from-mint/70 via-card to-card transition-all",
          "focus-within:border-solid focus-within:border-lime focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--lime)_25%,transparent)]",
          compact ? "px-3 py-2" : "px-4 py-3",
        )}
      >
        <span className="relative grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-lime">
          <Sparkles className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 size-2 animate-ping rounded-full bg-lime" />
        </span>
        <label htmlFor="ai-search" className="sr-only">
          Beskriv vad du behöver
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            id="ai-search"
            value={value}
            autoFocus={autoFocus}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            className="w-full bg-transparent text-sm text-foreground focus:outline-none"
          />
          {!value && (
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm whitespace-nowrap text-muted-foreground">
              <span className="hidden shrink-0 sm:inline">Eller beskriv vad du behöver…&nbsp;</span>
              <span className="sm:hidden">Beskriv…&nbsp;</span>
              <span className="truncate italic">”{typed}</span>
              <span className="ml-px inline-block h-4 w-px animate-pulse bg-foreground/60" />
              <span className="italic">”</span>
            </span>
          )}
        </div>
        <span className="hidden shrink-0 rounded-md border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
          AI
        </span>
        <button
          type="submit"
          aria-label="Tolka med AI"
          disabled={!value.trim() || busy}
          className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-40"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
        </button>
      </form>

      <AnimatePresence>
        {chips && chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-1.5 pt-3" aria-live="polite">
              <span className="mr-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Wand2 className="size-3.5 text-primary" /> AI förstod:
              </span>
              {chips.map((c, i) => (
                <motion.span
                  key={c.key}
                  initial={{ opacity: 0, scale: 0.6, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, type: "spring", stiffness: 500, damping: 26 }}
                  className="relative overflow-hidden rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                >
                  <span className="shimmer-bg absolute inset-0 opacity-70" />
                  <span className="relative">{c.label}</span>
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
