export const PRICING = {
  // Drywall
  get drywall() {
    return {
      walls: DRYWALL_RATES['Walls'] || 6.00,
      ceiling: DRYWALL_RATES['Ceiling'] || 8.50,
      bathroomWalls: DRYWALL_RATES['Bathroom Walls'] || 6.00,
      bathroomCeiling: DRYWALL_RATES['Bathroom Ceiling'] || 8.50,
      arch: DRYWALL_RATES['Arch'] || 75.00,
      dividingWall: DIVIDING_WALL_SURCHARGE,
      dividingBathroomWall: DIVIDING_WALL_SURCHARGE,
    };
  },

  // Crack Repair
  get crackRepairWall() {
    return {
      under5: CRACK_REPAIR_WALL_UNDER_5,
      perLft: CRACK_REPAIR_WALL_PER_LFT,
      calc: (lft: number) => calcCrackRepair(lft, 'wall'),
    };
  },
  get crackRepairCeiling() {
    return {
      under5: CRACK_REPAIR_CEILING_UNDER_5,
      perLft: CRACK_REPAIR_CEILING_PER_LFT,
      calc: (lft: number) => calcCrackRepair(lft, 'ceiling'),
    };
  },

  // Floor surcharges (flat fees)
  get floors() { return FLOOR_SURCHARGE as Record<string, number>; },
  get staircase() { return STAIRCASE_FEE; },
  get tripCharge() { return TRIP_CHARGE; },

  // Demolition
  get demolition() {
    return {
      ...DEMOLITION_SQFT,
      ...DEMOLITION_LFT,
    } as Record<string, number>;
  },

  get popcornScraping() {
    return {
      tiers: POPCORN_SCRAPING_TIERS,
      rateFor: (sqft: number) => calcPopcornRate(sqft),
    };
  },

  get haulAway() {
    return {
      baseFeeUnder50: HAUL_AWAY_UNDER_50_FLAT,
      perSqftAbove50: HAUL_AWAY_ABOVE_50_PER_SQFT,
    };
  },

  // Insulation
  get insulation() {
    return {
      'Wall Insulation (R13)': { price: INSULATION_PER_SQFT, minSqft: 50 },
      'Ceiling Insulation (R19)': { price: INSULATION_PER_SQFT, minSqft: 40 },
    } as Record<string, { price: number, minSqft: number }>;
  },

  // Corner Metal
  get cornerMetal() {
    return {
      ...CORNER_METAL,
      arch90: ARCH_CORNER_METAL_PER_LFT,
      archBullnose: ARCH_CORNER_METAL_PER_LFT,
    } as Record<string, number>;
  },

  // Ceiling Height Surcharge (per sqft, keyed by height in ft)
  get ceilingHeightSurcharge() {
    return {
      tiers: CEILING_HEIGHT_TIERS,
      rateFor: (ft: number) => calcCeilingHeightRate(ft),
    };
  },
  // Texture
  get texture() { return TEXTURE_RATES as Record<string, number>; },

  // Trim
  get trim() {
    return {
      baseboard: BASEBOARD_LFT as Record<string, number>,
      doorCasing: DOOR_CASING_LFT,
    };
  },

  // Paint
  get paint() {
    return {
      gallonPrice: 45, // Behr paint
      wallsCeiling: PAINT_SQFT['Room Walls'] || 9.00,
      doorCasing: PAINT_LINEAR['Door Casing'] || 5.00,
      baseboard: PAINT_LINEAR['Baseboards'] || 5.00,

      sqftTiers: [
        { maxSqft: 350, gallons: 1, baseLabor: PAINT_SQFT_TIERS['350 or less (1 gal)'] },
        { maxSqft: 650, gallons: 2, baseLabor: PAINT_SQFT_TIERS['above 350 (2 gal)'] },
        { maxSqft: Infinity, gallons: 3, baseLabor: PAINT_SQFT_TIERS['above 650 (3 gal)'] },
      ],
      linearFtTiers: [
        { maxFt: 400, gallons: 1, baseLabor: PAINT_LINEAR_TIERS['400 or less (1 gal)'] },
        { maxFt: Infinity, gallons: 2, baseLabor: PAINT_LINEAR_TIERS['above 400 (2 gal)'] },
      ]
    };
  }
};

