import homeDepotStoreByZip from '../data/homeDepotStoreByZip.json'; // confirm this file exists in System A too — if not, copy it over from EstimateWizard's folder

const HOME_DEPOT_APIFY_ACTOR = 'automation-lab~home-depot-product-scraper';

export interface LiveScrapeResult {
  url: string;
  price: number | null;
  outOfStock: boolean;
}

function normalizeApifyPriceItem(item: any): LiveScrapeResult {
  const url =
    item?.url ?? item?.sourceUrl ?? item?.originalUrl ?? item?.startUrl ?? item?.pageUrl ?? '';

  const rawResult =
    item?.price ??
    item?.currentPrice ??
    item?.priceInfo?.price ??
    item?.pricing?.price ??
    item?.result_from_js_script ??
    item?.result ??
    item?.jsResult ??
    item?.pageFunctionResult ??
    item?.output ??
    item?.value;

  const availabilityText = String(
    item?.availability ?? item?.stockStatus ?? item?.fulfillment ?? '',
  );
  const rawText = rawResult == null ? '' : String(rawResult);
  const outOfStock =
    /out\s*of\s*stock|sold\s*out|unavailable|discontinued/i.test(rawText) ||
    /out\s*of\s*stock|sold\s*out|unavailable|discontinued/i.test(availabilityText);

  const parsed = !outOfStock ? Number.parseFloat(rawText.replace(/[$,]/g, '')) : NaN;

  return { url, price: Number.isFinite(parsed) ? parsed : null, outOfStock };
}

export function getStoreIdForZip(zip: string): string | null {
  return (homeDepotStoreByZip as Record<string, string>)[zip] || null;
}

export async function runHomeDepotActorLive(params: {
  zipcode: string;
  storeId: string;
  productUrls: string[];
}): Promise<LiveScrapeResult[]> {
  const token = import.meta.env.VITE_APIFY_TOKEN as string | undefined;

  const productUrls = [...new Set(params.productUrls.filter(Boolean))];
  if (!productUrls.length) throw new Error('No product URLs to scrape.');

  // Try Cloudflare Pages function first to avoid CORS in production
  try {
    const response = await fetch('/api/apify-scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      const items = Array.isArray(data) ? data : [];
      return items.map(normalizeApifyPriceItem);
    }
    
    console.warn(`Netlify function returned status ${response.status}. Falling back to direct Apify API call.`);
  } catch (err) {
    console.warn('Failed to call Netlify apify-scrape function:', err);
  }

  // Fallback to direct Apify call (requires VITE_APIFY_TOKEN on client side)
  if (!token) throw new Error('VITE_APIFY_TOKEN is missing on client side.');

  // Confirmed field names from a successful manual Apify run:
  // { maxItems, productUrls: [{ url }], storeId, zipCode }
  const actorInput = {
    maxItems: productUrls.length,
    productUrls: productUrls.map((url) => ({ url })),
    storeId: params.storeId,
    zipCode: params.zipcode,
  };

  const response = await fetch(
    `https://api.apify.com/v2/actors/${HOME_DEPOT_APIFY_ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&format=json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actorInput),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Home Depot price lookup failed (${response.status}): ${text || response.statusText}`);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : [];
  return items.map(normalizeApifyPriceItem);
}