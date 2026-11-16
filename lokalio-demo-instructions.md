# Build Instructions: Lokalio Redesign Demo (Homepage + Search Results)

You are building a **high-end, modern demo redesign** of Lokalio (lokalio.se), a Swedish marketplace for commercial premises (offices, retail, warehouses, workshops, properties, land, businesses for sale). This is a **pitch demo for a client**. It must look premium, feel fast and alive, and clearly show a better search UX than the current site. Only the frontend is needed. Use mock data, no backend.

Scope: **2 pages**
1. `/` — Homepage with a much better search experience
2. `/lokaler` — Search results page with **3 switchable layout concepts**

Language of all UI text: **Swedish** (exact copy is given below). Code and comments in English.

---

## 1. Context: what the current site has (and what's wrong with it)

**Current homepage:** full-bleed aerial city photo hero, headline "Hitta rätt plats för ditt företag", subtext "Sök bland lediga kontor, butiker, lager och andra kommersiella lokaler i hela Sverige." Below it a search box with category tabs (Lokaler, Fastigheter, Mark och skog, Företag), then 3 separate fields (Var söker du? / Typ av lokal / Sökord) and 2 equal-weight buttons ("Sök lokaler", "Sök med AI"). Then a features section ("Från första sökning till rätt lokal – på ett ställe.") and a city grid (Jönköping 16, Norrköping 5, Stockholm 3, Malmö 3 lediga objekt…).

**Current results page (/lokaler):** title "Lediga objekt · 40 objekt", one search input, only 2 filters (Kategori, Ort), sort dropdown, "Bevaka sökningen", a large ad banner at the top, a small map, then one very wide horizontal card per row (big image left, text right). Only 24 per page.

