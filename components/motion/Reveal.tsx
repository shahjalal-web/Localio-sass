"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Fade-up + blur-to-sharp when scrolled into view (once). */
export function Reveal({
  delay = 0,
  y = 24,
  children,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};
