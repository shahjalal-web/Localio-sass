export type Category = "lokaler" | "fastigheter" | "mark-och-skog" | "foretag";

export type PremisesType =
  | "Kontor"
  | "Butik"
  | "Lager"
  | "Logistik"
  | "Verkstad"
  | "Restaurang"
  | "Kontorshotell"
  | "Showroom";

export type DealType = "Hyra" | "Till salu";

export type PriceKind = "perMonth" | "perSqmYear" | "sale" | "onRequest";

export type Feature =
  | "Parkering"
  | "Pentry"
  | "Lastkaj"
  | "Hiss"
  | "Fiber"
  | "Nära kollektivtrafik"
  | "Takhöjd 5 m"
  | "Skyltläge"
  | "Konferensrum";

export interface Listing {
  id: string;
  title: string;
  address: string;
  city: string;
  area?: string;
  category: Category;
  type: PremisesType;
  deal: DealType;
  sizeSqm: number;
  price: { kind: PriceKind; amount?: number };
  /** "now" or ISO date */
  availableFrom: "now" | string;
  images: string[];
  lat: number;
  lng: number;
  features: Feature[];
  advertiser: { name: string; logoText: string };
  isFeatured?: boolean;
  isNew?: boolean;
  energyClass?: "A" | "B" | "C" | "D";
  /** ISO date the ad was published (used for "Nyast" sort) */
  published: string;
  description: string;
}
