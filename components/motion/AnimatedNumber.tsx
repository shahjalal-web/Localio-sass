"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Slot-machine style number roll used for live result counts. */
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(1);
  if (value !== prev) {
    setDir(value > prev ? 1 : -1);
    setPrev(value);
  }
  return (
    <span className={cn("tabular relative inline-flex overflow-hidden align-bottom", className)}>
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.span
          key={value}
          custom={dir}
          initial={{ y: `${dir * 90}%`, opacity: 0, filter: "blur(2px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: `${dir * -90}%`, opacity: 0, filter: "blur(2px)" }}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
          className="inline-block"
        >
          {formatNumber(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Counts up from 0 when scrolled into view. */
export function CountUp({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${formatNumber(v)}${suffix}`);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, mv, to]);
  return (
    <motion.span ref={ref} className={cn("tabular", className)}>
      {text}
    </motion.span>
  );
}
