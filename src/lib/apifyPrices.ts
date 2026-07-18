// lib/apifyPrices.ts

const ACTOR_ID = 'ecomscrape~cloudflare-web-scraper-ppe';
const TOKEN = import.meta.env.VITE_APIFY_TOKEN as string;

export interface ScrapedPrice {
  url: string;
  price: number | null;      // null when parsed as "out of stock" or unreadable
  outOfStock: boolean;
  raw: any;                  // keep the raw dataset item around for debugging
}

function normalizeItem(item: any): ScrapedPrice {
  const url: string =
    item.url ?? item.originalUrl ?? item.startUrl ?? item.pageUrl ?? '';

  // The actor's js_script returns either a numeric-string price, "out of stock", or null.
  // Depending on how the actor names the output field, check the likely candidates.
const rawResult =
  item.result_from_js_script ?? item.result ?? item.jsResult ?? item.pageFunctionResult ?? item.output ?? item.value;

  const outOfStock = typeof rawResult === 'string' && rawResult.toLowerCase().includes('out of stock');
  const price = !outOfStock && rawResult != null && !isNaN(parseFloat(rawResult))
    ? parseFloat(rawResult)
    : null;

  return { url, price, outOfStock, raw: item };
}

/** Fast: reads whatever the last completed run already produced. Free — no new scrape. */
export async function fetchLastRunPrices(): Promise<ScrapedPrice[]> {
  const res = await fetch(
    `https://api.apify.com/v2/actors/${ACTOR_ID}/runs/last/dataset/items?token=${TOKEN}&status=SUCCEEDED&clean=true`
  );
  if (!res.ok) throw new Error(`Apify fetch failed: ${res.status} ${res.statusText}`);
  const items = await res.json();
  return items.map(normalizeItem);
}

/** Slow + costs credits: kicks off a brand new scrape of all 24 URLs and waits for it to finish. */
export async function runFreshScrape(input: unknown): Promise<ScrapedPrice[]> {
  const res = await fetch(
    `https://api.apify.com/v2/actors/${ACTOR_ID}/run-sync-get-dataset-items?token=${TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) throw new Error(`Apify run failed: ${res.status} ${res.statusText}`);
  const items = await res.json();
  return items.map(normalizeItem);
}