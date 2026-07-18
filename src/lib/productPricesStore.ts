import { supabase } from './supabase';
import type { ScrapedPrice } from './apifyPrices';

export interface ProductPrice {
  url: string;
  name: string | null;
  price_per_board: number | null;
  board_length_ft: number;
  waste_pct: number;
  markup_pct: number;
  status: string;
  price_per_lft: number | null; // computed client-side
}

export type ProductPriceMap = Record<string, ProductPrice>;

function computePricePerLft(r: {
  url: string;
  price_per_board: number | null;
  board_length_ft: number;
  waste_pct: number;
  markup_pct: number;
  name: string | null;
}): number | null {
  // User requested: "there should ne be based on length, there should not be any calculation for now"
  // Map the raw price directly.
  return r.price_per_board;
}

export async function fetchProductPrices(): Promise<ProductPriceMap> {
  const { data, error } = await supabase
    .from('product_prices')
    .select('url, name, price_per_board, board_length_ft, waste_pct, markup_pct, status');

  if (error || !data) return {};

  return Object.fromEntries(
    data.map(r => [
      r.url,
      { ...r, price_per_lft: computePricePerLft(r) } as ProductPrice,
    ])
  );
}

/** $/lft for a catalog URL; null = no usable material price on file. */
export function pricePerLft(map: ProductPriceMap, url: string): number | null {
  return map[url]?.price_per_lft ?? null;
}

/** Writes scraped prices from the admin catalog page back into product_prices, matched by url. */
export async function saveScrapedPrices(prices: ScrapedPrice[]): Promise<{ saved: number; failed: string[] }> {
  const now = new Date().toISOString();
  const failed: string[] = [];
  let saved = 0;

  // product_prices.url has no guaranteed unique constraint for upsert, so update row-by-row matched on url.
  await Promise.all(prices.map(async p => {
    const status = p.outOfStock ? 'out_of_stock' : p.price != null ? 'ok' : 'error';
    const patch: Record<string, any> = {
      last_checked_at: now,
      status,
      error_msg: status === 'error' ? 'No price parsed from last scrape' : null,
      updated_at: now,
    };
    if (p.price != null) {
      patch.price_per_board = p.price;
      patch.last_ok_at = now;
    }

    const { error } = await supabase.from('product_prices').update(patch).eq('url', p.url);
    if (error) failed.push(p.url);
    else saved++;
  }));

  return { saved, failed };
}