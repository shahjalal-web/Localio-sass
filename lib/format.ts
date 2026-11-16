import type { Listing } from "@/types/listing";

const nf = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 1 });

/** Fixed "today" for the demo so server and client render identically. */
export const DEMO_TODAY = new Date("2026-11-16T00:00:00Z");

/** sv-SE formatting with a regular space (Intl uses NBSP, which is fine visually). */
export function formatNumber(n: number): string {
  return nf.format(Math.round(n));
}

export function formatSqm(n: number): string {
  return `${formatNumber(n)} m²`;
}

/** Monthly rent in kr. Undefined when it can't be derived (sale / on request). */
export function monthlyRent(l: Listing): number | undefined {
  const { kind, amount } = l.price;
  if (amount == null) return undefined;
  if (kind === "perMonth") return amount;
  if (kind === "perSqmYear") return (amount * l.sizeSqm) / 12;
  return undefined;
}

/** Normalized rent in kr/m²/år. Undefined for sale / on request. */
export function rentPerSqmYear(l: Listing): number | undefined {
  const { kind, amount } = l.price;
  if (amount == null) return undefined;
  if (kind === "perSqmYear") return amount;
  if (kind === "perMonth") return (amount * 12) / l.sizeSqm;
  return undefined;
}

export function formatPrice(l: Listing): { main: string; helper?: string } {
  const { kind, amount } = l.price;
  switch (kind) {
    case "perMonth":
      return {
        main: `${formatNumber(amount ?? 0)} kr/mån`,
        helper: `≈ ${formatNumber(rentPerSqmYear(l) ?? 0)} kr/m²/år`,
      };
    case "perSqmYear":
      return {
        main: `${formatNumber(amount ?? 0)} kr/m²/år`,
        helper: `≈ ${formatNumber(monthlyRent(l) ?? 0)} kr/mån`,
      };
    case "sale":
      return {
        main: formatMkr(amount ?? 0),
        helper: `≈ ${formatNumber((amount ?? 0) / l.sizeSqm)} kr/m²`,
      };
    default:
      return { main: "Pris på förfrågan" };
  }
}

export function formatMkr(amount: number): string {
  return `${nf1.format(amount / 1_000_000)} mkr`;
}

/** Short label for map price pills. */
export function formatPinLabel(l: Listing): string {
  const { kind, amount } = l.price;
  if (kind === "perSqmYear" && amount) return `${formatNumber(amount)} kr/m²`;
  if (kind === "perMonth" && amount) return `${nf1.format(amount / 1000)} tkr/mån`;
  if (kind === "sale" && amount) return formatMkr(amount);
  return formatSqm(l.sizeSqm);
}

export function isAvailableNow(l: Listing): boolean {
  return l.availableFrom === "now" || new Date(l.availableFrom) <= DEMO_TODAY;
}

const monthFmt = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function formatAvailability(l: Listing): string {
  if (isAvailableNow(l)) return "Ledigt nu";
  return `Från ${monthFmt.format(new Date(l.availableFrom))}`;
}

export function daysSincePublished(l: Listing): number {
  return Math.max(0, Math.round((DEMO_TODAY.getTime() - new Date(l.published).getTime()) / 86_400_000));
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

