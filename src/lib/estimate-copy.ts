// import { PRICING } from '../data/pricing';
// import type { CustomQuestionRecord } from './customQuestionsStore';
// // import { trimConfig } from '../data/trimConfig';

// export interface HomeDepotProduct {
//   image: string;
//   productName: string;
//   productUrl: string;
//   unitPrice: number;
//   packSize?: string;
// }

// export interface LineItem {
//   area: string;
//   label: string;
//   detail: string;
//   amount: number;
//   isOutOfStock?: boolean;
//   /** Present only for measured items (lft/sqft/qty-based). When set, the UI
//    *  allows editing `quantity` and recomputes `amount = quantity * rate`.
//    *  Absent for flat-fee items (surcharges, trip charge, etc.) — those are
//    *  never quantity-editable. */
//   quantity?: number;
//   rate?: number;
//   unit?: 'lft' | 'sqft' | 'unit';
//   /** Home Depot product metadata — present on material line items sourced from the HD catalog. */
//   homeDepotProduct?: HomeDepotProduct;
// }

// export interface EstimateResult {
//   lineItems: LineItem[];
//   subtotal: number;
// }

// interface AreaValues {
//   [key: string]: any;
// }

// /** Look up a catalog product by its Home Depot URL from trimConfig. */
// function findCatalogProduct(url: string): { name: string; image: string; url: string } | null {
//   for (const q of trimConfig) {
//     if (q.catalog) {
//       for (const cat of q.catalog) {
//         for (const p of cat.products) {
//           if (p.url === url && p.name !== 'None of the above') {
//             return { name: p.name, image: p.image || '', url: p.url };
//           }
//         }
//       }
//     }
//   }
//   return null;
// }

// const PRODUCT_LENGTHS: Record<string, number> = {
//   // Baseboard 3"
//   'https://www.homedepot.com/p/Kelleher-LWM623-9-16-in-x-3-1-4-in-MDF-Baseboard-Molding-MDF221A/202071604': 16,
//   'https://www.homedepot.com/p/Builders-Choice-Pro-Pack-OP306-1-2-in-x-3-1-2-in-x-144-in-Primed-MDF-Baseboard-Moulding-8-Pack-96-Total-Linear-Feet-HDFB306-PP/306717387': 96,
//   'https://www.homedepot.com/p/FINISHED-ELEGANCE-1-in-x-3-in-x-8-ft-MDF-Molding-Board-10003223/204468315': 8,
//   'https://www.homedepot.com/p/Woodgrain-Millwork-713-9-16-in-x-3-1-4-in-x-96-in-Primed-Finger-Jointed-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10000568/203209374': 8,

//   // Baseboard 4"
//   'https://www.homedepot.com/p/FINISHED-ELEGANCE-1-in-x-4-in-x-8-ft-MDF-Molding-Boards-10003222/204468314': 8,
//   'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-1-2-in-x-4-in-x-84-in-Primed-E1E-MDF-Baseboard-Moulding-4-Pack-28-Total-Linear-Feet-01240-96084PK/331387080': 28,
//   'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-9-16-in-x-4-1-4-in-x-96-in-Primed-White-Pine-Baseboard-Moulding-4-Pack-32-Total-Linear-Feet-00LK4-93096PK/331519591': 32,
//   'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-5-8-in-x-4-1-4-in-x-96-in-Primed-MDF-Baseboard-Moulding-4-Pack-32-Total-Linear-Feet-90412-96096PK/331387087': 32,

//   // Baseboard 5"
//   'https://www.homedepot.com/p/Woodgrain-Millwork-1866-9-16-in-x-5-1-4-in-x-96-in-Primed-MDF-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10001790/203209462': 8,
//   'https://www.homedepot.com/p/Woodgrain-Millwork-11-16-in-x-5-1-2-in-x-96-in-Primed-MDF-Craftsman-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10026967/302793194': 8,
//   'https://www.homedepot.com/p/HOUSE-OF-FARA-5-8-in-D-x-5-1-4-in-W-x-96-in-L-Primed-Pine-Wood-Finger-Joint-Baseboard-Moulding-5709PFJ/340059370': 8,
//   'https://www.homedepot.com/p/Woodgrain-Millwork-618-9-16-in-x-5-1-4-in-x-96-in-Primed-Finger-Jointed-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10001781/203209486': 8,

