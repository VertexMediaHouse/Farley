import type { AreaValues } from '../types/form';
import { calculateEstimate } from './estimate';
import { adaptV2ToV1Estimate } from '../utils/estimateAdapter';
import type { CustomQuestionRecord } from './customQuestionsStore';
import type { ProductPriceMap } from './productPricesStore';

export const ESTIMATE_DRAFT_KEY = 'fcd_estimate_v2';
export const ESTIMATE_RESULT_KEY = 'fcd_estimate_data';

export const DEFAULT_CONTACT = {
  isCommercial: 'no',
  isSubcontractor: 'no',
  areaCode: '',
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

function collectFilesFromAreas(areas: AreaValues[]): File[] {
  const files: File[] = [];
  for (const area of areas) {
    for (const key in area) {
      const val = area[key];
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item instanceof File) {
            files.push(item);
          }
        }
      }
    }
  }
  return files;
}

const generateThumbnails = async (files: File[]): Promise<string[]> => {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_SIZE = 400;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_SIZE) {
                  height *= MAX_SIZE / width;
                  width = MAX_SIZE;
                }
              } else {
                if (height > MAX_SIZE) {
                  width *= MAX_SIZE / height;
                  height = MAX_SIZE;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => {
              resolve(e.target?.result as string);
            };
            img.src = e.target?.result as string;
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        })
    )
  );
};

export async function submitEstimate(
  drywall: AreaValues[],
  trim: AreaValues[],
  paint: AreaValues[],
  contact: ContactData,
  customQuestions: CustomQuestionRecord[],
  productPrices: ProductPriceMap = {},
): Promise<void> {
  const formData = adaptV2ToV1Estimate(drywall, trim, paint, contact, productPrices);
  const result = calculateEstimate({ drywall, trim, paint }, customQuestions, productPrices);
  
  const allFiles = [
    ...collectFilesFromAreas(drywall),
    ...collectFilesFromAreas(trim),
    ...collectFilesFromAreas(paint)
  ];
  const thumbnails = allFiles.length > 0 ? await generateThumbnails(allFiles) : [];
  
  localStorage.setItem(ESTIMATE_RESULT_KEY, JSON.stringify({ answers: formData, estimate: result, thumbnails, contact }));
  window.open('/estimate', '_blank');
  localStorage.removeItem(ESTIMATE_DRAFT_KEY);
}
