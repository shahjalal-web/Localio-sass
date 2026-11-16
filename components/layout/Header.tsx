"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Menu, Moon, Sun, ArrowRight, X } from "lucide-react";
import { notInDemo } from "@/lib/demo";
import { Logo } from "./Logo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { useFavorites, useTheme } from "@/lib/stores";
import { LISTINGS_BY_ID } from "@/lib/data/listings";
import { formatPrice, formatSqm } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Lediga objekt", href: "/lokaler" },
  { label: "För annonsörer", href: "/#annonsorer" },
  { label: "Priser", href: null },
  { label: "Lokalio Connect", href: null },
] as const;

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const transparent = isHome && !scrolled;
  const [hovered, setHovered] = useState<string | null>(null);
  const active = NAV.find((n) => n.href && pathname.startsWith(n.href) && n.href !== "/#annonsorer")?.label ?? null;
  const indicator = hovered ?? active;
  const { theme, toggle } = useTheme();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/70 bg-background/75 shadow-[0_1px_0_rgb(14_26_21/0.02)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-10">
        <Logo inverted={transparent} />

        <nav aria-label="Huvudmeny" className="mx-auto hidden lg:block">
          <ul
            className={cn(
              "flex items-center gap-1 rounded-full p-1 transition-colors",
              transparent ? "bg-white/10 ring-1 ring-white/15 backdrop-blur-md" : "bg-card ring-1 ring-border",
            )}
            onMouseLeave={() => setHovered(null)}
          >
            {NAV.map((item) => {
              const isIndicator = indicator === item.label;
              const cls = cn(
                "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors outline-offset-2",
                transparent
                  ? isIndicator ? "text-ink" : "text-white/85 hover:text-white"
                  : isIndicator ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              );
              const inner = (
                <>
                  {isIndicator && (
                    <motion.span
                      layoutId="nav-indicator"
                      className={cn("absolute inset-0 -z-0 rounded-full", transparent ? "bg-white" : "bg-primary")}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </>
              );
              return (
                <li key={item.label} onMouseEnter={() => setHovered(item.label)}>
                  {item.href ? (
                    <Link href={item.href} className={cls} aria-current={active === item.label ? "page" : undefined}>
                      {inner}
                    </Link>
                  ) : (
                    <button type="button" className={cls} onClick={() => notInDemo(item.label)}>
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Byt till ljust läge" : "Byt till mörkt läge"}
            className={cn(
              "grid size-10 place-items-center rounded-full transition-colors",
              transparent ? "text-white hover:bg-white/15" : "text-foreground hover:bg-muted",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <SavedPopover transparent={transparent} />

          <button
            type="button"
            onClick={() => notInDemo("Inloggning")}
            className={cn(
              "hidden rounded-full px-4 py-2 text-sm font-medium transition-colors md:block",
              transparent ? "text-white hover:bg-white/15" : "text-foreground hover:bg-muted",
            )}
          >
            Logga in
          </button>
          <button
            type="button"
            onClick={() => notInDemo("Registrering")}
            className={cn(
              "group hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] sm:inline-flex",
              transparent ? "bg-white text-ink hover:bg-white/90" : "bg-primary text-primary-foreground hover:bg-primary-hover",
            )}
          >
            Registrera konto
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <MobileMenu transparent={transparent} />
        </div>
      </div>
    </header>
  );
}

function SavedPopover({ transparent }: { transparent: boolean }) {
  const { ids, count, toggle } = useFavorites();
  const items = ids.map((id) => LISTINGS_BY_ID.get(id)).filter((l) => l != null);

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Sparade objekt (${count})`}
        className={cn(
          "relative grid size-10 place-items-center rounded-full transition-colors",
          transparent ? "text-white hover:bg-white/15" : "text-foreground hover:bg-muted",
        )}
      >
        <Heart className="size-[18px]" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              className="tabular absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-ink ring-2 ring-background"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[340px] rounded-2xl p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold">Sparade objekt</p>
          <span className="text-xs text-muted-foreground">{count} st</span>
        </div>
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-mint">
              <Heart className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Inga sparade objekt ännu</p>
            <p className="mt-1 text-xs text-muted-foreground">Tryck på hjärtat på en lokal för att spara den här.</p>
          </div>
        ) : (
          <ul className="max-h-[360px] overflow-y-auto p-2">
            {items.map((l) => (
              <li key={l.id} className="group flex items-center gap-3 rounded-xl p-2 hover:bg-muted">
                <Link href={`/lokaler?objekt=${l.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Image src={l.images[0]} alt="" width={56} height={44} className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{l.address}, {l.city}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {l.type} · {formatSqm(l.sizeSqm)} · {formatPrice(l).main}
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label={`Ta bort ${l.address} från sparade`}
                  onClick={() => toggle(l.id)}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground opacity-60 hover:bg-background hover:text-foreground group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <div className="border-t p-2">
            <Link
              href="/lokaler?sparade=1"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Visa alla sparade <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function MobileMenu({ transparent }: { transparent: boolean }) {
  const { count } = useFavorites();
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Öppna meny"
        className={cn(
          "grid size-10 place-items-center rounded-full transition-colors lg:hidden",
          transparent ? "text-white hover:bg-white/15" : "text-foreground hover:bg-muted",
        )}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 border-0 bg-background p-0 sm:max-w-md">
        <div className="flex h-16 items-center px-5">
          <SheetTitle className="sr-only">Meny</SheetTitle>
          <SheetDescription className="sr-only">Navigering för lokalio</SheetDescription>
          <Logo />
        </div>
        <nav aria-label="Mobilmeny" className="flex flex-1 flex-col px-5 pt-6">
          {NAV.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
            >
              {item.href ? (
                <SheetClose asChild>
                  <Link href={item.href} className="flex items-center justify-between border-b py-5 text-2xl font-semibold tracking-tight">
                    {item.label}
                    <ArrowRight className="size-5 text-muted-foreground" />
                  </Link>
                </SheetClose>
              ) : (
                <button
                  type="button"
                  onClick={() => notInDemo(item.label)}
                  className="flex w-full items-center justify-between border-b py-5 text-left text-2xl font-semibold tracking-tight"
                >
                  {item.label}
                  <ArrowRight className="size-5 text-muted-foreground" />
                </button>
              )}
            </motion.div>
          ))}
          <SheetClose asChild>
            <Link href="/lokaler?sparade=1" className="mt-6 flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
              <span className="grid size-10 place-items-center rounded-full bg-mint">
                <Heart className="size-5 text-primary" />
              </span>
              <span className="flex-1 font-medium">Sparade objekt</span>
              <span className="tabular rounded-full bg-lime px-2.5 py-0.5 text-sm font-bold text-ink">{count}</span>
            </Link>
          </SheetClose>
        </nav>
        <div className="grid gap-2 p-5 pb-8">
          <button type="button" onClick={() => notInDemo("Inloggning")} className="rounded-full py-3.5 font-semibold ring-1 ring-border">
            Logga in
          </button>
          <button type="button" onClick={() => notInDemo("Registrering")} className="rounded-full bg-primary py-3.5 font-semibold text-primary-foreground">
            Registrera konto
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
