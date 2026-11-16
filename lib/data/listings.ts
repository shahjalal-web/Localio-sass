import type { Category, DealType, Feature, Listing, PremisesType, PriceKind } from "@/types/listing";
import { pick, type Pool } from "./images";

const ADVERTISERS = {
  vatter: { name: "Vätterstaden Fastigheter", logoText: "VF" },
  ostgota: { name: "Östgöta Lokaler AB", logoText: "ÖL" },
  nordstaden: { name: "Nordstaden Förvaltning", logoText: "NF" },
  hamn: { name: "Hamnkvarteret AB", logoText: "HK" },
  lindqvist: { name: "Lindqvist & Co Fastigheter", logoText: "L&" },
  bergslagen: { name: "Bergslagen Property", logoText: "BP" },
  slott: { name: "Slottsstaden Lokaler", logoText: "SL" },
  kvarn: { name: "Kvarnholmen Fastigheter", logoText: "KF" },
  smaland: { name: "Smålandshem Kommersiellt", logoText: "SK" },
} as const;

type Adv = keyof typeof ADVERTISERS;

interface Seed {
  title: string;
  address: string;
  city: string;
  area?: string;
  category?: Category;
  type: PremisesType;
  deal?: DealType;
  size: number;
  price: [PriceKind, number?];
  available?: string;
  pool: Pool;
  lead?: Pool;
  lat: number;
  lng: number;
  features: Feature[];
  adv: Adv;
  featured?: boolean;
  isNew?: boolean;
  energy?: "A" | "B" | "C" | "D";
  publishedDaysAgo: number;
  blurb?: string;
}

const TYPE_TEXT: Record<PremisesType, string> = {
  Kontor: "Ett ljust och flexibelt kontor med goda möjligheter att anpassa planlösningen efter er verksamhet.",
  Butik: "Butikslokal med stora skyltfönster och ett naturligt kundflöde – perfekt för detaljhandel eller service.",
  Lager: "Rationell lagerlokal med goda in- och utlastningsmöjligheter och smidig access för tunga transporter.",
  Logistik: "Modern logistikyta med strategiskt läge nära större trafikleder och effektiva flöden.",
  Verkstad: "Verkstadslokal med hög takhöjd, port i markplan och kontorsdel – redo för produktion eller service.",
  Restaurang: "Restauranglokal med fullt utrustat kök och genomtänkt matsal i ett läge med många förbipasserande.",
  Kontorshotell: "Färdigmöblerade kontorsrum i ett modernt kontorshotell med delade ytor, reception och mötesrum.",
  Showroom: "Representativ showroom med stora glaspartier och ett exponerat läge som syns från vägen.",
};

const BASE_DATE = new Date("2026-11-16T00:00:00Z").getTime();

function isoDaysAgo(days: number): string {
  return new Date(BASE_DATE - days * 86_400_000).toISOString().slice(0, 10);
}

