import type { AreaValues } from '../types/form';
import { calculateEstimate } from './estimate';
import { adaptV2ToV1Estimate } from '../utils/estimateAdapter';
import type { CustomQuestionRecord } from './customQuestionsStore';
import { getStoreIdForZip, runHomeDepotActorLive } from './homeDepotLiveScrape';

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
  sameWorkArea: 'Yes',
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

const generateAreaThumbnails = async (areas: AreaValues[], prefix: string): Promise<Record<string, string[]>> => {
  const result: Record<string, string[]> = {};
  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    const areaName = `${prefix} Area ${i + 1}`;
    const files: File[] = [];
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
    if (files.length > 0) {
      result[areaName] = await generateThumbnails(files);
    }
  }
  return result;
};

/** Runs the live Home Depot scrape for every trim area that has a catalog
 *  product selected, and writes the returned price back onto each area as
 *  `baseboardCatalog_userPrice` — the exact field lib/estimate.ts reads. */
async function enrichTrimWithLivePrices(
  trim: AreaValues[],
  zipcode: string,
): Promise<AreaValues[]> {
  try {
    let zip = zipcode.replace(/\D/g, '').slice(0, 5);
    if (!/^\d{5}$/.test(zip)) {
      console.warn('Invalid or missing ZIP code for live price enrichment. Using fallback ZIP (92691) so pricing can still be calculated.', zipcode);
      zip = '92691';
    }

    const storeId = getStoreIdForZip(zip);
    if (!storeId) {
      console.warn(`No Home Depot store is mapped to ZIP ${zip}, falling back to defaults.`);
      return trim;
    }

    // Collect every catalog URL selected across trim areas (baseboard or casing)
    const urls = new Set<string>();
    trim.forEach(area => {
      if (typeof area.baseboardCatalog === 'string' && area.baseboardCatalog && area.baseboardCatalog !== 'None of the above') {
        urls.add(area.baseboardCatalog);
      }
      if (typeof area.casingCatalog === 'string' && area.casingCatalog && area.casingCatalog !== 'None of the above') {
        urls.add(area.casingCatalog);
      }
    });

    if (urls.size === 0) {
      // Nothing to scrape (client-provided trim, or no catalog selection) — leave as-is.
      return trim;
    }

    try {
      const liveItems = await runHomeDepotActorLive({
        zipcode: zip,
        storeId,
        productUrls: [...urls],
      });

      const priceForUrl = (url: string): number | null => {
        const match = liveItems.find(item => item.url === url);
        if (!match || match.outOfStock || match.price == null) return null;
        return match.price;
      };

      return trim.map(area => {
        const catalogUrl =
          (typeof area.baseboardCatalog === 'string' && area.baseboardCatalog) ||
          (typeof area.casingCatalog === 'string' && area.casingCatalog) ||
          '';
        if (!catalogUrl || catalogUrl === 'None of the above') return area;

        const livePrice = priceForUrl(catalogUrl);
        if (livePrice == null) return area;

        return { ...area, baseboardCatalog_userPrice: String(livePrice) };
      });
    } catch (scrapeError) {
      console.error('Failed to run live Home Depot scrape, falling back to defaults:', scrapeError);
      return trim;
    }
  } catch (err) {
    console.error('Failed to enrich trim with live prices, falling back to defaults:', err);
    return trim;
  }
}

export async function submitEstimate(
  drywall: AreaValues[],
  trim: AreaValues[],
  paint: AreaValues[],
  contact: ContactData,
  customQuestions: CustomQuestionRecord[],
): Promise<void> {
  const enrichedTrim = await enrichTrimWithLivePrices(trim, contact.areaCode);

  const formData = adaptV2ToV1Estimate(drywall, enrichedTrim, paint, contact);
  const result = calculateEstimate({ drywall, trim: enrichedTrim, paint, sameWorkArea: contact.sameWorkArea }, customQuestions);
  
  const allFiles = [
    ...collectFilesFromAreas(drywall),
    ...collectFilesFromAreas(trim),
    ...collectFilesFromAreas(paint)
  ];
  const drywallThumbs = await generateAreaThumbnails(drywall, 'Drywall');
  const trimThumbs = await generateAreaThumbnails(trim, 'Trim');
  const paintThumbs = await generateAreaThumbnails(paint, 'Paint');
  const areaThumbnails = { ...drywallThumbs, ...trimThumbs, ...paintThumbs };
  
  const thumbnails = allFiles.length > 0 ? await generateThumbnails(allFiles) : [];
  
  localStorage.setItem(ESTIMATE_RESULT_KEY, JSON.stringify({ 
    answers: formData, 
    estimate: result, 
    thumbnails, 
    areaThumbnails,
    rawAreas: { drywall, trim, paint },
    contact 
  }));
  // NOTE: Do NOT remove ESTIMATE_DRAFT_KEY here.
  // The draft must survive so "Modify My Project" on the estimate page
  // can restore the user's form state. It is cleared only on explicit reset.
}