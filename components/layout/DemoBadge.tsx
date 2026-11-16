"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, X, Check, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const NOTES = [
  {
    problem: "Sökningen är uppdelad i 3 fält och 2 konkurrerande knappar.",
    solution: "En enda sammanhållen sökrad (Var · Typ · Yta · Hyra) med en tydlig knapp som visar antal träffar live.",
  },
  {
    problem: "Inga filter för storlek (m²) eller pris på startsidan.",
    solution: "Yta och hyra är förstklassiga filter med reglage, snabbval och ett histogram över utbudet.",
  },
  {
    problem: "AI-sök är en separat knapp.",
    solution: "AI är inbyggt i sökningen – beskriv behovet i fritext och se hur filtren fylls i automatiskt.",
  },
  {
    problem: "Låg täthet i resultatet (~1,5 objekt per skärm) och en annons som trycker ned listan.",
    solution: "Tre layoutkoncept (Karta + lista, Galleri, Jämför) med 4–12 objekt per skärm. Annonser visas inbäddat i flödet.",
  },
  {
    problem: "Kartan är frikopplad från listan och det går inte att jämföra objekt.",
    solution: "Tvåvägs-synk mellan karta och lista, prisetiketter på kartan och jämförelse av 2–4 objekt sida vid sida.",
  },
];

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

export function DemoBadge() {
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // On the homepage, wait until the user scrolls so the badge never covers the hero search.
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 160, () => false);
  const show = visible && (pathname !== "/" || scrolled);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: pathname === "/" ? 0 : 1.2 }}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-full bg-ink/90 p-1 pl-1 text-white shadow-float ring-1 ring-white/10 backdrop-blur-md dark:bg-card"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-white/10"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-lime" />
              </span>
              Designkoncept · by Shah Jalal
              <span className="hidden text-white/50 sm:inline">· Designanteckningar</span>
            </button>
            <button
              type="button"
              aria-label="Dölj designkoncept-märket"
              onClick={() => setVisible(false)}
              className="grid size-7 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl p-0 sm:max-w-2xl">
          <div className="relative overflow-hidden rounded-t-3xl bg-forest px-6 pt-8 pb-6 text-white sm:px-8">
            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-lime/20 blur-3xl" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5 text-lime" /> Designanteckningar
            </span>
            <DialogTitle className="mt-4 font-display text-4xl font-normal tracking-tight">
              Varför ser det ut så här?
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-lg text-white/70">
              En klickbar demo av en ny start- och resultatsida för Lokalio. Här är UX-problemen vi löser – och hur.
            </DialogDescription>
          </div>
          <ol className="divide-y px-6 sm:px-8">
            {NOTES.map((n, i) => (
              <li key={i} className="grid gap-2 py-5 sm:grid-cols-[28px_1fr]">
                <span className="tabular grid size-7 place-items-center rounded-full bg-mint text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">{n.problem}</p>
                  <p className="mt-1.5 flex gap-2 font-medium">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {n.solution}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-3 border-t bg-muted/40 px-6 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-muted-foreground">Prova: skriv en mening i AI-fältet eller byt layout på resultatsidan.</p>
            <a
              href="/lokaler?ort=jonkoping"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              Öppna resultatsidan <ArrowRight className="size-4" />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