//   // Baseboard 6"
//   'https://www.homedepot.com/p/Unbranded-1-in-x-6-in-x-8-ft-Radiata-Pine-Finger-Joint-Primed-Board-280552/304468198': 8,
//   'https://www.homedepot.com/p/Builder-s-Choice-257-5-8-in-x-6-in-Primed-MDF-Baseboard-Moulding-Sold-by-Linear-Foot-HDFB257/206005284': 1,
//   'https://www.homedepot.com/p/HOUSE-OF-FARA-8665-3-4-in-x-6-1-2-in-x-96-in-MDF-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-8665/202087580': 8,
//   'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-6-in-W-x-96-in-L-Primed-Pine-Wood-Finger-Joint-Baseboard-Moulding-H20PFJ/339857100': 8,

//   // Casing 2"
//   'https://www.homedepot.com/p/WM-356-11-16-in-x-2-1-4-in-x-84-in-Primed-Finger-Jointed-Casing-10000527/206001677': 7,
//   'https://www.homedepot.com/p/Woodgrain-Millwork-25E2-11-16-in-x-2-1-2-in-x-96-in-Craftsman-Primed-MDF-Casing-1-Piece-8-Total-Linear-Feet-10026964/302792237': 8,
//   'https://www.homedepot.com/p/711-5-8-in-x-2-1-2-in-x-7-ft-MDF-Casing-MDF424A-1/204685095': 7,
//   'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-2-1-2-in-W-x-84-in-L-Primed-Pine-Wood-PFJ-Casing-Moulding-361PFJ/334803846': 7,

//   // Casing 3"
//   'https://www.homedepot.com/p/RB03-1-in-x-3-1-2-in-x-96-in-Primed-MDF-Casing-1-Piece-8-Total-Linear-Feet-10002037/204167646': 8,
//   'https://www.homedepot.com/p/Woodgrain-Millwork-LWM-445-5-8-in-x-3-1-4-in-x-96-in-Primed-Finger-Jointed-Casing-10000550/203209381': 8,
//   'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-3-1-4-in-W-x-96-in-L-Primed-Pine-Finger-Joint-Wood-Casing-Moulding-W360-PFJ/340684060': 8,
//   'https://www.homedepot.com/p/Builders-Choice-Pro-Pack-434-11-16-in-x-3-1-2-in-x-84-in-Craftsman-Finished-MDF-Primed-White-Casing-5-Pack-35-Total-Linear-Feet-FECS434DP/304065772': 35
// };

// function getProductLength(url: string): number {
//   const normalizedUrl = url.split('?')[0].replace(/\/$/, '');
//   return PRODUCT_LENGTHS[normalizedUrl] ?? 16;
// }

// export function calculateEstimate(
//   data: {
//     drywall: AreaValues[];
//     paint: AreaValues[];
//     sameWorkArea?: string;
//   },
//   customQuestions: CustomQuestionRecord[] = [],
// ): EstimateResult {
//   const lineItems: LineItem[] = [];
//   let subtotal = 0;
//   const sameWorkArea = data.sameWorkArea ?? 'Yes';

//   const chargedFloors = new Set<string>();
//   let chargedStaircase = false;

//   const addItem = (
//     area: string,
//     label: string,
//     detail: string,
//     amount: number,
//     measured?: { quantity: number; rate: number; unit: 'lft' | 'sqft' | 'unit' },
//     hdProduct?: HomeDepotProduct,
//   ) => {
//     if (amount > 0) {
//       lineItems.push({
//         area,
//         label,
//         detail,
//         amount,
//         ...(measured ? { quantity: measured.quantity, rate: measured.rate, unit: measured.unit } : {}),
//         ...(hdProduct ? { homeDepotProduct: hdProduct } : {}),
//       });
//       subtotal += amount;
//     }
//   };

