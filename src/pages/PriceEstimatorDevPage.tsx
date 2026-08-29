import { PriceEstimatorInner } from './PriceEstimatorPage';

/**
 * /priceestimatordevelopment — dedicated dev/internal route.
 * Renders the full Price Estimator directly, bypassing the
 * "Coming Soon" gate that guards /priceestimator for public users.
 *
 * All form state is preserved via the same localStorage-based
 * useEstimateDraft hook used by PriceEstimatorInner.
 */
export default function PriceEstimatorDevPage() {
  return <PriceEstimatorInner />;
}
