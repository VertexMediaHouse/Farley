  import { describe, it, expect } from 'vitest';
  import { calculateEstimate } from './estimate';

  describe('calculateEstimate', () => {
    it('calculates a basic wall repair', () => {
      const result = calculateEstimate({
        drywall: [{ repairType: 'Walls', squareFootage: '100' }],
        trim: [],
        paint: []
      });
      // 100 sqft * 6 = 600 + 75 trip charge = 675
      expect(result.subtotal).toBe(675);
      expect(result.lineItems).toContainEqual({
        area: 'Drywall Area 1',
        label: 'Repair: Walls',
        detail: '100 sqft',
        amount: 600
      });
    });

    it('calculates crack repair with flat fee and tiers', () => {
      // Under 5ft flat fee
      let result = calculateEstimate({
        drywall: [{ repairType: 'Crack Repair Wall', linearFeet: '4' }],
        trim: [],
        paint: []
      });
      // 850 + 75 = 925
      expect(result.subtotal).toBe(925);

      // 10ft tier ($70/lft)
      result = calculateEstimate({
        drywall: [{ repairType: 'Crack Repair Wall', linearFeet: '10' }],
        trim: [],
        paint: []
      });
      // 10 * 70 = 700 + 75 = 775
      expect(result.subtotal).toBe(775);
    });

    it('calculates demolition and haul away combo', () => {
      const result = calculateEstimate({
        drywall: [{ 
          repairType: 'Walls', 
          squareFootage: '10',
          needDemolition: 'Remove Existing Wall Drywall', 
          demolitionSquareFootage: '100',
          needHaulAway: 'Yes',
          // haulAwaySquareFootage intentionally omitted to test derived logic
        }],
        trim: [],
        paint: []
      });
      // Repair: 10 * 6 = 60
      // Demo: 100 * 1.50 = 150
      // Haul away derived from demo (100): 100 * 2.50 = 250
      // Trip: 75
      // Total = 60 + 150 + 250 + 75 = 535
      expect(result.subtotal).toBe(535);
      expect(result.lineItems.find(i => i.label === 'Haul Away')?.amount).toBe(250);
    });

    it('calculates paint crossing a gallon tier', () => {
      const result = calculateEstimate({
        drywall: [],
        trim: [],
        paint: [{ paintArea: 'Room Walls', squareFootage: '400' }]
      });
      // 400 sqft * 9.00 = 3600
      // 400 falls into tier maxSqft: 650 => 2 gallons * 45 = 90
      // Labor tier for 2 gallons = 100
      // Trip charge = 75
      // Total = 3600 + 90 + 100 + 75 = 3865
      expect(result.subtotal).toBe(3865);
      expect(result.lineItems).toContainEqual(
        expect.objectContaining({ label: 'Paint Materials (2 gal)', amount: 90 })
      );
    });
  });
