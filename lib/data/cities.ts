import { slugify } from "@/lib/format";
import { CITY_IMAGES } from "./images";
import { LISTINGS } from "./listings";

export interface City {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  image: string;
  count: number;
  areas: string[];
  nearby: string[];
  tagline: string;
}

const RAW: Omit<City, "slug" | "count" | "areas" | "image">[] = [
  { name: "Jönköping", lat: 57.7826, lng: 14.1618, zoom: 12, nearby: ["Huskvarna", "Tenhult", "Linköping"], tagline: "Logistiknav vid Vättern" },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686, zoom: 12, nearby: ["Uppsala"], tagline: "Huvudstadens mest eftertraktade lägen" },
  { name: "Göteborg", lat: 57.7089, lng: 11.9746, zoom: 12, nearby: ["Jönköping"], tagline: "Hamn, handel och innovation" },
  { name: "Malmö", lat: 55.605, lng: 13.0038, zoom: 12, nearby: ["Göteborg"], tagline: "Porten mot kontinenten" },
  { name: "Norrköping", lat: 58.5877, lng: 16.1924, zoom: 12, nearby: ["Linköping"], tagline: "Industrihistoria möter nya kontor" },
  { name: "Linköping", lat: 58.4108, lng: 15.6214, zoom: 12, nearby: ["Norrköping", "Jönköping"], tagline: "Tech, forskning och handel" },
  { name: "Uppsala", lat: 59.8586, lng: 17.6389, zoom: 12, nearby: ["Stockholm"], tagline: "Universitetsstad i stark tillväxt" },
  { name: "Örebro", lat: 59.2741, lng: 15.2066, zoom: 12, nearby: ["Linköping", "Uppsala"], tagline: "Mitt i Sveriges logistikcentrum" },
];

export const CITIES: City[] = RAW.map((c) => {
  const slug = slugify(c.name);
  const inCity = LISTINGS.filter((l) => l.city === c.name);
  const areas = Array.from(new Set(inCity.map((l) => l.area).filter((a): a is string => Boolean(a))));
  return { ...c, slug, image: CITY_IMAGES[slug], count: inCity.length, areas };
});

export const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export function cityFromSlug(slug?: string | null): City | undefined {
  return slug ? CITY_BY_SLUG.get(slug) : undefined;
}

/** Areas used for the "Var?" combobox. */
export const AREAS = CITIES.flatMap((c) =>
  c.areas.map((a) => ({
    name: a,
    city: c.name,
    citySlug: c.slug,
    count: LISTINGS.filter((l) => l.city === c.name && l.area === a).length,
  })),
);

/** Addresses used for the "Var?" combobox. */
export const ADDRESSES = LISTINGS.map((l) => ({
  id: l.id,
  address: l.address,
  city: l.city,
  citySlug: slugify(l.city),
}));

export const SWEDEN_CENTER = { lat: 58.6, lng: 15.2, zoom: 6 };
