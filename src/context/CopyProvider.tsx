import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { applyOverrides, fetchOverrides, type OverrideMap } from '../lib/overrides';
import { fetchCustomQuestions, type CustomQuestionRecord } from '../lib/customQuestionsStore';
import { fetchProductPrices, type ProductPriceMap } from '../lib/productPricesStore';
import type { QuestionConfig } from '../types/form';

interface ContextType {
  overrides: OverrideMap;
  customQuestions: CustomQuestionRecord[];
  productPrices: ProductPriceMap;
}

const Ctx = createContext<ContextType>({ overrides: {}, customQuestions: [], productPrices: {} });

export function CopyProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionRecord[]>([]);
  const [productPrices, setProductPrices] = useState<ProductPriceMap>({});

  useEffect(() => {
    fetchOverrides().then(setOverrides).catch(() => { /* fall back */ });
    fetchCustomQuestions().then(setCustomQuestions).catch(() => { /* fall back */ });
    fetchProductPrices().then(setProductPrices).catch(() => {});
  }, []);

  return <Ctx.Provider value={{ overrides, customQuestions, productPrices }}>{children}</Ctx.Provider>;
}

function insertCustomQuestions(
  base: QuestionConfig[],
  customs: CustomQuestionRecord[],
  path: 'drywall' | 'trim' | 'paint'
): QuestionConfig[] {
  const pathCustoms = customs.filter(c => c.path === path);
  if (pathCustoms.length === 0) return base;

  const result = [...base];

  // Insert questions. To handle dependencies properly, we can insert one by one.
  pathCustoms.forEach(custom => {
    const config: QuestionConfig = {
      ...custom.config,
    };
    
    if (custom.insert_after_id) {
      const idx = result.findIndex(q => q.id === custom.insert_after_id);
      if (idx !== -1) {
        result.splice(idx + 1, 0, config);
      } else {
        result.push(config); // fallback to end
      }
    } else {
      result.push(config);
    }
  });

  return result;
}

/** Returns the config with custom questions woven in and client copy merged in. */
export function useQuestionCopy(config: QuestionConfig[], path?: 'drywall' | 'trim' | 'paint') {
  const { overrides, customQuestions } = useContext(Ctx);
  
  // 1. Insert custom questions if path is provided
  const withCustoms = path ? insertCustomQuestions(config, customQuestions, path) : config;

  // 2. Apply label overrides
  return applyOverrides(withCustoms, overrides);
}

export function useCustomQuestions() {
  const { customQuestions } = useContext(Ctx);
  return customQuestions;
}

export function useProductPrices() {
  const { productPrices } = useContext(Ctx);
  return productPrices;
}