// ============================================================
// Individual named exports for pricingMapper.ts (admin editor)
// Objects are mutable (Object.assign); primitives use let + setter.
// ============================================================

// -- Drywall base rates (per sqft, keyed by repair-type dropdown value) --
export const DRYWALL_RATES: Record<string, number> = {
  'Walls': 6.00,
  'Ceiling': 8.50,
  'Bathroom Walls': 6.00,
  'Bathroom Ceiling': 8.50,
  'Arch': 75.00,
};

export let DIVIDING_WALL_SURCHARGE = 3.00;
export function setDividingWallSurcharge(v: number) { DIVIDING_WALL_SURCHARGE = v; }

// -- Crack Repair Wall --
// Under 5ft: flat fee. Above 5ft: per-lft rate keyed by crack length.
export let CRACK_REPAIR_WALL_UNDER_5 = 850;
export function setCrackRepairWallUnder5(v: number) { CRACK_REPAIR_WALL_UNDER_5 = v; }

export const CRACK_REPAIR_WALL_PER_LFT: Record<string, number> = {
  '5-8': 50,
  '9': 60,
  '10': 70,
  '12': 75,
};

// -- Crack Repair Ceiling --
export let CRACK_REPAIR_CEILING_UNDER_5 = 1200;
export function setCrackRepairCeilingUnder5(v: number) { CRACK_REPAIR_CEILING_UNDER_5 = v; }

export const CRACK_REPAIR_CEILING_PER_LFT: Record<string, number> = {
  '5-8': 75,
  '9': 80,
  '10': 85,
  '11': 90,
  '12': 95,
};

// Helper: get the per-lft rate for a given crack length
function getCrackPerLftRate(lft: number, rates: Record<string, number>): number {
  if (lft <= 8) return rates['5-8'] ?? 0;
  if (lft <= 9) return rates['9'] ?? 0;
  if (lft <= 10) return rates['10'] ?? 0;
  if (lft <= 11) return rates['11'] ?? rates['10'] ?? 0;
  return rates['12'] ?? 0;
}

export function calcCrackRepair(lft: number, kind: 'wall' | 'ceiling'): { total: number; rate: number; isFlat: boolean } {
  if (!(lft > 0)) return { total: 0, rate: 0, isFlat: true };
  if (lft <= 5) {
    const flat = kind === 'wall' ? CRACK_REPAIR_WALL_UNDER_5 : CRACK_REPAIR_CEILING_UNDER_5;
    return { total: flat, rate: 0, isFlat: true };
  }
  const rates = kind === 'wall' ? CRACK_REPAIR_WALL_PER_LFT : CRACK_REPAIR_CEILING_PER_LFT;
  const rate = getCrackPerLftRate(lft, rates);
  return { total: lft * rate, rate, isFlat: false };
}

// -- Floor surcharges --
export const FLOOR_SURCHARGE: Record<string, number> = {
  'First Floor': 0,
  'Second Floor': 350,
  'Third Floor+': 550,
  'Basement': 350,
  'Garage': 0,
};

export let STAIRCASE_FEE = 450;
export function setStaircaseFee(v: number) { STAIRCASE_FEE = v; }

// -- Demolition (sqft items) --
export const DEMOLITION_SQFT: Record<string, number> = {
  'Remove Existing Wall Drywall': 1.50,
  'Remove Existing Ceiling Drywall': 2.50,
  'Remove Existing wall Insulation': 1.50,
  'Remove existing ceiling Insulation': 2.00,
  'Wallpaper Removal': 5.20,
};

// -- Demolition (linear ft items) --
export const DEMOLITION_LFT: Record<string, number> = {
  'Base board': 1.00,
  'Door casing': 1.00,
};

