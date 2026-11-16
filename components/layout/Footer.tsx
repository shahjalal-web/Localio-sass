import Link from "next/link";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

const COLUMNS = [
  {
    title: "Sök objekt",
    links: [
      { label: "Kontor", href: "/lokaler?typ=kontor" },
      { label: "Butiker", href: "/lokaler?typ=butik" },
      { label: "Lager & logistik", href: "/lokaler?typ=lager,logistik" },
      { label: "Fastigheter", href: "/lokaler?kategori=fastigheter" },
      { label: "Ledigt nu", href: "/lokaler?ledigNu=1" },
    ],
  },
  {
    title: "För annonsörer",
    links: [
      { label: "Annonsera", href: "/#annonsorer" },
      { label: "Priser", href: "/#annonsorer" },
      { label: "Lokalio Connect", href: "/#annonsorer" },
      { label: "Statistik & insikter", href: "/#annonsorer" },
    ],
  },
  {
    title: "Om oss",
    links: [
      { label: "Om Lokalio", href: "/" },
      { label: "Kontakt", href: "/" },
      { label: "Press", href: "/" },
      { label: "Karriär", href: "/" },
    ],
  },
  {
    title: "Juridiskt",
    links: [
      { label: "Användarvillkor", href: "/" },
      { label: "Integritetspolicy", href: "/" },
      { label: "Cookies", href: "/" },
    ],
  },
];

const SOCIAL = [
  {
    label: "LinkedIn",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.5 4.77 5.75V21h-4v-5.3c0-1.27-.02-2.9-1.8-2.9-1.8 0-2.6 1.37-2.6 2.8V21h-4z",
  },
  {
    label: "Instagram",
    path: "M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17.1 5.8a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 3c-2.4 0-2.7 0-3.7.06-3.3.15-5.1 1.97-5.25 5.25C3 9.3 3 9.6 3 12s0 2.7.06 3.7c.15 3.27 1.97 5.1 5.25 5.25 1 .05 1.3.06 3.7.06s2.7 0 3.7-.06c3.27-.15 5.1-1.97 5.24-5.25.05-1 .06-1.3.06-3.7s0-2.7-.06-3.7c-.15-3.27-1.97-5.1-5.24-5.25C14.7 3 14.4 3 12 3z",
  },
  {
    label: "Facebook",
    path: "M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.27 4.3c-2.3 0-3.87 1.4-3.87 3.97v2.23H7.8v3h2.6V21z",
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-forest text-white">
      <div className="noise pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" />
      <div className="relative mx-auto max-w-[1440px] px-4 pt-16 pb-10 sm:px-6 lg:px-10 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <p className="font-display text-5xl leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Plats för <em className="text-lime">möjligheter</em>
            </p>
            <p className="mt-5 max-w-sm text-white/70">
              Få nya lediga lokaler som matchar dina behov direkt i inkorgen. Ett mejl i veckan, inget spam.
            </p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-white">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-white/65 transition-colors hover:text-lime">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/95 px-2 py-1.5">
              <Logo />
            </div>
            <p className="text-sm text-white/55">© 2026 Lokalio AB · Org.nr 559000-0000</p>
          </div>
          <ul className="flex gap-2">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href="#"
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-lime hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
