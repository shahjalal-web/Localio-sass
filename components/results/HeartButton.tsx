"use client";

import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { favoritesStore, useFavorites } from "@/lib/stores";
import { cn } from "@/lib/utils";

const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return { x: Math.cos(a) * 18, y: Math.sin(a) * 18, c: i % 2 ? "#7BD389" : "#E5484D" };
});

export function HeartButton({
  id,
  label,
  className,
  size = "md",
}: {
  id: string;
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { has } = useFavorites();
  const on = has(id);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      aria-pressed={on}
      aria-label={on ? `Ta bort ${label} från sparade` : `Spara ${label}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = favoritesStore.toggle(id);
        toast(added ? "Sparad i dina favoriter" : "Borttagen från favoriter", {
          description: label,
          action: { label: "Ångra", onClick: () => favoritesStore.toggle(id) },
        });
      }}
      className={cn(
        "relative z-10 grid place-items-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur-md transition-colors hover:bg-white",
        size === "sm" ? "size-8" : "size-9",
        className,
      )}
    >
      <motion.span
        key={on ? "on" : "off"}
        initial={{ scale: on ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 12 }}
        className="grid place-items-center"
      >
        <Heart className={cn(size === "sm" ? "size-4" : "size-[18px]", on && "fill-[#E5484D] text-[#E5484D]")} />
      </motion.span>
      <AnimatePresence>
        {on && (
          <motion.span key="burst" className="pointer-events-none absolute inset-0" initial="a" animate="b" exit={{ opacity: 0 }}>
            {PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2 size-1.5 rounded-full"
                style={{ background: p.c }}
                variants={{
                  a: { x: "-50%", y: "-50%", opacity: 1, scale: 1 },
                  b: { x: `calc(-50% + ${p.x}px)`, y: `calc(-50% + ${p.y}px)`, opacity: 0, scale: 0.4, transition: { duration: 0.55, ease: "easeOut" } },
                }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