//   // Check if anything needs a trip charge
//   let hasPaint = false;

//   data.drywall.forEach((area, i) => {
//     const areaName = `Drywall Area ${i + 1}`;
//     const repairType = area.repairType;
//     if (!repairType) return;

//     // 1. Repair Type
//     const sqft = parseFloat(area.squareFootage) || 0;
//     const lft = parseFloat(area.linearFeet) || 0;
//     let repairPrice = 0;
//     let repairRate = 0;
//     let repairQty = 0;
//     let repairUnit: 'lft' | 'sqft' = 'sqft';

//     if (repairType === 'Wall') {
//       repairRate = PRICING.drywall.walls; repairQty = sqft; repairUnit = 'sqft';
//       repairPrice = sqft * repairRate;
//     } else if (repairType === 'Ceiling') {
//       repairRate = PRICING.drywall.ceiling; repairQty = sqft; repairUnit = 'sqft';
//       repairPrice = sqft * repairRate;
//     } else if (repairType === 'Bathroom wall') {
//       repairRate = PRICING.drywall.bathroomWalls; repairQty = sqft; repairUnit = 'sqft';
//       repairPrice = sqft * repairRate;
//     } else if (repairType === 'Bathroom Ceiling') {
//       repairRate = PRICING.drywall.bathroomCeiling; repairQty = sqft; repairUnit = 'sqft';
//       repairPrice = sqft * repairRate;
//     } else if (repairType === 'Arch') {
//       repairRate = PRICING.drywall.arch; repairQty = lft; repairUnit = 'lft';
//       repairPrice = lft * repairRate;
//     } else if (repairType === 'Wall Crack Repair') {
//       repairQty = lft; repairUnit = 'lft';
//       const result = PRICING.crackRepairWall.calc(lft);
//       repairPrice = result.total;
//       repairRate = result.rate;
//     } else if (repairType === 'Ceiling Crack Repair') {
//       repairQty = lft; repairUnit = 'lft';
//       const result = PRICING.crackRepairCeiling.calc(lft);
//       repairPrice = result.total;
//       repairRate = result.rate;
//     }
//     addItem(
//       areaName,
//       `Repair: ${repairType}`,
//       sqft > 0 ? `${sqft} sqft` : `${lft} lft`,
//       repairPrice,
//       repairRate > 0 ? { quantity: repairQty, rate: repairRate, unit: repairUnit } : undefined,
//     );

//     // Dividing wall
//     if (area.dividingWall === 'Yes') {
//       addItem(areaName, 'Dividing Wall Surcharge', `${sqft} sqft`, sqft * PRICING.drywall.dividingWall, {
//         quantity: sqft, rate: PRICING.drywall.dividingWall, unit: 'sqft',
//       });
//     }

//     // Floor Level (flat fee — no quantity)
//     if (area.projectLocation && PRICING.floors[area.projectLocation]) {
//       const location = area.projectLocation;
//       if (sameWorkArea !== 'No') {
//         if (!chargedFloors.has(location)) {
//           addItem(areaName, `Floor Surcharge: ${location}`, 'Flat Fee', PRICING.floors[location]);
//           chargedFloors.add(location);
//         }
//       } else {
//         addItem(areaName, `Floor Surcharge: ${location}`, 'Flat Fee', PRICING.floors[location]);
//       }
//     }

//     // Staircase (flat fee — no quantity)
//     if (area.staircase === 'Yes') {
//       if (sameWorkArea !== 'No') {
//         if (!chargedStaircase) {
//           addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
//           chargedStaircase = true;
//         }
//       } else {
//         addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
//       }
//     }