const seeds: Seed[] = [
  // ---------------- Jönköping (12) ----------------
  {
    title: "Representativt kontorshus med egen parkering vid Munksjön",
    address: "Batterigatan 19", city: "Jönköping", area: "Öster", type: "Kontor",
    size: 2229, price: ["perMonth", 23000], pool: "office", lead: "exterior",
    lat: 57.7838, lng: 14.1832, features: ["Parkering", "Hiss", "Fiber", "Konferensrum"],
    adv: "vatter", featured: true, energy: "B", publishedDaysAgo: 9,
  },
  {
    title: "Stor butikslokal i handelsområde med egen lastkaj",
    address: "Skiffervägen 4", city: "Jönköping", area: "Ljungarum", type: "Butik",
    size: 1250, price: ["perSqmYear", 1600], pool: "retail",
    lat: 57.7556, lng: 14.2061, features: ["Parkering", "Lastkaj", "Skyltläge"],
    adv: "smaland", isNew: true, energy: "C", publishedDaysAgo: 1,
  },
  {
    title: "Charmig butik i gatuplan mitt i city",
    address: "Smedjegatan 7", city: "Jönköping", area: "Centrum", type: "Butik",
    size: 268, price: ["perSqmYear", 2200], pool: "retail",
    lat: 57.7819, lng: 14.1611, features: ["Skyltläge", "Nära kollektivtrafik", "Pentry"],
    adv: "vatter", energy: "C", publishedDaysAgo: 14,
  },
  {
    title: "Lager med 11 portar och hög takhöjd i Torsvik",
    address: "Betavägen 17", city: "Jönköping", area: "Torsvik", type: "Lager",
    size: 9801, price: ["onRequest"], pool: "warehouse", available: "2027-02-01",
    lat: 57.7612, lng: 14.0842, features: ["Lastkaj", "Takhöjd 5 m", "Parkering"],
    adv: "lindqvist", featured: true, energy: "B", publishedDaysAgo: 21,
  },
  {
    title: "Ljust kontor för 10–14 personer nära Resecentrum",
    address: "Västra Storgatan 9", city: "Jönköping", area: "Väster", type: "Kontor",
    size: 145, price: ["perMonth", 19500], pool: "office",
    lat: 57.7806, lng: 14.1548, features: ["Nära kollektivtrafik", "Pentry", "Fiber", "Hiss"],
    adv: "vatter", isNew: true, energy: "A", publishedDaysAgo: 0,
  },
  {
    title: "Flexibla kontorsrum i kontorshotell vid kanalen",
    address: "Kanalgatan 6", city: "Jönköping", area: "Centrum", type: "Kontorshotell",
    size: 110, price: ["perMonth", 14900], pool: "office",
    lat: 57.7831, lng: 14.1667, features: ["Nära kollektivtrafik", "Pentry", "Konferensrum", "Fiber"],
    adv: "kvarn", featured: true, energy: "A", publishedDaysAgo: 4,
  },
  {
    title: "Showroom med skyltläge mot Huskvarnavägen",
    address: "Huskvarnavägen 64", city: "Jönköping", area: "Öster", type: "Showroom",
    size: 520, price: ["perSqmYear", 1150], pool: "showroom", available: "2027-01-01",
    lat: 57.7869, lng: 14.2026, features: ["Parkering", "Skyltläge", "Lastkaj"],
    adv: "smaland", energy: "C", publishedDaysAgo: 18,
  },
  {
    title: "Butikslokal i populära A6 – stort kundflöde",
    address: "Kompanigatan 5", city: "Jönköping", area: "A6", type: "Butik",
    size: 780, price: ["perSqmYear", 1900], pool: "retail",
    lat: 57.7713, lng: 14.2003, features: ["Parkering", "Skyltläge", "Lastkaj"],
    adv: "lindqvist", energy: "B", publishedDaysAgo: 11,
  },
  {
    title: "Verkstad med port och kontorsdel i Huskvarna",
    address: "Drottninggatan 21", city: "Jönköping", area: "Huskvarna", type: "Verkstad",
    size: 640, price: ["perSqmYear", 850], pool: "workshop",
    lat: 57.7896, lng: 14.2754, features: ["Lastkaj", "Takhöjd 5 m", "Parkering"],
    adv: "smaland", energy: "D", publishedDaysAgo: 26,
  },
  {
    title: "Kallager med bra access till riksväg 40",
    address: "Industrigatan 4", city: "Jönköping", area: "Tenhult", type: "Lager",
    size: 1850, price: ["perSqmYear", 690], pool: "warehouse", available: "2026-12-15",
    lat: 57.7043, lng: 14.3218, features: ["Lastkaj", "Takhöjd 5 m"],
    adv: "lindqvist", energy: "D", publishedDaysAgo: 30,
  },
  {
    title: "Restauranglokal med uteservering på Östra Storgatan",
    address: "Östra Storgatan 52", city: "Jönköping", area: "Öster", type: "Restaurang",
    size: 210, price: ["perMonth", 26000], pool: "restaurant",
    lat: 57.7847, lng: 14.1771, features: ["Skyltläge", "Nära kollektivtrafik"],
    adv: "vatter", isNew: true, energy: "C", publishedDaysAgo: 2,
  },
  {
    title: "Kontorsfastighet i kvarteret Klostret – fullt uthyrd",
    address: "Klostergatan 40", city: "Jönköping", area: "Väster", category: "fastigheter", type: "Kontor",
    deal: "Till salu", size: 1380, price: ["sale", 24900000], pool: "exterior", lead: "exterior",
    lat: 57.7787, lng: 14.1489, features: ["Parkering", "Hiss", "Fiber"],
    adv: "kvarn", energy: "B", publishedDaysAgo: 16,
  },

  // ---------------- Norrköping (4) ----------------
  {
    title: "Butik i gatuplan på Drottninggatan",
    address: "Drottninggatan 30", city: "Norrköping", area: "Centrum", type: "Butik",
    size: 120, price: ["perSqmYear", 2600], pool: "retail",
    lat: 58.5905, lng: 16.1846, features: ["Skyltläge", "Nära kollektivtrafik"],
    adv: "ostgota", energy: "C", publishedDaysAgo: 7,
  },
  {
    title: "Logistikyta med direkt anslutning till E4",
    address: "Malmgatan 8", city: "Norrköping", area: "Ingelsta", type: "Logistik",
    size: 2400, price: ["perSqmYear", 850], pool: "warehouse",
    lat: 58.6129, lng: 16.2211, features: ["Lastkaj", "Takhöjd 5 m", "Parkering"],
    adv: "ostgota", featured: true, energy: "B", publishedDaysAgo: 5,
  },
  {
    title: "Ljust kontor med stort mötesrum i centrala Norrköping",
    address: "Trädgårdsgatan 12", city: "Norrköping", area: "Centrum", type: "Kontor",
    size: 186, price: ["perMonth", 21500], pool: "office",
    lat: 58.5874, lng: 16.1902, features: ["Konferensrum", "Pentry", "Hiss", "Nära kollektivtrafik"],
    adv: "ostgota", isNew: true, energy: "A", publishedDaysAgo: 1,
  },
  {
    title: "Kontor i industrilandskapet med utsikt över Motala ström",
    address: "Holmentorget 10", city: "Norrköping", area: "Industrilandskapet", type: "Kontor",
    size: 420, price: ["perSqmYear", 1750], pool: "office", available: "2027-03-01",
    lat: 58.5907, lng: 16.1789, features: ["Fiber", "Hiss", "Pentry"],
    adv: "nordstaden", energy: "B", publishedDaysAgo: 24,
  },

  // ---------------- Linköping (4) ----------------
  {
    title: "Kontor med takterrass på Storgatan",
    address: "Storgatan 40", city: "Linköping", area: "Centrum", type: "Kontor",
    size: 260, price: ["perSqmYear", 1950], pool: "office",
    lat: 58.4101, lng: 15.6236, features: ["Hiss", "Pentry", "Nära kollektivtrafik"],
    adv: "ostgota", energy: "B", publishedDaysAgo: 12,
  },
  {
    title: "Handelslokal i Tornby med stora parkeringsytor",
    address: "Roxtorpsgatan 12", city: "Linköping", area: "Tornby", type: "Butik",
    size: 1100, price: ["perSqmYear", 1350], pool: "retail", available: "2027-01-15",
    lat: 58.4339, lng: 15.5822, features: ["Parkering", "Lastkaj", "Skyltläge"],
    adv: "nordstaden", energy: "C", publishedDaysAgo: 19,
  },
  {
    title: "Tech-kontor i Mjärdevi Science Park",
    address: "Teknikringen 7", city: "Linköping", area: "Mjärdevi", type: "Kontor",
    size: 640, price: ["perSqmYear", 1650], pool: "office",
    lat: 58.3946, lng: 15.5684, features: ["Fiber", "Parkering", "Konferensrum"],
    adv: "ostgota", featured: true, energy: "A", publishedDaysAgo: 6,
  },
  {
    title: "Industritomt 12 000 m² för logistiketablering",
    address: "Gärstadvägen", city: "Linköping", area: "Gärstad", category: "mark-och-skog", type: "Logistik",
    deal: "Till salu", size: 12000, price: ["sale", 6500000], pool: "land", lead: "land",
    lat: 58.4359, lng: 15.6588, features: ["Parkering"],
    adv: "nordstaden", publishedDaysAgo: 33,
  },

  // ---------------- Stockholm (4) ----------------
  {
    title: "Kontorsfastighet i Hammarby sjöstad",
    address: "Kvarnbäcksgatan 14", city: "Stockholm", area: "Hammarby sjöstad", category: "fastigheter", type: "Kontor",
    deal: "Till salu", size: 780, price: ["sale", 28500000], pool: "exterior", lead: "exterior",
    lat: 59.3043, lng: 18.0975, features: ["Hiss", "Fiber", "Nära kollektivtrafik"],
    adv: "hamn", energy: "B", publishedDaysAgo: 10,
  },
  {
    title: "Kontor i sekelskifteshus på Sveavägen",
    address: "Sveavägen 44", city: "Stockholm", area: "Vasastan", type: "Kontor",
    size: 320, price: ["perSqmYear", 4900], pool: "office",
    lat: 59.3393, lng: 18.0601, features: ["Hiss", "Fiber", "Nära kollektivtrafik", "Konferensrum"],
    adv: "hamn", featured: true, energy: "C", publishedDaysAgo: 3,
  },
  {
    title: "Liten butik med högt kundflöde på Götgatan",
    address: "Götgatan 78", city: "Stockholm", area: "Södermalm", type: "Butik",
    size: 95, price: ["perSqmYear", 5200], pool: "retail",
    lat: 59.3122, lng: 18.0739, features: ["Skyltläge", "Nära kollektivtrafik"],
    adv: "hamn", isNew: true, energy: "C", publishedDaysAgo: 0,
  },
  {
    title: "Kontorsrum för 4–6 personer i kontorshotell vid City",
    address: "Kungsgatan 8", city: "Stockholm", area: "Norrmalm", type: "Kontorshotell",
    size: 60, price: ["perMonth", 18500], pool: "office",
    lat: 59.3357, lng: 18.0735, features: ["Nära kollektivtrafik", "Pentry", "Konferensrum", "Fiber"],
    adv: "kvarn", energy: "A", publishedDaysAgo: 8,
  },

  // ---------------- Göteborg (4) ----------------
  {
    title: "Kombinerad kontors- och lagerfastighet på Hisingen",
    address: "Sjöfartsgatan 31", city: "Göteborg", area: "Hisingen", category: "fastigheter", type: "Logistik",
    deal: "Till salu", size: 2460, price: ["sale", 78500000], pool: "warehouse", lead: "exterior",
    lat: 57.7182, lng: 11.9381, features: ["Lastkaj", "Parkering", "Takhöjd 5 m"],
    adv: "lindqvist", featured: true, energy: "B", publishedDaysAgo: 13,
  },
  {
    title: "Restaurang med bar och 120 sittplatser på Avenyn",
    address: "Kungsportsavenyen 21", city: "Göteborg", area: "Centrum", type: "Restaurang",
    size: 340, price: ["perMonth", 45000], pool: "restaurant", available: "2027-04-01",
    lat: 57.7003, lng: 11.9748, features: ["Skyltläge", "Nära kollektivtrafik"],
    adv: "nordstaden", energy: "C", publishedDaysAgo: 22,
  },
  {
    title: "Kontor med älvutsikt på Lindholmen",
    address: "Lindholmspiren 5", city: "Göteborg", area: "Lindholmen", type: "Kontor",
    size: 510, price: ["perSqmYear", 2600], pool: "office",
    lat: 57.7066, lng: 11.9381, features: ["Fiber", "Hiss", "Konferensrum", "Parkering"],
    adv: "hamn", isNew: true, energy: "A", publishedDaysAgo: 2,
  },
  {
    title: "Lager med fyra portar nära hamnen",
    address: "Importgatan 18", city: "Göteborg", area: "Hisingen", type: "Lager",
    size: 3200, price: ["perSqmYear", 780], pool: "warehouse",
    lat: 57.7362, lng: 11.9502, features: ["Lastkaj", "Takhöjd 5 m"],
    adv: "lindqvist", energy: "C", publishedDaysAgo: 28,
  },

  // ---------------- Malmö (3) ----------------
  {
    title: "Butik på Södra Förstadsgatan nära Triangeln",
    address: "Södra Förstadsgatan 26", city: "Malmö", area: "Centrum", type: "Butik",
    size: 180, price: ["perSqmYear", 3100], pool: "retail",
    lat: 55.5965, lng: 13.0011, features: ["Skyltläge", "Nära kollektivtrafik"],
    adv: "slott", energy: "C", publishedDaysAgo: 15,
  },
  {
    title: "Nybyggt kontor i Hyllie vid stationen",
    address: "Hyllie Boulevard 10", city: "Malmö", area: "Hyllie", type: "Kontor",
    size: 900, price: ["perSqmYear", 2400], pool: "office", available: "2027-06-01",
    lat: 55.5634, lng: 12.9759, features: ["Nära kollektivtrafik", "Fiber", "Parkering", "Konferensrum"],
    adv: "slott", featured: true, energy: "A", publishedDaysAgo: 5,
  },
  {
    title: "Välkänt café med inventarier i Västra Hamnen",
    address: "Stapelbäddsgatan 3", city: "Malmö", area: "Västra Hamnen", category: "foretag", type: "Restaurang",
    deal: "Till salu", size: 140, price: ["sale", 1950000], pool: "restaurant",
    lat: 55.6136, lng: 12.9787, features: ["Skyltläge", "Pentry"],
    adv: "slott", isNew: true, publishedDaysAgo: 3,
  },

  // ---------------- Uppsala (2) ----------------
  {
    title: "Kontor i kvarteret Rosenberg på Kungsgatan",
    address: "Kungsgatan 47", city: "Uppsala", area: "Centrum", type: "Kontor",
    size: 230, price: ["perSqmYear", 2300], pool: "office",
    lat: 59.8606, lng: 17.6436, features: ["Nära kollektivtrafik", "Hiss", "Pentry"],
    adv: "bergslagen", energy: "B", publishedDaysAgo: 9,
  },
  {
    title: "Verkstad med två portar i Boländerna",
    address: "Bolandsgatan 15", city: "Uppsala", area: "Boländerna", type: "Verkstad",
    size: 760, price: ["perSqmYear", 950], pool: "workshop", available: "2026-12-01",
    lat: 59.8519, lng: 17.6702, features: ["Lastkaj", "Takhöjd 5 m", "Parkering"],
    adv: "bergslagen", energy: "D", publishedDaysAgo: 17,
  },

  // ---------------- Örebro (3) ----------------
  {
    title: "Kontor i anrik byggnad vid Svartån",
    address: "Myrmalmsgatan 2", city: "Örebro", area: "Centrum", type: "Kontor",
    size: 432, price: ["onRequest"], pool: "office",
    lat: 59.2721, lng: 15.2025, features: ["Hiss", "Pentry", "Nära kollektivtrafik"],
    adv: "bergslagen", energy: "C", publishedDaysAgo: 4,
  },
  {
    title: "Butikslokal på gågatan Drottninggatan",
    address: "Drottninggatan 12", city: "Örebro", area: "Centrum", type: "Butik",
    size: 150, price: ["perSqmYear", 2400], pool: "retail",
    lat: 59.2737, lng: 15.2128, features: ["Skyltläge", "Nära kollektivtrafik"],
    adv: "bergslagen", energy: "C", publishedDaysAgo: 20,
  },
  {
    title: "Logistikterminal i Törsjö – mitt i Sveriges logistiknav",
    address: "Pappersbruksallén 20", city: "Örebro", area: "Törsjö", type: "Logistik",
    size: 12500, price: ["onRequest"], pool: "warehouse", available: "2027-03-01",
    lat: 59.2349, lng: 15.2668, features: ["Lastkaj", "Takhöjd 5 m", "Parkering"],
    adv: "lindqvist", featured: true, energy: "A", publishedDaysAgo: 11,
  },
];

