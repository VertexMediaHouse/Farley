/**
 * Price overrides — same persistence model as question_overrides.
 *
 * Supabase table needed (run once):
 *
 *   create table price_overrides (
 *     id         text primary key default 'main',
 *     rules      jsonb not null default '{}',
 *     updated_at timestamptz default now(),
 *     updated_by uuid references auth.users(id)
 *   );
 *   -- allow any authenticated user to read + write their own org's row:
 *   alter table price_overrides enable row level security;
 *   create policy "auth read"  on price_overrides for select using (auth.role() = 'authenticated');
 *   create policy "auth write" on price_overrides for all    using (auth.role() = 'authenticated');
 */

import type { PricingRule } from './pricing';
import { supabase } from './supabase';

export type PriceOverrideMap = Record<string, PricingRule>;

/** Load saved pricing overrides from Supabase. Returns {} if none saved yet. */
export async function fetchPriceOverrides(): Promise<PriceOverrideMap> {
  const { data, error } = await supabase
    .from('price_overrides')
    .select('rules')
    .eq('id', 'main')
    .single();

  if (error || !data?.rules) return {};
  return data.rules as PriceOverrideMap;
}

/** Persist the full rules map to Supabase (upsert on fixed row "main"). */
export async function savePriceOverrides(rules: PriceOverrideMap): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('price_overrides')
    .upsert({
      id:         'main',
      rules:      rules,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    }, { onConflict: 'id' });

  if (error) throw error;
}
