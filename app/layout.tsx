import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DemoBadge } from "@/components/layout/DemoBadge";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Lokalio – Hitta rätt plats för ditt företag",
    template: "%s · Lokalio",
  },
  description:
    "Sök bland lediga kontor, butiker, lager och andra kommersiella lokaler i hela Sverige. Designkoncept av Shah Jalal.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F2ED" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1712" },
  ],
};

const THEME_SCRIPT = `try{if(localStorage.getItem("lokalio:theme")==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className={`${geist.variable} ${instrument.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only z-[100] rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Hoppa till innehåll
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <DemoBadge />
        </Providers>
      </body>
    </html>
  );
}
