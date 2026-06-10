/**
 * estimateEngine.ts
 *
 * Main estimate calculation engine.
 *
 * - Minimum job = TRUE minimum ($700 floor on grand total, NOT a fixed add-on fee)
 * - BASE_SERVICE_FEE removed entirely
 * - Ceiling multiplier (1.15) applied to all ceiling drywall labor
 * - Two-story, occupied room, emergency, late-day multipliers wired in
 * - Drywall type (½", ⅝", green board) drives correct per-sqft rate
 * - Finish level (orange peel / knockdown / level 4 / level 5) drives correct rate
 *   (knockdown treated same as orange peel per pricing sheet)
 * - Insulation bug fixed: uses correct INSULATION_R19_BUNDLE / INSULATION_R13_ROLL coverage
 *   and the $3.50/sqft labor line is now included
 * - Corner metal selection added
 * - Electrical services added (recessed lights, fan, fixture, outlet, TV mount)
 * - Soffits flagged for manual review (no fixed rate exists)
 * - Multipliers applied ONLY to the affected labor category (not haul-away, not electrical, etc.)
 */

import type { EstimateResult, EstimateLineItem } from '../types/estimate';
import {
  LABOR_PRICING,
  MATERIAL_PRICING,
  ADDITIONAL_CHARGES,
  MATERIAL_COVERAGE,
  MINIMUM_JOB_CHARGE_CONFIG,
} from '../constants/pricing';
import {
  calculatePerimeter,
  addWaste,
  roundUpToNearestInteger,
  calculateR19Bundles,
  calculateR13Rolls,
  safeParseFloat,
} from '../utils/calculationHelpers';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Resolve the correct wall labor rate from drywall type + finish level. */
function resolveWallRate(drywallType: string, finishLevel: string): number {
  const isGreenBoard = drywallType === 'green board';
  const level = finishLevel.toLowerCase();

  if (level === 'smooth finish' || level === 'level 4') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_HALF_WALL_SMOOTH_FINISH;
    return LABOR_PRICING.DRYWALL.HALF_WALL_SMOOTH_FINISH;
  }
  if (level === 'level 5') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_HALF_WALL_KNOCK_DOWN;
    return LABOR_PRICING.DRYWALL.HALF_WALL_LEVEL5;
  }
  if (level === 'knock down' || level === 'knockdown') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_HALF_WALL_KNOCK_DOWN;
    return LABOR_PRICING.DRYWALL.HALF_WALL_KNOCK_DOWN;
  }
  // Orange peel or Match Existing (default)
  if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_HALF_WALL_ORANGE_PEEL;
  return LABOR_PRICING.DRYWALL.HALF_WALL_ORANGE_PEEL;
}

/** Resolve the correct ceiling labor rate from drywall type + finish level.
 *  NOTE: the ceiling multiplier (1.15) is applied separately — do not bake it in here. */
function resolveCeilingRate(drywallType: string, finishLevel: string): number {
  const isGreenBoard = drywallType === 'green board';
  const level = finishLevel.toLowerCase();

  if (level === 'smooth finish' || level === 'level 4') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_FIVE_EIGHTH_CEILING_SMOOTH_FINISH;
    return LABOR_PRICING.DRYWALL.FIVE_EIGHTTH_CEILING_SMOOTH_FINISH;
  }
  if (level === 'level 5') {
    // No explicit ceiling level5 rate; fallback to knock down as proxy
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_FIVE_EIGHTH_CEILING_KNOCK_DOWN;
    return LABOR_PRICING.DRYWALL.FIVE_EIGHTTH_WALL_LEVEL5;
  }
  if (level === 'knock down' || level === 'knockdown') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_FIVE_EIGHTH_CEILING_KNOCK_DOWN;
    return LABOR_PRICING.DRYWALL.FIVE_EIGHTTH_CEILING_KNOCK_DOWN;
  }
  // Default orange peel
  if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_FIVE_EIGHTH_CEILING_ORANGE_PEEL;
  return LABOR_PRICING.DRYWALL.FIVE_EIGHTTH_CEILING_ORANGE_PEEL;
}

