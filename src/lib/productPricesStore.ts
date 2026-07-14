import { supabase } from './supabase';

export interface ProductPrice {
  url: string;
  price_per_lft: number;
  name?: string;
}

export type ProductPriceMap = Record<string, ProductPrice>;

export async function fetchProductPrices(): Promise<ProductPriceMap> {
  const { data, error } = await supabase.from('product_prices').select('url, price_per_lft, name');
  if (error || !data) return {};
  return Object.fromEntries(data.map(r => [r.url, r as ProductPrice]));
}

/** $/lft for a catalog URL; null = no material price on file. */
export function pricePerLft(map: ProductPriceMap, url: string): number | null {
  const p = map[url];
  return p?.price_per_lft > 0 ? p.price_per_lft : null;
}
