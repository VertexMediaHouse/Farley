/**
 * calculationHelpers.ts
 *
 * Utility functions used by estimateEngine.ts.
 *
 * Includes:
 *  - Room geometry  (ceiling area, wall area, perimeter)
 *  - Waste padding
 *  - Safe numeric parsing
 *  - Rounding helpers
 *  - Insulation bundle / roll calculators  (R19 wall bundles, R13 ceiling rolls)
 *  - Soffit geometry  (ceiling soffit area, wall soffit area)
 *  - Arch / curved surface area approximation
 *  - Drywall sheet count from area
 *  - Linear-foot helpers  (crown molding, door casing)
 */

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY — ROOM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ceiling area of a rectangular room.
 * Formula: Length × Width
 */
export function calculateCeilingArea(length: number, width: number): number {
  return length * width;
}

/**
 * Total wall surface area of a rectangular room (all four walls, no deductions).
 * Formula: 2 × (L × H) + 2 × (W × H)
 */
export function calculateWallArea(
  length: number,
  width: number,
  height: number
): number {
  return 2 * (length * height) + 2 * (width * height);
}

/**
 * Floor / ceiling perimeter of a rectangular room.
 * Useful for baseboard, crown molding, door casing linear-foot totals.
 * Formula: 2 × (Length + Width)
 */
