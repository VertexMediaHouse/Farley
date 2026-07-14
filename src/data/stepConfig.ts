import { drywallConfig } from './drywallConfig';
import { trimConfig } from './trimConfig';
import { paintConfig } from './paintConfig';
import type { QuestionConfig } from '../types/form';

export const TOTAL_STEPS = 4;

export type ServicePath = 'drywall' | 'trim' | 'paint';

export const SERVICE_PATHS: ServicePath[] = ['drywall', 'trim', 'paint'];

/** Base question configs keyed by service path. */
export const STEP_CONFIGS: Record<ServicePath, QuestionConfig[]> = {
  drywall: drywallConfig,
  trim: trimConfig,
  paint: paintConfig,
};

/** Metadata for each wizard step. */
export const STEP_META = {
  contact: { step: 1, title: 'Contact Information' },
  drywall: { step: 2, title: 'Drywall Assessment', path: 'drywall' as ServicePath },
  trim:    { step: 3, title: 'Trim & Baseboard',   path: 'trim' as ServicePath },
  paint:   { step: 4, title: 'Painting',           path: 'paint' as ServicePath },
} as const;