//     // Demolition
//     if (area.needDemolition && PRICING.demolition[area.needDemolition]) {
//       const demoRate = PRICING.demolition[area.needDemolition];
//       const isLinear = area.needDemolition === 'Base board' || area.needDemolition === 'Door casing';
//       const demoQty = isLinear
//         ? parseFloat(area.demolitionLinearFeet) || 0
//         : parseFloat(area.demolitionSquareFootage) || 0;
//       addItem(areaName, `Demolition: ${area.needDemolition}`, `${demoQty} unit(s)`, demoQty * demoRate, {
//         quantity: demoQty, rate: demoRate, unit: isLinear ? 'lft' : 'sqft',
//       });
//     } else if (area.needDemolition === 'Popcorn Ceiling scraping') {
//       const dSqft = parseFloat(area.demolitionSquareFootage) || 0;
//       const rate = PRICING.popcornScraping.rateFor(dSqft);
//       addItem(areaName, 'Popcorn Ceiling Scraping', `${dSqft} sqft`, dSqft * rate, {
//         quantity: dSqft, rate, unit: 'sqft',
//       });
//     }

//     // Haul Away
//     if (area.needHaulAway === 'Yes') {
//       let hSqft = parseFloat(area.haulAwaySquareFootage);
//       if (isNaN(hSqft)) hSqft = parseFloat(area.demolitionSquareFootage) || 0;
//       if (hSqft > 0) {
//         if (hSqft <= 50) {
//           // Flat fee up to 50 sqft — no clean per-unit rate to edit against
//           addItem(areaName, 'Haul Away', 'Up to 50 sqft', PRICING.haulAway.baseFeeUnder50);
//         } else {
//           const extraSqft = hSqft - 50;
//           const totalCost = PRICING.haulAway.baseFeeUnder50 + (extraSqft * PRICING.haulAway.perSqftAbove50);
//           addItem(areaName, 'Haul Away', `${hSqft} sqft`, totalCost);
//         }
//       }
//     }

//     // Insulation
//     if (area.needInsulation && PRICING.insulation[area.needInsulation]) {
//       const ins = PRICING.insulation[area.needInsulation];
//       let insSqft = parseFloat(area.insulationSquareFootage) || 0;
//       if (insSqft > 0) {
//         if (insSqft < ins.minSqft) insSqft = ins.minSqft;
//         addItem(areaName, `Insulation: ${area.needInsulation}`, `${insSqft} sqft (min applied)`, insSqft * ins.price, {
//           quantity: insSqft, rate: ins.price, unit: 'sqft',
//         });
//       }
//     }

//     // Corner Metals
//     if (area.needCornerMetal === 'Yes' && typeof area.cornerMetals === 'string') {
//       try {
//         const metals = JSON.parse(area.cornerMetals);
//         metals.forEach((m: any) => {
//           const mType = m.metalType as keyof typeof PRICING.cornerMetal;
//           const qty = parseFloat(m.quantity) || 0;
//           if (mType && qty > 0 && PRICING.cornerMetal[mType]) {
//             addItem(areaName, `Corner Metal: ${mType}`, `${qty} qty`, qty * PRICING.cornerMetal[mType], {
//               quantity: qty, rate: PRICING.cornerMetal[mType], unit: 'unit',
//             });
//           }
//         });
//       } catch (e) { }
//     }

//     // Arch Corner Metals
//     if (area.needArchCornerMetal === 'Yes' && typeof area.archCornerMetals === 'string') {
//       try {
//         const metals = JSON.parse(area.archCornerMetals);
//         metals.forEach((m: any) => {
//           const qty = parseFloat(m.quantity) || 0;
//           const height = parseFloat(m.height) || 0;
//           const width = parseFloat(m.width) || 0;
//           const lft = (height + width) * qty; // Total linear feet
//           if (lft > 0) {
//             const mType = m.metalType === 'Arch Bullnose' ? 'archBullnose' : 'arch90';
//             addItem(areaName, `Arch Metal: ${m.metalType}`, `${lft} lft`, lft * PRICING.cornerMetal[mType], {
//               quantity: lft, rate: PRICING.cornerMetal[mType], unit: 'lft',
//             });
//           }
//         });
//       } catch (e) { }
//     }

//     // Texture
//     if (area.texture && PRICING.texture[area.texture]) {
//       addItem(areaName, `Texture: ${area.texture}`, `${sqft} sqft`, sqft * PRICING.texture[area.texture], {
//         quantity: sqft, rate: PRICING.texture[area.texture], unit: 'sqft',
//       });
//     }

