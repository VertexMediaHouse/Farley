import type { AreaValues } from '../types/form';
import { calculateEstimate } from '../services/estimateEngine';
import { adaptV2ToV1Estimate } from '../utils/estimateAdapter';
import type { CustomQuestionRecord } from './customQuestionsStore';

export const ESTIMATE_DRAFT_KEY = 'fcd_estimate_v2';
export const ESTIMATE_RESULT_KEY = 'fcd_estimate_data';

export const DEFAULT_CONTACT = {
  isSubcontractor: 'no',
  fullName: '',
  companyName: '',
  phoneNumber: '',
  emailAddress: '',
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
};

export type ContactData = typeof DEFAULT_CONTACT;

export interface EstimateDraft {
  step: number;
  drywall: AreaValues[];
  trim: AreaValues[];
  paint: AreaValues[];
  contact: ContactData;
}

/** Strip File objects before persisting to localStorage. */
export function stripFiles(areas: AreaValues[]): Record<string, unknown>[] {
  return areas.map(area => {
    const out: Record<string, unknown> = {};
    for (const k in area) {
      const v = area[k];
      out[k] = Array.isArray(v) ? [] : v;
    }
    return out;
  });
}

export function saveDraft(draft: EstimateDraft): void {
  try {
    localStorage.setItem(ESTIMATE_DRAFT_KEY, JSON.stringify({
      ...draft,
      drywall: stripFiles(draft.drywall),
      trim: stripFiles(draft.trim),
      paint: stripFiles(draft.paint),
    }));
  } catch { /* ignore quota errors */ }
}

export function loadDraft(): Partial<EstimateDraft> | null {
  try {
    const saved = localStorage.getItem(ESTIMATE_DRAFT_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function submitEstimate(
  drywall: AreaValues[],
  trim: AreaValues[],
  paint: AreaValues[],
  contact: ContactData,
  customQuestions: CustomQuestionRecord[],
): void {
  const formData = adaptV2ToV1Estimate(drywall, trim, paint, contact);
  const result = calculateEstimate(formData, { drywall, trim, paint }, customQuestions);
  localStorage.setItem(ESTIMATE_RESULT_KEY, JSON.stringify({ answers: formData, estimate: result }));
  window.open('/estimate', '_blank');
  localStorage.removeItem(ESTIMATE_DRAFT_KEY);
}
