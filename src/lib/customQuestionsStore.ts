import { supabase } from './supabase';
import type { QuestionConfig } from '../types/form';

export interface PricingRule {
  type: 'flat' | 'per_unit';
  amount: number;
}

export interface CustomQuestionConfig extends QuestionConfig {
  pricingRules?: Record<string, PricingRule>; // For dropdowns, key is option string. For numbers, key is 'multiplier'
}

export interface CustomQuestionRecord {
  id: string;
  path: 'drywall' | 'trim' | 'paint';
  insert_after_id: string | null;
  config: CustomQuestionConfig;
  created_at?: string;
  updated_at?: string;
}

export async function fetchCustomQuestions(path?: 'drywall' | 'trim' | 'paint'): Promise<CustomQuestionRecord[]> {
  let query = supabase.from('custom_questions').select('*').order('created_at', { ascending: true });
  if (path) {
    query = query.eq('path', path);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching custom questions:", error);
    return [];
  }
  return data as CustomQuestionRecord[];
}

export async function saveCustomQuestion(record: Omit<CustomQuestionRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('custom_questions').insert([
    {
      path: record.path,
      insert_after_id: record.insert_after_id,
      config: record.config,
    }
  ]).select();

  if (error) throw error;
  return data?.[0] as CustomQuestionRecord;
}

export async function deleteCustomQuestion(id: string) {
  const { error } = await supabase.from('custom_questions').delete().eq('id', id);
  if (error) throw error;
}