// -- Popcorn Scraping: per-sqft rate by total area --
export const POPCORN_SCRAPING_TIERS: Array<{ maxSqft: number; price: number }> = [
  { maxSqft: 100, price: 2.50 },
  { maxSqft: 250, price: 3.00 },
  { maxSqft: 500, price: 3.50 },
  { maxSqft: Infinity, price: 4.00 },
];

export function calcPopcornRate(sqft: number): number {
  if (!(sqft > 0)) return 0;
  const tier = POPCORN_SCRAPING_TIERS.find(t => sqft <= t.maxSqft)!;
  return tier.price;
}

// -- Haul Away --
export let HAUL_AWAY_UNDER_50_FLAT = 350.00;
export function setHaulAwayUnder50(v: number) { HAUL_AWAY_UNDER_50_FLAT = v; }

export let HAUL_AWAY_ABOVE_50_PER_SQFT = 2.50;
export function setHaulAwayAbove50(v: number) { HAUL_AWAY_ABOVE_50_PER_SQFT = v; }

// -- Insulation --
export let INSULATION_PER_SQFT = 3.50;
export function setInsulationPerSqft(v: number) { INSULATION_PER_SQFT = v; }

// -- Corner Metal (keyed by dropdown value) --
export const CORNER_METAL: Record<string, number> = {
  'Standard 90 degree corner metal 8ft': 100,
  'Standard 90 degree corner metal 10ft': 125,
  'Bullnose corner metal 8ft': 125,
  'Bullnose corner metal 10ft': 150,
};

export let ARCH_CORNER_METAL_PER_LFT = 75;
export function setArchCornerMetal(v: number) { ARCH_CORNER_METAL_PER_LFT = v; }

// -- Ceiling Height Surcharge (per sqft, keyed by ceiling height in ft) --
// -- Ceiling Height Surcharge: per-sqft rate by ceiling height --
export const CEILING_HEIGHT_TIERS: Array<{ maxFt: number; price: number }> = [
  { maxFt: 9, price: 7.00 },
  { maxFt: 10, price: 8.00 },
  { maxFt: 11, price: 9.00 },
  { maxFt: Infinity, price: 10.00 },
];

export function calcCeilingHeightRate(ft: number): number {
  if (!(ft > 8)) return 0;
  const tier = CEILING_HEIGHT_TIERS.find(t => ft <= t.maxFt)!;
  return tier.price;
}

// -- Texture / Finish --
export const TEXTURE_RATES: Record<string, number> = {
  'Smooth Finish level 4': 12,
  'Level 5 finish': 15,
  'Orange Peel': 10,
  'Knockdown': 12,
};

// -- Trim: Baseboard (keyed by height in inches) --
export const BASEBOARD_LFT: Record<string, number> = {
  '6': 5.00,
  '7': 6.00,
  '8': 6.50,
  '9': 7.00,
  '10': 7.50,
};

export let DOOR_CASING_LFT = 7.00;
export function setDoorCasingLft(v: number) { DOOR_CASING_LFT = v; }

// -- Paint (per sqft, keyed by paint area dropdown value) --
export const PAINT_SQFT: Record<string, number> = {
  'Room Walls': 9.00,
  'Ceiling': 9.00,
  'Bathroom Walls': 9.00,
  'Bathroom Ceiling': 9.00,
};

// -- Paint (per linear ft, keyed by paint area dropdown value) --
export const PAINT_LINEAR: Record<string, number> = {
  'Baseboards': 5.00,
  'Door Casing': 5.00,
};

// -- Trip Charge --
export let TRIP_CHARGE = 75;
export function setTripCharge(v: number) { TRIP_CHARGE = v; }

// -- Paint gallon tiers (base labor per gallon, keyed by tier label) --
export const PAINT_SQFT_TIERS: Record<string, number> = {
  '350 or less (1 gal)': 50,
  'above 350 (2 gal)': 100,
  'above 650 (3 gal)': 150,
};

export const PAINT_LINEAR_TIERS: Record<string, number> = {
  '400 or less (1 gal)': 50,
  'above 400 (2 gal)': 100,
};