//     // Ceiling Height Surcharge (above 8ft)
//     if (area.ceilingAbove8 === 'Yes' && area.ceilingHeight) {
//       const h = parseInt(area.ceilingHeight);  // handles '9ft' → 9
//       const rate = PRICING.ceilingHeightSurcharge.rateFor(h);
//       const qty = sqft > 0 ? sqft : lft;
//       const unit: 'lft' | 'sqft' = sqft > 0 ? 'sqft' : 'lft';
//       if (rate > 0 && qty > 0) {
//         addItem(areaName, `High Ceiling Surcharge (${h}ft)`, `${qty} ${unit} @ $${rate}/${unit}`, qty * rate, {
//           quantity: qty, rate, unit,
//         });
//       }
//     }

//     // Process Custom Questions
//     customQuestions.filter(q => q.path === 'drywall').forEach(cq => {
//       const val = area[cq.config.id];
//       if (!val) return;
//       const rule = cq.config.pricingRules?.[val] || (cq.config.type === 'number' ? cq.config.pricingRules?.['multiplier'] : null);
//       if (rule) {
//         if (rule.type === 'flat') {
//           addItem(areaName, `Custom: ${cq.config.label} (${val})`, 'Flat Fee', rule.amount);
//         } else if (rule.type === 'per_unit') {
//           const qty = parseFloat(val) || 0;
//           if (qty > 0) {
//             addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount, {
//               quantity: qty, rate: rule.amount, unit: 'unit',
//             });
//           }
//         }
//       }
//     });
//   });

//   data.trim.forEach((area, i) => {
//     const areaName = `Trim Area ${i + 1}`;
//     if (!area.service) return;

//     // ── Baseboard ──────────────────────────────────────────────────────────
//     if (area.service.includes('Baseboard')) {
//       const lft = parseFloat(area.baseboardLinearFeet) || 0;
//       if (lft > 0) {
//         const catalogUrl = typeof area.baseboardCatalog === 'string' ? area.baseboardCatalog : '';
//         const userEnteredPrice = parseFloat(area.baseboardCatalog_userPrice) || 0;
//         const materialRate = userEnteredPrice > 0 ? userEnteredPrice : null;
//         const height = area.baseboardHeight || '6';
//         const heightKey = String(parseInt(height) || 6);
//         const laborRate = PRICING.trim.baseboard[heightKey] ?? 5.00;
//         if (catalogUrl) {
//           addItem(areaName, 'Trim: Baseboard labor', `${lft} lft`, lft * laborRate, {
//             quantity: lft, rate: laborRate, unit: 'lft',
//           });
//           if (materialRate != null && materialRate > 0) {
//             const baseProduct = findCatalogProduct(catalogUrl);
//             const prodLength = getProductLength(catalogUrl);
//             const reqQty = Math.ceil(lft / prodLength);
//             const totalMaterialCost = reqQty * materialRate;
//             addItem(areaName, 'Trim: Baseboard material', `${reqQty} unit(s) @ $${materialRate}/unit (${prodLength} ft each)`, totalMaterialCost, {
//               quantity: reqQty, rate: materialRate, unit: 'unit',
//             }, baseProduct ? { image: baseProduct.image, productName: baseProduct.name, productUrl: baseProduct.url, unitPrice: materialRate, packSize: `${prodLength} ft` } : undefined);
//           }
//           // removed the else block that pushed the "Price not entered" / isOutOfStock row
//           else {
//             const baseProduct = findCatalogProduct(catalogUrl);
//             lineItems.push({
//               area: areaName,
//               label: 'Trim: Baseboard material',
//               detail: 'Price not entered',
//               amount: 0,
//               isOutOfStock: true,
//               ...(baseProduct ? { homeDepotProduct: { image: baseProduct.image, productName: baseProduct.name, productUrl: baseProduct.url, unitPrice: 0 } } : {}),
//             });
//           }
//         } else {
//           addItem(areaName, `Trim: Baseboards (${heightKey}" height)`, `${lft} lft`, lft * laborRate, {
//             quantity: lft, rate: laborRate, unit: 'lft',
//           });
//         }
//       }
//     }

