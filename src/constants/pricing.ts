export const LABOR_PRICING = {
  DRYWALL: {
    CEILING_ORANGE_PEEL: 25.00, // per sqft
    WALL_ORANGE_PEEL: 22.00,    // per sqft
    CEILING_SMOOTH: 27.00,      // per sqft (Level 4 Smooth)
    WALL_SMOOTH: 25.00,         // per sqft (Level 4 Smooth)
    POPCORN_SCRAPING: 2.50,     // per sqft
    SKIM_COAT_L4: 4.50,         // per sqft
    HOLE_REPAIRS_CLEANUP: 3.00, // per sqft
  },
  PAINT: {
    PRIMER_AND_PAINT: 5.00,     // per sqft
    PRIMER_ONLY: 5.00,          // per sqft
    TRIM_PAINTING: 10.00,       // per linear ft
  },
  TRIM: {
    BASEBOARD_INSTALL: 5.00,    // per linear ft
    CROWN_MOLDING_INSTALL: 7.00 // per linear ft
  },
  ELECTRICAL: {
    BATHROOM_FAN: 250.00,       // each
    LED_CAN_LIGHT: 220.00,      // each (4"/6" can lights)
    SURFACE_MOUNT_LIGHT: 150.00 // each
  }
};

export const MATERIAL_PRICING = {
  INSULATION: {
    R19_BUNDLE: 100.00,         // per bundle
    R13_ROLL: 30.00,            // per roll
  },
  DRYWALL: {
    SHEET_5_8: 20.00,           // each
    SHEET_1_2_LIGHTWEIGHT: 16.00, // each
    SHEET_GREEN_BOARD: 18.50,   // each
  },
  FRAMING: {
    STUD_2X4X8: 4.50,           // each
    STUD_2X4X10: 7.50,          // each
  },
  SUPPLIES: {
    SCREWS_5LB: 25.98,
    SCREWS_25LB: 49.98,
    BULLNOSE_CORNER_BEAD: 11.00,
    JOINT_COMPOUND: 17.00,
    TOPPING_MUD: 17.00,
    HOT_MUD_20: 18.00,
    HOT_MUD_40: 16.00,
    CORNER_BEAD_8FT: 5.00,
    CORNER_BEAD_10FT: 6.50,
    JOINT_TAPE: 5.00,
    FIBER_TAPE: 16.00,
    TEXTURE_BUCKET: 65.00,
    KILZ_PRIMER_2GAL: 35.00,
  }
};

export const ADDITIONAL_CHARGES = {
  HAUL_AWAY: 300.00,
  STORE_TRIP: 100.00,
  PAINT_TRIP: 75.00,
  BASE_SERVICE_FEE: 750.00, // Fixed additional charge at every order
};

// ========================================
// MATERIAL COVERAGE RULES
// ========================================
export const MATERIAL_COVERAGE = {
  DRYWALL_SHEET: 32,            // 1 standard sheet covers 32 sqft
  JOINT_COMPOUND: 150,          // 1 bucket mud covers ~150 sqft
  HOT_MUD_40: 200,              // 1 bag of Setting mud covers ~200 sqft
  JOINT_TAPE_SHEETS: 5,         // 1 roll joint tape per 5 sheets
  SCREWS_5LB_MAX_SHEETS: 12,    // 5lb box screws is sufficient up to 12 sheets
  SCREWS_25LB_SHEETS: 50,       // 25lb bucket screws per 50 sheets
  CORNER_BEAD_WALL_SQFT: 120,   // 1 corner bead per 120 sqft of wall area
  TEXTURE_BUCKET: 500,          // 1 spray texture bucket covers 500 sqft
  PRIMER_BUCKET: 400,           // 1 primer bucket (2 Gal) covers 400 sqft
  INSULATION_ROLL: 100,         // 1 roll/bundle of insulation covers 100 sqft
};

// ========================================
// MINIMUM JOB CHARGE CONFIGURATION
// ========================================
export const MINIMUM_JOB_CHARGE_CONFIG = {
  // Can be 'TRUE_MINIMUM_TOTAL' or 'FIXED_ADDITIONAL_FEE'
  TYPE: 'FIXED_ADDITIONAL_FEE' as 'TRUE_MINIMUM_TOTAL' | 'FIXED_ADDITIONAL_FEE',
  VALUE: 750.00,
};

