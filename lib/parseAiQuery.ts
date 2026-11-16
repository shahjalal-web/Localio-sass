import type { Feature, PremisesType } from "@/types/listing";
import { CITIES } from "@/lib/data/cities";
import { DEFAULT_FILTERS, type Filters } from "@/lib/filters";
import { formatNumber, slugify } from "@/lib/format";

export interface AiChip {
  key: string;
  label: string;
}

export interface AiResult {
  filters: Filters;
  chips: AiChip[];
  /** True when nothing could be understood. */
  empty: boolean;
}

const TYPE_WORDS: [RegExp, PremisesType][] = [
  [/kontorshotell|coworking|co-working|kontorsplats/, "Kontorshotell"],
  [/kontor|office|arbetsplats/, "Kontor"],
  [/butik|affar|handel|shop|store|retail/, "Butik"],
  [/logistik|terminal|distribution/, "Logistik"],
  [/lager|warehouse|forrad/, "Lager"],
  [/verkstad|industri|produktion|workshop/, "Verkstad"],
  [/restaurang|\bcafe\b|\bkafe\b|\bkrog\b|\bbar\b/, "Restaurang"],
  [/showroom|utstallning/, "Showroom"],
];

const FEATURE_WORDS: [RegExp, Feature][] = [
  [/parkering|p-plats|parkeringsplats/, "Parkering"],
  [/lastkaj|lastport|lastning/, "Lastkaj"],
  [/pentry|\bkok\b/, "Pentry"],
  [/\bhiss\b/, "Hiss"],
  [/fiber|bredband/, "Fiber"],
  [/centralstation|resecentrum|\bstation|kollektivtrafik|pendel|\btag\b|\bbuss|tunnelbana/, "Nära kollektivtrafik"],
  [/takhojd|hogt i tak/, "Takhöjd 5 m"],
  [/skyltlage|gatuplan|skyltfonster/, "Skyltläge"],
  [/motesrum|konferens/, "Konferensrum"],
];

const EXTRA_PLACES: Record<string, string> = {
  huskvarna: "jonkoping",
  tenhult: "jonkoping",
  gothenburg: "goteborg",
  gbg: "goteborg",
  sthlm: "stockholm",
};

/** Parse "25 000", "25000", "25k", "25 tkr", "1,5 mkr" into kronor. */
function parseAmount(raw: string, suffix?: string): number {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  const s = (suffix ?? "").toLowerCase();
  if (s.startsWith("mkr") || s.startsWith("milj") || s === "m") return n * 1_000_000;
  if (s === "k" || s.startsWith("tkr") || s.startsWith("tusen")) return n * 1000;
  return n;
}

/**
 * Fake "AI": keyword/regex based natural language → filters.
 * Handles Swedish (with or without å/ä/ö) and a bit of English.
 */
