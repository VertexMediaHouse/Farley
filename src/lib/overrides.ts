import type { QuestionConfig } from '../types/form';
import { supabase } from './supabase';

export interface QuestionOverride {
  label?: string | null;
  helpText?: string | null;
  placeholder?: string | null;
  noticeText?: string | null;
}

export type OverrideMap = Record<string, QuestionOverride>;

/** The ONLY fields a client may change. ids, options, conditions, catalogs are code-owned. */
const EDITABLE = ['label', 'helpText', 'placeholder', 'noticeText'] as const;
export type EditableKey = typeof EDITABLE[number];

export function applyOverrides(
  questions: QuestionConfig[],
  overrides: OverrideMap,
): QuestionConfig[] {
  return questions.map(q => {
    const o = overrides[q.id];
    if (!o) return q;

    const next: QuestionConfig = { ...q };
    for (const key of EDITABLE) {
      const val = o[key];
      if (typeof val === 'string' && val.trim()) next[key] = val;
    }
    if (q.children?.length) next.children = applyOverrides(q.children, overrides);
    return next;
  });
}

/** DB row (snake_case) → OverrideMap (camelCase). */
export async function fetchOverrides(): Promise<OverrideMap> {
  const { data, error } = await supabase
    .from('question_overrides')
    .select('question_id, label, help_text, placeholder, notice_text');

  if (error || !data) return {};

  return Object.fromEntries(
    data.map(r => [r.question_id, {
      label: r.label,
      helpText: r.help_text,
      placeholder: r.placeholder,
      noticeText: r.notice_text,
    }]),
  );
}

export async function saveOverride(id: string, patch: QuestionOverride) {
  const { data: { user } } = await supabase.auth.getUser();
  return supabase.from('question_overrides').upsert({
    question_id: id,
    label:       patch.label       || null,
    help_text:   patch.helpText    || null,
    placeholder: patch.placeholder || null,
    notice_text: patch.noticeText  || null,
    updated_at:  new Date().toISOString(),
    updated_by:  user?.id ?? null,
  });
}

export async function resetOverride(id: string) {
  return supabase.from('question_overrides').delete().eq('question_id', id);
}