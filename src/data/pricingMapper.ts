import type { PricingRule } from '../lib/pricing';
import * as P from './pricing';

type Rate = keyof typeof P.RATES;

// Every admin-editable rule, in display order, and the pricing.ts value it edits in place.
type Source =
  | { flat: Rate }                                                   // flat_if → RATES[flat]
  | { rate: Rate; unit: string }                                     // per_unit → RATES[rate]
  | { prices: Record<string, number> }                               // per_option → object
  | { byOption: Record<string, number>; unit: string }               // per_unit rateByOption → object
  | { tiers: Record<string, number>[]; tierKey: string; unit: string }; // per_unit rateByOption → tier prices

const SOURCES: Record<string, Source> = {
  drywall: { prices: P.DRYWALL_RATES },
  dividing_wall: { flat: 'DIVIDING_WALL_SURCHARGE' },

  crack_repair_wall_under_5: { flat: 'CRACK_REPAIR_WALL_UNDER_5' },
  crack_repair_ceiling_under_5: { flat: 'CRACK_REPAIR_CEILING_UNDER_5' },
  crack_repair_wall_extra_lft: { prices: P.CRACK_REPAIR_WALL_PER_LFT },
  crack_repair_ceiling_extra_lft: { prices: P.CRACK_REPAIR_CEILING_PER_LFT },

  floor_surcharge: { prices: P.FLOOR_SURCHARGE },
  staircase_fee: { flat: 'STAIRCASE_FEE' },

  ceiling_height_surcharge: { tiers: P.CEILING_HEIGHT_TIERS, tierKey: 'maxFt', unit: 'sqft' },

  demolition_sqft: { prices: P.DEMOLITION_SQFT },
  demolition_lft: { prices: P.DEMOLITION_LFT },
  popcorn_scraping: { tiers: P.POPCORN_SCRAPING_TIERS, tierKey: 'maxSqft', unit: 'sqft' },
  haul_away_under_50: { flat: 'HAUL_AWAY_UNDER_50_FLAT' },
  haul_away_above_50: { rate: 'HAUL_AWAY_ABOVE_50_PER_SQFT', unit: 'sqft' },

  insulation_per_sqft: { rate: 'INSULATION_PER_SQFT', unit: 'sqft' },

  corner_metal: { prices: P.CORNER_METAL },
  arch_corner_metal: { rate: 'ARCH_CORNER_METAL_PER_LFT', unit: 'lft' },

  texture_rates: { prices: P.TEXTURE_RATES },

  baseboard_lft: { byOption: P.BASEBOARD_LFT, unit: 'lft' },
  door_casing_lft: { rate: 'DOOR_CASING_LFT', unit: 'lft' },

  paint_sqft: { prices: P.PAINT_SQFT },
  paint_linear: { prices: P.PAINT_LINEAR },

  paint_sqft_tiers: { prices: P.PAINT_SQFT_TIERS },
  paint_linear_tiers: { prices: P.PAINT_LINEAR_TIERS },

  trip_charge: { flat: 'TRIP_CHARGE' },
};

function toRule(s: Source): PricingRule {
  if ('flat' in s) return { shape: 'flat_if', amount: P.RATES[s.flat] };
  if ('rate' in s) return { shape: 'per_unit', unit: s.unit, rate: P.RATES[s.rate] };
  if ('prices' in s) return { shape: 'per_option', prices: { ...s.prices } };
  if ('byOption' in s) return { shape: 'per_unit', unit: s.unit, rate: 0, rateByOption: { ...s.byOption } };
  return { shape: 'per_unit', unit: s.unit, rate: 0, rateByOption: Object.fromEntries(s.tiers.map(t => [String(t[s.tierKey]), t.price])) };
}

export function getInitialPricingRules(): Record<string, PricingRule> {
  return Object.fromEntries(Object.entries(SOURCES).map(([id, s]) => [id, toRule(s)]));
}

export function applyPricingRules(rules: Record<string, PricingRule> = {}) {
  if (!rules) return;
  for (const [id, s] of Object.entries(SOURCES)) {
    const r = rules[id];
    if ('flat' in s) {
      if (r?.shape === 'flat_if' && typeof r.amount === 'number') P.RATES[s.flat] = r.amount;
    } else if ('rate' in s) {
      if (r?.shape === 'per_unit' && typeof r.rate === 'number') P.RATES[s.rate] = r.rate;
    } else if ('prices' in s) {
      if (r?.shape === 'per_option' && r.prices) Object.assign(s.prices, r.prices);
    } else if (r?.shape === 'per_unit' && r.rateByOption) {
      if ('byOption' in s) Object.assign(s.byOption, r.rateByOption);
      else for (const t of s.tiers) {
        const v = r.rateByOption[String(t[s.tierKey])];
        if (typeof v === 'number') t.price = v;
      }
    }
  }
}
