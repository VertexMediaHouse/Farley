import { useEffect, useState } from 'react';
import type { QuestionConfig, AreaValues, Condition } from '../types/form';
import UploadBox from './UploadBox';
import InfoButton from './InfoButton';
import { input as inp, label as lbl, errorText } from './theme';

// ─── Condition evaluator ─────────────────────────────────────────────────────

export function evalCondition(cond: Condition, values: AreaValues): boolean {
  const raw = values[cond.field];
  const val = typeof raw === 'string' ? raw : '';
  if (cond.is  !== undefined) return val === cond.is;
  if (cond.not !== undefined) return val !== cond.not;
  if (cond.notNo)             return val !== 'No' && val !== '';
  if (cond.in)                return cond.in.includes(val);
  if (cond.notIn)             return val !== '' && !cond.notIn.includes(val);
  return true;
}

export function validateConfig(config: QuestionConfig[], values: AreaValues): Record<string, string> {
  const errs: Record<string, string> = {};
  config.forEach(q => {
    const isVisible = !q.condition || evalCondition(q.condition, values);
    if (!isVisible) return;

    if (q.type === 'repeatableGroup') {
      const children = q.children || [];
      const raw = values[q.id] as string;
      try {
        const records = raw ? JSON.parse(raw) : [{}];
        // For simplicity, just checking if first record is missing a required child field
        children.forEach(c => {
          if (c.required) {
            records.forEach((rec: any, idx: number) => {
              if (!rec[c.id]) {
                errs[`${q.id}_${idx}_${c.id}`] = 'Required';
                errs[q.id] = 'Required fields missing in group';
              }
            });
          }
        });
      } catch {
        errs[q.id] = 'Invalid format';
      }
    } else if (q.required) {
      const cur = values[q.id];
      if (!cur || (Array.isArray(cur) && cur.length === 0)) {
        errs[q.id] = 'Required';
      }
    }
  });
  return errs;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface FormRendererProps {
  questions: QuestionConfig[];
  values: AreaValues;
  onChange: (id: string, value: AreaValues[string]) => void;
  errors?: Record<string, string>;
}

// ─── Main renderer ───────────────────────────────────────────────────────────

export default function FormRenderer({ questions, values, onChange, errors = {} }: FormRendererProps) {
  // Auto-clear values of hidden questions
  useEffect(() => {
    questions.forEach(q => {
      if (q.condition && !evalCondition(q.condition, values)) {
        const cur = values[q.id];
        const empty = cur === '' || cur === null || cur === undefined || (Array.isArray(cur) && cur.length === 0);
        if (!empty) onChange(q.id, q.type === 'photoUpload' ? [] : '');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, JSON.stringify(Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, Array.isArray(v) ? v.length : v])
  ))]);

  return (
    <div className="space-y-4">
      {questions.map(q => {
        if (q.condition && !evalCondition(q.condition, values)) return null;
        return <Field key={q.id} q={q} values={values} onChange={onChange} errors={errors} />;
      })}
    </div>
  );
}

// ─── Single field ────────────────────────────────────────────────────────────

function Field({
  q, values, onChange, errors,
}: {
  q: QuestionConfig;
  values: AreaValues;
  onChange: (id: string, v: AreaValues[string]) => void;
  errors: Record<string, string>;
}) {
  const val   = (values[q.id] ?? '') as string;
  const files = (Array.isArray(values[q.id]) ? values[q.id] : []) as File[];
  const err   = errors[q.id];

  const Label = () => (
    <label className={lbl}>
      {q.label}{q.required && <span className="ml-0.5 text-red-500">*</span>}
      {q.helpText && <InfoButton helpText={q.helpText} />}
    </label>
  );

  if (q.type === 'notice') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {q.noticeText}
      </div>
    );
  }

  if (q.type === 'repeatableGroup') {
    return (
      <RepeatableGroup
        q={q}
        rawValue={val}
        onChange={(v) => onChange(q.id, v)}
      />
    );
  }

  if (q.type === 'photoUpload') {
    return (
      <div>
        <Label />
        {q.multiple ? (
          <MultiUpload files={files} onChange={f => onChange(q.id, f)} />
        ) : (
          <UploadBox
            value={files[0] ?? null}
            onChange={f => onChange(q.id, f ? [f] : [])}
          />
        )}
      </div>
    );
  }

  if (q.type === 'catalogDropdown') {
    return <CatalogSelector q={q} value={val} onChange={v => onChange(q.id, v)} />;
  }

  if (q.type === 'dropdown') {
    return (
      <div>
        <Label />
        <select className={inp} value={val} onChange={e => onChange(q.id, e.target.value)}>
          {q.options?.map(o => <option key={o} value={o}>{o || 'Select…'}</option>)}
        </select>
        {err && <p className={errorText}>{err}</p>}
      </div>
    );
  }

  if (q.type === 'textarea') {
    return (
      <div>
        <Label />
        <textarea
          rows={4}
          className={`${inp} resize-none`}
          placeholder={q.placeholder}
          value={val}
          onChange={e => onChange(q.id, e.target.value)}
        />
        {err && <p className={errorText}>{err}</p>}
      </div>
    );
  }

  // text / number
  return (
    <div>
      <Label />
      <input
        type={q.type === 'number' ? 'number' : 'text'}
        className={inp}
        placeholder={q.placeholder}
        value={val}
        onChange={e => onChange(q.id, e.target.value)}
      />
      {err && <p className={errorText}>{err}</p>}
    </div>
  );
}

