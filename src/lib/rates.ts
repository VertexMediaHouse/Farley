import type { PricingRule, FormSnapshot, Submission } from './pricing';
import { calculateEstimate } from './estimate';

export interface RateRow {
  questionId: string;
  path: string;        // where it lives inside config — 'rateByOption.ceiling'
  label: string;       // human: "Ceiling"
  unit: string;        // "/sqft" | "/lft" | "flat" | "/gallon"
  amount: number;
}

/** One rule → its editable numbers. */
export function flattenRates(
  questionId: string,
  questionLabel: string,
  rule: PricingRule,
  optionLabels: Record<string, string>,   // value → label, for display
): RateRow[] {
  const row = (path: string, label: string, unit: string, amount: number): RateRow =>
    ({ questionId, path, label, unit, amount });

  switch (rule.shape) {
    case 'none':
      return [];

    case 'flat_if':
      return [row('amount', questionLabel, 'flat', rule.amount)];

    case 'per_option':
      return Object.entries(rule.prices || {}).map(([value, amt]) =>
        row(`prices.${value}`, optionLabels[value] ?? value, 'flat', amt));

    case 'per_unit': {
      const rows = rule.rate > 0
        ? [row('rate', `${questionLabel} — default`, `/${rule.unit}`, rule.rate)]
        : [];
      for (const [value, amt] of Object.entries(rule.rateByOption ?? {})) {
        rows.push(row(`rateByOption.${value}`, optionLabels[value] ?? value, `/${rule.unit}`, amt));
      }
      return rows;
    }

    case 'tiered_unit':
      return (rule.tiers || []).flatMap((t, i) => [
        ...(t.flat !== undefined ? [row(`tiers.${i}.flat`, `${t.when} — flat`, 'flat', t.flat)] : []),
        ...(t.rate !== undefined ? [row(`tiers.${i}.rate`, t.when, `/${rule.unit}`, t.rate)] : []),
      ]);

    case 'gallons':
      return [row('pricePerGallon', `${questionLabel} — per gallon`, '/gallon', rule.pricePerGallon)];

    default:
      return [];
  }
}

/** Write an edited number back into the rule's config. */
export function setRate(rule: PricingRule, path: string, amount: number): PricingRule {
  const next: any = structuredClone(rule);
  const keys = path.split('.');
  let cur = next;
  for (const k of keys.slice(0, -1)) {
    if (cur[k] === undefined) cur[k] = {};
    cur = cur[k];
  }
  cur[keys.at(-1)!] = amount;
  return next as PricingRule;
}

/** Bulk adjust an array of rates by a percentage */
export function bulkAdjust(rows: RateRow[], pct: number, round: 'none' | 'nearest' | 'up'): RateRow[] {
  return rows.map(r => {
    let next = r.amount * (1 + pct / 100);
    if (round === 'nearest') next = Math.round(next * 4) / 4;   // to the quarter
    if (round === 'up') next = Math.ceil(next);
    return { ...r, amount: Number(next.toFixed(2)) };
  });
}

/** Preview the impact of new rates against recent submissions */
export function previewImpact(
  draftSnapshot: FormSnapshot,
  recent: Submission[],           // last 30, with their frozen answers
): { avgDelta: number; rows: Array<{ id: string; was: number; now: number }> } {
  if (!recent.length) return { avgDelta: 0, rows: [] };

  const rows = recent.map(s => {
    // @ts-expect-error - calculateEstimate doesn't take a snapshot yet; it reads global pricing
    const estimate = calculateEstimate(draftSnapshot, s.answers);
    const now = estimate?.subtotal ?? 0;

    return {
      id: s.id,
      was: s.subtotal,
      now: now,
    };
  });

  const avgDelta = rows.reduce((a, r) => {
    if (r.was === 0) return a;
    return a + ((r.now - r.was) / r.was);
  }, 0) / rows.length * 100;

  return { avgDelta, rows };
}
