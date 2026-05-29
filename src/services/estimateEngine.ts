/**
 * estimateEngine.ts
 *
 * Main estimate calculation engine.
 *
 * NEW in this version (vs previous):
 *  - Minimum job = TRUE minimum ($700 floor on grand total, NOT a fixed add-on fee)
 *  - BASE_SERVICE_FEE removed entirely
 *  - Ceiling multiplier (1.15) applied to all ceiling drywall labor
 *  - Two-story, occupied room, emergency, late-day multipliers wired in
 *  - Drywall type (½", ⅝", green board) drives correct per-sqft rate
 *  - Finish level (orange peel / knockdown / level 4 / level 5) drives correct rate
 *    (knockdown treated same as orange peel per pricing sheet)
 *  - Insulation bug fixed: uses correct INSULATION_R19_BUNDLE / INSULATION_R13_ROLL coverage
 *    and the $3.50/sqft labor line is now included
 *  - Corner metal selection added
 *  - Electrical services added (recessed lights, fan, fixture, outlet, TV mount)
 *  - Soffits flagged for manual review (no fixed rate exists)
 *  - Multipliers applied ONLY to the affected labor category (not haul-away, not electrical, etc.)
 */

import type { EstimateResult, EstimateLineItem } from '../types/estimate';
import {
  LABOR_PRICING,
  MATERIAL_PRICING,
  ADDITIONAL_CHARGES,
  MATERIAL_COVERAGE,
  MULTIPLIERS,
  MINIMUM_JOB_CHARGE_CONFIG,
} from '../constants/pricing';
import {
  calculateCeilingArea,
  calculateWallArea,
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
  const isFiveEighths = drywallType === '5/8';

  if (finishLevel === 'level 5') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_FIVE_EIGHTH_WALL_LEVEL5;
    if (isFiveEighths) return LABOR_PRICING.DRYWALL.FIVE_EIGHTH_WALL_LEVEL5;
    return LABOR_PRICING.DRYWALL.WALL_SMOOTH_L5; // ½" level 5 = $22
  }
  if (finishLevel === 'level 4' || finishLevel === 'smooth finish') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_FIVE_EIGHTH_WALL_LEVEL4;
    if (isFiveEighths) return LABOR_PRICING.DRYWALL.FIVE_EIGHTH_WALL_LEVEL4;
    return LABOR_PRICING.DRYWALL.WALL_SMOOTH; // ½" level 4 = $20
  }
  // Orange peel OR knockdown (same price per sheet)
  if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_FIVE_EIGHTH_WALL_ORANGE_PEEL;
  if (isFiveEighths) return LABOR_PRICING.DRYWALL.FIVE_EIGHTH_WALL_ORANGE_PEEL;
  return LABOR_PRICING.DRYWALL.WALL_ORANGE_PEEL; // ½" orange peel = $16
}

/** Resolve the correct ceiling labor rate from drywall type + finish level.
 *  NOTE: the ceiling multiplier (1.15) is applied separately — do not bake it in here. */
function resolveCeilingRate(drywallType: string, finishLevel: string): number {
  const isGreenBoard = drywallType === 'green board';
  const isFiveEighths = drywallType === '5/8';

  if (finishLevel === 'level 5') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_HALF_CEILING_LEVEL5; // $22
    if (isFiveEighths) return LABOR_PRICING.DRYWALL.FIVE_EIGHTH_WALL_LEVEL5; // $22 (no dedicated ⅝ ceiling L5 key — mirrors wall)
    return LABOR_PRICING.DRYWALL.CEILING_SMOOTH_L5; // ½" ceiling level 5 = $23
  }
  if (finishLevel === 'level 4' || finishLevel === 'smooth finish') {
    if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_HALF_CEILING_LEVEL4; // $20
    if (isFiveEighths) return LABOR_PRICING.DRYWALL.FIVE_EIGHTH_WALL_LEVEL4; // $20
    return LABOR_PRICING.DRYWALL.CEILING_SMOOTH; // ½" ceiling level 4 = $20
  }
  // Orange peel or knockdown
  if (isGreenBoard) return LABOR_PRICING.DRYWALL.GREENBOARD_HALF_CEILING_ORANGE_PEEL; // $18
  if (isFiveEighths) return LABOR_PRICING.DRYWALL.FIVE_EIGHTH_CEILING_ORANGE_PEEL; // $18.50
  return LABOR_PRICING.DRYWALL.CEILING_ORANGE_PEEL; // ½" orange peel = $18
}

