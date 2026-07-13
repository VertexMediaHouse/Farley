import type { PricingRule } from '../lib/pricing';
import * as P from './pricing';

export function getInitialPricingRules(): Record<string, PricingRule> {
  return {
    'drywall': { shape: 'per_option', prices: { ...P.DRYWALL_RATES } },
    'dividing_wall': { shape: 'flat_if', amount: P.DIVIDING_WALL_SURCHARGE },
    
    'crack_repair_wall_under_5': { shape: 'flat_if', amount: P.CRACK_REPAIR_WALL_UNDER_5 },
    'crack_repair_ceiling_under_5': { shape: 'flat_if', amount: P.CRACK_REPAIR_CEILING_UNDER_5 },
    'crack_repair_wall_lft': { shape: 'per_unit', unit: 'lft', rate: 0, rateByOption: { ...P.CRACK_REPAIR_WALL_LFT } },
    'crack_repair_ceiling_lft': { shape: 'per_unit', unit: 'lft', rate: 0, rateByOption: { ...P.CRACK_REPAIR_CEILING_LFT } },
    
    'floor_surcharge': { shape: 'per_option', prices: { ...P.FLOOR_SURCHARGE } },
    'staircase_fee': { shape: 'flat_if', amount: P.STAIRCASE_FEE },
    
    'demolition_sqft': { shape: 'per_option', prices: { ...P.DEMOLITION_SQFT } },
    'demolition_lft': { shape: 'per_option', prices: { ...P.DEMOLITION_LFT } },
    'popcorn_scraping': { shape: 'per_unit', unit: 'sqft', rate: 0, rateByOption: { ...P.POPCORN_SCRAPING } },
    
    'haul_away_under_50': { shape: 'flat_if', amount: P.HAUL_AWAY_UNDER_50_FLAT },
    'haul_away_above_50': { shape: 'per_unit', unit: 'sqft', rate: P.HAUL_AWAY_ABOVE_50_PER_SQFT },
    
    'insulation_per_sqft': { shape: 'per_unit', unit: 'sqft', rate: P.INSULATION_PER_SQFT },
    
    'corner_metal': { shape: 'per_option', prices: { ...P.CORNER_METAL } },
    'arch_corner_metal': { shape: 'per_unit', unit: 'lft', rate: P.ARCH_CORNER_METAL_PER_LFT },
    
    'texture_rates': { shape: 'per_option', prices: { ...P.TEXTURE_RATES } },
    
    'baseboard_lft': { shape: 'per_unit', unit: 'lft', rate: 0, rateByOption: { ...P.BASEBOARD_LFT } },
    'door_casing_lft': { shape: 'per_unit', unit: 'lft', rate: P.DOOR_CASING_LFT },
    
    'paint_sqft': { shape: 'per_option', prices: { ...P.PAINT_SQFT } },
    'paint_linear': { shape: 'per_option', prices: { ...P.PAINT_LINEAR } },
    'trip_charge': { shape: 'flat_if', amount: P.TRIP_CHARGE },
  };
}

// In order to make primitives mutable, we need to provide a function to update them in pricing.ts.
// For objects like DRYWALL_RATES, we can just use Object.assign.
export function applyPricingRules(rules: Record<string, PricingRule> = {}) {
  if (!rules) return;
  if (rules.drywall?.shape === 'per_option' && rules.drywall.prices) Object.assign(P.DRYWALL_RATES, rules.drywall.prices);
  if (rules.dividing_wall?.shape === 'flat_if' && typeof rules.dividing_wall.amount === 'number') P.setDividingWallSurcharge(rules.dividing_wall.amount);
  
  if (rules.crack_repair_wall_under_5?.shape === 'flat_if' && typeof rules.crack_repair_wall_under_5.amount === 'number') P.setCrackRepairWallUnder5(rules.crack_repair_wall_under_5.amount);
  if (rules.crack_repair_ceiling_under_5?.shape === 'flat_if' && typeof rules.crack_repair_ceiling_under_5.amount === 'number') P.setCrackRepairCeilingUnder5(rules.crack_repair_ceiling_under_5.amount);
  
  if (rules.crack_repair_wall_lft?.shape === 'per_unit' && rules.crack_repair_wall_lft.rateByOption) {
    Object.assign(P.CRACK_REPAIR_WALL_LFT, rules.crack_repair_wall_lft.rateByOption);
  }
  if (rules.crack_repair_ceiling_lft?.shape === 'per_unit' && rules.crack_repair_ceiling_lft.rateByOption) {
    Object.assign(P.CRACK_REPAIR_CEILING_LFT, rules.crack_repair_ceiling_lft.rateByOption);
  }
  
  if (rules.floor_surcharge?.shape === 'per_option' && rules.floor_surcharge.prices) Object.assign(P.FLOOR_SURCHARGE, rules.floor_surcharge.prices);
  if (rules.staircase_fee?.shape === 'flat_if' && typeof rules.staircase_fee.amount === 'number') P.setStaircaseFee(rules.staircase_fee.amount);
  
  if (rules.demolition_sqft?.shape === 'per_option' && rules.demolition_sqft.prices) Object.assign(P.DEMOLITION_SQFT, rules.demolition_sqft.prices);
  if (rules.demolition_lft?.shape === 'per_option' && rules.demolition_lft.prices) Object.assign(P.DEMOLITION_LFT, rules.demolition_lft.prices);
  
  if (rules.popcorn_scraping?.shape === 'per_unit' && rules.popcorn_scraping.rateByOption) {
    Object.assign(P.POPCORN_SCRAPING, rules.popcorn_scraping.rateByOption);
  }
  
  if (rules.haul_away_under_50?.shape === 'flat_if' && typeof rules.haul_away_under_50.amount === 'number') P.setHaulAwayUnder50(rules.haul_away_under_50.amount);
  if (rules.haul_away_above_50?.shape === 'per_unit' && typeof rules.haul_away_above_50.rate === 'number') P.setHaulAwayAbove50(rules.haul_away_above_50.rate);
  
  if (rules.insulation_per_sqft?.shape === 'per_unit' && typeof rules.insulation_per_sqft.rate === 'number') P.setInsulationPerSqft(rules.insulation_per_sqft.rate);
  
  if (rules.corner_metal?.shape === 'per_option' && rules.corner_metal.prices) Object.assign(P.CORNER_METAL, rules.corner_metal.prices);
  if (rules.arch_corner_metal?.shape === 'per_unit' && typeof rules.arch_corner_metal.rate === 'number') P.setArchCornerMetal(rules.arch_corner_metal.rate);
  
  if (rules.texture_rates?.shape === 'per_option' && rules.texture_rates.prices) Object.assign(P.TEXTURE_RATES, rules.texture_rates.prices);
  
  if (rules.baseboard_lft?.shape === 'per_unit' && rules.baseboard_lft.rateByOption) {
    Object.assign(P.BASEBOARD_LFT, rules.baseboard_lft.rateByOption);
  }
  if (rules.door_casing_lft?.shape === 'per_unit' && typeof rules.door_casing_lft.rate === 'number') P.setDoorCasingLft(rules.door_casing_lft.rate);
  
  if (rules.paint_sqft?.shape === 'per_option' && rules.paint_sqft.prices) Object.assign(P.PAINT_SQFT, rules.paint_sqft.prices);
  if (rules.paint_linear?.shape === 'per_option' && rules.paint_linear.prices) Object.assign(P.PAINT_LINEAR, rules.paint_linear.prices);
  
  if (rules.trip_charge?.shape === 'flat_if' && typeof rules.trip_charge.amount === 'number') P.setTripCharge(rules.trip_charge.amount);
}
