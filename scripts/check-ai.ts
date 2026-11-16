/* Sanity checks for the fake AI parser and filter logic. Run: npx tsx scripts/check-ai.ts */
import { parseAiQuery, AI_EXAMPLES } from "@/lib/parseAiQuery";
import { countListings, DEFAULT_FILTERS, parseFilters, toQuery } from "@/lib/filters";
import { LISTINGS } from "@/lib/data/listings";
import { CITIES } from "@/lib/data/cities";

let failed = 0;
function check(name: string, cond: boolean, info?: unknown) {
  if (!cond) failed++;
  console.log(`${cond ? "✔" : "✘"} ${name}`, cond ? "" : JSON.stringify(info));
}

check("36 listings", LISTINGS.length === 36, LISTINGS.length);
check("Jönköping has 12", CITIES.find((c) => c.slug === "jonkoping")?.count === 12);

const a = parseAiQuery(AI_EXAMPLES[0]);
check("ex1 city", a.filters.ort === "jonkoping", a.filters);
check("ex1 type", a.filters.typ.join() === "Kontor", a.filters.typ);
check("ex1 size", a.filters.minYta === 80 && a.filters.maxYta === 150, a.filters);
check("ex1 price", a.filters.maxPris === 25000 && a.filters.enhet === "man", a.filters);
check("ex1 transit", a.filters.egenskaper.includes("Nära kollektivtrafik"), a.filters.egenskaper);
check("ex1 has results", countListings(LISTINGS, a.filters) >= 1, countListings(LISTINGS, a.filters));

const b = parseAiQuery("Logistik nära E4 i Norrköping, minst 2 000 m²");
check("ex4 minYta", b.filters.minYta === 2000 && b.filters.maxPris == null, b.filters);
check("ex4 results", countListings(LISTINGS, b.filters) >= 1);

const c = parseAiQuery("Butik under 100 m² i Stockholm, ledigt nu");
check("under 100 m² is size not price", c.filters.maxYta === 100 && c.filters.maxPris == null, c.filters);
check("ledigt nu", c.filters.tilltrade === "nu");

const d = parseAiQuery("Företag till salu i Malmö max 2 mkr");
check("no 'tag' false positive", !d.filters.egenskaper.includes("Nära kollektivtrafik"), d.filters.egenskaper);
check("mkr → kopa", d.filters.deal === "kopa" && d.filters.maxPris === 2_000_000, d.filters);

const e = parseAiQuery("blablabla");
check("empty", e.empty);

for (const ex of AI_EXAMPLES) {
  const r = parseAiQuery(ex);
  console.log(`  "${ex}" → ${r.chips.map((x) => x.label).join(" · ")} (${countListings(LISTINGS, r.filters)} träffar)`);
}

const q = toQuery(a.filters, { vy: "karta" });
const back = parseFilters(new URLSearchParams(q));
check("URL roundtrip", JSON.stringify(back) === JSON.stringify(a.filters), { q, back });
check("default count", countListings(LISTINGS, DEFAULT_FILTERS) === 36);

if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log("All checks passed");