**UX problems to solve (mention these in the demo's design notes):**
- Search is split into 3 fields + 2 competing buttons: too much effort before the first result.
- No size (m²) or price filters on the homepage or visibly on the results page.
- AI search is a separate button instead of being part of the main search.
- Results: very low density (about 1.5 listings per screen), the map is disconnected from the list, the ad pushes results down, and there's no way to compare listings.

**Brand to keep (evolve, don't replace):**
- Name/wordmark: `lokalio` (lowercase, bold, geometric sans) with a simple green "L" block icon (build it as an inline SVG; do not hotlink their logo)
- Primary: deep forest green `#163A2E` (hover `#0F2B22`)
- Background: warm off-white `#F4F2ED`
- Surface/cards: `#FFFFFF`
- Soft mint accent: `#E4EFE8`
- Fresh accent for highlights/AI: lime-green `#7BD389` (use sparingly)
- Text: `#0E1A15` / muted `#5B6660`
- Borders: `#E5E2DA`

---

## 2. Tech stack (use exactly this)

- **Next.js 15 (App Router) + TypeScript (strict)**
- **Tailwind CSS v4**
- **shadcn/ui** (Button, Input, Popover, Command, Slider, Select, Sheet, Dialog, Tabs, Toggle Group, Badge, Tooltip, Skeleton, Sonner toasts)
- **Framer Motion** for animation
- **lucide-react** icons
- **react-leaflet + Leaflet** for maps, with **CARTO Positron** tiles (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`, keep attribution). Load the map with `next/dynamic` and `ssr: false`.
- **nuqs** (or plain `useSearchParams`) so all filters live in the URL
- Fonts via `next/font`: **"Inter Tight"** or **"Geist"** for UI, and a display font for big headlines, e.g. **"Instrument Serif"** (italic accents) or **"Space Grotesk"**. Pick one pairing and use it everywhere.
- Images: Unsplash photos of Scandinavian offices, retail, and warehouses via `images.unsplash.com`. Add the domain to `next.config.ts` `images.remotePatterns`. Use `next/image` everywhere.
- Package manager: pnpm. Must deploy to **Vercel** with zero config.

---

## 3. Project structure

```
app/
  layout.tsx            // fonts, metadata (noindex), Toaster, DemoBadge
  page.tsx              // Homepage
  lokaler/page.tsx      // Results
  globals.css
components/
  layout/Header.tsx, Footer.tsx, DemoBadge.tsx, Logo.tsx
  search/SmartSearch.tsx, CategoryTabs.tsx, LocationCombobox.tsx,
         FilterPopovers.tsx, AiSearchInput.tsx, ActiveFilterChips.tsx
  home/Hero.tsx, QuickChips.tsx, StatsStrip.tsx, CityGrid.tsx,
       FeatureBento.tsx, HowItWorks.tsx, CtaAdvertisers.tsx
  results/ResultsToolbar.tsx, LayoutSwitcher.tsx,
          ViewSplitMap.tsx, ViewGrid.tsx, ViewCompare.tsx,
          ListingCard.tsx, ListingRow.tsx, ListingMap.tsx,
          QuickViewSheet.tsx, CompareTray.tsx, EmptyState.tsx, ResultsSkeleton.tsx
lib/
  data/listings.ts      // 36 mock listings
  data/cities.ts
  filters.ts            // filter + sort logic
  parseAiQuery.ts       // fake AI: natural language → filters
  format.ts             // sv-SE number/price formatting
types/listing.ts
```

---

## 4. Mock data

`types/listing.ts`:
```ts
export type Category = "lokaler" | "fastigheter" | "mark-och-skog" | "foretag";
export type PremisesType = "Kontor" | "Butik" | "Lager" | "Logistik" | "Verkstad" | "Restaurang" | "Kontorshotell" | "Showroom";
export type DealType = "Hyra" | "Till salu";
export interface Listing {
  id: string;
  title: string;            // e.g. "Ljust kontor med stort mötesrum i centrala Norrköping"
  address: string;          // "Trädgårdsgatan 12"
  city: string;             // "Norrköping"
  area?: string;            // "Centrum"
  category: Category;
  type: PremisesType;
  deal: DealType;
  sizeSqm: number;
  price: { kind: "perMonth" | "perSqmYear" | "sale" | "onRequest"; amount?: number };
  availableFrom: "now" | string;   // ISO date
  images: string[];         // 3–5 Unsplash URLs
  lat: number; lng: number;
  features: string[];       // "Parkering", "Pentry", "Lastkaj", "Hiss", "Fiber", "Nära kollektivtrafik", "Takhöjd 5 m"
  advertiser: { name: string; logoText: string };
  isFeatured?: boolean;     // "Utvald"
  isNew?: boolean;          // "Ny"
  energyClass?: "A" | "B" | "C" | "D";
}
```

Create **36 realistic listings** spread over Jönköping (~12), Norrköping, Linköping, Stockholm, Göteborg, Malmö, Uppsala, Örebro, with real-looking coordinates and street names. Use these as a base (they match the client's real data style):
- Myrmalmsgatan 2, Örebro, Kontor, 432 m², Pris på förfrågan
- Batterigatan 19, Jönköping, Kontor, 2 229 m², 23 000 kr/mån
- Skiffervägen 4, Jönköping, Butik, 1 250 m², 1 600 kr/m²/år
- Smedjegatan 7, Jönköping, Butik, 268 m², 2 200 kr/m²/år
- Betavägen 17, Jönköping, Lager, 9 801 m²
- Drottninggatan, Norrköping, Butik, 120 m², 2 600 kr/m²/år
- Malmgatan, Norrköping, Logistik, 2 400 m², 850 kr/m²/år
- Sjöfartsgatan 31, Göteborg, Fastighet, 2 460 m², Till salu 78 500 000 kr
- Kvarnbäcksgatan 14, Stockholm, Fastighet, 780 m², 28 500 000 kr

Price formatting (`lib/format.ts`, use `Intl.NumberFormat("sv-SE")`):
- perMonth → `23 000 kr/mån`
- perSqmYear → `1 600 kr/m²/år`, plus a small muted helper line `≈ 166 667 kr/mån`
- sale → `78,5 mkr`
- onRequest → `Pris på förfrågan`

---

## 5. Global elements

**Header** (sticky, glass effect: `backdrop-blur-xl bg-[#F4F2ED]/70`, border appears after scrolling):
- Left: Logo
- Center: pill nav "Lediga objekt · För annonsörer · Priser · Lokalio Connect" with an animated active indicator (Framer `layoutId`)
- Right: heart icon with saved-count badge, "Logga in" (ghost), "Registrera konto" (primary pill)
- On the homepage the header starts transparent with white text over the hero, then turns solid on scroll.
- Mobile: hamburger opens a full-height Sheet.

**DemoBadge:** small floating pill bottom-left: "Designkoncept · by Shah Jalal", dismissible. Add `robots: { index: false }` in metadata.

**Footer:** 4 columns (Sök objekt / För annonsörer / Om oss / Juridiskt), a large "Plats för möjligheter" tagline, newsletter input, and social icons.

---

## 6. Page 1: Homepage `/`

Overall feel: **Airbnb-level search clarity + Linear/Vercel-level polish + Scandinavian calm.** Lots of whitespace, large rounded corners (`rounded-3xl`), soft layered shadows, subtle grain.

### 6.1 Hero (min-h ~ 92vh)
- Full-bleed aerial Swedish city photo with a slow Ken Burns zoom (scale 1 → 1.06 over 20s), a dark-green gradient overlay from bottom-left, and a subtle noise texture.
- Small eyebrow pill with a pulsing dot: "● 1 240 lediga lokaler i hela Sverige just nu"
- Headline (huge, `text-6xl md:text-8xl`, tight tracking), staggered word-by-word reveal:
  "Hitta rätt plats" / "för ditt *företag*" (the last word in italic display font, lime underline drawn in with SVG path animation)
- Subtext: "Sök bland lediga kontor, butiker, lager och andra kommersiella lokaler i hela Sverige."
- **Floating stat cards** on the right (desktop only), slightly rotated glass cards that float gently: "Kontor · Jönköping · 145 m² · Ledig nu", "+12 nya lokaler idag".

### 6.2 SmartSearch (the hero's centerpiece and the most important component)
A large white floating search panel overlapping the bottom of the hero, `rounded-[28px]`, heavy soft shadow.

**Row 1: Category tabs** with an animated sliding background: `Lokaler` (Building2), `Fastigheter` (Landmark), `Mark och skog` (Trees), `Företag` (Briefcase). The deal toggle `Hyra | Köpa` sits at the right.

**Row 2: one unified search bar** (Airbnb style, segments separated by dividers, each segment opens a Popover; the active segment gets a white raised state while the bar background is mint):
1. **Var?** — "Ort, område eller adress". A Command combobox with grouped suggestions (Städer / Områden / Adresser), keyboard navigation, highlighted matches, listing counts per city ("Jönköping · 16 lokaler"), a "📍 Nära mig" option, and recent searches stored in localStorage.
2. **Typ** — multi-select chips grid with icons (Kontor, Butik, Lager, Logistik, Verkstad, Restaurang, Kontorshotell, Showroom).
3. **Yta** — dual-handle slider 0–10 000+ m², with min/max inputs and preset chips ("< 100 m²", "100–300", "300–1 000", "1 000+"). Show a tiny **histogram above the slider** built from the mock data.
4. **Hyra** — price range slider plus a toggle between "kr/mån" and "kr/m²/år".
5. **Search button**: big green circle/pill with a Search icon. It expands into "Sök · 128 träffar" with a **live result count** that animates whenever any filter changes.

**Row 3: AI search, merged in:** below the bar, a slim input with a sparkle icon:
"✨ Eller beskriv vad du behöver… t.ex. *'Ljust kontor för 10 personer nära centralstationen i Jönköping, max 25 000 kr/mån'*"
- Rotating placeholder examples (typewriter effect).
- On submit, `parseAiQuery()` (regex/keyword based) extracts city, type, size (people × 10 m²), max price, and features. Animate the extracted values into the segments above as chips ("Jönköping", "Kontor", "~100 m²", "≤ 25 000 kr/mån", "Nära kollektivtrafik") with a shimmer, then navigate to `/lokaler?...`.

**Row 4: Quick chips** (horizontal scroll on mobile): "Ledigt nu", "Kontor i Stockholm", "Lager nära E4", "Butik i gatuplan", "Kontorshotell", "Under 100 m²".

Behaviour: everything syncs into the URL query when navigating. Pressing `/` focuses search. On mobile the bar collapses into a single "Var vill du söka?" button that opens a **full-screen step-by-step search sheet**.

### 6.3 Stats strip
Four count-up numbers when in view: "1 240+ lediga objekt", "290 kommuner", "850+ annonsörer", "Gratis att söka".

### 6.4 "Populära orter" — city bento grid
Asymmetric bento grid (1 large + 4 small + 2 medium). Each tile: photo (grayscale → color on hover, slight zoom), city name, "16 lediga objekt", and an arrow button that slides on hover. Clicking goes to `/lokaler?ort=jonkoping`.

### 6.5 "Från första sökning till rätt lokal – på ett ställe." — feature bento
Six cards with **mini live UI illustrations built in JSX/CSS (not images)**:
1. **Filtrera på det som spelar roll** — animated filter chips toggling (Kontor, Jönköping, 100–300 m², Ledig nu) and a counter changing.
2. **Spara & jämför** — two mini listing cards with hearts and a compare check.
3. **Bevaka sökningen** — notification bell that rings, with a stacked toast "3 nya lokaler matchar din bevakning".
4. **Sök med AI** — chat bubble turning into filter chips.
5. **Karta i realtid** — mini map with pins pulsing.
6. **Direktkontakt med annonsör** — avatar plus message bubble.

### 6.6 Featured listings carousel
"Utvalda lokaler": horizontal snap carousel of `ListingCard`s with arrow buttons and drag support.

### 6.7 How it works
Three steps with numbered circles connected by an animated line: "Sök" → "Jämför & bevaka" → "Kontakta annonsören".

### 6.8 CTA for advertisers
Dark green rounded section with a large headline "Har du en lokal att hyra ut?", subtext, two buttons ("Annonsera nu", "Se priser"), and a floating mock dashboard card (views graph, leads).

### 6.9 Footer

---

## 7. Page 2: Search results `/lokaler`

Reads all filters from URL params (`ort`, `typ`, `minYta`, `maxYta`, `maxPris`, `deal`, `kategori`, `ledigNu`, `sort`, `vy`).

### 7.1 Top section (sticky under the header)
- **Compact SmartSearch** (the same component in `compact` mode, single row).
- **Filter bar:** pill buttons with popovers: Kategori · Typ · Yta · Pris · Tillträde (Ledigt nu / Inom 3 mån / Valfritt datum) · Egenskaper (Parkering, Lastkaj, Pentry, Hiss, Fiber, Nära kollektivtrafik) · "Alla filter" (opens a right Sheet with every filter and a sticky "Visa 42 objekt" button).
- Active filters are shown as removable chips with an "Rensa alla" link.
- Right side: result count ("42 lediga objekt i Jönköping"), Sort select (Rekommenderade, Nyast, Lägst pris, Högst pris, Minsta yta, Största yta), a **"🔔 Bevaka sökningen"** button (toast: "Bevakning sparad – vi meddelar dig när nya lokaler matchar"), and the **LayoutSwitcher**.

### 7.2 LayoutSwitcher: the client asked for different ideas, so make this prominent
A segmented control with icons and a tooltip describing each concept:
- **A · Karta + lista** (`vy=karta`, default)
- **B · Galleri** (`vy=galleri`)
- **C · Jämför** (`vy=jamfor`)

Also add a small floating **"Designkoncept A / B / C"** pill top-right with a one-line explanation of each concept's idea, so the client understands the reasoning. Switching layouts animates with Framer `AnimatePresence` + `layout` (cards morph smoothly).

### 7.3 Concept A: Split view, map + list (Airbnb/Hemnet style)
- Left 55%: scrollable list of `ListingCard`s in a 2-column grid. Right 45%: sticky full-height map.
- **Two-way hover sync:** hovering a card highlights and lifts its map pin; hovering a pin highlights the card.
- Map pins are **price-tag pills** ("1 600 kr/m²", "23 tkr/mån", "432 m²" when on request). They cluster at low zoom (count bubbles), and the active pin turns dark green.
- **"Sök när jag flyttar kartan"** checkbox on the map; moving the map filters the list by bounds.
- Clicking a pin opens a mini card popup on the map.
- Button to expand the map fullscreen; on mobile a floating "Karta / Lista" toggle button at the bottom.

### 7.4 Concept B: Visual gallery grid
- 3–4 column responsive grid of large, image-first cards (4:3).
- Each card: **image carousel with dots** (swipe and arrows on hover), badges top-left ("Utvald", "Ny", "Ledigt nu"), heart top-right (animated fill + burst), then title, "Kontor · Jönköping, Öster", a key-facts row with icons (📐 268 m² · 💰 2 200 kr/m²/år · 📅 Ledigt nu), and the advertiser name/logo at the bottom.
- The sponsored advertiser card (like NIVIKA) is shown **natively inside the grid** as one card labelled "Annons", not as a huge banner on top.
- Infinite scroll with skeleton cards, plus a "Visa fler" fallback button.
- Above the grid, a horizontal row of "Snabbval" chips by area: Centrum, Öster, Väster, Torsvik, A6…

### 7.5 Concept C: Compact list + compare (for professional users)
- Dense table-like rows: thumbnail · address and title · type · m² · price · kr/m²/år (normalized for every listing) · tillträde · actions (heart, compare checkbox).
- Sortable column headers.
- Selecting 2–4 listings shows a **floating CompareTray** at the bottom with thumbnails and a "Jämför (3)" button. It opens a full-screen Dialog with listings side by side and differences highlighted (best price per m² gets a green "Bäst pris/m²" badge).

### 7.6 Shared results features
- **QuickViewSheet:** clicking a listing opens a right side sheet (bottom sheet on mobile) with an image gallery, key facts grid, description, features, a mini map, and advertiser contact ("Kontakta annonsör" plus "Boka visning" buttons). There is no separate detail page.
- **Favorites** persisted in localStorage, with the count shown in the header.
- **Skeleton loading** (simulate 400 ms) whenever filters change.
- **Empty state:** illustration plus "Inga lokaler matchar just nu", with suggestions ("Ta bort filtret 'Yta'", "Visa närliggande orter: Huskvarna, Tenhult") and a "Bevaka sökningen" button.
- Pagination info: "Visar 1–24 av 42".
- Recently viewed strip at the bottom.

---

## 8. ListingCard spec (used in A and B)
- `rounded-2xl`, white, 1px border, hover: lift (`-translate-y-1`), shadow increase, image zoom 1.05.
- Image area: carousel with dots, gradient at the bottom, badges, heart.
- The content hierarchy must be scannable in 2 seconds:
  1. **Price** (bold, largest) + helper line
  2. **Size m²** + type badge
  3. Title (1 line, truncate)
  4. Address · city (muted, with a MapPin icon)
  5. Up to 3 feature icons (Parkering, Lastkaj, Pentry)
- Fully keyboard accessible (whole card is a link/button, with a focus ring).

---

## 9. Motion & micro-interactions (this is what makes it feel premium)
- Page sections: fade-up + slight blur-to-sharp on scroll into view (`whileInView`, once).
- Staggered children in grids (0.04s).
- Buttons: subtle scale on press (0.97), with an arrow nudge on hover.
- Live counters animate with a number roll.
- Filter chips: spring pop when added, shrink when removed.
- Heart: scale bounce plus a tiny particle burst.
- Search popover: scale-in from origin, 150 ms.
- Respect `prefers-reduced-motion`.
- Smooth scrolling (Lenis is optional).

---

## 10. Responsiveness & quality bar
- Breakpoints: 375, 768, 1024, 1440. Test all of them. No horizontal overflow.
- Mobile-first touches: full-screen search sheet, bottom-sheet filters, sticky "Visa X objekt" button, map/list toggle FAB.
- Accessibility: semantic HTML, labels on all inputs, aria for popovers/sliders, contrast AA, visible focus states.
- Performance: Lighthouse 90+ on Performance, Accessibility, Best Practices. Use `next/image` with `sizes`, lazy-load the map, and keep the bundle lean.
- No console errors and no hydration warnings. `pnpm build` must pass with zero TypeScript errors.
- Optional bonus: dark mode toggle (deep green-black `#0B1712` background).

---

## 11. Build order (follow step by step, verify each before moving on)
1. Scaffold Next.js 15 + TS + Tailwind v4 + shadcn/ui; set up fonts, color tokens (CSS variables), and `next.config.ts` image domains.
2. Types, mock data (36 listings), format helpers, filter/sort logic, `parseAiQuery` (with a few unit-style sanity checks in a script).
3. Header, Footer, Logo, DemoBadge.
4. SmartSearch (full + compact modes) with all popovers, live count, AI input, URL sync. **Spend the most effort here.**
5. Homepage sections in order (6.1 → 6.9).
6. Results page: toolbar, filter bar, chips, sort, LayoutSwitcher.
7. Concept A (map + list with hover sync), then B (gallery), then C (compare).
8. QuickViewSheet, favorites, compare tray, skeletons, empty state, toasts.
9. Motion polish pass, then a mobile pass at 375 px.
10. `pnpm build` and `pnpm lint`, fix everything, then deploy to Vercel.

---

## 12. Acceptance checklist (the demo is done when all are true)
- [ ] Homepage search: user can pick place + type + size + price and see a live count before searching.
- [ ] AI search fills filters visibly from a natural-language sentence.
- [ ] Results page reads/writes all filters from the URL (shareable links).
- [ ] 3 result layouts switch instantly with smooth animation.
- [ ] Map ↔ list hover sync works in concept A.
- [ ] Compare works for 2–4 listings in concept C.
- [ ] Quick view, favorites, save-search toast, and empty state all work.
- [ ] Looks excellent at 375 px and at 1440 px.
- [ ] `pnpm build` passes; deployed on Vercel; noindex; DemoBadge visible.

Design north star: **"A client should open the link and immediately feel this is a premium, modern product and that finding a commercial space has become effortless."** When in doubt, choose more whitespace, clearer hierarchy, and smoother motion.
