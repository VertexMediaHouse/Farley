export type PricingRule =
  | { shape: 'none' }
  | { shape: 'flat_if'; amount: number }
  | { shape: 'per_option'; prices: Record<string, number> }
  | { shape: 'per_unit'; unit: string; rate: number; rateByOption?: Record<string, number> }
  | { shape: 'tiered_unit'; unit: string; tiers: Array<{ when: string; flat?: number; rate?: number }> }
  | { shape: 'gallons'; pricePerGallon: number };

export interface FormSnapshot {
  id: string;
  version: number;
  rules: Record<string, PricingRule>;
  created_at: string;
}

export interface Submission {
  id: string;
  answers: any;
  subtotal: number;
  created_at: string;
}

import { supabase } from './supabase';

export async function fetchLatestSnapshot(): Promise<FormSnapshot | null> {
  const { data, error } = await supabase
    .from('form_versions')
    .select('*')
    .order('version', { ascending: false })
    .limit(1)
    .single();
    
  if (error || !data) return null;
  return data as FormSnapshot;
}

export async function saveSnapshot(rules: Record<string, PricingRule>, oldRules: Record<string, PricingRule>): Promise<FormSnapshot> {
  const { data: user } = await supabase.auth.getUser();
  const userId = user?.user?.id ?? null;
  
  // 1. Get latest version to increment
  const latest = await fetchLatestSnapshot();
  const nextVersion = latest ? latest.version + 1 : 1;
  
  // 2. Insert new snapshot
  const { data: snapshot, error: snapError } = await supabase
    .from('form_versions')
    .insert({
      version: nextVersion,
      rules: rules,
    })
    .select()
    .single();
    
  if (snapError) throw snapError;
  
  // 3. Log changes to rate_changes table
  const changes = [];
  for (const [qid, rule] of Object.entries(rules)) {
    // In a real implementation we would do a deep diff of the PricingRule.
    // For simplicity, we just log that this question's rule changed if JSON stringified differs.
    if (JSON.stringify(rule) !== JSON.stringify(oldRules[qid])) {
      changes.push({
        question_id: qid,
        path: 'rules',
        old_amount: oldRules[qid] ? JSON.stringify(oldRules[qid]) : null,
        new_amount: JSON.stringify(rule),
        changed_by: userId,
      });
    }
  }
  
  if (changes.length > 0) {
    await supabase.from('rate_changes').insert(changes);
  }
  
  return snapshot as FormSnapshot;
}