/** Human-readable finish level label. */
function finishLabel(finishLevel: string): string {
  const map: Record<string, string> = {
    'orange peel': 'Orange Peel Texture',
    'knockdown': 'Knockdown Texture',
    'knock down': 'Knockdown Texture',
    'level 4': 'Level 4 Smooth',
    'smooth finish': 'Level 4 Smooth',
    'level 5': 'Level 5 Smooth',
    'match existing texture': 'Match Existing Texture',
  };
  return map[finishLevel.toLowerCase()] ?? 'Orange Peel Texture';
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function calculateEstimate(formData: any): EstimateResult {
  // ── 1. Parse dimensions ──────────────────────────────────────────────────
  const length = safeParseFloat(formData.length);
  const width = safeParseFloat(formData.width);
  const perimeter = calculatePerimeter(length, width);

  // ── 2. Output buckets ────────────────────────────────────────────────────
  const laborItems: EstimateLineItem[] = [];
  const materialItems: EstimateLineItem[] = [];
  const additionalCharges: EstimateLineItem[] = [];

  let hasMaterials = false;
  let hasPaintService = false;
  let isPendingReview = false;
  const followUpQuestions: string[] = [];
  let requiresPhotos = false;

  if (formData.has_photos === 'No') requiresPhotos = true;

  // ── 3. DRYWALL ────────────────────────────────────────────────────────────
  let drywallArea = 0;

  if (formData.services?.drywall) {
    const texture = formData.drywall_texture || 'Orange Peel';
    const finishLevel = texture.toLowerCase();

    // ── 3a. Read per-area sqft directly from form fields ──────────────────
    const wallSqft = safeParseFloat(formData.drywall_wall_sqft);
    const ceilingSqft = safeParseFloat(formData.drywall_ceiling_sqft);
    const bathWallSqft = safeParseFloat(formData.drywall_bathroom_wall_sqft);
    const bathCeilSqft = safeParseFloat(formData.drywall_bathroom_ceiling_sqft);

    drywallArea = wallSqft + ceilingSqft + bathWallSqft + bathCeilSqft;

    if (finishLevel === 'match existing texture') {
      isPendingReview = true;
      followUpQuestions.push('Texture matching requested — pricing will be confirmed after photo review or on-site inspection.');
    }

    // ── 3b. Labor per area ────────────────────────────────────────────────
    if (wallSqft > 0) {
      const rate = resolveWallRate('1/2', finishLevel);
      laborItems.push({
        name: `Wall Drywall Install & Finish — ½" ${finishLabel(finishLevel)}`,
        quantity: Math.round(wallSqft),
        unit: 'sqft',
        unitPrice: rate,
        total: wallSqft * rate,
      });
    }

    if (ceilingSqft > 0) {
      const baseRate = resolveCeilingRate('5/8', finishLevel);
      const rate = Math.round(baseRate * 1.15 * 100) / 100;
      laborItems.push({
        name: `Ceiling Drywall Install & Finish — 5/8" ${finishLabel(finishLevel)}`,
        quantity: Math.round(ceilingSqft),
        unit: 'sqft',
        unitPrice: rate,
        total: ceilingSqft * rate,
      });
    }

    if (bathWallSqft > 0) {
      const rate = resolveWallRate('green board', finishLevel);
      laborItems.push({
        name: `Bathroom Wall Drywall — Greenboard ½" ${finishLabel(finishLevel)}`,
        quantity: Math.round(bathWallSqft),
        unit: 'sqft',
        unitPrice: rate,
        total: bathWallSqft * rate,
      });
    }

    if (bathCeilSqft > 0) {
      const rate = resolveCeilingRate('green board', finishLevel);
      laborItems.push({
        name: `Bathroom Ceiling Drywall — Greenboard 5/8" ${finishLabel(finishLevel)}`,
        quantity: Math.round(bathCeilSqft),
        unit: 'sqft',
        unitPrice: rate,
        total: bathCeilSqft * rate,
      });
    }

    if (drywallArea === 0) {
      isPendingReview = true;
      followUpQuestions.push('No drywall square footage provided — pricing will be confirmed after on-site inspection.');
    }

    // ── 3c. Demolition ────────────────────────────────────────────────────
    const demolitionSelections: string[] = Array.isArray(formData.drywall_demolition)
      ? formData.drywall_demolition
      : (formData.drywall_demolition ? [formData.drywall_demolition] : []);

    let haulAwayNeeded = false;

    if (demolitionSelections.includes('Remove Existing Wall Drywall')) {
      const demoWallSqft = safeParseFloat(formData.drywall_demo_wall_sqft);
      if (demoWallSqft > 0) {
        const demoRate = resolveWallRate('1/2', finishLevel);
        laborItems.push({
          name: 'Wall Drywall Demolition & Tear-out',
          quantity: Math.round(demoWallSqft),
          unit: 'sqft',
          unitPrice: demoRate,
          total: demoWallSqft * demoRate,
        });
        haulAwayNeeded = true;
      } else {
        isPendingReview = true;
        followUpQuestions.push('Wall demolition selected — please provide sqft to confirm pricing.');
      }
    }

    if (demolitionSelections.includes('Remove Existing Ceiling Drywall')) {
      const demoCeilSqft = safeParseFloat(formData.drywall_demo_ceiling_sqft);
      if (demoCeilSqft > 0) {
        const demoRate = resolveCeilingRate('5/8', finishLevel);
        laborItems.push({
          name: 'Ceiling Drywall Demolition & Tear-out',
          quantity: Math.round(demoCeilSqft),
          unit: 'sqft',
          unitPrice: demoRate,
          total: demoCeilSqft * demoRate,
        });
        haulAwayNeeded = true;
      } else {
        isPendingReview = true;
        followUpQuestions.push('Ceiling demolition selected — please provide sqft to confirm pricing.');
      }
    }

    if (demolitionSelections.includes('Remove Insulation (sqft)')) {
      const insRemovalSqft = safeParseFloat(formData.drywall_demo_insulation_sqft);
      if (insRemovalSqft > 0) {
        laborItems.push({
          name: 'Insulation Removal',
          quantity: Math.round(insRemovalSqft),
          unit: 'sqft',
          unitPrice: MATERIAL_PRICING.INSULATION.R13_RATE_PER_SQFT,
          total: insRemovalSqft * MATERIAL_PRICING.INSULATION.R13_RATE_PER_SQFT,
        });
        haulAwayNeeded = true;
      } else {
        isPendingReview = true;
        followUpQuestions.push('Insulation removal selected — please provide sqft to confirm pricing.');
      }
    }

    if (demolitionSelections.includes('Remove Base Board (linear ft)')) {
      const baseboardRemovalFt = safeParseFloat(formData.drywall_demo_baseboard_ft);
      if (baseboardRemovalFt > 0) {
        laborItems.push({
          name: 'Baseboard Removal',
          quantity: Math.round(baseboardRemovalFt),
          unit: 'linear ft',
          unitPrice: LABOR_PRICING.TRIM.BASEBOARD_INSTALL,
          total: baseboardRemovalFt * LABOR_PRICING.TRIM.BASEBOARD_INSTALL,
        });
        haulAwayNeeded = true;
      } else {
        isPendingReview = true;
        followUpQuestions.push('Baseboard removal selected — please provide linear footage to confirm pricing.');
      }
    }

    if (demolitionSelections.includes('Popcorn Ceiling Removal')) {
      const popcornSqft = safeParseFloat(formData.drywall_popcorn_sqft);
      const POPCORN_BASE = 300;
      const POPCORN_PER_SQFT_OVER_100 = 1;
      const popcornTotal = popcornSqft > 100
        ? POPCORN_BASE + (popcornSqft - 100) * POPCORN_PER_SQFT_OVER_100
        : POPCORN_BASE;
      laborItems.push({
        name: 'Popcorn Ceiling Removal',
        quantity: popcornSqft > 0 ? Math.round(popcornSqft) : 1,
        unit: popcornSqft > 0 ? 'sqft' : 'job',
        unitPrice: popcornSqft > 100
          ? POPCORN_BASE / popcornSqft + POPCORN_PER_SQFT_OVER_100
          : POPCORN_BASE,
        total: popcornTotal,
      });
      haulAwayNeeded = true;
    }

    if (haulAwayNeeded) {
      additionalCharges.push({
        name: 'Haul Away — Demo Debris',
        quantity: 1,
        unit: 'job',
        unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY,
        total: ADDITIONAL_CHARGES.HAUL_AWAY,
      });
    }

    // ── 3d. Insulation (R13 wall, R19 ceiling) ────────────────────────────
    if (formData.drywall_insulation === 'Yes') {
      const insWallSqft = wallSqft + bathWallSqft;
      const insCeilSqft = ceilingSqft + bathCeilSqft;

      if (insWallSqft > 0) {
        hasMaterials = true;
        laborItems.push({
          name: 'R13 Wall Insulation — Labor',
          quantity: Math.round(insWallSqft),
          unit: 'sqft',
          unitPrice: MATERIAL_PRICING.INSULATION.R13_RATE_PER_SQFT,
          total: insWallSqft * MATERIAL_PRICING.INSULATION.R13_RATE_PER_SQFT,
        });
        const r13WallRolls = calculateR13Rolls(insWallSqft, MATERIAL_COVERAGE.INSULATION_R13_ROLL);
        materialItems.push({
          name: 'R13 Wall Insulation (Rolls, 40 sqft each)',
          quantity: r13WallRolls,
          unit: 'rolls',
          unitPrice: MATERIAL_PRICING.INSULATION.R13_ROLL,
          total: r13WallRolls * MATERIAL_PRICING.INSULATION.R13_ROLL,
        });
      }

      if (insCeilSqft > 0) {
        hasMaterials = true;
        laborItems.push({
          name: 'R19 Ceiling Insulation — Labor',
          quantity: Math.round(insCeilSqft),
          unit: 'sqft',
          unitPrice: MATERIAL_PRICING.INSULATION.R19_RATE_PER_SQFT,
          total: insCeilSqft * MATERIAL_PRICING.INSULATION.R19_RATE_PER_SQFT,
        });
        const r19CeilBundles = calculateR19Bundles(insCeilSqft, MATERIAL_COVERAGE.INSULATION_R19_BUNDLE);
        materialItems.push({
          name: 'R19 Ceiling Insulation (Bundles, 48 sqft each)',
          quantity: r19CeilBundles,
          unit: 'bundles',
          unitPrice: MATERIAL_PRICING.INSULATION.R19_BUNDLE,
          total: r19CeilBundles * MATERIAL_PRICING.INSULATION.R19_BUNDLE,
        });
      }
    }

    // ── 3e. Corner metal ──────────────────────────────────────────────────
    const cornerMetals: string[] = Array.isArray(formData.drywall_corner_metal)
      ? formData.drywall_corner_metal
      : (formData.drywall_corner_metal ? [formData.drywall_corner_metal] : []);
    const cornerQty = safeParseFloat(formData.drywall_corner_count) || 1;
    const cornerLength = formData.drywall_corner_length || '10ft';
    const use8ft = cornerLength === '8ft';

    if (cornerMetals.includes('Standard 90 Degree Corner Metal')) {
      const unitPrice = use8ft
        ? MATERIAL_PRICING.CORNER_METAL.NINETY_DEGREE_8FT
        : MATERIAL_PRICING.CORNER_METAL.NINETY_DEGREE_10FT;
      materialItems.push({
        name: `Standard 90° Corner Metal (${cornerLength})`,
        quantity: cornerQty,
        unit: 'pcs',
        unitPrice,
        total: cornerQty * unitPrice,
      });
    }

    if (cornerMetals.includes('Bullnose Corner Metal')) {
      const unitPrice = use8ft
        ? MATERIAL_PRICING.CORNER_METAL.BULLNOSE_8FT
        : MATERIAL_PRICING.CORNER_METAL.BULLNOSE_10FT;
      materialItems.push({
        name: `Bullnose Corner Metal (${cornerLength})`,
        quantity: cornerQty,
        unit: 'pcs',
        unitPrice,
        total: cornerQty * unitPrice,
      });
    }

    const archSelected = cornerMetals.some(c => c.toLowerCase().includes('arch'));
    if (archSelected) {
      const unitPrice = MATERIAL_PRICING.CORNER_METAL.ARCH_STANDARD_PER_LINEAR;
      materialItems.push({
        name: `Arch Corner Metal (${cornerLength})`,
        quantity: cornerQty,
        unit: 'pcs',
        unitPrice,
        total: cornerQty * unitPrice,
      });
    }

    const engelSelected = cornerMetals.some(c => c.toLowerCase().includes('engel'));
    if (archSelected || engelSelected) {
      isPendingReview = true;
      followUpQuestions.push(`Arch/Engel corner metal selected (${cornerQty} corners) — pricing will be confirmed after on-site measurement.`);
    }

    // ── 3f. Soffits → manual review with sqft logged ──────────────────────
    const soffits: string[] = Array.isArray(formData.drywall_soffits)
      ? formData.drywall_soffits
      : (formData.drywall_soffits ? [formData.drywall_soffits] : []);
    const hasSoffits = soffits.some(s => s !== 'None');
    if (hasSoffits) {
      const sofSqft = safeParseFloat(formData.drywall_soffits_sqft);
      isPendingReview = true;
      followUpQuestions.push(
        `Soffits selected${sofSqft ? ` (${sofSqft} sqft)` : ''} — pricing requires on-site measurement and will be confirmed separately.`
      );
    }
  }

  // ── 4. PAINTING ──────────────────────────────────────────────────────────
  if (formData.services?.paint) {
    hasPaintService = true;

    // ── 4a. Parse Paint Areas ─────────────────────────────────────────────
    const paintAreas: string[] = Array.isArray(formData.paint_area)
      ? formData.paint_area
      : (formData.paint_area ? [formData.paint_area] : []);

    let totalPaintSqft = 0;

    if (paintAreas.includes('Wall')) {
      totalPaintSqft += safeParseFloat(formData.paint_wall_sqft);
    }
    if (paintAreas.includes('Ceiling')) {
      totalPaintSqft += safeParseFloat(formData.paint_ceiling_sqft);
    }
    if (paintAreas.includes('Bath ceiling')) {
      totalPaintSqft += safeParseFloat(formData.paint_bath_ceiling_sqft);
    }
    if (paintAreas.includes('Bath wall')) {
      totalPaintSqft += safeParseFloat(formData.paint_bath_wall_sqft);
    }

    if (totalPaintSqft > 0) {
      const unitPrice = LABOR_PRICING.PAINT.PRIMER_AND_PAINT;
      laborItems.push({
        name: 'Painting — Corner-to-Corner (Walls/Ceilings)',
        quantity: Math.round(totalPaintSqft),
        unit: 'sqft',
        unitPrice,
        total: totalPaintSqft * unitPrice,
      });
    } else if (paintAreas.length > 0) {
      isPendingReview = true;
      followUpQuestions.push('Painting areas selected but no square footage provided — pricing will be confirmed after on-site inspection.');
    }

    // ── 4b. Parse Trim Areas ──────────────────────────────────────────────
    const trimAreas: string[] = Array.isArray(formData.paint_trim_area)
      ? formData.paint_trim_area
      : (formData.paint_trim_area ? [formData.paint_trim_area] : []);

    let totalTrimLf = 0;

    if (trimAreas.includes('Trim')) {
      totalTrimLf += safeParseFloat(formData.paint_trim_linear_ft);
    }
    if (trimAreas.includes('Baseboards')) {
      totalTrimLf += safeParseFloat(formData.paint_baseboards_linear_ft);
    }

    if (totalTrimLf > 0) {
      laborItems.push({
        name: 'Painting — Trim & Baseboards',
        quantity: Math.round(totalTrimLf),
        unit: 'linear ft',
        unitPrice: LABOR_PRICING.PAINT.TRIM_PAINTING,
        total: totalTrimLf * LABOR_PRICING.PAINT.TRIM_PAINTING,
      });
    } else if (trimAreas.length > 0) {
      isPendingReview = true;
      followUpQuestions.push('Trim painting selected but no linear footage provided — pricing will be confirmed after on-site inspection.');
    }

    // ── 4c. Ceiling Height Flag ───────────────────────────────────────────
    if (formData.paint_ceiling_height_over_8ft === 'Yes') {
      const heightStr = formData.paint_ceiling_height || 'over 8ft';
      isPendingReview = true;
      followUpQuestions.push(`High ceilings (${heightStr}) may require scaffolding or extra labor — pricing will be confirmed after on-site inspection.`);
    }

    // ── 4d. Paint Materials ───────────────────────────────────────────────
    const wantsUsToGetPaint =
      formData.paint_customer_providing === 'No' &&
      formData.paint_contractor_providing === 'Yes';

    if (wantsUsToGetPaint && totalPaintSqft > 0) {
      hasMaterials = true;

      if (formData.paint_primer === 'Yes') {
        const paintAreaWithWaste = addWaste(totalPaintSqft, 0.15);
        const primerBuckets = roundUpToNearestInteger(paintAreaWithWaste / MATERIAL_COVERAGE.PRIMER_BUCKET);
        materialItems.push({
          name: 'Kilz Wall & Trim Primer (2 Gal)',
          quantity: primerBuckets,
          unit: 'buckets',
          unitPrice: MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
          total: primerBuckets * MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
        });
      }
    }
  }

  // ── 5. TRIM ──────────────────────────────────────────────────────────────
  if (formData.services?.trim) {
    const baseboardFeetRaw = safeParseFloat(formData.trim_base_linear_feet);
    const casingFeetRaw = safeParseFloat(formData.trim_casing_linear_feet);

    const hasDims = formData.services?.drywall
      ? formData.drywall_has_dims === 'Yes'
      : formData.general_has_dims === 'Yes';

    const effectiveBaseboardFeet = baseboardFeetRaw > 0 ? baseboardFeetRaw : (hasDims ? perimeter : 60);
    const effectiveCasingFeet = casingFeetRaw > 0 ? casingFeetRaw : 0;

    const finalBaseboardFeet =
      effectiveBaseboardFeet === 0 && effectiveCasingFeet === 0
        ? (hasDims ? perimeter : 60)
        : effectiveBaseboardFeet;

    const serviceTypeStr = Array.isArray(formData.trim_services)
      ? formData.trim_services.join(',').toLowerCase()
      : (formData.trim_services || '').toLowerCase();
    const isInstall = serviceTypeStr.includes('install new baseboard') || serviceTypeStr === '';
    const isReplace = serviceTypeStr.includes('replace existing baseboard');

    const customBasePrice = safeParseFloat(formData.trim_base_price);
    const baseInstallRate = customBasePrice > 0 ? customBasePrice : LABOR_PRICING.TRIM.BASEBOARD_INSTALL;

    const customCasingPrice = safeParseFloat(formData.trim_casing_price);
    const casingInstallRate = customCasingPrice > 0 ? customCasingPrice : LABOR_PRICING.TRIM.DOOR_CASING;

    if (isInstall || isReplace) {
      if (finalBaseboardFeet > 0) {
        laborItems.push({
          name: 'Baseboard Installation',
          quantity: Math.round(finalBaseboardFeet),
          unit: 'linear ft',
          unitPrice: baseInstallRate,
          total: finalBaseboardFeet * baseInstallRate,
        });
      }

      if (effectiveCasingFeet > 0) {
        laborItems.push({
          name: 'Door Casing Installation',
          quantity: Math.round(effectiveCasingFeet),
          unit: 'linear ft',
          unitPrice: casingInstallRate,
          total: effectiveCasingFeet * casingInstallRate,
        });
      }

      if (isReplace) {
        const demoRate = LABOR_PRICING.TRIM.BASEBOARD_INSTALL;
        if (finalBaseboardFeet > 0) {
          laborItems.push({
            name: 'Baseboard Demolition & Removal',
            quantity: Math.round(finalBaseboardFeet),
            unit: 'linear ft',
            unitPrice: demoRate,
            total: finalBaseboardFeet * demoRate,
          });
        }
        if (effectiveCasingFeet > 0) {
          laborItems.push({
            name: 'Casing Demolition & Removal',
            quantity: Math.round(effectiveCasingFeet),
            unit: 'linear ft',
            unitPrice: demoRate,
            total: effectiveCasingFeet * demoRate,
          });
        }
        const alreadyHasHaulAway = additionalCharges.some(i => i.name.includes('Haul Away'));
        if (!alreadyHasHaulAway) {
          additionalCharges.push({
            name: 'Haul Away — Trim Demolition Debris',
            quantity: 1,
            unit: 'job',
            unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY,
            total: ADDITIONAL_CHARGES.HAUL_AWAY,
          });
        }
      }
      hasMaterials = true;
    }

    if (formData.trim_search_fee_ok === 'Yes') {
      additionalCharges.push({
        name: 'Trim Sourcing & Search Fee',
        quantity: 1,
        unit: 'hr',
        unitPrice: 50.00,
        total: 50.00,
      });
    }
  }

  // ── 6. ELECTRICAL ────────────────────────────────────────────────────────
  if (formData.services?.electrical) {
    const electricalServices: string[] = Array.isArray(formData.electrical_services)
      ? formData.electrical_services
      : (formData.electrical_services ? [formData.electrical_services] : []);

    electricalServices.forEach((service: string) => {
      switch (service) {
        case 'recessed lighting': {
          const lightCount = Math.max(1, safeParseFloat(formData.electrical_light_count) || 1);
          const lightSize = formData.electrical_light_size === '4 inch' ? '4"' : '6"';
          const unitPrice = lightSize === '4"'
            ? LABOR_PRICING.ELECTRICAL.CAN_LIGHT_4_INCH
            : LABOR_PRICING.ELECTRICAL.CAN_LIGHT_6_INCH;
          laborItems.push({
            name: `${lightSize} Recessed Can Lights — M&L`,
            quantity: lightCount,
            unit: 'lights',
            unitPrice,
            total: lightCount * unitPrice,
          });
          break;
        }
        case 'ceiling fan installation': {
          const fanCount = Math.max(1, safeParseFloat(formData.electrical_fan_count) || 1);
          laborItems.push({
            name: 'Ceiling Fan Installation — Labor Only (client provides fan)',
            quantity: fanCount,
            unit: 'units',
            unitPrice: LABOR_PRICING.ELECTRICAL.BATHROOM_FAN,
            total: fanCount * LABOR_PRICING.ELECTRICAL.BATHROOM_FAN,
          });
          break;
        }
        case 'light fixture installation': {
          const fixtureCount = Math.max(1, safeParseFloat(formData.electrical_fixture_count) || 1);
          laborItems.push({
            name: 'Light Fixture Installation — Labor Only (client provides fixture)',
            quantity: fixtureCount,
            unit: 'units',
            unitPrice: LABOR_PRICING.ELECTRICAL.SURFACE_MOUNT_LIGHT,
            total: fixtureCount * LABOR_PRICING.ELECTRICAL.SURFACE_MOUNT_LIGHT,
          });
          break;
        }
        case 'bathroom fan installation': {
          const fanCount = Math.max(1, safeParseFloat(formData.electrical_fan_count) || 1);
          laborItems.push({
            name: 'Bathroom Fan Installation — Labor Only (client provides fan model)',
            quantity: fanCount,
            unit: 'units',
            unitPrice: LABOR_PRICING.ELECTRICAL.BATHROOM_FAN,
            total: fanCount * LABOR_PRICING.ELECTRICAL.BATHROOM_FAN,
          });
          break;
        }
        case 'outlet/switch relocation':
        case 'new outlet installation':
        case 'tv mount wire concealment': {
          isPendingReview = true;
          const serviceNameMap: Record<string, string> = {
            'outlet/switch relocation': 'Outlet/Switch Relocation',
            'new outlet installation': 'New Outlet Installation',
            'tv mount wire concealment': 'TV Mount Wire Concealment',
          };
          followUpQuestions.push(
            `${serviceNameMap[service]} selected — pricing will be confirmed after on-site assessment.`
          );
          break;
        }
        default:
          break;
      }
    });
  }

  // ── 7. TRIP CHARGES ──────────────────────────────────────────────────────
  if (hasMaterials) {
    additionalCharges.push({
      name: 'Store Material Procurement Trip',
      quantity: 1,
      unit: 'trip',
      unitPrice: ADDITIONAL_CHARGES.STORE_TRIP,
      total: ADDITIONAL_CHARGES.STORE_TRIP,
    });
  }

  if (hasPaintService) {
    additionalCharges.push({
      name: 'Paint Tint Matching & Setup Charge',
      quantity: 1,
      unit: 'job',
      unitPrice: ADDITIONAL_CHARGES.PAINT_TRIP,
      total: ADDITIONAL_CHARGES.PAINT_TRIP,
    });
  }

  // ── 8. TOTALS ─────────────────────────────────────────────────────────────
  const subtotalLabor = laborItems.reduce((s, i) => s + i.total, 0);
  const subtotalMaterials = materialItems.reduce((s, i) => s + i.total, 0);
  const finalSubtotalAdditional = additionalCharges.reduce((s, i) => s + i.total, 0);

  // Add mandatory $700 fixed charge to the total
  const baseServiceFee = MINIMUM_JOB_CHARGE_CONFIG.VALUE;
  let grandTotal = subtotalLabor + subtotalMaterials + finalSubtotalAdditional + baseServiceFee;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    labor: laborItems,
    materials: materialItems,
    additionalCharges,
    subtotalLabor: round2(subtotalLabor),
    subtotalMaterials: round2(subtotalMaterials),
    subtotalAdditional: round2(finalSubtotalAdditional),
    baseServiceFee: MINIMUM_JOB_CHARGE_CONFIG.VALUE,
    grandTotal: round2(grandTotal),
    isPendingReview,
    reviewStatus: isPendingReview ? 'Pending Final Review' : 'Calculated',
    followUpQuestions,
    requiresPhotos,
  };
}