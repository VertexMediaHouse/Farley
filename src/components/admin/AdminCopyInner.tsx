import { useEffect, useState } from 'react';
import { fetchOverrides, saveOverride, resetOverride, type OverrideMap } from '../../lib/overrides';
import { drywallConfig } from '../../data/drywallConfig';
import { trimConfig } from '../../data/trimConfig';
import { paintConfig } from '../../data/paintConfig';
import type { QuestionConfig } from '../../types/form';
import { input as inp, btnPrimary, btnGhost } from '../theme';

const SECTIONS = [
  { title: 'Drywall',  questions: drywallConfig },
  { title: 'Trim & baseboard', questions: trimConfig },
  { title: 'Painting', questions: paintConfig },
];

/** Flatten repeatable groups so children are editable too. */
function flatten(qs: QuestionConfig[]): QuestionConfig[] {
  return qs.flatMap(q => [q, ...(q.children ? flatten(q.children) : [])]);
}

export default function AdminCopyInner() {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { fetchOverrides().then(setOverrides); }, []);

  const current = (q: QuestionConfig) =>
    dirty[q.id] ?? overrides[q.id]?.label ?? q.label ?? '';

  const isChanged = (q: QuestionConfig) =>
    Boolean(overrides[q.id]?.label) && overrides[q.id]?.label !== q.label;

  const save = async (q: QuestionConfig) => {
    setSaving(q.id);
    const label = dirty[q.id]?.trim() ?? '';
    if (!label || label === q.label) {
      await resetOverride(q.id);
    } else {
      await saveOverride(q.id, { ...overrides[q.id], label });
    }
    setOverrides(await fetchOverrides());
    setDirty(d => { const { [q.id]: _, ...rest } = d; return rest; });
    setSaving(null);
  };

  const reset = async (q: QuestionConfig) => {
    await resetOverride(q.id);
    setOverrides(await fetchOverrides());
    setDirty(d => { const { [q.id]: _, ...rest } = d; return rest; });
  };

  return (
    <div className="pb-10">
      <div className="bg-white px-8 py-8 border-b border-slate-200">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Question wording</h1>
        <p className="mt-1 text-sm text-slate-500">
          Change how a question reads. Answer options and pricing are fixed in code.
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 px-8 py-8">
        {SECTIONS.map(({ title, questions }) => (
          <section key={title}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              {title}
            </h2>
            <div className="space-y-3">
              {flatten(questions)
                .filter(q => q.label || q.noticeText)
                .map(q => (
                  <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{q.id}</code>
                      {isChanged(q) && (
                        <span className="rounded-full bg-[#2F9BF0]/10 px-2 py-0.5 text-xs font-semibold text-[#2F9BF0]">
                          Edited
                        </span>
                      )}
                    </div>

                    <p className="mb-2 text-xs text-slate-400">
                      Original: {q.label ?? q.noticeText}
                    </p>

                    <div className="flex gap-2">
                      <input
                        className={inp}
                        value={current(q)}
                        placeholder={q.label}
                        onChange={e => setDirty(d => ({ ...d, [q.id]: e.target.value }))}
                      />
                      <button
                        className={btnPrimary}
                        disabled={dirty[q.id] === undefined || saving === q.id}
                        onClick={() => save(q)}
                      >
                        {saving === q.id ? 'Saving…' : 'Save'}
                      </button>
                      {isChanged(q) && (
                        <button className={btnGhost} onClick={() => reset(q)}>Reset</button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
