import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" fill="#163A2E" />
      <path d="M11 8.5h4v11.25h7.5V23.5H11z" fill="#F4F2ED" />
      <circle cx="22.5" cy="10.5" r="2.5" fill="#7BD389" />
    </svg>
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="lokalio – till startsidan"
      className={cn("group inline-flex items-center gap-2 rounded-xl focus-visible:outline-offset-4", className)}
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
      <span
        className={cn(
          "text-[1.4rem] leading-none font-bold tracking-[-0.045em] transition-colors",
          inverted ? "text-white" : "text-foreground",
        )}
      >
        lokalio
      </span>
    </Link>
  );
}
