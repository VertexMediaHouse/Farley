import type { EstimateResult, EstimateLineItem } from '../types/estimate';
import { 
  LABOR_PRICING, 
  MATERIAL_PRICING, 
  ADDITIONAL_CHARGES, 
  MATERIAL_COVERAGE,
  MINIMUM_JOB_CHARGE_CONFIG 
} from '../constants/pricing';
import {
  calculateCeilingArea,
  calculateWallArea,
  calculatePerimeter,
  addWaste,
  roundUpToNearestInteger
} from '../utils/calculationHelpers';

/**
 * Main estimate engine function that parses form responses, calculates dimensions, 
 * maps pricing databases, handles waste factors and rounding, and generates 
 * a complete, structured, and strictly rule-based EstimateResult.
 * 
 * All AI keyword parsing, hidden modifiers, note inferences, and auto-added
 * haul-away fees have been fully removed. Calculations are 100% deterministic.
 * 
 * @param formData FormAnswers state from the React homepage wizard.
 * @returns Fully itemized EstimateResult.
 */
export function calculateEstimate(formData: any): EstimateResult {
  // 1. Safe parsing of room dimensions from step 0
  const length = Math.max(0, parseFloat(formData.length) || 0);
  const width = Math.max(0, parseFloat(formData.width) || 0);
  const height = Math.max(0, parseFloat(formData.height) || 0);

  // Calculate base surface areas from geometry
  const ceilingArea = calculateCeilingArea(length, width);
  const wallArea = calculateWallArea(length, width, height);
  const perimeter = calculatePerimeter(length, width);
  const totalRoomArea = ceilingArea + wallArea;

  const laborItems: EstimateLineItem[] = [];
  const materialItems: EstimateLineItem[] = [];
  const additionalCharges: EstimateLineItem[] = [];

  // Track tracking variables
  let hasMaterials = false;
  let hasPaintService = false;
  
  // Track review/photo/missing dims flags
  let isPendingReview = false;
  const followUpQuestions: string[] = [];
  let requiresPhotos = false;

  // Photo review logic
  if (formData.has_photos === 'Yes') {
    isPendingReview = true;
  } else if (formData.has_photos === 'No') {
    requiresPhotos = true;
  }

  // -------------------------------------------------------------
  // A. LABOR CALCULATIONS
  // -------------------------------------------------------------

  // 1. Drywall Labor
  let drywallArea = 0;
  let isDrywallCeilingActive = false;
  let isDrywallWallActive = false;

  if (formData.services?.drywall) {
    const areas = formData.drywall_areas || 'Both';
    isDrywallCeilingActive = areas === 'Ceiling' || areas === 'Both';
    isDrywallWallActive = areas === 'Wall' || areas === 'Both';

    // Calculate drywall area based on selected areas
    drywallArea = (isDrywallCeilingActive ? ceilingArea : 0) + (isDrywallWallActive ? wallArea : 0);

    const texture = formData.drywall_texture || 'Orange Peel';
    const isSmooth = texture === 'Smooth';

    // Drywall Ceiling Installation
    if (isDrywallCeilingActive && ceilingArea > 0) {
      const unitPrice = isSmooth ? LABOR_PRICING.DRYWALL.CEILING_SMOOTH : LABOR_PRICING.DRYWALL.CEILING_ORANGE_PEEL;
      const total = ceilingArea * unitPrice;
      laborItems.push({
        name: `Ceiling Drywall Install & Finish (${isSmooth ? 'Level 4 Smooth' : 'Orange Peel Texture'})`,
        quantity: Math.round(ceilingArea),
        unit: 'sqft',
        unitPrice,
        total
      });
    }

    // Drywall Wall Installation
    if (isDrywallWallActive && wallArea > 0) {
      const unitPrice = isSmooth ? LABOR_PRICING.DRYWALL.WALL_SMOOTH : LABOR_PRICING.DRYWALL.WALL_ORANGE_PEEL;
      const total = wallArea * unitPrice;
      laborItems.push({
        name: `Wall Drywall Install & Finish (${isSmooth ? 'Level 4 Smooth' : 'Orange Peel Texture'})`,
        quantity: Math.round(wallArea),
        unit: 'sqft',
        unitPrice,
        total
      });
    }

    // Popcorn Ceiling Scraping (Explicit choice in form)
    if (formData.drywall_popcorn === 'Yes') {
      const scrapeArea = ceilingArea;
      if (scrapeArea > 0) {
        const unitPrice = LABOR_PRICING.DRYWALL.POPCORN_SCRAPING;
        const total = scrapeArea * unitPrice;
        laborItems.push({
          name: 'Popcorn Ceiling Scraping & Removal',
          quantity: Math.round(scrapeArea),
          unit: 'sqft',
          unitPrice,
          total
        });
      }
    }

    // Skim Coat Level 4 Finish (Explicit choice in form)
    if (formData.drywall_skim === 'Yes') {
      const skimArea = drywallArea;
      if (skimArea > 0) {
        const unitPrice = LABOR_PRICING.DRYWALL.SKIM_COAT_L4;
        const total = skimArea * unitPrice;
        laborItems.push({
          name: 'Skim Coat Level 4 Finishing',
          quantity: Math.round(skimArea),
          unit: 'sqft',
          unitPrice,
          total
        });
      }
    }

    // Hole Repairs and Cleanup (Explicit choice in form)
    if (formData.drywall_patch === 'Yes') {
      const patchAreaInput = parseFloat(formData.drywall_patch_area);
      if (isNaN(patchAreaInput) || patchAreaInput <= 0) {
        isPendingReview = true;
        followUpQuestions.push('What is the approximate total square footage of the patchwork/hole repair areas?');
      } else {
        const unitPrice = LABOR_PRICING.DRYWALL.HOLE_REPAIRS_CLEANUP;
        const total = patchAreaInput * unitPrice;
        laborItems.push({
          name: 'Patchwork Hole Repair & Cleanup Support',
          quantity: Math.round(patchAreaInput),
          unit: 'sqft',
          unitPrice,
          total
        });
      }
    }

    // Check if drywall dimensions are missing
    if (formData.drywall_has_dims === 'No') {
      isPendingReview = true;
      followUpQuestions.push('What are the exact lengths and widths of the specific walls or ceiling sections requiring drywall hang or finishing?');
      followUpQuestions.push('Are there any corners, obstacles, or high ceiling heights in the drywall work areas we should be aware of?');
    }
  }

  // 2. Demolition Labor (Explicit choice in form)
  let isDemolitionSelected = false;
  if (formData.services?.drywall && formData.drywall_demo === 'Yes') {
    isDemolitionSelected = true;
    if (drywallArea > 0) {
      const texture = formData.drywall_texture || 'Orange Peel';
      const isSmooth = texture === 'Smooth';

      let demoCost = 0;
      // Demolition cost applies ONLY to affected service areas calculated separately
      if (isDrywallCeilingActive) {
        const ceilingInstallRate = isSmooth ? LABOR_PRICING.DRYWALL.CEILING_SMOOTH : LABOR_PRICING.DRYWALL.CEILING_ORANGE_PEEL;
        demoCost += ceilingArea * ceilingInstallRate;
      }
      if (isDrywallWallActive) {
        const wallInstallRate = isSmooth ? LABOR_PRICING.DRYWALL.WALL_SMOOTH : LABOR_PRICING.DRYWALL.WALL_ORANGE_PEEL;
        demoCost += wallArea * wallInstallRate;
      }

      if (demoCost > 0) {
        laborItems.push({
          name: 'Drywall Demolition & Sheetrock Tear-out',
          quantity: Math.round(drywallArea),
          unit: 'sqft',
          unitPrice: Math.round((demoCost / drywallArea) * 100) / 100,
          total: demoCost
        });
      }
    }
  }

  // 3. Painting Labor (Explicit choice in form)
  if (formData.services?.paint && formData.paint_needed !== 'No') {
    hasPaintService = true;
    const paintType = formData.paint_type;
    const isCornerToCorner = paintType === 'Corner-to-corner painting';
    const isTouchUp = paintType === 'Touch-up painting';

    let paintArea = 0;
    let paintDimensionError = false;

    if (isCornerToCorner) {
      // Corner-to-Corner uses room geometry area: Wall + Ceiling if drywall is both/unspecified, or matching active drywall areas
      paintArea = totalRoomArea;
      if (formData.services?.drywall) {
        paintArea = (isDrywallCeilingActive ? ceilingArea : 0) + (isDrywallWallActive ? wallArea : 0);
      }

      if (formData.paint_corner_has_dims === 'No') {
        isPendingReview = true;
        paintDimensionError = true;
        followUpQuestions.push('What are the exact dimensions or surface square footage of the rooms and walls slated for corner-to-corner painting?');
        followUpQuestions.push('Are we painting ceilings, walls, or both? What color and gloss level (eggshell, satin, semi-gloss) did you select?');
      }
    } else if (isTouchUp) {
      // Touch-Up painting requires a user-specified area and does NOT estimate from room geometry automatically
      const touchUpAreaInput = parseFloat(formData.paint_touch_up_area);
      if (isNaN(touchUpAreaInput) || touchUpAreaInput <= 0) {
        isPendingReview = true;
        paintDimensionError = true;
        followUpQuestions.push('Could you estimate the approximate square footage of the touch-up painting spots?');
      } else {
        paintArea = touchUpAreaInput;
      }
    }

    if (paintArea > 0 && !paintDimensionError) {
      const unitPrice = LABOR_PRICING.PAINT.PRIMER_AND_PAINT;
      const total = paintArea * unitPrice;

      laborItems.push({
        name: isCornerToCorner ? 'Corner-to-Corner Surface Painting' : 'Touch-Up Spot Painting',
        quantity: Math.round(paintArea),
        unit: 'sqft',
        unitPrice,
        total
      });
    }

    // Trim Painting Labor (Explicit choice in form)
    if (formData.trim_paint === 'Yes' && perimeter > 0) {
      const unitPrice = LABOR_PRICING.PAINT.TRIM_PAINTING;
      const total = perimeter * unitPrice;
      laborItems.push({
        name: 'Trim & Baseboard Professional Painting',
        quantity: Math.round(perimeter),
        unit: 'linear ft',
        unitPrice,
        total
      });
    }
  }

  // 4. Trim Installation Labor (Explicit choice in form)
  if (formData.services?.trim) {
    if (formData.trim_install === 'Yes' && perimeter > 0) {
      const unitPrice = LABOR_PRICING.TRIM.BASEBOARD_INSTALL;
      const total = perimeter * unitPrice;
      laborItems.push({
        name: 'Baseboard & Trim Carpentry Installation',
        quantity: Math.round(perimeter),
        unit: 'linear ft',
        unitPrice,
        total
      });
    }

    // Crown molding labor (Explicit choice in form)
    if (formData.trim_crown === 'Yes' && perimeter > 0) {
      const unitPrice = LABOR_PRICING.TRIM.CROWN_MOLDING_INSTALL;
      const total = perimeter * unitPrice;
      laborItems.push({
        name: 'Crown Molding Fine Wood Install',
        quantity: Math.round(perimeter),
        unit: 'linear ft',
        unitPrice,
        total
      });
    }
  }

  // 5. Electrical Labor (Explicit choices in form)
  if (formData.services?.drywall && formData.drywall_electrical === 'Yes') {
    // Bathroom Fan
    const fanQty = parseInt(formData.elec_fan_qty, 10) || 0;
    if (fanQty > 0) {
      const unitPrice = LABOR_PRICING.ELECTRICAL.BATHROOM_FAN;
      laborItems.push({
        name: 'Electrical: Bathroom Fan Installation',
        quantity: fanQty,
        unit: 'ea',
        unitPrice,
        total: fanQty * unitPrice
      });
    }

    // Can Lights
    const canQty = parseInt(formData.elec_can_qty, 10) || 0;
    if (canQty > 0) {
      const unitPrice = LABOR_PRICING.ELECTRICAL.LED_CAN_LIGHT;
      laborItems.push({
        name: 'Electrical: 4"/6" LED Can Lights Wire & Install',
        quantity: canQty,
        unit: 'ea',
        unitPrice,
        total: canQty * unitPrice
      });
    }

    // Surface Mount Light
    const surfaceQty = parseInt(formData.elec_surface_qty, 10) || 0;
    if (surfaceQty > 0) {
      const unitPrice = LABOR_PRICING.ELECTRICAL.SURFACE_MOUNT_LIGHT;
      laborItems.push({
        name: 'Electrical: Surface Mount Light Fixture Install',
        quantity: surfaceQty,
        unit: 'ea',
        unitPrice,
        total: surfaceQty * unitPrice
      });
    }
  }

  // -------------------------------------------------------------
  // B. MATERIAL CALCULATIONS (Deterministic & Rule-Based)
  // -------------------------------------------------------------

  if (formData.services?.drywall && drywallArea > 0 && formData.drywall_has_dims !== 'No') {
    hasMaterials = true;

    // Apply 10% waste to drywall square footage
    const drywallAreaWithWaste = addWaste(drywallArea, 0.10);
    
    // Each standard sheet of 4x8 drywall covers 32 sqft (MATERIAL_COVERAGE.DRYWALL_SHEET)
    const drywallSheets = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.DRYWALL_SHEET);

    if (drywallSheets > 0) {
      // 1/2" lightweight is standard unless moisture resistance (bathroom/wet area) or 5/8" fire-rated is chosen
      let sheetPrice = MATERIAL_PRICING.DRYWALL.SHEET_1_2_LIGHTWEIGHT;
      let sheetName = "1/2\" Lightweight Drywall Sheet (8ft)";

      // Note: Since we removed text notes auto-parsing, we rely on the texture selection or similar clean properties if needed,
      // or standard lightweight as the client database pricing specifies.
      materialItems.push({
        name: sheetName,
        quantity: drywallSheets,
        unit: 'sheets',
        unitPrice: sheetPrice,
        total: drywallSheets * sheetPrice
      });

      // Joint Compound: 1 bucket of joint compound covers ~150 sqft
      const compoundBuckets = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.JOINT_COMPOUND);
      materialItems.push({
        name: 'Drywall Joint Compound mud (Premixed)',
        quantity: compoundBuckets,
        unit: 'buckets',
        unitPrice: MATERIAL_PRICING.SUPPLIES.JOINT_COMPOUND,
        total: compoundBuckets * MATERIAL_PRICING.SUPPLIES.JOINT_COMPOUND
      });

      // Setting Mud: 1 bag of Hot Mud 40 per 200 sqft
      const hotMudBags = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.HOT_MUD_40);
      materialItems.push({
        name: 'Hot Mud 40 (Fast Setting Compound)',
        quantity: hotMudBags,
        unit: 'bags',
        unitPrice: MATERIAL_PRICING.SUPPLIES.HOT_MUD_40,
        total: hotMudBags * MATERIAL_PRICING.SUPPLIES.HOT_MUD_40
      });

      // Joint Tape: 1 roll per 5 sheets
      const tapeRolls = roundUpToNearestInteger(drywallSheets / MATERIAL_COVERAGE.JOINT_TAPE_SHEETS);
      materialItems.push({
        name: 'Professional Joint Tape (250ft roll)',
        quantity: tapeRolls,
        unit: 'rolls',
        unitPrice: MATERIAL_PRICING.SUPPLIES.JOINT_TAPE,
        total: tapeRolls * MATERIAL_PRICING.SUPPLIES.JOINT_TAPE
      });

      // Screws: 5lb box is plenty for up to 12 sheets. 25lb bucket per 50 sheets.
      const screwBoxes5lb = drywallSheets <= MATERIAL_COVERAGE.SCREWS_5LB_MAX_SHEETS ? 1 : 0;
      const screwBoxes25lb = drywallSheets > MATERIAL_COVERAGE.SCREWS_5LB_MAX_SHEETS ? roundUpToNearestInteger(drywallSheets / MATERIAL_COVERAGE.SCREWS_25LB_SHEETS) : 0;

      if (screwBoxes5lb > 0) {
        materialItems.push({
          name: 'Drywall Screws (5lb box)',
          quantity: screwBoxes5lb,
          unit: 'boxes',
          unitPrice: MATERIAL_PRICING.SUPPLIES.SCREWS_5LB,
          total: screwBoxes5lb * MATERIAL_PRICING.SUPPLIES.SCREWS_5LB
        });
      }

      if (screwBoxes25lb > 0) {
        materialItems.push({
          name: 'Drywall Screws (25lb bucket)',
          quantity: screwBoxes25lb,
          unit: 'buckets',
          unitPrice: MATERIAL_PRICING.SUPPLIES.SCREWS_25LB,
          total: screwBoxes25lb * MATERIAL_PRICING.SUPPLIES.SCREWS_25LB
        });
      }

      // Corner beads (if wall is active, add protection beads)
      if (isDrywallWallActive) {
        const beadsNeeded = roundUpToNearestInteger(wallArea / MATERIAL_COVERAGE.CORNER_BEAD_WALL_SQFT);
        const isTenFoot = height > 8;
        const beadPrice = isTenFoot ? MATERIAL_PRICING.SUPPLIES.CORNER_BEAD_10FT : MATERIAL_PRICING.SUPPLIES.CORNER_BEAD_8FT;
        
        materialItems.push({
          name: `Corner Bead ${isTenFoot ? '10ft' : '8ft'}`,
          quantity: beadsNeeded,
          unit: 'pcs',
          unitPrice: beadPrice,
          total: beadsNeeded * beadPrice
        });
      }

      // Texture Buckets (if texture is Orange Peel and not level 4 smooth)
      const textureType = formData.drywall_texture || 'Orange Peel';
      if (textureType !== 'Smooth') {
        const textureQty = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.TEXTURE_BUCKET);
        materialItems.push({
          name: 'Drywall Spray Texture Compound Bucket',
          quantity: textureQty,
          unit: 'buckets',
          unitPrice: MATERIAL_PRICING.SUPPLIES.TEXTURE_BUCKET,
          total: textureQty * MATERIAL_PRICING.SUPPLIES.TEXTURE_BUCKET
        });
      }

      // Always recommend primer for new drywall (primer cover = 400 sqft per 2 gal bucket)
      const primerBuckets = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.PRIMER_BUCKET);
      materialItems.push({
        name: 'Kilz Drywall Primer (2 Gal bucket)',
        quantity: primerBuckets,
        unit: 'buckets',
        unitPrice: MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
        total: primerBuckets * MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL
      });
    }

    // Drywall Insulation Materials (Explicit choice in form)
    if (formData.drywall_insulation === 'Yes') {
      const insulationQty = roundUpToNearestInteger(drywallArea / MATERIAL_COVERAGE.INSULATION_ROLL);
      const isR19 = height > 9;
      const insulationPrice = isR19 ? MATERIAL_PRICING.INSULATION.R19_BUNDLE : MATERIAL_PRICING.INSULATION.R13_ROLL;
      const insulationName = isR19 ? 'R19 High-Density Thermal Insulation (Bundle)' : 'R13 Wall Insulation (Roll)';

      materialItems.push({
        name: insulationName,
        quantity: insulationQty,
        unit: isR19 ? 'bundles' : 'rolls',
        unitPrice: insulationPrice,
        total: insulationQty * insulationPrice
      });
    }
  }

  // Paint materials (only if paint is needed, they do not already have the paint, and dimensions are provided)
  if (
    formData.services?.paint && 
    formData.paint_needed !== 'No' && 
    formData.paint_has_paint === 'No'
  ) {
    let paintArea = 0;
    const paintType = formData.paint_type;
    const isCornerToCorner = paintType === 'Corner-to-corner painting';
    const isTouchUp = paintType === 'Touch-up painting';

    if (isCornerToCorner && formData.paint_corner_has_dims !== 'No') {
      paintArea = totalRoomArea;
      if (formData.services?.drywall) {
        paintArea = (isDrywallCeilingActive ? ceilingArea : 0) + (isDrywallWallActive ? wallArea : 0);
      }
    } else if (isTouchUp) {
      const touchUpAreaInput = parseFloat(formData.paint_touch_up_area);
      if (!isNaN(touchUpAreaInput) && touchUpAreaInput > 0) {
        paintArea = touchUpAreaInput;
      }
    }

    if (paintArea > 0) {
      hasMaterials = true;
      const paintAreaWithWaste = addWaste(paintArea, 0.15); // Add 15% paint waste

      // Calculate paint primer buckets
      const paintPrimerBuckets = roundUpToNearestInteger(paintAreaWithWaste / MATERIAL_COVERAGE.PRIMER_BUCKET);
      materialItems.push({
        name: 'Professional Kilz Wall & Trim Primer (2 Gal)',
        quantity: paintPrimerBuckets,
        unit: 'buckets',
        unitPrice: MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
        total: paintPrimerBuckets * MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL
      });
    }
  }

  // -------------------------------------------------------------
  // C. ADDITIONAL CHARGES & TRIP FEES
  // -------------------------------------------------------------

  // 1. Haul Away Logistics ($300)
  // ONLY charge if demolition is selected and user accepted the haul-away recommendation
  if (isDemolitionSelected && formData.drywall_haul_away === 'Yes') {
    additionalCharges.push({
      name: 'Haul Away Logistics, Scrap Disposal & Debris Cleanup',
      quantity: 1,
      unit: 'job',
      unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY,
      total: ADDITIONAL_CHARGES.HAUL_AWAY
    });
  }

  // 2. Store Material Procurement Trip Charge ($100)
  // Added whenever materials are being purchased
  if (hasMaterials) {
    additionalCharges.push({
      name: 'Store Material Procurement & Freight Trip Charge',
      quantity: 1,
      unit: 'trip',
      unitPrice: ADDITIONAL_CHARGES.STORE_TRIP,
      total: ADDITIONAL_CHARGES.STORE_TRIP
    });
  }

  // 3. Paint Prep and Specialized Tinting Trip Charge ($75)
  if (hasPaintService) {
    additionalCharges.push({
      name: 'Special Tint Matching & Paint Sprayer Setup Charge',
      quantity: 1,
      unit: 'job',
      unitPrice: ADDITIONAL_CHARGES.PAINT_TRIP,
      total: ADDITIONAL_CHARGES.PAINT_TRIP
    });
  }

  // -------------------------------------------------------------
  // D. SUBTOTALS & GRAND TOTAL SUM
  // -------------------------------------------------------------

  const subtotalLabor = laborItems.reduce((sum, item) => sum + item.total, 0);
  const subtotalMaterials = materialItems.reduce((sum, item) => sum + item.total, 0);
  const subtotalAdditional = additionalCharges.reduce((sum, item) => sum + item.total, 0);

  let grandTotal = 0;
  let baseServiceFee = 0;

  // Process MINIMUM_JOB_CHARGE_CONFIG rule deterministically
  if (MINIMUM_JOB_CHARGE_CONFIG.TYPE === 'FIXED_ADDITIONAL_FEE') {
    baseServiceFee = MINIMUM_JOB_CHARGE_CONFIG.VALUE;
    grandTotal = subtotalLabor + subtotalMaterials + subtotalAdditional + baseServiceFee;
  } else if (MINIMUM_JOB_CHARGE_CONFIG.TYPE === 'TRUE_MINIMUM_TOTAL') {
    const rawTotal = subtotalLabor + subtotalMaterials + subtotalAdditional;
    baseServiceFee = 0;
    if (rawTotal < MINIMUM_JOB_CHARGE_CONFIG.VALUE) {
      const adjustment = MINIMUM_JOB_CHARGE_CONFIG.VALUE - rawTotal;
      grandTotal = MINIMUM_JOB_CHARGE_CONFIG.VALUE;
      additionalCharges.push({
        name: 'Adjustment to Meet Minimum Job Charge',
        quantity: 1,
        unit: 'adjustment',
        unitPrice: adjustment,
        total: adjustment
      });
      // Recalculate subtotalAdditional since we added the adjustment
      const newSubtotalAdditional = additionalCharges.reduce((sum, item) => sum + item.total, 0);
      grandTotal = subtotalLabor + subtotalMaterials + newSubtotalAdditional;
    } else {
      grandTotal = rawTotal;
    }
  }

  return {
    labor: laborItems,
    materials: materialItems,
    additionalCharges,
    subtotalLabor: Math.round(subtotalLabor * 100) / 100,
    subtotalMaterials: Math.round(subtotalMaterials * 100) / 100,
    subtotalAdditional: Math.round(additionalCharges.reduce((sum, item) => sum + item.total, 0) * 100) / 100,
    baseServiceFee,
    grandTotal: Math.round(grandTotal * 100) / 100,
    isPendingReview,
    reviewStatus: isPendingReview ? 'Pending Final Review' : 'Calculated',
    followUpQuestions,
    requiresPhotos
  };
}
