import { PRICING } from '../data/pricing';
import type { CustomQuestionRecord } from './customQuestionsStore';
import type { ProductPriceMap } from './productPricesStore';
import { pricePerLft } from './productPricesStore';

export interface LineItem {
  area: string;
  label: string;
  detail: string;
  amount: number;
  isOutOfStock?: boolean;
  /** Present only for measured items (lft/sqft/qty-based). When set, the UI
   *  allows editing `quantity` and recomputes `amount = quantity * rate`.
   *  Absent for flat-fee items (surcharges, trip charge, etc.) — those are
   *  never quantity-editable. */
  quantity?: number;
  rate?: number;
  unit?: 'lft' | 'sqft' | 'unit';
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
  customQuestions: CustomQuestionRecord[] = [],
  productPrices: ProductPriceMap = {},
): EstimateResult {
  const lineItems: LineItem[] = [];
  let subtotal = 0;

  const addItem = (
    area: string,
    label: string,
    detail: string,
    amount: number,
    measured?: { quantity: number; rate: number; unit: 'lft' | 'sqft' | 'unit' },
  ) => {
    if (amount > 0) {
      lineItems.push({
        area,
        label,
        detail,
        amount,
        ...(measured ? { quantity: measured.quantity, rate: measured.rate, unit: measured.unit } : {}),
      });
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
    let repairRate = 0;
    let repairQty = 0;
    let repairUnit: 'lft' | 'sqft' = 'sqft';

    if (repairType === 'Walls') {
      repairRate = PRICING.drywall.walls; repairQty = sqft; repairUnit = 'sqft';
      repairPrice = sqft * repairRate;
    } else if (repairType === 'Ceiling') {
      repairRate = PRICING.drywall.ceiling; repairQty = sqft; repairUnit = 'sqft';
      repairPrice = sqft * repairRate;
    } else if (repairType === 'Bathroom Walls') {
      repairRate = PRICING.drywall.bathroomWalls; repairQty = sqft; repairUnit = 'sqft';
      repairPrice = sqft * repairRate;
    } else if (repairType === 'Bathroom Ceiling') {
      repairRate = PRICING.drywall.bathroomCeiling; repairQty = sqft; repairUnit = 'sqft';
      repairPrice = sqft * repairRate;
    } else if (repairType === 'Crack Repair Wall') {
      repairQty = lft; repairUnit = 'lft';
      if (lft < 5) {
        repairPrice = PRICING.crackRepairWall.flatFeeUnder5ft;
        // Flat fee under 5ft — not a clean per-unit rate, so don't expose quantity editing
        repairRate = 0;
      } else {
        const tier = PRICING.crackRepairWall.tiers.find(t => lft <= t.maxFt);
        repairRate = tier?.price || 75;
        repairPrice = lft * repairRate;
      }
    } else if (repairType === 'Crack repair ceiling') {
      repairQty = lft; repairUnit = 'lft';
      if (lft < 5) {
        repairPrice = PRICING.crackRepairCeiling.flatFeeUnder5ft;
        repairRate = 0;
      } else {
        const tier = PRICING.crackRepairCeiling.tiers.find(t => lft <= t.maxFt);
        repairRate = tier?.price || 95;
        repairPrice = lft * repairRate;
      }
    }

    addItem(
      areaName,
      `Repair: ${repairType}`,
      sqft > 0 ? `${sqft} sqft` : `${lft} lft`,
      repairPrice,
      repairRate > 0 ? { quantity: repairQty, rate: repairRate, unit: repairUnit } : undefined,
    );

    // Dividing wall
    if (area.dividingWall === 'Yes') {
      addItem(areaName, 'Dividing Wall Surcharge', `${sqft} sqft`, sqft * PRICING.drywall.dividingWall, {
        quantity: sqft, rate: PRICING.drywall.dividingWall, unit: 'sqft',
      });
    }

    // Floor Level (flat fee — no quantity)
    if (area.projectLocation && PRICING.floors[area.projectLocation]) {
      addItem(areaName, `Floor Surcharge: ${area.projectLocation}`, 'Flat Fee', PRICING.floors[area.projectLocation]);
    }

    // Staircase (flat fee — no quantity)
    if (area.staircase === 'Yes') {
      addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
    }

    // Demolition
    if (area.needDemolition && PRICING.demolition[area.needDemolition]) {
      const demoRate = PRICING.demolition[area.needDemolition];
      const isLinear = area.needDemolition === 'Base board' || area.needDemolition === 'Door casing';
      const demoQty = isLinear
        ? parseFloat(area.demolitionLinearFeet) || 0
        : parseFloat(area.demolitionSquareFootage) || 0;
      addItem(areaName, `Demolition: ${area.needDemolition}`, `${demoQty} unit(s)`, demoQty * demoRate, {
        quantity: demoQty, rate: demoRate, unit: isLinear ? 'lft' : 'sqft',
      });
    } else if (area.needDemolition === 'Popcorn Ceiling scraping') {
      const h = parseFloat(area.ceilingHeight) || 8;
      const dSqft = parseFloat(area.demolitionSquareFootage) || 0;
      const tier = PRICING.popcornScraping.tiers.find(t => h <= t.maxFt);
      const rate = tier?.price || 4.00;
      addItem(areaName, 'Popcorn Ceiling Scraping', `${dSqft} sqft @ ${h}ft height`, dSqft * rate, {
        quantity: dSqft, rate, unit: 'sqft',
      });
    }

    // Haul Away
    if (area.needHaulAway === 'Yes') {
      let hSqft = parseFloat(area.haulAwaySquareFootage);
      if (isNaN(hSqft)) hSqft = parseFloat(area.demolitionSquareFootage) || 0;
      if (hSqft > 0) {
        if (hSqft < 50) {
          // Flat fee under 50 sqft — no clean per-unit rate to edit against
          addItem(areaName, 'Haul Away', 'Under 50 sqft', PRICING.haulAway.baseFeeUnder50);
        } else {
          addItem(areaName, 'Haul Away', `${hSqft} sqft`, hSqft * PRICING.haulAway.perSqftAbove50, {
            quantity: hSqft, rate: PRICING.haulAway.perSqftAbove50, unit: 'sqft',
          });
        }
      }
    }

    // Insulation
    if (area.needInsulation && PRICING.insulation[area.needInsulation]) {
      const ins = PRICING.insulation[area.needInsulation];
      let insSqft = parseFloat(area.insulationSquareFootage) || 0;
      if (insSqft > 0) {
        if (insSqft < ins.minSqft) insSqft = ins.minSqft;
        addItem(areaName, `Insulation: ${area.needInsulation}`, `${insSqft} sqft (min applied)`, insSqft * ins.price, {
          quantity: insSqft, rate: ins.price, unit: 'sqft',
        });
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
            addItem(areaName, `Corner Metal: ${mType}`, `${qty} qty`, qty * PRICING.cornerMetal[mType], {
              quantity: qty, rate: PRICING.cornerMetal[mType], unit: 'unit',
            });
          }
        });
      } catch (e) { }
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
            addItem(areaName, `Arch Metal: ${m.metalType}`, `${lft} lft`, lft * PRICING.cornerMetal[mType], {
              quantity: lft, rate: PRICING.cornerMetal[mType], unit: 'lft',
            });
          }
        });
      } catch (e) { }
    }

    // Texture
    if (area.texture && PRICING.texture[area.texture]) {
      addItem(areaName, `Texture: ${area.texture}`, `${sqft} sqft`, sqft * PRICING.texture[area.texture], {
        quantity: sqft, rate: PRICING.texture[area.texture], unit: 'sqft',
      });
    }

    // Ceiling Height Surcharge (above 8ft)
    if (area.ceilingAbove8 === 'Yes') {
      const h = Math.floor(parseFloat(area.ceilingHeight) || 9);
      const heightKey = String(Math.min(h, 12));
      const rate = PRICING.ceilingHeightSurcharge[heightKey] ?? 0;
      if (rate > 0 && sqft > 0) {
        addItem(areaName, `High Ceiling Surcharge (${h}ft)`, `${sqft} sqft @ $${rate}/sqft`, sqft * rate, {
          quantity: sqft, rate, unit: 'sqft',
        });
      }
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
            addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount, {
              quantity: qty, rate: rule.amount, unit: 'unit',
            });
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
        const catalogUrl = typeof area.baseboardCatalog === 'string' ? area.baseboardCatalog : '';
        const materialRate = catalogUrl ? pricePerLft(productPrices, catalogUrl) : null;
        const height = area.baseboardHeight || '6';
        const heightKey = String(parseInt(height) || 6);
        const laborRate = PRICING.trim.baseboard[heightKey] ?? 5.00;
        if (catalogUrl) {
          addItem(areaName, 'Trim: Baseboard labor', `${lft} lft`, lft * laborRate, {
            quantity: lft, rate: laborRate, unit: 'lft',
          });
          if (materialRate != null) {
            addItem(areaName, 'Trim: Baseboard material', `${lft} lft @ $${materialRate}/lft`, lft * materialRate, {
              quantity: lft, rate: materialRate, unit: 'lft',
            });
          } else {
            lineItems.push({
              area: areaName,
              label: 'Trim: Baseboard material',
              detail: 'Out of stock',
              amount: 0,
              isOutOfStock: true
            });
          }
        } else {
          addItem(areaName, `Trim: Baseboards (${heightKey}" height)`, `${lft} lft`, lft * laborRate, {
            quantity: lft, rate: laborRate, unit: 'lft',
          });
        }
      }
    }

    if (area.service.includes('Casing')) {
      const lft = parseFloat(area.casingLinearFeet) || 0;
      if (lft > 0) {
        const catalogUrl = typeof area.baseboardCatalog === 'string' ? area.baseboardCatalog : '';
        const materialRate = catalogUrl ? pricePerLft(productPrices, catalogUrl) : null;
        const laborRate = PRICING.trim.doorCasing;
        if (catalogUrl) {
          addItem(areaName, 'Trim: Casing labor', `${lft} lft`, lft * laborRate, {
            quantity: lft, rate: laborRate, unit: 'lft',
          });
          if (materialRate != null) {
            addItem(areaName, 'Trim: Casing material', `${lft} lft @ $${materialRate}/lft`, lft * materialRate, {
              quantity: lft, rate: materialRate, unit: 'lft',
            });
          } else {
            lineItems.push({
              area: areaName,
              label: 'Trim: Casing material',
              detail: 'Out of stock',
              amount: 0,
              isOutOfStock: true
            });
          }
        } else {
          addItem(areaName, 'Trim: Door Casing', `${lft} lft`, lft * laborRate, {
            quantity: lft, rate: laborRate, unit: 'lft',
          });
        }
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
            addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount, {
              quantity: qty, rate: rule.amount, unit: 'unit',
            });
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
      addItem(areaName, `Paint: ${area.paintArea}`, `${qty} ${isLinear ? 'lft' : 'sqft'}`, qty * rate, {
        quantity: qty, rate, unit: isLinear ? 'lft' : 'sqft',
      });

      // Paint material/labor tiers — tier-based, not a clean linear per-unit
      // rate, so these are intentionally left non-quantity-editable (flat).
      let tierList = isLinear ? PRICING.paint.linearFtTiers : PRICING.paint.sqftTiers;
      const tier = tierList.find(t => isLinear ? qty <= (t as any).maxFt : qty <= (t as any).maxSqft);
      if (tier) {
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
            addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount, {
              quantity: qty, rate: rule.amount, unit: 'unit',
            });
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
