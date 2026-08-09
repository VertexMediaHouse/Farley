// utils/familyCounts.ts
import rawColors from './colors.json';
import type { RawPaintColor } from './types';

export function getFamilyCounts() {
  const counts: Record<string, { behr: number; ppg: number; unknown: number; total: number }> = {};
  for (const raw of rawColors as RawPaintColor[]) {
    const family = (raw.family || 'unknown').trim().toLowerCase();
    if (!counts[family]) counts[family] = { behr: 0, ppg: 0, unknown: 0, total: 0 };
    const brand = (raw.brand || '').toLowerCase();
    if (brand === 'behr') counts[family].behr++;
    else if (brand.includes('glidden') || brand.includes('ppg')) counts[family].ppg++;
    else counts[family].unknown++;
    counts[family].total++;
  }
  return counts;
}