export function parseAiQuery(input: string, base: Filters = DEFAULT_FILTERS): AiResult {
  const text = slugify(input).replace(/-/g, " ");
  // Keep a version with digits/spacing intact for number parsing.
  const raw = input.toLowerCase().replace(/ /g, " ");
  const f: Filters = { ...base, typ: [...base.typ], egenskaper: [...base.egenskaper] };
  const chips: AiChip[] = [];

  // --- Deal
  if (/\b(kopa|kop|till salu|for sale|buy)\b/.test(text)) {
    f.deal = "kopa";
    chips.push({ key: "deal", label: "Köpa" });
  } else if (/\b(hyra|hyr|uthyrning|rent)\b/.test(text)) {
    f.deal = "hyra";
  }

  // --- City
  const words = ` ${text} `;
  let city = CITIES.find((c) => words.includes(` ${c.slug.replace(/-/g, " ")} `));
  if (!city) {
    const alias = Object.keys(EXTRA_PLACES).find((a) => words.includes(` ${a} `));
    if (alias) city = CITIES.find((c) => c.slug === EXTRA_PLACES[alias]);
  }
  if (city) {
    f.ort = city.slug;
    chips.push({ key: "ort", label: city.name });
    const area = city.areas.find((a) => words.includes(` ${slugify(a).replace(/-/g, " ")} `));
    if (area) {
      f.omrade = area;
      chips.push({ key: "omrade", label: area });
    }
  }

  // --- Type
  for (const [re, type] of TYPE_WORDS) {
    if (re.test(text) && !f.typ.includes(type)) {
      // "kontorshotell" also matches "kontor" – skip the generic one
      if (type === "Kontor" && f.typ.includes("Kontorshotell")) continue;
      f.typ.push(type);
      chips.push({ key: `typ-${type}`, label: type });
    }
  }

  // --- Size: people → ~10 m² per person
  const people = raw.match(/(\d{1,4})\s*(?:-|–)?\s*(?:\d{1,4}\s*)?(personer|pers|anställda|anstallda|medarbetare|people|platser|arbetsplatser)/);
  const sqm = raw.match(/(minst|över|over|från|fran|max|högst|hogst|under|upp till|ca|cirka|runt)?\s*(\d{1,3}(?:\s\d{3})+|\d+)\s*(m2|m²|kvm|kvadrat|sqm)/);
  if (sqm) {
    const qual = sqm[1] ?? "";
    const n = parseAmount(sqm[2]);
    if (/minst|över|over|från|fran/.test(qual)) {
      f.minYta = n;
      chips.push({ key: "yta", label: `Från ${formatNumber(n)} m²` });
    } else if (/max|högst|hogst|under|upp till/.test(qual)) {
      f.maxYta = n;
      chips.push({ key: "yta", label: `Upp till ${formatNumber(n)} m²` });
    } else {
      f.minYta = Math.round((n * 0.8) / 10) * 10;
      f.maxYta = Math.round((n * 1.3) / 10) * 10;
      chips.push({ key: "yta", label: `~${formatNumber(n)} m²` });
    }
  } else if (people) {
    const n = Number(people[1]);
    const target = n * 10;
    f.minYta = Math.round((target * 0.8) / 10) * 10;
    f.maxYta = Math.round((target * 1.5) / 10) * 10;
    chips.push({ key: "yta", label: `~${formatNumber(target)} m² (${n} pers.)` });
  }

  // --- Price
  const price = raw.match(
    /(max|högst|hogst|under|upp till|budget|mindre än|mindre an|below|<)\s*:?\s*(\d{1,3}(?:[\s.]\d{3})+|\d+(?:,\d+)?)\s*(mkr|miljoner|milj|tkr|tusen|k|kr|:-)?\s*(\/\s*(?:mån|man|månad|manad|month)|i månaden|per månad|\/\s*m²\/år|\/\s*kvm|kr\/m²|per kvm)?(?=[\s,.]|$)/,
  );
  const afterPrice = price ? raw.slice((price.index ?? 0) + price[0].length).trimStart() : "";
  const priceIsReallySize = price && !price[3] && /^(m2|m²|kvm|kvadrat|sqm|pers|anst|medarb)/.test(afterPrice);
  if (price && !priceIsReallySize) {
    const amount = parseAmount(price[2], price[3]);
    const perSqm = /kvm|m²/.test(price[4] ?? "") || /kr\/m²|per kvm/.test(raw);
    if (amount > 0) {
      if (f.deal === "kopa" || /mkr|milj/.test(price[3] ?? "")) {
        f.deal = "kopa";
        f.maxPris = amount;
        chips.push({ key: "pris", label: `≤ ${formatNumber(amount / 1e6)} mkr` });
      } else if (perSqm) {
        f.enhet = "kvm";
        f.maxPris = amount;
        chips.push({ key: "pris", label: `≤ ${formatNumber(amount)} kr/m²/år` });
      } else {
        f.enhet = "man";
        f.maxPris = amount;
        chips.push({ key: "pris", label: `≤ ${formatNumber(amount)} kr/mån` });
      }
    }
  }

  // --- Features
  for (const [re, feat] of FEATURE_WORDS) {
    if (re.test(text) && !f.egenskaper.includes(feat)) {
      f.egenskaper.push(feat);
      chips.push({ key: `eg-${feat}`, label: feat });
    }
  }

  // --- Availability
  if (/(ledig nu|ledigt nu|omgaende|direkt|asap|snarast|tilltrade nu)/.test(text)) {
    f.tilltrade = "nu";
    chips.push({ key: "tilltrade", label: "Ledigt nu" });
  } else if (/(inom 3 manader|inom tre manader|till varen)/.test(text)) {
    f.tilltrade = "3man";
    chips.push({ key: "tilltrade", label: "Inom 3 mån" });
  }

  return { filters: f, chips, empty: chips.length === 0 };
}

export const AI_EXAMPLES = [
  "Ljust kontor för 10 personer nära centralstationen i Jönköping, max 25 000 kr/mån",
  "Lager med lastkaj och hög takhöjd i Göteborg",
  "Butik i gatuplan i Stockholm, ledigt nu",
  "Logistik nära E4 i Norrköping, minst 2 000 m²",
  "Kontorshotell för 5 personer i Stockholm",
];