//     if (area.service.includes('Casing')) {
//       const lft = parseFloat(area.casingLinearFeet) || 0;
//       if (lft > 0) {
//         const catalogUrl = (typeof area.casingCatalog === 'string' && area.casingCatalog && area.casingCatalog !== 'None of the above')
//           ? area.casingCatalog
//           : (typeof area.baseboardCatalog === 'string' ? area.baseboardCatalog : '');
//         const userEnteredPrice = parseFloat(area.baseboardCatalog_userPrice) || 0;
//         const materialRate = userEnteredPrice > 0 ? userEnteredPrice : null;
//         const laborRate = PRICING.trim.doorCasing;
//         if (catalogUrl) {
//           addItem(areaName, 'Trim: Casing labor', `${lft} lft`, lft * laborRate, {
//             quantity: lft, rate: laborRate, unit: 'lft',
//           });
//           if (materialRate != null && materialRate > 0) {
//             const casingProduct = findCatalogProduct(catalogUrl);
//             const prodLength = getProductLength(catalogUrl);
//             const reqQty = Math.ceil(lft / prodLength);
//             const totalMaterialCost = reqQty * materialRate;
//             addItem(areaName, 'Trim: Casing material', `${reqQty} unit(s) @ $${materialRate}/unit (${prodLength} ft each)`, totalMaterialCost, {
//               quantity: reqQty, rate: materialRate, unit: 'unit',
//             }, casingProduct ? { image: casingProduct.image, productName: casingProduct.name, productUrl: casingProduct.url, unitPrice: materialRate, packSize: `${prodLength} ft` } : undefined);
//           }
//           // removed the else block that pushed the "Price not entered" / isOutOfStock row
//           else {
//             const casingProduct = findCatalogProduct(catalogUrl);
//             lineItems.push({
//               area: areaName,
//               label: 'Trim: Casing material',
//               detail: 'Price not entered',
//               amount: 0,
//               isOutOfStock: true,
//               ...(casingProduct ? { homeDepotProduct: { image: casingProduct.image, productName: casingProduct.name, productUrl: casingProduct.url, unitPrice: 0 } } : {}),
//             });
//           }
//         } else {
//           addItem(areaName, 'Trim: Door Casing', `${lft} lft`, lft * laborRate, {
//             quantity: lft, rate: laborRate, unit: 'lft',
//           });
//         }
//       }
//     }

//     if (area.projectLevel && PRICING.floors[area.projectLevel]) {
//       const level = area.projectLevel;
//       if (sameWorkArea !== 'No') {
//         if (!chargedFloors.has(level)) {
//           addItem(areaName, `Floor Surcharge: ${level}`, 'Flat Fee', PRICING.floors[level]);
//           chargedFloors.add(level);
//         }
//       } else {
//         addItem(areaName, `Floor Surcharge: ${level}`, 'Flat Fee', PRICING.floors[level]);
//       }
//     }
//     if (area.staircase === 'Yes') {
//       if (sameWorkArea !== 'No') {
//         if (!chargedStaircase) {
//           addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
//           chargedStaircase = true;
//         }
//       } else {
//         addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
//       }
//     }

//     // Process Custom Questions
//     customQuestions.filter(q => q.path === 'trim').forEach(cq => {
//       const val = area[cq.config.id];
//       if (!val) return;
//       const rule = cq.config.pricingRules?.[val] || (cq.config.type === 'number' ? cq.config.pricingRules?.['multiplier'] : null);
//       if (rule) {
//         if (rule.type === 'flat') {
//           addItem(areaName, `Custom: ${cq.config.label} (${val})`, 'Flat Fee', rule.amount);
//         } else if (rule.type === 'per_unit') {
//           const qty = parseFloat(val) || 0;
//           if (qty > 0) {
//             addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount, {
//               quantity: qty, rate: rule.amount, unit: 'unit',
//             });
//           }
//         }
//       }
//     });
//   });


