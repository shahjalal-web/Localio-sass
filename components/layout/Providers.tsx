"use client";

import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={150}>
        {children}
        <Toaster position="bottom-center" richColors={false} closeButton toastOptions={{ classNames: { toast: "!rounded-2xl !shadow-lift" } }} />
      </TooltipProvider>
    </MotionConfig>
  );
}
