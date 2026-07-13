import { PRICING } from '../data/pricing';
import type { CustomQuestionRecord } from './customQuestionsStore';

export interface LineItem {
  area: string;
  label: string;
  detail: string;
  amount: number;
}

export interface EstimateResult {
  lineItems: LineItem[];
  subtotal: number;
}

interface AreaValues {
  [key: string]: any;
}

export function calculateEstimate(
  data: { drywall: AreaValues[], trim: AreaValues[], paint: AreaValues[] },
  customQuestions: CustomQuestionRecord[] = []
): EstimateResult {
  const lineItems: LineItem[] = [];
  let subtotal = 0;

  const addItem = (area: string, label: string, detail: string, amount: number) => {
    if (amount > 0) {
      lineItems.push({ area, label, detail, amount });
      subtotal += amount;
    }
  };

  // Check if anything needs a trip charge
  let hasPaint = false;

  data.drywall.forEach((area, i) => {
    const areaName = `Drywall Area ${i + 1}`;
    const repairType = area.repairType;
    if (!repairType) return;

    // 1. Repair Type
    const sqft = parseFloat(area.squareFootage) || 0;
    const lft = parseFloat(area.linearFeet) || 0;
    let repairPrice = 0;

    if (repairType === 'Walls') repairPrice = sqft * PRICING.drywall.walls;
    else if (repairType === 'Ceiling') repairPrice = sqft * PRICING.drywall.ceiling;
    else if (repairType === 'Bathroom Walls') repairPrice = sqft * PRICING.drywall.bathroomWalls;
    else if (repairType === 'Bathroom Ceiling') repairPrice = sqft * PRICING.drywall.bathroomCeiling;
    else if (repairType === 'Crack Repair Wall') {
      if (lft < 5) repairPrice = PRICING.crackRepairWall.flatFeeUnder5ft;
      else {
        const tier = PRICING.crackRepairWall.tiers.find(t => lft <= t.maxFt);
        repairPrice = lft * (tier?.price || 75);
      }
    }
    else if (repairType === 'Crack repair ceiling') {
      if (lft < 5) repairPrice = PRICING.crackRepairCeiling.flatFeeUnder5ft;
      else {
        const tier = PRICING.crackRepairCeiling.tiers.find(t => lft <= t.maxFt);
        repairPrice = lft * (tier?.price || 95);
      }
    }
    addItem(areaName, `Repair: ${repairType}`, sqft > 0 ? `${sqft} sqft` : `${lft} lft`, repairPrice);

    // Dividing wall
    if (area.dividingWall === 'Yes') {
      addItem(areaName, 'Dividing Wall Surcharge', `${sqft} sqft`, sqft * PRICING.drywall.dividingWall);
    }

    // Floor Level
    if (area.projectLocation && PRICING.floors[area.projectLocation]) {
      addItem(areaName, `Floor Surcharge: ${area.projectLocation}`, 'Flat Fee', PRICING.floors[area.projectLocation]);
    }

    // Staircase
    if (area.staircase === 'Yes') {
      addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
    }

    // Demolition
    if (area.needDemolition && PRICING.demolition[area.needDemolition]) {
      const demoRate = PRICING.demolition[area.needDemolition];
      const demoQty = area.needDemolition === 'Base board' || area.needDemolition === 'Door casing' 
        ? parseFloat(area.demolitionLinearFeet) || 0 
        : parseFloat(area.demolitionSquareFootage) || 0;
      addItem(areaName, `Demolition: ${area.needDemolition}`, `${demoQty} unit(s)`, demoQty * demoRate);
    } else if (area.needDemolition === 'Popcorn Ceiling scraping') {
      const h = parseFloat(area.ceilingHeight) || 8;
      const dSqft = parseFloat(area.demolitionSquareFootage) || 0;
      const tier = PRICING.popcornScraping.tiers.find(t => h <= t.maxFt);
      const rate = tier?.price || 4.00;
      addItem(areaName, 'Popcorn Ceiling Scraping', `${dSqft} sqft @ ${h}ft height`, dSqft * rate);
    }

    // Haul Away
    if (area.needHaulAway === 'Yes') {
      // User said "count haulaway same" -> use demolition sqft if not provided directly
      let hSqft = parseFloat(area.haulAwaySquareFootage);
      if (isNaN(hSqft)) hSqft = parseFloat(area.demolitionSquareFootage) || 0;
      if (hSqft > 0) {
        if (hSqft < 50) addItem(areaName, 'Haul Away', 'Under 50 sqft', PRICING.haulAway.baseFeeUnder50);
        else addItem(areaName, 'Haul Away', `${hSqft} sqft`, hSqft * PRICING.haulAway.perSqftAbove50);
      }
    }

    // Insulation
    if (area.needInsulation && PRICING.insulation[area.needInsulation]) {
      const ins = PRICING.insulation[area.needInsulation];
      let insSqft = parseFloat(area.insulationSquareFootage) || 0;
      if (insSqft > 0) {
        if (insSqft < ins.minSqft) insSqft = ins.minSqft;
        addItem(areaName, `Insulation: ${area.needInsulation}`, `${insSqft} sqft (min applied)`, insSqft * ins.price);
      }
    }

    // Corner Metals
    if (area.needCornerMetal === 'Yes' && typeof area.cornerMetals === 'string') {
      try {
        const metals = JSON.parse(area.cornerMetals);
        metals.forEach((m: any) => {
          const mType = m.metalType as keyof typeof PRICING.cornerMetal;
          const qty = parseFloat(m.quantity) || 0;
          if (mType && qty > 0 && PRICING.cornerMetal[mType]) {
            addItem(areaName, `Corner Metal: ${mType}`, `${qty} qty`, qty * PRICING.cornerMetal[mType]);
          }
        });
      } catch (e) {}
    }

    // Arch Corner Metals
    if (area.needArchCornerMetal === 'Yes' && typeof area.archCornerMetals === 'string') {
      try {
        const metals = JSON.parse(area.archCornerMetals);
        metals.forEach((m: any) => {
          const qty = parseFloat(m.quantity) || 0;
          const height = parseFloat(m.height) || 0;
          const width = parseFloat(m.width) || 0;
          const lft = (height + width) * qty; // Total linear feet
          if (lft > 0) {
            const mType = m.metalType === 'Arch Bullnose' ? 'archBullnose' : 'arch90';
            addItem(areaName, `Arch Metal: ${m.metalType}`, `${lft} lft`, lft * PRICING.cornerMetal[mType]);
          }
        });
      } catch (e) {}
    }

    // Texture
    if (area.texture && PRICING.texture[area.texture]) {
      addItem(areaName, `Texture: ${area.texture}`, `${sqft} sqft`, sqft * PRICING.texture[area.texture]);
    }

    // Process Custom Questions
    customQuestions.filter(q => q.path === 'drywall').forEach(cq => {
      const val = area[cq.config.id];
      if (!val) return;
      const rule = cq.config.pricingRules?.[val] || (cq.config.type === 'number' ? cq.config.pricingRules?.['multiplier'] : null);
      if (rule) {
        if (rule.type === 'flat') {
          addItem(areaName, `Custom: ${cq.config.label} (${val})`, 'Flat Fee', rule.amount);
        } else if (rule.type === 'per_unit') {
          const qty = parseFloat(val) || 0;
          if (qty > 0) {
            addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount);
          }
        }
      }
    });
  });

  data.trim.forEach((area, i) => {
    const areaName = `Trim Area ${i + 1}`;
    if (!area.service) return;

    // ── Baseboard ──────────────────────────────────────────────────────────
    if (area.service.includes('Baseboard')) {
      const lft = parseFloat(area.baseboardLinearFeet) || 0;
      if (lft > 0) {
        const height = area.baseboardHeight || '6';   // default to 6" if not selected
        const heightKey = String(parseInt(height) || 6);  // normalise to '6','7','8','9','10'
        // Per-height rates: 6->$5, 7->$6, 8->$6.50, 9->$7, 10->$7.50
        const rate = PRICING.trim.baseboard[heightKey] ?? 5.00;
        addItem(areaName, `Trim: Baseboards (${heightKey}" height)`, `${lft} lft`, lft * rate);
      }
    }

    // ── Door Casing ─────────────────────────────────────────────────────────
    if (area.service.includes('Casing')) {
      const lft = parseFloat(area.casingLinearFeet) || 0;
      if (lft > 0) {
        addItem(areaName, `Trim: Door Casing`, `${lft} lft`, lft * PRICING.trim.doorCasing);
      }
    }

    if (area.projectLevel && PRICING.floors[area.projectLevel]) {
      addItem(areaName, `Floor Surcharge: ${area.projectLevel}`, 'Flat Fee', PRICING.floors[area.projectLevel]);
    }
    if (area.staircase === 'Yes') {
      addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
    }

    // Process Custom Questions
    customQuestions.filter(q => q.path === 'trim').forEach(cq => {
      const val = area[cq.config.id];
      if (!val) return;
      const rule = cq.config.pricingRules?.[val] || (cq.config.type === 'number' ? cq.config.pricingRules?.['multiplier'] : null);
      if (rule) {
        if (rule.type === 'flat') {
          addItem(areaName, `Custom: ${cq.config.label} (${val})`, 'Flat Fee', rule.amount);
        } else if (rule.type === 'per_unit') {
          const qty = parseFloat(val) || 0;
          if (qty > 0) {
            addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount);
          }
        }
      }
    });
  });


  data.paint.forEach((area, i) => {
    const areaName = `Paint Area ${i + 1}`;
    if (!area.paintArea) return;
    hasPaint = true;

    const isLinear = area.paintArea === 'Baseboards' || area.paintArea === 'Door Casing';
    const qty = parseFloat(isLinear ? area.linearFeet : area.squareFootage) || 0;

    if (qty > 0) {
      const rate = isLinear ? PRICING.paint.baseboard : PRICING.paint.wallsCeiling;
      addItem(areaName, `Paint: ${area.paintArea}`, `${qty} ${isLinear ? 'lft' : 'sqft'}`, qty * rate);

      // Paint material/labor tiers
      let tierList = isLinear ? PRICING.paint.linearFtTiers : PRICING.paint.sqftTiers;
      const tier = tierList.find(t => isLinear ? qty <= (t as any).maxFt : qty <= (t as any).maxSqft);
      if (tier) {
        // Calculate paint cost (round up gallons logic handles this inherently by step tiers)
        // Wait, spec: "Always round up per square footage. Paint will be a standard Behr paint for HD... $45 per gallon based on square footage"
        const paintCost = tier.gallons * PRICING.paint.gallonPrice;
        addItem(areaName, `Paint Materials (${tier.gallons} gal)`, 'Behr Paint', paintCost);
        addItem(areaName, `Paint Base Labor`, 'Flat Fee', tier.baseLabor);
      }
    }

    if (area.projectLevel && PRICING.floors[area.projectLevel]) {
      addItem(areaName, `Floor Surcharge: ${area.projectLevel}`, 'Flat Fee', PRICING.floors[area.projectLevel]);
    }
    if (area.staircase === 'Yes') {
      addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
    }

    // Process Custom Questions
    customQuestions.filter(q => q.path === 'paint').forEach(cq => {
      const val = area[cq.config.id];
      if (!val) return;
      const rule = cq.config.pricingRules?.[val] || (cq.config.type === 'number' ? cq.config.pricingRules?.['multiplier'] : null);
      if (rule) {
        if (rule.type === 'flat') {
          addItem(areaName, `Custom: ${cq.config.label} (${val})`, 'Flat Fee', rule.amount);
        } else if (rule.type === 'per_unit') {
          const qty = parseFloat(val) || 0;
          if (qty > 0) {
            addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount);
          }
        }
      }
    });
  });

  if (hasPaint) {
    addItem('Project', 'Trip Charge', 'Once per project', PRICING.tripCharge);
  }

  return { lineItems, subtotal };
}