//   data.paint.forEach((area, i) => {
//     const areaName = `Paint Area ${i + 1}`;
//     if (!area.paintArea) return;
//     hasPaint = true;

//     const isLinear = area.paintArea === 'Baseboards' || area.paintArea === 'Door Casing';
//     const qty = parseFloat(isLinear ? area.linearFeet : area.squareFootage) || 0;

//     if (qty > 0) {
//       const rate = isLinear ? PRICING.paint.baseboard : PRICING.paint.wallsCeiling;
//       addItem(areaName, `Paint: ${area.paintArea}`, `${qty} ${isLinear ? 'lft' : 'sqft'}`, qty * rate, {
//         quantity: qty, rate, unit: isLinear ? 'lft' : 'sqft',
//       });

//       // Paint material/labor tiers — tier-based, not a clean linear per-unit
//       // rate, so these are intentionally left non-quantity-editable (flat).
//       const tierList = isLinear ? PRICING.paint.linearFtTiers : PRICING.paint.sqftTiers;
//       const tier = tierList.find(t => isLinear ? qty <= (t as any).maxFt : qty <= (t as any).maxSqft);
//       if (tier) {
//         const paintCost = tier.gallons * PRICING.paint.gallonPrice;
//         addItem(areaName, `Paint Materials (${tier.gallons} gal)`, 'Behr Paint', paintCost);
//         addItem(areaName, `Paint Base Labor`, 'Flat Fee', tier.baseLabor);
//       }
//     }

//     if (area.projectLevel && PRICING.floors[area.projectLevel]) {
//       const level = area.projectLevel;
//       if (sameWorkArea !== 'No') {
//         if (!chargedFloors.has(level)) {
//           addItem(areaName, `Floor Surcharge: ${level}`, 'Flat Fee', PRICING.floors[level]);
//           chargedFloors.add(level);
//         }
//       } else {
//         addItem(areaName, `Floor Surcharge: ${level}`, 'Flat Fee', PRICING.floors[level]);
//       }
//     }
//     if (area.staircase === 'Yes') {
//       if (sameWorkArea !== 'No') {
//         if (!chargedStaircase) {
//           addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
//           chargedStaircase = true;
//         }
//       } else {
//         addItem(areaName, 'Staircase Surcharge', 'Flat Fee', PRICING.staircase);
//       }
//     }

//     // Ceiling Height Surcharge (above 8ft)
//     if (area.ceilingAbove8 === 'Yes' && area.ceilingHeight) {
//       const h = parseInt(area.ceilingHeight);  // handles '9ft' → 9
//       const rate = PRICING.ceilingHeightSurcharge.rateFor(h);
//       if (rate > 0 && qty > 0) {
//         addItem(areaName, `High Ceiling Surcharge (${h}ft)`, `${qty} ${isLinear ? 'lft' : 'sqft'} @ $${rate}/${isLinear ? 'lft' : 'sqft'}`, qty * rate, {
//           quantity: qty, rate, unit: isLinear ? 'lft' : 'sqft',
//         });
//       }
//     }

//     // Process Custom Questions
//     customQuestions.filter(q => q.path === 'paint').forEach(cq => {
//       const val = area[cq.config.id];
//       if (!val) return;
//       const rule = cq.config.pricingRules?.[val] || (cq.config.type === 'number' ? cq.config.pricingRules?.['multiplier'] : null);
//       if (rule) {
//         if (rule.type === 'flat') {
//           addItem(areaName, `Custom: ${cq.config.label} (${val})`, 'Flat Fee', rule.amount);
//         } else if (rule.type === 'per_unit') {
//           const qty = parseFloat(val) || 0;
//           if (qty > 0) {
//             addItem(areaName, `Custom: ${cq.config.label}`, `${qty} unit(s)`, qty * rule.amount, {
//               quantity: qty, rate: rule.amount, unit: 'unit',
//             });
//           }
//         }
//       }
//     });
//   });

//   if (hasPaint) {
//     addItem('Project', 'Trip Charge', 'Once per project', PRICING.tripCharge);
//   }

//   return { lineItems, subtotal };
// }