function describe(s: Seed): string {
  const where = s.area ? `${s.area}, ${s.city}` : s.city;
  const feat = s.features.length
    ? ` Lokalen erbjuder bland annat ${s.features.slice(0, 3).map((f) => f.toLowerCase()).join(", ")}.`
    : "";
  return `${TYPE_TEXT[s.type]} Objektet ligger på ${s.address} i ${where} och omfattar ${s.size.toLocaleString("sv-SE")} m².${feat} Kontakta annonsören för planritning och visning.`;
}

export const LISTINGS: Listing[] = seeds.map((s, i) => ({
  id: `lk-${(i + 1).toString().padStart(3, "0")}`,
  title: s.title,
  address: s.address,
  city: s.city,
  area: s.area,
  category: s.category ?? "lokaler",
  type: s.type,
  deal: s.deal ?? "Hyra",
  sizeSqm: s.size,
  price: { kind: s.price[0], amount: s.price[1] },
  availableFrom: s.available ?? "now",
  images: pick(s.pool, i, 4, s.lead),
  lat: s.lat,
  lng: s.lng,
  features: s.features,
  advertiser: ADVERTISERS[s.adv],
  isFeatured: s.featured,
  isNew: s.isNew,
  energyClass: s.energy,
  published: isoDaysAgo(s.publishedDaysAgo),
  description: s.blurb ?? describe(s),
}));

export const LISTINGS_BY_ID = new Map(LISTINGS.map((l) => [l.id, l]));

export const ALL_FEATURES: Feature[] = [
  "Parkering",
  "Lastkaj",
  "Pentry",
  "Hiss",
  "Fiber",
  "Nära kollektivtrafik",
  "Takhöjd 5 m",
  "Skyltläge",
  "Konferensrum",
];

export const ALL_TYPES: PremisesType[] = [
  "Kontor",
  "Butik",
  "Lager",
  "Logistik",
  "Verkstad",
  "Restaurang",
  "Kontorshotell",
  "Showroom",
];