// ─── Repeatable Group ────────────────────────────────────────────────────────

interface RepeatableRecord {
  [key: string]: string;
}

function RepeatableGroup({
  q,
  rawValue,
  onChange,
}: {
  q: QuestionConfig;
  rawValue: string;
  onChange: (v: string) => void;
}) {
  const children = q.children ?? [];

  // Parse the stored JSON string into an array of records
  const parseRecords = (v: string): RepeatableRecord[] => {
    if (!v) return [buildEmpty()];
    try {
      const arr = JSON.parse(v) as RepeatableRecord[];
      return arr.length > 0 ? arr : [buildEmpty()];
    } catch {
      return [buildEmpty()];
    }
  };

  const buildEmpty = (): RepeatableRecord => {
    const rec: RepeatableRecord = {};
    children.forEach(c => { rec[c.id] = ''; });
    return rec;
  };

  const records = parseRecords(rawValue);

  const commit = (next: RepeatableRecord[]) => {
    onChange(JSON.stringify(next));
  };

  const updateField = (idx: number, fieldId: string, val: string) => {
    const next = records.map((r, i) => i === idx ? { ...r, [fieldId]: val } : r);
    commit(next);
  };

  const addRecord = () => {
    commit([...records, buildEmpty()]);
  };

  const removeRecord = (idx: number) => {
    const next = records.filter((_, i) => i !== idx);
    commit(next.length > 0 ? next : [buildEmpty()]);
  };

  return (
    <div className="space-y-3">
      <label className={lbl}>{q.label}</label>
      {records.map((rec, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              #{idx + 1}
            </span>
            {records.length > 1 && (
              <button
                type="button"
                onClick={() => removeRecord(idx)}
                className="text-xs font-medium text-slate-400 transition hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
          {children.map(child => {
            if (child.type === 'photoUpload') {
              // Photo upload inside repeatable is not stored in JSON, skip for now
              return null;
            }
            if (child.type === 'dropdown') {
              return (
                <div key={child.id}>
                  <label className={lbl}>
                    {child.label}
                    {child.required && <span className="ml-0.5 text-red-500">*</span>}
                  </label>
                  <select
                    className={inp}
                    value={rec[child.id] ?? ''}
                    onChange={e => updateField(idx, child.id, e.target.value)}
                  >
                    {child.options?.map(o => (
                      <option key={o} value={o}>{o || 'Select…'}</option>
                    ))}
                  </select>
                </div>
              );
            }
            return (
              <div key={child.id}>
                <label className={lbl}>
                  {child.label}
                  {child.required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
                <input
                  type={child.type === 'number' ? 'number' : 'text'}
                  className={inp}
                  placeholder={child.placeholder}
                  value={rec[child.id] ?? ''}
                  onChange={e => updateField(idx, child.id, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      ))}
      <button
        type="button"
        onClick={addRecord}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2 text-sm font-semibold text-slate-500 transition hover:border-[#12294A] hover:bg-slate-50 hover:text-[#12294A]"
      >
        <span className="text-lg leading-none">+</span> Add another
      </button>
    </div>
  );
}

// ─── Multi-upload ────────────────────────────────────────────────────────────

function MultiUpload({ files, onChange }: { files: File[]; onChange: (f: File[]) => void }) {
  return (
    <div className="space-y-2">
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <img src={URL.createObjectURL(f)} alt="" className="h-16 w-auto rounded-lg border border-slate-200 object-cover" />
          <button type="button" onClick={() => onChange(files.filter((_, idx) => idx !== i))} className="text-xs font-medium text-red-500 hover:underline">Remove</button>
        </div>
      ))}
      <UploadBox value={null} onChange={f => { if (f) onChange([...files, f]); }} label="Add photo" />
    </div>
  );
}

// ─── Catalog selector ────────────────────────────────────────────────────────

function CatalogSelector({ q, value, onChange }: { q: QuestionConfig; value: string; onChange: (v: string) => void }) {
  const [activeSize, setActiveSize] = useState('');
  const cats = q.catalog ?? [];

  const pill = (on: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
      on ? 'bg-[#2F9BF0] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;

  return (
    <div>
      <label className={lbl}>
        {q.label}
        {q.helpText && <InfoButton helpText={q.helpText} />}
      </label>

      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map(cat => (
          <button
            key={cat.size}
            type="button"
            onClick={() => setActiveSize(s => s === cat.size ? '' : cat.size)}
            className={pill(activeSize === cat.size)}
          >
            {cat.size}
          </button>
        ))}
      </div>

      {activeSize && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {cats.find(c => c.size === activeSize)?.products.map(p => {
             const isSelected = value === p.name;
             return (
              <div 
                key={p.url} 
                onClick={() => onChange(p.name)}
                className={`relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 bg-white transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'border-[#2F9BF0] shadow-md ring-4 ring-[#2F9BF0]/10' : 'border-slate-200 hover:border-[#2F9BF0]/40'
                }`}
              >
                {/* Image Placeholder */}
                <div className="flex h-32 w-full flex-col items-center justify-center bg-slate-50 border-b border-slate-100 overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <svg className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-slate-400 font-medium">Image</span>
                    </>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1 p-3">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-700 leading-tight line-clamp-2">{p.name}</span>
                    <a 
                      href={p.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                    >
                      View
                    </a>
                  </div>
                  
                  {/* Radio button at bottom center */}
                  <div className="mt-auto flex justify-center pt-2">
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={p.name} 
                      checked={isSelected} 
                      onChange={() => onChange(p.name)} 
                      className="h-5 w-5 accent-[#2F9BF0] transition-transform cursor-pointer" 
                      style={{ transform: isSelected ? 'scale(1.15)' : 'scale(1)' }}
                    />
                  </div>
                </div>
              </div>
             );
          })}
        </div>
      )}

      {value && (
        <div className="mt-4 rounded-lg bg-[#2F9BF0]/5 px-4 py-3 border border-[#2F9BF0]/10 flex items-center gap-2">
          <svg className="h-5 w-5 text-[#2F9BF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-slate-700">Selected: <span className="font-bold text-[#2F9BF0]">{value}</span></p>
        </div>
      )}
    </div>
  );
}