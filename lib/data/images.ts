/** Unsplash photo ids (verified). Placeholder imagery for the demo. */
const OFFICE = [
  "1497366216548-37526070297c",
  "1497366811353-6870744d04b2",
  "1497215728101-856f4ea42174",
  "1524758631624-e2822e304c36",
  "1505409859467-3a796fd5798e",
  "1600508774634-4e11d34730e2",
  "1604328698692-f76ea9498e76",
  "1497366754035-f200968a6e72",
  "1462826303086-329426d1aef5",
  "1531973576160-7125cd663d86",
  "1568992687947-868a62a9f521",
  "1504384308090-c894fdcc538d",
  "1606857521015-7f9fcf423740",
  "1527192491265-7e15c55b1ed2",
  "1559136555-9303baea8ebd",
  "1517502884422-41eaead166d4",
  "1577412647305-991150c7d163",
  "1562664377-709f2c337eb2",
  "1564069114553-7215e1ff1890",
];
const WAREHOUSE = [
  "1586528116311-ad8dd3c8310d",
  "1553413077-190dd305871c",
  "1565891741441-64926e441838",
  "1541888946425-d81bb19240f5",
];
const WORKSHOP = ["1581091226825-a6a2a5aee158", "1589939705384-5185137a7f0f", ...WAREHOUSE];
const RETAIL = [
  "1441986300917-64674bd600d8",
  "1528698827591-e19ccd7bc23d",
  "1567401893414-76b7b1e5a7a5",
  "1604719312566-8912e9227c6a",
];
const RESTAURANT = ["1555396273-367ea4eb4db5", "1517248135467-4c7edcad34c4", "1528698827591-e19ccd7bc23d"];
const EXTERIOR = [
  "1487958449943-2429e8be8625",
  "1486406146926-c627a92ad1ab",
  "1545324418-cc1a3fa10c00",
  "1460317442991-0ec209397118",
  "1479839672679-a46483c0e7c8",
  "1523217582562-09d0def993a6",
];
const SHOWROOM = [
  "1600607687939-ce8a6c25118c",
  "1560448204-e02f11c3d0e2",
  "1501183638710-841dd1904471",
  "1513694203232-719a280e022f",
];
const LAND = ["1448375240586-882707db888b", "1470071459604-3b5ec3a7fe05", "1521336575822-6da63fb45455"];

export const POOLS = {
  office: OFFICE,
  warehouse: WAREHOUSE,
  workshop: WORKSHOP,
  retail: RETAIL,
  restaurant: RESTAURANT,
  exterior: EXTERIOR,
  showroom: SHOWROOM,
  land: LAND,
} as const;

export type Pool = keyof typeof POOLS;

export function unsplash(id: string, w = 1200): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
}

/** Deterministically pick n images from a pool, starting at seed, optionally leading with an exterior/other pool. */
export function pick(pool: Pool, seed: number, n = 4, lead?: Pool): string[] {
  const src = POOLS[pool];
  const out: string[] = [];
  if (lead) out.push(POOLS[lead][seed % POOLS[lead].length]);
  for (let i = 0; out.length < n; i++) {
    const id = src[(seed * 3 + i) % src.length];
    if (!out.includes(id)) out.push(id);
    if (i > 40) break;
  }
  return out.map((id) => unsplash(id));
}

export const HERO_IMAGE = unsplash("1509356843151-3e7d96241e11", 2400);

export const CITY_IMAGES: Record<string, string> = {
  jonkoping: unsplash("1491557345352-5929e343eb89", 1400),
  stockholm: unsplash("1508189860359-777d945909ef", 1000),
  goteborg: unsplash("1497217968520-7d8d60b7bc25", 1000),
  malmo: unsplash("1479839672679-a46483c0e7c8", 1000),
  norrkoping: unsplash("1460317442991-0ec209397118", 1000),
  linkoping: unsplash("1523217582562-09d0def993a6", 1000),
  uppsala: unsplash("1487958449943-2429e8be8625", 1000),
  orebro: unsplash("1545324418-cc1a3fa10c00", 1000),
};