/** Resolve the drywall sheet material price from type. */
function resolveDrywallSheetPrice(drywallType: string): number {
  if (drywallType === '5/8') return MATERIAL_PRICING.DRYWALL.SHEET_5_8;
  if (drywallType === 'green board') return MATERIAL_PRICING.DRYWALL.SHEET_GREEN_BOARD;
  return MATERIAL_PRICING.DRYWALL.SHEET_1_2_LIGHTWEIGHT;
}

/** Human-readable drywall type label. */
function drywallTypeLabel(drywallType: string): string {
  if (drywallType === '5/8') return '5/8"';
  if (drywallType === 'green board') return '½" Green Board';
  return '½"';
}

/** Human-readable finish level label. */
function finishLabel(finishLevel: string): string {
  const map: Record<string, string> = {
    'orange peel': 'Orange Peel Texture',
    'knockdown': 'Knockdown Texture',
    'level 4': 'Level 4 Smooth',
    'smooth finish': 'Level 4 Smooth',
    'level 5': 'Level 5 Smooth',
    'match existing texture': 'Match Existing Texture',
  };
  return map[finishLevel] ?? 'Orange Peel Texture';
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function calculateEstimate(formData: any): EstimateResult {
  // ── 1. Parse dimensions ──────────────────────────────────────────────────
  const length = safeParseFloat(formData.length);
  const width  = safeParseFloat(formData.width);
  const height = safeParseFloat(formData.height);

  const ceilingArea = calculateCeilingArea(length, width);
  const wallArea    = calculateWallArea(length, width, height);
  const perimeter   = calculatePerimeter(length, width);

  // ── 2. Multipliers from form ─────────────────────────────────────────────
  // Ceiling multiplier is ALWAYS applied to ceiling labor — no form toggle needed.
  // All others are opt-in via form flags.
  const isTwoStory    = formData.is_two_story    === 'Yes';
  const isOccupied    = formData.is_occupied      === 'Yes';
  const isEmergency   = formData.is_emergency     === 'Yes';
  const isLateDay     = formData.is_late_day      === 'Yes';

  // Build a single "condition multiplier" for wall/general work
  let conditionMultiplier = 1.0;
  if (isTwoStory)  conditionMultiplier *= MULTIPLIERS.TWO_STORY;
  if (isOccupied)  conditionMultiplier *= MULTIPLIERS.OCCUPIED_ROOM;
  if (isEmergency) conditionMultiplier *= MULTIPLIERS.EMERGENCY;
  if (isLateDay)   conditionMultiplier *= MULTIPLIERS.LATE_DAY;

  // Ceiling gets an additional ceiling multiplier on top of condition multiplier
  const ceilingMultiplier = conditionMultiplier * MULTIPLIERS.CEILING;

  // ── 3. Output buckets ────────────────────────────────────────────────────
  const laborItems:      EstimateLineItem[] = [];
  const materialItems:   EstimateLineItem[] = [];
  const additionalCharges: EstimateLineItem[] = [];

  let hasMaterials   = false;
  let hasPaintService = false;
  let isPendingReview = false;
  const followUpQuestions: string[] = [];
  let requiresPhotos = false;

  if (formData.has_photos === 'No') requiresPhotos = true;

  // ── 4. DRYWALL ────────────────────────────────────────────────────────────
  let activeWallArea    = 0;
  let activeCeilingArea = 0;
  let drywallArea       = 0;

  if (formData.services?.drywall) {
    const hasDims    = formData.drywall_has_dims === 'Yes';
    const workType   = formData.drywall_work_type || 'entire room installation';
    const areas      = formData.drywall_areas || 'both';
    const drywallType = formData.drywall_type || '1/2'; // '1/2' | '5/8' | 'green board'
    const texture    = formData.drywall_texture || 'orange peel';

    // Normalise drywall_type key
    const drywallKey = drywallType === '5/8' ? '5/8'
      : drywallType === 'green board' ? 'green board'
      : '1/2';

    // Normalise finish level
    const finishLevel = texture; // stored directly from form option value

    // ── 4a. Establish active areas ────────────────────────────────────────
    if (hasDims) {
      if (areas === 'walls' || areas === 'both')   activeWallArea    = wallArea;
      if (areas === 'celling' || areas === 'both') activeCeilingArea = ceilingArea;
    } else {
      // Fallback flat-rate virtual areas for material estimation
      if (workType === 'full wall replacement')        { activeWallArea = 150; }
      else if (workType === 'celling replacement')     { activeCeilingArea = 144; }
      else if (workType === 'entire room installation'){ activeWallArea = 384; activeCeilingArea = 144; }
    }

    drywallArea = activeWallArea + activeCeilingArea;

    // ── 4b. Repair types → flag for manual review, no auto-price ─────────
    const isRepairType =
      workType === 'small hole repair' ||
      workType === 'medium patch repair' ||
      workType === 'larger sections repair';

    if (isRepairType) {
      isPendingReview = true;
      const repairLabel =
        workType === 'small hole repair'    ? 'Small Hole Repair'   :
        workType === 'medium patch repair'  ? 'Medium Patch Repair' :
        'Larger Sections Repair';
      followUpQuestions.push(
        `Drywall ${repairLabel} selected — pricing will be confirmed after on-site inspection or photo review.`
      );
    } else {
      // ── 4c. Wall labor ─────────────────────────────────────────────────
      if (activeWallArea > 0) {
        const baseWallRate = resolveWallRate(drywallKey, finishLevel);
        const wallRate     = baseWallRate * conditionMultiplier;
        laborItems.push({
          name: `Wall Drywall Install & Finish — ${drywallTypeLabel(drywallKey)} ${finishLabel(finishLevel)}`,
          quantity:  Math.round(activeWallArea),
          unit:      'sqft',
          unitPrice: wallRate,
          total:     activeWallArea * wallRate,
        });
      }

      // ── 4d. Ceiling labor (+ ceiling multiplier) ──────────────────────
      if (activeCeilingArea > 0) {
        const baseCeilingRate = resolveCeilingRate(drywallKey, finishLevel);
        const ceilRate        = baseCeilingRate * ceilingMultiplier;
        laborItems.push({
          name: `Ceiling Drywall Install & Finish — ${drywallTypeLabel(drywallKey)} ${finishLabel(finishLevel)}`,
          quantity:  Math.round(activeCeilingArea),
          unit:      'sqft',
          unitPrice: ceilRate,
          total:     activeCeilingArea * ceilRate,
        });
      }
    }

    // ── 4e. Demolition labor ──────────────────────────────────────────────
    const demoSelection = formData.drywall_demo || 'no demolition';
    const isDemoWall    = demoSelection === 'remove existing wall drywall' || demoSelection === 'remove both';
    const isDemoCeiling = demoSelection === 'remove existing cellng drywall' || demoSelection === 'remove both';

    if (isDemoWall) {
      if (activeWallArea > 0) {
        const demoRate = resolveWallRate(drywallKey, finishLevel) * conditionMultiplier;
        laborItems.push({
          name: 'Wall Drywall Demolition & Tear-out',
          quantity:  Math.round(activeWallArea),
          unit:      'sqft',
          unitPrice: demoRate,
          total:     activeWallArea * demoRate,
        });
        additionalCharges.push({
          name:      'Haul Away — Wall Demo Debris',
          quantity:  1,
          unit:      'job',
          unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY,
          total:     ADDITIONAL_CHARGES.HAUL_AWAY,
        });
      } else {
        isPendingReview = true;
        followUpQuestions.push('Wall demolition selected but no dimensions provided — will be confirmed after inspection.');
      }
    }

    if (isDemoCeiling) {
      if (activeCeilingArea > 0) {
        const demoCeilRate = resolveCeilingRate(drywallKey, finishLevel) * ceilingMultiplier;
        laborItems.push({
          name: 'Ceiling Drywall Demolition & Tear-out',
          quantity:  Math.round(activeCeilingArea),
          unit:      'sqft',
          unitPrice: demoCeilRate,
          total:     activeCeilingArea * demoCeilRate,
        });
        const alreadyHasHaulAway = additionalCharges.some(i => i.name.includes('Haul Away'));
        if (!alreadyHasHaulAway) {
          additionalCharges.push({
            name:      'Haul Away — Ceiling Demo Debris',
            quantity:  1,
            unit:      'job',
            unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY,
            total:     ADDITIONAL_CHARGES.HAUL_AWAY,
          });
        }
      } else {
        isPendingReview = true;
        followUpQuestions.push('Ceiling demolition selected but no dimensions provided — will be confirmed after inspection.');
      }
    }

    // ── 4f. Insulation (labor + materials) ────────────────────────────────
    // R19 → walls  |  R13 → ceilings  (per logic sheet)
    if (formData.drywall_insulation === 'Yes') {
      const insulationAreas   = formData.drywall_insulation_areas || 'both';
      const isInsulateWall    = insulationAreas === 'wall'   || insulationAreas === 'both';
      const isInsulateCeiling = insulationAreas === 'celling' || insulationAreas === 'both';

      if (isInsulateWall && activeWallArea > 0) {
        hasMaterials = true;
        // Labor: $3.50/sqft
        laborItems.push({
          name:      'R19 Wall Insulation — Labor',
          quantity:  Math.round(activeWallArea),
          unit:      'sqft',
          unitPrice: MATERIAL_PRICING.INSULATION.R19_RATE_PER_SQFT,
          total:     activeWallArea * MATERIAL_PRICING.INSULATION.R19_RATE_PER_SQFT,
        });
        // Materials: bundles (48 sqft each, $50/bundle)
        const r19Bundles = calculateR19Bundles(activeWallArea, MATERIAL_COVERAGE.INSULATION_R19_BUNDLE);
        materialItems.push({
          name:      'R19 Wall Insulation (Bundles, 48 sqft each)',
          quantity:  r19Bundles,
          unit:      'bundles',
          unitPrice: MATERIAL_PRICING.INSULATION.R19_BUNDLE,
          total:     r19Bundles * MATERIAL_PRICING.INSULATION.R19_BUNDLE,
        });
      }

      if (isInsulateCeiling && activeCeilingArea > 0) {
        hasMaterials = true;
        // Labor: $3.50/sqft
        laborItems.push({
          name:      'R13 Ceiling Insulation — Labor',
          quantity:  Math.round(activeCeilingArea),
          unit:      'sqft',
          unitPrice: MATERIAL_PRICING.INSULATION.R13_RATE_PER_SQFT,
          total:     activeCeilingArea * MATERIAL_PRICING.INSULATION.R13_RATE_PER_SQFT,
        });
        // Materials: rolls (40 sqft each, $30/roll)
        const r13Rolls = calculateR13Rolls(activeCeilingArea, MATERIAL_COVERAGE.INSULATION_R13_ROLL);
        materialItems.push({
          name:      'R13 Ceiling Insulation (Rolls, 40 sqft each)',
          quantity:  r13Rolls,
          unit:      'rolls',
          unitPrice: MATERIAL_PRICING.INSULATION.R13_ROLL,
          total:     r13Rolls * MATERIAL_PRICING.INSULATION.R13_ROLL,
        });
      }
    }

    // ── 4g. Missing dimensions flag ───────────────────────────────────────
    if (formData.drywall_has_dims === 'No' && !isRepairType) {
      isPendingReview = true;
      followUpQuestions.push('What are the exact lengths and widths of the walls or ceiling sections requiring drywall work?');
      followUpQuestions.push('Are there any corners, obstacles, or high ceiling heights we should know about?');
    }

    // ── 4h. Corner metal ─────────────────────────────────────────────────
    const cornerMetalType = formData.corner_metal_type || 'none';
    if (cornerMetalType !== 'none') {
      hasMaterials = true;
      const cornerMetalLength = formData.corner_metal_length || '10ft';

      if (cornerMetalType === 'standard') {
        const unitPrice = cornerMetalLength === '8ft'
          ? MATERIAL_PRICING.CORNER_METAL.NINETY_DEGREE_8FT
          : MATERIAL_PRICING.CORNER_METAL.NINETY_DEGREE_10FT;
        const qty = safeParseFloat(formData.corner_metal_qty) || 1;
        materialItems.push({
          name:      `Standard 90° Corner Metal (${cornerMetalLength})`,
          quantity:  qty,
          unit:      'pcs',
          unitPrice,
          total:     qty * unitPrice,
        });
      } else if (cornerMetalType === 'bullnose') {
        const unitPrice = cornerMetalLength === '8ft'
          ? MATERIAL_PRICING.CORNER_METAL.BULLNOSE_8FT
          : MATERIAL_PRICING.CORNER_METAL.BULLNOSE_10FT;
        const qty = safeParseFloat(formData.corner_metal_qty) || 1;
        materialItems.push({
          name:      `Bullnose Corner Metal (${cornerMetalLength})`,
          quantity:  qty,
          unit:      'pcs',
          unitPrice,
          total:     qty * unitPrice,
        });
      } else if (cornerMetalType === 'arch') {
        // Arch metal has no fixed price — flag for review
        isPendingReview = true;
        followUpQuestions.push('Arch corner metal selected — pricing will be confirmed after on-site measurement.');
      }
    }

    // ── 4i. Soffits → always manual review (no fixed rate) ───────────────
    const soffitType = formData.soffit_type || 'none';
    if (soffitType !== 'none') {
      isPendingReview = true;
      followUpQuestions.push(
        `${soffitType === 'ceiling soffits' ? 'Ceiling' : 'Wall'} soffits selected — pricing requires on-site measurement and will be confirmed separately.`
      );
    }
  }

  // ── 5. PAINTING ──────────────────────────────────────────────────────────
  if (formData.services?.paint) {
    hasPaintService = true;
    const paintNeeds = formData.paint_needs_paint || 'entire room';
    const paintType  = formData.paint_type || 'corner to corner painting';
    const isTouchUp  = paintType === 'touch-up painting' || paintType === 'Touch-up painting';

    const hasDims = formData.services?.drywall
      ? formData.drywall_has_dims === 'Yes'
      : formData.general_has_dims === 'Yes';

    let paintArea      = 0;
    let paintPerimeter = 0;

    if (isTouchUp) {
      const touchUpInput = safeParseFloat(formData.paint_touch_up_area);
      paintArea = touchUpInput > 0 ? touchUpInput : 30;
    } else {
      if      (paintNeeds === 'walls')         paintArea      = hasDims ? wallArea    : 300;
      else if (paintNeeds === 'celling')       paintArea      = hasDims ? ceilingArea : 150;
      else if (paintNeeds === 'entire room')   paintArea      = hasDims ? (wallArea + ceilingArea) : 450;
      else if (paintNeeds === 'trim/baseboard') paintPerimeter = hasDims ? perimeter : 60;
    }

    if (paintArea > 0) {
      // Apply condition multiplier; ceiling gets additional ceiling multiplier if painting ceiling
      const isPaintCeiling = paintNeeds === 'celling';
      const paintMultiplier = isPaintCeiling
        ? ceilingMultiplier
        : conditionMultiplier;

      const unitPrice = LABOR_PRICING.PAINT.PRIMER_AND_PAINT * paintMultiplier;
      laborItems.push({
        name:      isTouchUp
          ? 'Painting — Touch-Up Spot Painting'
          : `Painting — Corner-to-Corner (${paintNeeds})`,
        quantity:  Math.round(paintArea),
        unit:      'sqft',
        unitPrice,
        total:     paintArea * unitPrice,
      });
    }

    if (paintPerimeter > 0 || paintNeeds === 'trim/baseboard') {
      const effectivePerimeter = paintPerimeter > 0 ? paintPerimeter : (hasDims ? perimeter : 60);
      laborItems.push({
        name:      'Painting — Trim & Baseboard',
        quantity:  Math.round(effectivePerimeter),
        unit:      'linear ft',
        unitPrice: LABOR_PRICING.PAINT.TRIM_PAINTING,
        total:     effectivePerimeter * LABOR_PRICING.PAINT.TRIM_PAINTING,
      });
    }

    if (!hasDims && !isTouchUp) {
      isPendingReview = true;
      followUpQuestions.push('What are the exact dimensions or surface square footage of the areas to be painted?');
    }

    // Paint materials — only if client does NOT have paint
    if (formData.paint_has_paint === 'No') {
      let paintMatArea = 0;
      if (isTouchUp) {
        paintMatArea = safeParseFloat(formData.paint_touch_up_area) || 30;
      } else {
        if      (paintNeeds === 'walls')       paintMatArea = hasDims ? wallArea    : 300;
        else if (paintNeeds === 'celling')     paintMatArea = hasDims ? ceilingArea : 150;
        else if (paintNeeds === 'entire room') paintMatArea = hasDims ? (wallArea + ceilingArea) : 450;
      }

      if (paintMatArea > 0) {
        hasMaterials = true;
        const paintAreaWithWaste = addWaste(paintMatArea, 0.15);
        const primerBuckets = roundUpToNearestInteger(paintAreaWithWaste / MATERIAL_COVERAGE.PRIMER_BUCKET);
        materialItems.push({
          name:      'Kilz Wall & Trim Primer (2 Gal)',
          quantity:  primerBuckets,
          unit:      'buckets',
          unitPrice: MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
          total:     primerBuckets * MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
        });
      }
    }
  }

  // ── 6. TRIM ──────────────────────────────────────────────────────────────
  if (formData.services?.trim) {
    let totalTrimFeet = 0;
    if (Array.isArray(formData.trim_areas)) {
      totalTrimFeet = formData.trim_areas.reduce((sum: number, area: any) => {
        return sum + Math.max(0, safeParseFloat(area.feet));
      }, 0);
    }

    const hasDims = formData.services?.drywall
      ? formData.drywall_has_dims === 'Yes'
      : formData.general_has_dims === 'Yes';

    const effectiveTrimFeet = totalTrimFeet > 0
      ? totalTrimFeet
      : (hasDims ? perimeter : 60);

    const serviceType = formData.trim_services || 'install new baseboard';
    const trimStyle   = formData.trim_style || 'standerd';
    const styleLabel  =
      trimStyle === 'standerd'      ? 'Standard'  :
      trimStyle === 'mordern'       ? 'Modern'    :
      'Match Existing';

    if (serviceType === 'install new baseboard' || serviceType === 'replace existing baseboard') {
      const installRate  = LABOR_PRICING.TRIM.BASEBOARD_INSTALL;
      const installTotal = effectiveTrimFeet * installRate * conditionMultiplier;
      laborItems.push({
        name:      `Baseboard Installation — ${styleLabel}`,
        quantity:  Math.round(effectiveTrimFeet),
        unit:      'linear ft',
        unitPrice: installRate * conditionMultiplier,
        total:     installTotal,
      });

      if (serviceType === 'replace existing baseboard') {
        const demoRate  = LABOR_PRICING.TRIM.BASEBOARD_INSTALL * conditionMultiplier;
        const demoTotal = effectiveTrimFeet * demoRate;
        laborItems.push({
          name:      'Baseboard Demolition & Removal',
          quantity:  Math.round(effectiveTrimFeet),
          unit:      'linear ft',
          unitPrice: demoRate,
          total:     demoTotal,
        });
        const alreadyHasHaulAway = additionalCharges.some(i => i.name.includes('Haul Away'));
        if (!alreadyHasHaulAway) {
          additionalCharges.push({
            name:      'Haul Away — Trim Demolition Debris',
            quantity:  1,
            unit:      'job',
            unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY,
            total:     ADDITIONAL_CHARGES.HAUL_AWAY,
          });
        }
      }
      hasMaterials = true;
    } else if (serviceType === 'repair existing trim') {
      laborItems.push({
        name:      `Trim & Baseboard Repair — ${styleLabel}`,
        quantity:  Math.round(effectiveTrimFeet),
        unit:      'linear ft',
        unitPrice: LABOR_PRICING.TRIM.BASEBOARD_INSTALL * conditionMultiplier,
        total:     effectiveTrimFeet * LABOR_PRICING.TRIM.BASEBOARD_INSTALL * conditionMultiplier,
      });
    } else if (serviceType === 'paint existing trim') {
      const alreadyAdded = laborItems.some(i => i.name.includes('Trim & Baseboard'));
      if (!alreadyAdded) {
        laborItems.push({
          name:      `Painting — Trim & Baseboard (${styleLabel})`,
          quantity:  Math.round(effectiveTrimFeet),
          unit:      'linear ft',
          unitPrice: LABOR_PRICING.PAINT.TRIM_PAINTING,
          total:     effectiveTrimFeet * LABOR_PRICING.PAINT.TRIM_PAINTING,
        });
      }
      hasPaintService = true;
    }
  }

  // ── 7. ELECTRICAL ────────────────────────────────────────────────────────
  // Electrical multipliers: condition multiplier applies (two-story, occupied, etc.)
  // but ceiling multiplier does NOT automatically apply unless specifically ceiling work.
  if (formData.services?.electrical) {
    const electricalServices: string[] = Array.isArray(formData.electrical_services)
      ? formData.electrical_services
      : (formData.electrical_services ? [formData.electrical_services] : []);

    electricalServices.forEach((service: string) => {
      switch (service) {
        case 'recessed lighting': {
          const lightCount = Math.max(1, safeParseFloat(formData.electrical_light_count) || 1);
          const lightSize  = formData.electrical_light_size === '4 inch' ? '4"' : '6"';
          const unitPrice  = lightSize === '4"'
            ? LABOR_PRICING.ELECTRICAL.CAN_LIGHT_4_INCH
            : LABOR_PRICING.ELECTRICAL.CAN_LIGHT_6_INCH;
          laborItems.push({
            name:      `${lightSize} Recessed Can Lights — M&L`,
            quantity:  lightCount,
            unit:      'lights',
            unitPrice,
            total:     lightCount * unitPrice,
          });
          break;
        }
        case 'ceiling fan installation': {
          const fanCount = Math.max(1, safeParseFloat(formData.electrical_fan_count) || 1);
          laborItems.push({
            name:      'Ceiling Fan Installation — Labor Only (client provides fan)',
            quantity:  fanCount,
            unit:      'units',
            unitPrice: LABOR_PRICING.ELECTRICAL.BATHROOM_FAN,
            total:     fanCount * LABOR_PRICING.ELECTRICAL.BATHROOM_FAN,
          });
          break;
        }
        case 'light fixture installation': {
          const fixtureCount = Math.max(1, safeParseFloat(formData.electrical_fixture_count) || 1);
          laborItems.push({
            name:      'Light Fixture Installation — Labor Only (client provides fixture)',
            quantity:  fixtureCount,
            unit:      'units',
            unitPrice: LABOR_PRICING.ELECTRICAL.SURFACE_MOUNT_LIGHT,
            total:     fixtureCount * LABOR_PRICING.ELECTRICAL.SURFACE_MOUNT_LIGHT,
          });
          break;
        }
        case 'bathroom fan installation': {
          const fanCount = Math.max(1, safeParseFloat(formData.electrical_fan_count) || 1);
          laborItems.push({
            name:      'Bathroom Fan Installation — Labor Only (client provides fan model)',
            quantity:  fanCount,
            unit:      'units',
            unitPrice: LABOR_PRICING.ELECTRICAL.BATHROOM_FAN,
            total:     fanCount * LABOR_PRICING.ELECTRICAL.BATHROOM_FAN,
          });
          break;
        }
        case 'outlet/switch relocation':
        case 'new outlet installation':
        case 'tv mount wire concealment': {
          // No fixed rate — flag for review
          isPendingReview = true;
          const serviceNameMap: Record<string, string> = {
            'outlet/switch relocation': 'Outlet/Switch Relocation',
            'new outlet installation':  'New Outlet Installation',
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

  // ── 8. DRYWALL MATERIALS (large-scale installs only) ─────────────────────
  if (formData.services?.drywall && drywallArea > 0) {
    const workType  = formData.drywall_work_type || 'entire room installation';
    const isRepair  = workType === 'small hole repair' || workType === 'medium patch repair' || workType === 'larger sections repair';
    const drywallType = formData.drywall_type || '1/2';
    const drywallKey  = drywallType === '5/8' ? '5/8' : drywallType === 'green board' ? 'green board' : '1/2';
    const texture   = formData.drywall_texture || 'orange peel';

    hasMaterials = true;

    if (isRepair && formData.drywall_has_dims !== 'Yes') {
      // Flat-rate patching kit
      const { price: matPrice, name: matName } =
        workType === 'small hole repair'
          ? { price: 50.00,  name: 'Drywall Small Repair Patching Kit (supplies + mud)' }
          : workType === 'medium patch repair'
          ? { price: 75.00,  name: 'Drywall Medium Repair Kit (tape, mud, supplies)' }
          : { price: 150.00, name: 'Drywall Large Section Repair Kit (tape, screws, mud, supplies)' };

      materialItems.push({
        name: matName, quantity: 1, unit: 'kit', unitPrice: matPrice, total: matPrice,
      });
    } else {
      // Large scale installation
      const drywallAreaWithWaste = addWaste(drywallArea, 0.10);
      const drywallSheets = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.DRYWALL_SHEET);

      if (drywallSheets > 0) {
        const sheetPrice = resolveDrywallSheetPrice(drywallKey);
        materialItems.push({
          name:      `${drywallTypeLabel(drywallKey)} Drywall Sheet (8ft)`,
          quantity:  drywallSheets,
          unit:      'sheets',
          unitPrice: sheetPrice,
          total:     drywallSheets * sheetPrice,
        });

        // Joint compound: 1 bucket per 150 sqft
        const compoundBuckets = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.JOINT_COMPOUND);
        materialItems.push({
          name:      'Joint Compound — Premixed',
          quantity:  compoundBuckets,
          unit:      'buckets',
          unitPrice: MATERIAL_PRICING.SUPPLIES.JOINT_COMPOUND,
          total:     compoundBuckets * MATERIAL_PRICING.SUPPLIES.JOINT_COMPOUND,
        });

        // Hot mud 40: 1 bag per 200 sqft
        const hotMudBags = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.HOT_MUD_40);
        materialItems.push({
          name:      'Hot Mud 40 (Fast Setting Compound)',
          quantity:  hotMudBags,
          unit:      'bags',
          unitPrice: MATERIAL_PRICING.SUPPLIES.HOT_MUD_40,
          total:     hotMudBags * MATERIAL_PRICING.SUPPLIES.HOT_MUD_40,
        });

        // Joint tape: 1 roll per 5 sheets
        const tapeRolls = roundUpToNearestInteger(drywallSheets / MATERIAL_COVERAGE.JOINT_TAPE_SHEETS);
        materialItems.push({
          name:      'Paper Joint Tape (250ft roll)',
          quantity:  tapeRolls,
          unit:      'rolls',
          unitPrice: MATERIAL_PRICING.SUPPLIES.JOINT_TAPE,
          total:     tapeRolls * MATERIAL_PRICING.SUPPLIES.JOINT_TAPE,
        });

        // Screws: 5lb up to 12 sheets, 25lb bucket per 50 sheets beyond that
        if (drywallSheets <= MATERIAL_COVERAGE.SCREWS_5LB_MAX_SHEETS) {
          materialItems.push({
            name:      'Drywall Screws (5lb box)',
            quantity:  1,
            unit:      'box',
            unitPrice: MATERIAL_PRICING.SUPPLIES.SCREWS_5LB,
            total:     MATERIAL_PRICING.SUPPLIES.SCREWS_5LB,
          });
        } else {
          const screwBuckets = roundUpToNearestInteger(drywallSheets / MATERIAL_COVERAGE.SCREWS_25LB_SHEETS);
          materialItems.push({
            name:      'Drywall Screws (25lb bucket)',
            quantity:  screwBuckets,
            unit:      'buckets',
            unitPrice: MATERIAL_PRICING.SUPPLIES.SCREWS_25LB,
            total:     screwBuckets * MATERIAL_PRICING.SUPPLIES.SCREWS_25LB,
          });
        }

        // Corner beads: 1 per 120 sqft of wall
        if (activeWallArea > 0) {
          const beadsNeeded = roundUpToNearestInteger(activeWallArea / MATERIAL_COVERAGE.CORNER_BEAD_WALL_SQFT);
          materialItems.push({
            name:      'Corner Bead (8ft)',
            quantity:  beadsNeeded,
            unit:      'pcs',
            unitPrice: MATERIAL_PRICING.SUPPLIES.CORNER_BEAD_8FT,
            total:     beadsNeeded * MATERIAL_PRICING.SUPPLIES.CORNER_BEAD_8FT,
          });
        }

        // Texture bucket: only for orange peel / knockdown (not smooth)
        const needsTextureBucket =
          texture === 'orange peel' ||
          texture === 'knockdown'   ||
          texture === 'matching existing texture';

        if (needsTextureBucket) {
          const textureQty = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.TEXTURE_BUCKET);
          materialItems.push({
            name:      'Spray Texture Compound (5-gal bucket)',
            quantity:  textureQty,
            unit:      'buckets',
            unitPrice: MATERIAL_PRICING.SUPPLIES.TEXTURE_BUCKET,
            total:     textureQty * MATERIAL_PRICING.SUPPLIES.TEXTURE_BUCKET,
          });
        }

        // Primer: always for new drywall (400 sqft per 2-gal bucket)
        const primerBuckets = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.PRIMER_BUCKET);
        materialItems.push({
          name:      'Kilz Drywall Primer (2-gal bucket)',
          quantity:  primerBuckets,
          unit:      'buckets',
          unitPrice: MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
          total:     primerBuckets * MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
        });
      }
    }
  }

  // ── 9. TRIP CHARGES ──────────────────────────────────────────────────────
  if (hasMaterials) {
    additionalCharges.push({
      name:      'Store Material Procurement Trip',
      quantity:  1,
      unit:      'trip',
      unitPrice: ADDITIONAL_CHARGES.STORE_TRIP,
      total:     ADDITIONAL_CHARGES.STORE_TRIP,
    });
  }

  if (hasPaintService) {
    additionalCharges.push({
      name:      'Paint Tint Matching & Setup Charge',
      quantity:  1,
      unit:      'job',
      unitPrice: ADDITIONAL_CHARGES.PAINT_TRIP,
      total:     ADDITIONAL_CHARGES.PAINT_TRIP,
    });
  }

  // ── 10. TOTALS & MINIMUM JOB ENFORCEMENT ─────────────────────────────────
  const subtotalLabor      = laborItems.reduce((s, i) => s + i.total, 0);
  const subtotalMaterials  = materialItems.reduce((s, i) => s + i.total, 0);
  const subtotalAdditional = additionalCharges.reduce((s, i) => s + i.total, 0);

  let rawTotal  = subtotalLabor + subtotalMaterials + subtotalAdditional;
  let grandTotal = rawTotal;

  // TRUE minimum: if total is below $700, raise it to $700.
  // An adjustment line item is appended so the estimate is transparent.
  if (rawTotal < MINIMUM_JOB_CHARGE_CONFIG.VALUE) {
    const adjustment = MINIMUM_JOB_CHARGE_CONFIG.VALUE - rawTotal;
    additionalCharges.push({
      name:      `Minimum Job Charge Adjustment (minimum $${MINIMUM_JOB_CHARGE_CONFIG.VALUE})`,
      quantity:  1,
      unit:      'adjustment',
      unitPrice: adjustment,
      total:     adjustment,
    });
    grandTotal = MINIMUM_JOB_CHARGE_CONFIG.VALUE;
  }

  // Re-compute subtotalAdditional after possible minimum adjustment
  const finalSubtotalAdditional = additionalCharges.reduce((s, i) => s + i.total, 0);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    labor:            laborItems,
    materials:        materialItems,
    additionalCharges,
    subtotalLabor:    round2(subtotalLabor),
    subtotalMaterials: round2(subtotalMaterials),
    subtotalAdditional: round2(finalSubtotalAdditional),
    baseServiceFee:   0, // removed — minimum is enforced via TRUE_MINIMUM logic above
    grandTotal:       round2(grandTotal),
    isPendingReview,
    reviewStatus:     isPendingReview ? 'Pending Final Review' : 'Calculated',
    followUpQuestions,
    requiresPhotos,
  };
}