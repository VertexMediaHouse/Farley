export const PRICING = {
  // Drywall
  get drywall() {
    return {
      walls: DRYWALL_RATES['Walls'] || 6.00,
      ceiling: DRYWALL_RATES['Ceiling'] || 8.50,
      bathroomWalls: DRYWALL_RATES['Bathroom Walls'] || 6.00,
      bathroomCeiling: DRYWALL_RATES['Bathroom Ceiling'] || 8.50,
      dividingWall: DIVIDING_WALL_SURCHARGE,
      dividingBathroomWall: DIVIDING_WALL_SURCHARGE,
    };
  },
  
  // Crack Repair
  get crackRepairWall() {
    return {
      baseFee: CRACK_REPAIR_WALL_UNDER_5,
      perExtraLft: CRACK_REPAIR_WALL_EXTRA_LFT,
    };
  },
  get crackRepairCeiling() {
    return {
      baseFee: CRACK_REPAIR_CEILING_UNDER_5,
      perExtraLft: CRACK_REPAIR_CEILING_EXTRA_LFT,
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
      tiers: [
        { maxFt: 8, price: POPCORN_SCRAPING['8ft'] || 2.50 },
        { maxFt: 9, price: POPCORN_SCRAPING['9ft'] || 3.00 },
        { maxFt: 10, price: POPCORN_SCRAPING['10ft'] || 3.50 },
        { maxFt: Infinity, price: POPCORN_SCRAPING['12ft'] || 4.00 },
      ]
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
  get ceilingHeightSurcharge() { return CEILING_HEIGHT_SURCHARGE as Record<string, number>; },

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
        { maxSqft: 350, gallons: 1, baseLabor: 50 },
        { maxSqft: 650, gallons: 2, baseLabor: 100 },
        { maxSqft: Infinity, gallons: 3, baseLabor: 150 }, 
      ],
      linearFtTiers: [
        { maxFt: 400, gallons: 1, baseLabor: 50 },
        { maxFt: Infinity, gallons: 2, baseLabor: 100 },
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
};

export let DIVIDING_WALL_SURCHARGE = 3.00;
export function setDividingWallSurcharge(v: number) { DIVIDING_WALL_SURCHARGE = v; }

// -- Crack Repair flat fees --
export let CRACK_REPAIR_WALL_UNDER_5 = 850;
export function setCrackRepairWallUnder5(v: number) { CRACK_REPAIR_WALL_UNDER_5 = v; }

export let CRACK_REPAIR_CEILING_UNDER_5 = 1200;
export function setCrackRepairCeilingUnder5(v: number) { CRACK_REPAIR_CEILING_UNDER_5 = v; }

// -- Crack Repair per-extra-lft rate (applied to each foot beyond 5 lft) --
export let CRACK_REPAIR_WALL_EXTRA_LFT = 450;
export function setCrackRepairWallExtraLft(v: number) { CRACK_REPAIR_WALL_EXTRA_LFT = v; }

export let CRACK_REPAIR_CEILING_EXTRA_LFT = 450;
export function setCrackRepairCeilingExtraLft(v: number) { CRACK_REPAIR_CEILING_EXTRA_LFT = v; }

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
};

// -- Demolition (linear ft items) --
export const DEMOLITION_LFT: Record<string, number> = {
  'Base board': 1.00,
  'Door casing': 1.00,
};

// -- Popcorn Scraping (keyed by ceiling height) --
export const POPCORN_SCRAPING: Record<string, number> = {
  '8ft': 2.50,
  '9ft': 3.00,
  '10ft': 3.50,
  '12ft': 4.00,
};

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
export const CEILING_HEIGHT_SURCHARGE: Record<string, number> = {
  '9': 7.00,
  '10': 8.00,
  '11': 9.00,
  '12': 10.00,
};

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
