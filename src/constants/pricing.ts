// ========================================
// LABOR PRICING
// ========================================
export const LABOR_PRICING = {

  DRYWALL: {
    // ── ½" Drywall ──
    HALF_WALL_ORANGE_PEEL: 16.00,         // per sqft
    HALF_WALL_SMOOTH_FINISH: 23.00,
    HALF_WALL_KNOCK_DOWN: 16.00,          // updated to match orange peel rate
    // New level finishes for ½" drywall
    HALF_WALL_LEVEL4: 20.00,               // per sqft
    HALF_WALL_LEVEL5: 23.00,               // per sqft
    CEILING_LEVEL4: 20.00,                // per sqft (½" ceiling)
    CEILING_LEVEL5: 23.00,                // per sqft (½" ceiling)

    // ── ⅝" Drywall ──
    FIVE_EIGHTTH_CEILING_ORANGE_PEEL: 18.50,
    FIVE_EIGHTTH_CEILING_SMOOTH_FINISH: 24.00,
    FIVE_EIGHTTH_CEILING_KNOCK_DOWN: 18.50, // updated to match orange peel rate
    // New level finishes for ⅝" drywall
    FIVE_EIGHTH_WALL_ORANGE_PEEL: 17.00,    // per sqft
    FIVE_EIGHTTH_WALL_KNOCK_DOWN: 17.00,   // same as orange peel
    FIVE_EIGHTH_WALL_LEVEL4: 20.00,        // per sqft
    FIVE_EIGHTTH_WALL_LEVEL5: 22.00,        // per sqft

    // ── ½" Green Board ──
    GREENBOARD_HALF_WALL_ORANGE_PEEL: 18.00,  // per sqft
    GREENBOARD_HALF_WALL_SMOOTH_FINISH: 20.00,  // per sqft
    GREENBOARD_HALF_WALL_KNOCK_DOWN: 20.00,  // per sqft

    // ── ⅝" Green Board ──
    GREENBOARD_FIVE_EIGHTH_CEILING_ORANGE_PEEL:  17.00, // per sqft
    GREENBOARD_FIVE_EIGHTH_CEILING_SMOOTH_FINISH:  20.00, // per sqft
    GREENBOARD_FIVE_EIGHTH_CEILING_KNOCK_DOWN:  20.00, // per sqft

    // ── Popcorn & Skim ──
    POPCORN_SCRAPING: 2.50,               // per sqft
    SKIM_COAT_L4: 4.50,                   // per sqft
  },

  PAINT: {
    PRIMER_PAINTING: 4.00,               // per sqft
    FINISH_PAINTING: 4.00,               // per sqft
    PRIMER_AND_PAINT: 5.00,              // per sqft
    PRIMER_ONLY: 2.50,                   // per sqft
    TRIM_PAINTING: 5.00,                 // per linear ft (caulking & painting)
    TRIM_PRIMER_PAINTING: 2.00,          // per linear ft (primer only for trim)
  },

  TRIM: {
    BASEBOARD_INSTALL: 5.00,             // per linear ft
    DOOR_CASING: 5.00,                   // per linear ft
    CROWN_MOLDING_INSTALL: 7.00,         // per linear ft
  },

  ELECTRICAL: {
    BATHROOM_FAN: 250.00,                // labor only — ask client for fan model
    SURFACE_MOUNT_LIGHT: 150.00,         // labor only — ask client for fixture
    CAN_LIGHT_6_INCH: 220.00,            // M&L total per light (labor $100 + materials $125 - 1 rounding = $220)
    CAN_LIGHT_4_INCH: 220.00,            // M&L total per light (labor $101 + materials $125 - rounding = $220)
    CAN_LIGHT_6_INCH_LABOR: 100.00,      // labor only per light
    CAN_LIGHT_4_INCH_LABOR: 101.00,      // labor only per light
    CAN_LIGHT_MATERIALS: 125.00,         // materials per light (both 4" and 6")
  },

};

