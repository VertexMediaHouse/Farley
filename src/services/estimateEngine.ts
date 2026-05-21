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
 * @param formData FormAnswers state from the React homepage wizard.
 * @returns Fully itemized EstimateResult.
 */
export function calculateEstimate(formData: any): EstimateResult {
  // 1. Safe parsing of room dimensions
  const length = Math.max(0, parseFloat(formData.length) || 0);
  const width = Math.max(0, parseFloat(formData.width) || 0);
  const height = Math.max(0, parseFloat(formData.height) || 0);

  // Calculate base surface areas from geometry
  const ceilingArea = calculateCeilingArea(length, width);
  const wallArea = calculateWallArea(length, width, height);
  const perimeter = calculatePerimeter(length, width);

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
  // A. LABOR & DEMOLITION & INSULATION CALCULATIONS (Drywall Workflow)
  // -------------------------------------------------------------

  let activeWallArea = 0;
  let activeCeilingArea = 0;
  let drywallArea = 0;

  if (formData.services?.drywall) {
    const hasDims = formData.drywall_has_dims === 'Yes';
    const workType = formData.drywall_work_type || 'entire room installation';
    const areas = formData.drywall_areas || 'both';

    // Establish wall and ceiling areas
    if (hasDims) {
      if (areas === 'walls' || areas === 'both') {
        activeWallArea = wallArea;
      }
      if (areas === 'celling' || areas === 'both') {
        activeCeilingArea = ceilingArea;
      }
    } else {
      // Flat rate fallback virtual areas for material calculations
      if (workType === 'full wall replacement') {
        activeWallArea = 150;
      } else if (workType === 'celling replacement') {
        activeCeilingArea = 144;
      } else if (workType === 'entire room installation') {
        activeWallArea = 384;
        activeCeilingArea = 144;
      }
    }

    drywallArea = activeWallArea + activeCeilingArea;

    // Establish Labor Costs
    const texture = formData.drywall_texture || 'orange peel';
    const isSmooth = texture === 'smooth finish';

    const wallRate = isSmooth ? LABOR_PRICING.DRYWALL.WALL_SMOOTH : LABOR_PRICING.DRYWALL.WALL_ORANGE_PEEL;
    const ceilingRate = isSmooth ? LABOR_PRICING.DRYWALL.CEILING_SMOOTH : LABOR_PRICING.DRYWALL.CEILING_ORANGE_PEEL;

    // Hole repairs: collect info only, flag for manual review, no price calculation
    const isRepairType = workType === 'small hole repair' || workType === 'medium patch repair' || workType === 'larger sections repair';

    if (isRepairType) {
      isPendingReview = true;
      const repairLabel = workType === 'small hole repair' ? 'Small Hole Repair' : workType === 'medium patch repair' ? 'Medium Patch Repair' : 'Larger Sections Repair';
      followUpQuestions.push(`Drywall ${repairLabel} selected — pricing will be confirmed after on-site inspection or photo review.`);
    } else {
      // Large scale installation
      if (activeWallArea > 0) {
        laborItems.push({
          name: `Wall Drywall Install & Finish (${isSmooth ? 'Level 4 Smooth' : 'Orange Peel Texture'})`,
          quantity: Math.round(activeWallArea),
          unit: 'sqft',
          unitPrice: wallRate,
          total: activeWallArea * wallRate
        });
      }
      if (activeCeilingArea > 0) {
        laborItems.push({
          name: `Ceiling Drywall Install & Finish (${isSmooth ? 'Level 4 Smooth' : 'Orange Peel Texture'})`,
          quantity: Math.round(activeCeilingArea),
          unit: 'sqft',
          unitPrice: ceilingRate,
          total: activeCeilingArea * ceilingRate
        });
      }
    }

    // Demolition Labor
    // Options: 'no demolition', 'remove existing wall drywall', 'remove existing cellng drywall', 'remove both'
    const demoSelection = formData.drywall_demo || 'no demolition';
    const isDemoWall = demoSelection === 'remove existing wall drywall' || demoSelection === 'remove both';
    const isDemoCeiling = demoSelection === 'remove existing cellng drywall' || demoSelection === 'remove both';

    if (isDemoWall && activeWallArea > 0) {
      // Demolition = same cost as installation per sqft
      const demoWallCost = activeWallArea * wallRate;
      laborItems.push({
        name: 'Wall Drywall Demolition & Sheetrock Tear-out',
        quantity: Math.round(activeWallArea),
        unit: 'sqft',
        unitPrice: wallRate,
        total: demoWallCost
      });
      additionalCharges.push({
        name: 'Haul Away Logistics & Scrap Disposal (Wall Demolition Debris)',
        quantity: 1,
        unit: 'job',
        unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY,
        total: ADDITIONAL_CHARGES.HAUL_AWAY
      });
    } else if (isDemoWall && activeWallArea === 0) {
      // No dimensions provided for demo — flag for review
      isPendingReview = true;
      followUpQuestions.push('Wall demolition selected but no dimensions provided — pricing will be confirmed after on-site inspection.');
    }

    if (isDemoCeiling && activeCeilingArea > 0) {
      // Demolition = same cost as installation per sqft
      const demoCeilingCost = activeCeilingArea * ceilingRate;
      laborItems.push({
        name: 'Ceiling Drywall Demolition & Sheetrock Tear-out',
        quantity: Math.round(activeCeilingArea),
        unit: 'sqft',
        unitPrice: ceilingRate,
        total: demoCeilingCost
      });
      additionalCharges.push({
        name: 'Haul Away Logistics & Scrap Disposal (Ceiling Demolition Debris)',
        quantity: 1,
        unit: 'job',
        unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY,
        total: ADDITIONAL_CHARGES.HAUL_AWAY
      });
    } else if (isDemoCeiling && activeCeilingArea === 0) {
      // No dimensions provided for demo — flag for review
      isPendingReview = true;
      followUpQuestions.push('Ceiling demolition selected but no dimensions provided — pricing will be confirmed after on-site inspection.');
    }

    // Insulation Labor and Materials
    if (formData.drywall_insulation === 'Yes') {
      const insulationAreas = formData.drywall_insulation_areas || 'both';
      const isInsulateWall = insulationAreas === 'wall' || insulationAreas === 'both';
      const isInsulateCeiling = insulationAreas === 'celling' || insulationAreas === 'both';

      if (isInsulateWall) {
        hasMaterials = true;
        const qty = activeWallArea > 0 ? Math.ceil(activeWallArea / MATERIAL_COVERAGE.INSULATION_ROLL) : 2;
        materialItems.push({
          name: 'R19 Wall Insulation Material (Bundles)',
          quantity: qty,
          unit: 'bundles',
          unitPrice: MATERIAL_PRICING.INSULATION.R19_BUNDLE,
          total: qty * MATERIAL_PRICING.INSULATION.R19_BUNDLE
        });
        // No insulation labor charge per pricing sheet
      }

      if (isInsulateCeiling) {
        hasMaterials = true;
        const qty = activeCeilingArea > 0 ? Math.ceil(activeCeilingArea / MATERIAL_COVERAGE.INSULATION_ROLL) : 2;
        materialItems.push({
          name: 'R13 Ceiling Insulation Material (Rolls)',
          quantity: qty,
          unit: 'rolls',
          unitPrice: MATERIAL_PRICING.INSULATION.R13_ROLL,
          total: qty * MATERIAL_PRICING.INSULATION.R13_ROLL
        });
        // No insulation labor charge per pricing sheet
      }
    }

    // Check if drywall dimensions are missing
    if (formData.drywall_has_dims === 'No') {
      isPendingReview = true;
      followUpQuestions.push('What are the exact lengths and widths of the specific walls or ceiling sections requiring drywall hang or finishing?');
      followUpQuestions.push('Are there any corners, obstacles, or high ceiling heights in the drywall work areas we should be aware of?');
    }
  }

  // -------------------------------------------------------------
  // B. OTHER SERVICES LABOR (Painting & Trim - Unchanged as requested)
  // -------------------------------------------------------------

  // Painting Labor (Explicit choice in form)
  if (formData.services?.paint) {
    hasPaintService = true;
    const paintNeeds = formData.paint_needs_paint || 'entire room';
    const paintType = formData.paint_type || 'corner to corner painting';
    const isTouchUp = paintType === 'touch-up painting' || paintType === 'Touch-up painting';

    let paintArea = 0;
    let paintPerimeter = 0;

    const hasDims = formData.services?.drywall ? (formData.drywall_has_dims === 'Yes') : (formData.general_has_dims === 'Yes');

    if (isTouchUp) {
      const touchUpAreaInput = parseFloat(formData.paint_touch_up_area);
      if (isNaN(touchUpAreaInput) || touchUpAreaInput <= 0) {
        paintArea = 30; // fallback touch-up area
      } else {
        paintArea = touchUpAreaInput;
      }
    } else {
      // Corner to corner or other
      if (paintNeeds === 'walls') {
        paintArea = hasDims ? wallArea : 300;
      } else if (paintNeeds === 'celling') {
        paintArea = hasDims ? ceilingArea : 150;
      } else if (paintNeeds === 'entire room') {
        paintArea = hasDims ? (wallArea + ceilingArea) : 450;
      } else if (paintNeeds === 'trim/baseboard') {
        paintPerimeter = hasDims ? perimeter : 60;
      }
    }

    if (paintArea > 0) {
      const unitPrice = LABOR_PRICING.PAINT.PRIMER_AND_PAINT;
      const total = paintArea * unitPrice;
      laborItems.push({
        name: isTouchUp ? 'Painting: Touch-Up Spot Painting' : `Painting: Corner-to-Corner (${paintNeeds})`,
        quantity: Math.round(paintArea),
        unit: 'sqft',
        unitPrice,
        total
      });
    }

    if (paintPerimeter > 0 || paintNeeds === 'trim/baseboard') {
      const effectivePerimeter = paintPerimeter > 0 ? paintPerimeter : (hasDims ? perimeter : 60);
      const unitPrice = LABOR_PRICING.PAINT.TRIM_PAINTING;
      const total = effectivePerimeter * unitPrice;
      laborItems.push({
        name: 'Painting: Trim & Baseboard Professional Painting',
        quantity: Math.round(effectivePerimeter),
        unit: 'linear ft',
        unitPrice,
        total
      });
    }

    // Check if paint dimensions are missing
    if (!hasDims && !isTouchUp) {
      isPendingReview = true;
      followUpQuestions.push('What are the exact dimensions or surface square footage of the rooms/areas slated for painting?');
    }
  }

  // -------------------------------------------------------------
  // Trim Custom Services Labor & Demolition Calculations
  // -------------------------------------------------------------
  if (formData.services?.trim) {
    // 1. Calculate combined linear footage of all manually added areas
    let totalTrimFeet = 0;
    if (formData.trim_areas && Array.isArray(formData.trim_areas)) {
      totalTrimFeet = formData.trim_areas.reduce((sum: number, area: any) => {
        const feetVal = parseFloat(area.feet) || 0;
        return sum + Math.max(0, feetVal);
      }, 0);
    }

    // Prioritize manual areas linear footage over the room geometry perimeter fallback
    let effectiveTrimFeet = totalTrimFeet;
    if (effectiveTrimFeet === 0) {
      const hasDims = formData.services?.drywall ? (formData.drywall_has_dims === 'Yes') : (formData.general_has_dims === 'Yes');
      effectiveTrimFeet = hasDims ? perimeter : 60; // Fallback to perimeter if dimensions exist, otherwise 60 LF
    }

    const serviceType = formData.trim_services || 'install new baseboard';
    const trimStyle = formData.trim_style || 'standerd';
    
    // Capitalize style labels beautifully
    const styleLabel = trimStyle === 'standerd' ? 'Standard Style' : trimStyle === 'mordern' ? 'Modern Style' : 'Match Existing Style';

    if (serviceType === 'install new baseboard') {
      const unitPrice = LABOR_PRICING.TRIM.BASEBOARD_INSTALL; // $5.00/LF
      const total = effectiveTrimFeet * unitPrice;
      laborItems.push({
        name: `Baseboard & Trim Carpentry Installation (${styleLabel})`,
        quantity: Math.round(effectiveTrimFeet),
        unit: 'linear ft',
        unitPrice,
        total
      });
      hasMaterials = true; // Needs materials, adds trip charge
    } else if (serviceType === 'replace existing baseboard') {
      const installUnitPrice = LABOR_PRICING.TRIM.BASEBOARD_INSTALL; // $5.00/LF
      const installTotal = effectiveTrimFeet * installUnitPrice;
      laborItems.push({
        name: `Baseboard & Trim Carpentry Installation (${styleLabel})`,
        quantity: Math.round(effectiveTrimFeet),
        unit: 'linear ft',
        unitPrice: installUnitPrice,
        total: installTotal
      });

      // Demolition/Removal labor: same cost as installation
      const demoUnitPrice = installUnitPrice; // $5.00/LF
      const demoTotal = effectiveTrimFeet * demoUnitPrice;
      laborItems.push({
        name: `Baseboard & Trim Demolition & Removal`,
        quantity: Math.round(effectiveTrimFeet),
        unit: 'linear ft',
        unitPrice: demoUnitPrice,
        total: demoTotal
      });

      // Add Haul Away Charge for trim demolition if not already added by drywall demolition
      const alreadyHasHaulAway = additionalCharges.some(item => item.name.includes('Haul Away'));
      if (!alreadyHasHaulAway) {
        additionalCharges.push({
          name: 'Haul Away Logistics & Scrap Disposal (Trim Demolition Debris)',
          quantity: 1,
          unit: 'job',
          unitPrice: ADDITIONAL_CHARGES.HAUL_AWAY, // $300.00
          total: ADDITIONAL_CHARGES.HAUL_AWAY
        });
      }
      hasMaterials = true; // Needs baseboard materials, adds trip charge
    } else if (serviceType === 'repair existing trim') {
      const unitPrice = LABOR_PRICING.TRIM.BASEBOARD_INSTALL; // $5.00/LF
      const total = effectiveTrimFeet * unitPrice;
      laborItems.push({
        name: `Trim & Baseboard Carpentry Precision Repair (${styleLabel})`,
        quantity: Math.round(effectiveTrimFeet),
        unit: 'linear ft',
        unitPrice,
        total
      });
    } else if (serviceType === 'paint existing trim') {
      const unitPrice = LABOR_PRICING.PAINT.TRIM_PAINTING; // $10.00/LF
      const total = effectiveTrimFeet * unitPrice;
      
      // Check if trim painting labor is already added by general paint selection
      const alreadyAdded = laborItems.some(item => item.name.includes('Trim & Baseboard Professional Painting'));
      if (!alreadyAdded) {
        laborItems.push({
          name: `Painting: Trim & Baseboard Professional Painting (${styleLabel})`,
          quantity: Math.round(effectiveTrimFeet),
          unit: 'linear ft',
          unitPrice,
          total
        });
      }
      hasPaintService = true; // Triggers paint tint setup charge ($75.00)
    }
  }

  // -------------------------------------------------------------
  // C. MATERIAL CALCULATIONS (Deterministic & Rule-Based)
  // -------------------------------------------------------------

  if (formData.services?.drywall && drywallArea > 0) {
    hasMaterials = true;

    const workType = formData.drywall_work_type || 'entire room installation';
    const isRepair = workType === 'small hole repair' || workType === 'medium patch repair' || workType === 'larger sections repair';

    if (isRepair && formData.drywall_has_dims !== 'Yes') {
      // Flat rate patching materials list
      let matPrice = 50.00;
      let matName = 'Drywall Small Repair Patching Supplies & Mud';
      if (workType === 'medium patch repair') {
        matPrice = 75.00;
        matName = 'Drywall Medium Repair Patching Supplies, Tape & Mud';
      } else if (workType === 'larger sections repair') {
        matPrice = 150.00;
        matName = 'Drywall Large Section Patching Supplies, Tape, Screws & Mud';
      }

      materialItems.push({
        name: matName,
        quantity: 1,
        unit: 'job',
        unitPrice: matPrice,
        total: matPrice
      });
    } else {
      // Large scale installation or repairs with dimensions
      const drywallAreaWithWaste = addWaste(drywallArea, 0.10);
      const drywallSheets = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.DRYWALL_SHEET);

      if (drywallSheets > 0) {
        materialItems.push({
          name: '1/2" Lightweight Drywall Sheet (8ft)',
          quantity: drywallSheets,
          unit: 'sheets',
          unitPrice: MATERIAL_PRICING.DRYWALL.SHEET_1_2_LIGHTWEIGHT,
          total: drywallSheets * MATERIAL_PRICING.DRYWALL.SHEET_1_2_LIGHTWEIGHT
        });

        // Joint Compound: 1 bucket covers 150 sqft
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

        // Screws: 5lb box up to 12 sheets, 25lb bucket per 50 sheets
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
        if (activeWallArea > 0) {
          const beadsNeeded = roundUpToNearestInteger(activeWallArea / MATERIAL_COVERAGE.CORNER_BEAD_WALL_SQFT);
          materialItems.push({
            name: 'Corner Bead 8ft',
            quantity: beadsNeeded,
            unit: 'pcs',
            unitPrice: MATERIAL_PRICING.SUPPLIES.CORNER_BEAD_8FT,
            total: beadsNeeded * MATERIAL_PRICING.SUPPLIES.CORNER_BEAD_8FT
          });
        }

        // Texture Buckets (if texture is Orange Peel and not level 4 smooth)
        const textureType = formData.drywall_texture || 'orange peel';
        if (textureType !== 'smooth finish') {
          const textureQty = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.TEXTURE_BUCKET);
          materialItems.push({
            name: 'Drywall Spray Texture Compound Bucket',
            quantity: textureQty,
            unit: 'buckets',
            unitPrice: MATERIAL_PRICING.SUPPLIES.TEXTURE_BUCKET,
            total: textureQty * MATERIAL_PRICING.SUPPLIES.TEXTURE_BUCKET
          });
        }

        // Always recommend primer for new drywall (covers 400 sqft per 2 gal bucket)
        const primerBuckets = roundUpToNearestInteger(drywallAreaWithWaste / MATERIAL_COVERAGE.PRIMER_BUCKET);
        materialItems.push({
          name: 'Kilz Drywall Primer (2 Gal bucket)',
          quantity: primerBuckets,
          unit: 'buckets',
          unitPrice: MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL,
          total: primerBuckets * MATERIAL_PRICING.SUPPLIES.KILZ_PRIMER_2GAL
        });
      }
    }
  }

  // Paint materials (only if paint is selected, and they do not already have the paint)
  if (
    formData.services?.paint && 
    formData.paint_has_paint === 'No'
  ) {
    const paintNeeds = formData.paint_needs_paint || 'entire room';
    const paintType = formData.paint_type || 'corner to corner painting';
    const isTouchUp = paintType === 'touch-up painting' || paintType === 'Touch-up painting';

    const hasDims = formData.services?.drywall ? (formData.drywall_has_dims === 'Yes') : (formData.general_has_dims === 'Yes');

    let paintArea = 0;
    if (isTouchUp) {
      const touchUpAreaInput = parseFloat(formData.paint_touch_up_area);
      paintArea = (isNaN(touchUpAreaInput) || touchUpAreaInput <= 0) ? 30 : touchUpAreaInput;
    } else {
      if (paintNeeds === 'walls') {
        paintArea = hasDims ? wallArea : 300;
      } else if (paintNeeds === 'celling') {
        paintArea = hasDims ? ceilingArea : 150;
      } else if (paintNeeds === 'entire room') {
        paintArea = hasDims ? (wallArea + ceilingArea) : 450;
      }
    }

    if (paintArea > 0) {
      hasMaterials = true;
      const paintAreaWithWaste = addWaste(paintArea, 0.15); // Add 15% paint waste

      // Calculate paint primer buckets (2 Gal covers 400 sqft)
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
  // D. ADDITIONAL CHARGES & TRIP FEES
  // -------------------------------------------------------------

  if (hasMaterials) {
    additionalCharges.push({
      name: 'Store Material Procurement & Freight Trip Charge',
      quantity: 1,
      unit: 'trip',
      unitPrice: ADDITIONAL_CHARGES.STORE_TRIP,
      total: ADDITIONAL_CHARGES.STORE_TRIP
    });
  }

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
  // E. SUBTOTALS & GRAND TOTAL SUM
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