export function calculatePerimeter(length: number, width: number): number {
  return 2 * (length + width);
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY — SOFFITS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exposed drywall area of a ceiling soffit (box that drops from the ceiling).
 *
 * A ceiling soffit has:
 *  - 1 bottom face  (length × width)
 *  - 2 long sides   (length × dropHeight)
 *  - 2 short sides  (width  × dropHeight)
 *
 * Pass the soffit's own dimensions (not the room dimensions).
 *
 * @param length      Soffit run length (ft)
 * @param width       Soffit depth / projection (ft)
 * @param dropHeight  Distance the soffit drops below the main ceiling (ft)
 */
export function calculateCeilingSoffitArea(
  length: number,
  width: number,
  dropHeight: number
): number {
  const bottomFace = length * width;
  const longSides  = 2 * (length * dropHeight);
  const shortSides = 2 * (width  * dropHeight);
  return bottomFace + longSides + shortSides;
}

/**
 * Exposed drywall area of a wall soffit / bulkhead (box built against a wall).
 *
 * A wall soffit has:
 *  - 1 front face   (length × height)
 *  - 1 bottom face  (length × depth)
 *  - 2 end caps     (height × depth)
 *
 * @param length  Horizontal run of the soffit along the wall (ft)
 * @param height  Vertical face height of the soffit (ft)
 * @param depth   How far the soffit projects from the wall (ft)
 */
export function calculateWallSoffitArea(
  length: number,
  height: number,
  depth: number
): number {
  const frontFace  = length * height;
  const bottomFace = length * depth;
  const endCaps    = 2 * (height * depth);
  return frontFace + bottomFace + endCaps;
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY — ARCH / CURVED SURFACES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Approximate surface area of a half-cylinder arch (barrel vault or arched
 * doorway facing).
 *
 * Uses the formula for the curved surface of a half-cylinder:
 *   Area = π × radius × length
 *
 * @param spanWidth  The full width of the opening / arch span (ft). radius = spanWidth / 2
 * @param length     Depth / thickness of the arch (ft) — e.g. wall thickness
 */
export function calculateArchSurfaceArea(
  spanWidth: number,
  length: number
): number {
  const radius = spanWidth / 2;
  return Math.PI * radius * length;
}

// ─────────────────────────────────────────────────────────────────────────────
// WASTE & ROUNDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Appends a waste percentage to a base quantity.
 * Example: addWaste(100, 0.10) → 110 (10 % waste buffer)
 */
export function addWaste(quantity: number, wastePercent: number): number {
  return quantity * (1 + wastePercent);
}

/**
 * Rounds any number UP to the nearest whole integer.
 * Always round up when purchasing materials — never short yourself.
 */
export function roundUpToNearestInteger(value: number): number {
  return Math.ceil(value);
}

/**
 * Rounds a number to a given number of decimal places (default: 2).
 * Useful for currency display.
 */
export function roundToDecimals(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFE PARSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely converts any value to a float.
 * Returns 0 for null / undefined / NaN / empty string — never throws.
 *
 * Used throughout the engine wherever form input values are numeric.
 */
export function safeParseFloat(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Safely converts any value to a non-negative integer.
 * Returns 0 for bad input.
 */
export function safeParseInt(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

// ─────────────────────────────────────────────────────────────────────────────
// INSULATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the number of R-19 insulation bundles needed for a given wall area.
 *
 * Always rounds UP — never under-order insulation.
 *
 * @param wallArea        Total wall area to insulate (sqft)
 * @param coveragePerBundle  sqft covered per bundle (default: 48 sqft per MATERIAL_COVERAGE)
 */
export function calculateR19Bundles(
  wallArea: number,
  coveragePerBundle: number
): number {
  if (wallArea <= 0 || coveragePerBundle <= 0) return 0;
  return Math.ceil(wallArea / coveragePerBundle);
}

/**
 * Calculates the number of R-13 insulation rolls needed for a given ceiling area.
 *
 * Always rounds UP.
 *
 * @param ceilingArea    Total ceiling area to insulate (sqft)
 * @param coveragePerRoll  sqft covered per roll (default: 40 sqft per MATERIAL_COVERAGE)
 */
export function calculateR13Rolls(
  ceilingArea: number,
  coveragePerRoll: number
): number {
  if (ceilingArea <= 0 || coveragePerRoll <= 0) return 0;
  return Math.ceil(ceilingArea / coveragePerRoll);
}

// ─────────────────────────────────────────────────────────────────────────────
// DRYWALL SHEETS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the number of drywall sheets needed for a given area.
 *
 * Applies an optional waste factor BEFORE dividing, then rounds UP.
 *
 * @param area              Net area to cover (sqft) — before waste
 * @param coveragePerSheet  sqft per sheet (default standard: 32 sqft per MATERIAL_COVERAGE)
 * @param wastePercent      Waste factor as a decimal (default 0.10 = 10 %)
 */
export function calculateDrywallSheets(
  area: number,
  coveragePerSheet: number,
  wastePercent = 0.10
): number {
  if (area <= 0 || coveragePerSheet <= 0) return 0;
  const areaWithWaste = addWaste(area, wastePercent);
  return Math.ceil(areaWithWaste / coveragePerSheet);
}

// ─────────────────────────────────────────────────────────────────────────────
// LINEAR-FOOT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimates the linear feet of crown molding needed for a room perimeter,
 * subtracting a door deduction per doorway (crown typically skips doorways).
 *
 * @param perimeter       Room perimeter in linear feet
 * @param doorCount       Number of doorways to deduct
 * @param deductionPerDoor  Linear feet to deduct per door (default: 3 ft)
 */
export function calculateCrownMoldingFeet(
  perimeter: number,
  doorCount = 0,
  deductionPerDoor = 3
): number {
  return Math.max(0, perimeter - doorCount * deductionPerDoor);
}

/**
 * Estimates linear feet of door casing for a given number of doors.
 * Standard door casing = two verticals + one head casing.
 *
 * @param doorCount         Number of doors
 * @param doorHeight        Door height in feet (default: 6.833 ft ≈ 6′ 10″)
 * @param doorWidth         Door width in feet  (default: 2.833 ft ≈ 2′ 10″)
 */
export function calculateDoorCasingFeet(
  doorCount: number,
  doorHeight = 6.833,
  doorWidth  = 2.833
): number {
  const perDoor = 2 * doorHeight + doorWidth;
  return perDoor * doorCount;
}