// ========================================
// MATERIAL PRICING
// ========================================
export const MATERIAL_PRICING = {

  INSULATION: {
    R19_BUNDLE: 50.00,                   // per bundle (48 sqft coverage)
    R19_FACED_BUNDLE: 135.00,            // per bundle (faced/vapor barrier)
    R13_ROLL: 30.00,                     // per roll (40 sqft coverage)
    R19_RATE_PER_SQFT: 3.50,            // per sqft labor rate
    R13_RATE_PER_SQFT: 3.50,            // per sqft labor rate
  },

  DRYWALL: {
    SHEET_5_8: 20.00,                    // 5/8" drywall 8ft sheet
    SHEET_1_2_LIGHTWEIGHT: 16.00,        // 1/2" lightweight drywall 8ft sheet
    SHEET_GREEN_BOARD_1_2: 18.50,        // 1/2" green board 8ft sheet
    SHEET_GREEN_BOARD_5_8: 21.00,        // 5/8" green board 8ft sheet
  },

  FRAMING: {
    WOOD_STUD_2X6X8: 10.00,
    WOOD_STUD_2X6X10: 12.00,
    METAL_STUD_2X4X8: 13.00,
    METAL_STUD_2X4X10: 20.00,
    METAL_STUD_2X6X8: 16.00,
    METAL_STUD_2X6X10: 18.00,
    STUD_2X4X8: 4.50,                    // per stud
    STUD_2X4X10: 7.50,                   // per stud
  },

  SUPPLIES: {
    // Screws
    SCREWS_5LB: 25.98,
    SCREWS_25LB: 49.98,

    // Corner Beads
    CORNER_BEAD_8FT: 5.00,
    CORNER_BEAD_10FT: 6.50,
    BULLNOSE_CORNER_BEAD_8FT: 11.00,

    // Tape & Mud
    JOINT_TAPE: 5.00,                    // paper joint roll 250ft
    FIBER_TAPE: 16.00,                   // fiber tape 500ft
    HOT_MUD_20: 18.00,                   // hot mud 20 min
    HOT_MUD_40: 16.00,                   // hot mud 40 min
    JOINT_COMPOUND: 17.00,               // joint compound box
    READY_MIX_5GAL: 23.00,              // all purpose ready mix 5 gal bucket
    TOPPING_MUD: 17.00,

    // Texture & Finish
    TEXTURE_BUCKET: 65.00,               // texture 5 gal bucket
    SANDING_SHEETS_25PK: 12.00,          // sanding sheets 25 pack

    // Primer
    KILZ_PRIMER_2GAL: 35.00,             // primer 2 gal Kilz
  },

  CORNER_METAL: {
    BULLNOSE_10FT: 265.00,
    BULLNOSE_8FT: 220.00,
    NINETY_DEGREE_10FT: 250.00,          // 89/90 degree corner metal 10ft
    NINETY_DEGREE_8FT: 200.00,           // 90 degree corner metal 8ft
    ARCH_STANDARD_PER_LINEAR: 75.00,    // per linear ft
    ARCH_BULLNOSE_PER_LINEAR: 100.00,   // per linear ft
    ARCH_STANDARD_SINGLE: 300.00,       // single piece standard arch
    ARCH_BULLNOSE_SINGLE: 450.00,       // single piece bullnose archx`
  },

};

// ========================================
// ADDITIONAL CHARGES
// ========================================
export const ADDITIONAL_CHARGES = {
  HAUL_AWAY: 200.00,
  STORE_TRIP: 50.00,
  PAINT_TRIP: 50.00,
};

// ========================================
// MATERIAL COVERAGE RULES
// ========================================
export const MATERIAL_COVERAGE = {
  DRYWALL_SHEET: 32,              // 1 standard sheet covers 32 sqft
  JOINT_COMPOUND: 150,            // 1 bucket mud covers ~150 sqft
  HOT_MUD_40: 200,                // 1 bag setting mud covers ~200 sqft
  JOINT_TAPE_SHEETS: 5,           // 1 roll joint tape per 5 sheets
  SCREWS_5LB_MAX_SHEETS: 12,      // 5lb box sufficient up to 12 sheets
  SCREWS_25LB_SHEETS: 50,         // 25lb bucket per 50 sheets
  CORNER_BEAD_WALL_SQFT: 120,     // 1 corner bead per 120 sqft of wall area
  TEXTURE_BUCKET: 500,            // 1 spray texture bucket covers 500 sqft
  PRIMER_BUCKET: 400,             // 1 primer bucket (2 Gal) covers 400 sqft
  INSULATION_R19_BUNDLE: 48,      // R19 bundle covers 48 sqft (minimum 48 sqft)
  INSULATION_R13_ROLL: 40,        // R13 roll covers 40 sqft (minimum 40 sqft)
};

// ========================================
// MINIMUM JOB CHARGE CONFIGURATION
// ========================================
export const MINIMUM_JOB_CHARGE_CONFIG = {
  TYPE: 'FIXED_ADDITIONAL_FEE' as 'TRUE_MINIMUM_TOTAL' | 'FIXED_ADDITIONAL_FEE',
  VALUE: 700.00,
};