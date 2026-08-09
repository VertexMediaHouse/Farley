import { useEffect, useState } from 'react';
import type { QuestionConfig, AreaValues, Condition } from '../types/form';
import UploadBox from './UploadBox';
import InfoButton from './InfoButton';
import { useProductPrices } from '../context/CopyProvider';
import { pricePerLft } from '../lib/productPricesStore';
import { input as inp, label as lbl, errorText } from './theme';
import PaintExplorer from './paintexplorer/paintexplorer';
import type { PaintColor } from './paintexplorer/types';

// ─── Condition evaluator ─────────────────────────────────────────────────────

export function evalCondition(cond: Condition, values: AreaValues): boolean {
  const raw = values[cond.field];
  const val = typeof raw === 'string' ? raw : '';
  let result = true;
  if (cond.is !== undefined) result = val === cond.is;
  else if (cond.not !== undefined) result = val !== cond.not;
  else if (cond.notNo) result = val !== 'No' && val !== '';
  else if (cond.in) result = cond.in.includes(val);
  else if (cond.notIn) result = val !== '' && !cond.notIn.includes(val);
  // Evaluate chained AND condition
  if (result && cond.and) {
    result = evalCondition(cond.and, values);
  }
  return result;
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
  const val = (values[q.id] ?? '') as string;
  const files = (Array.isArray(values[q.id]) ? values[q.id] : []) as File[];
  const err = errors[q.id];

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
        onFilesChange={(files) => onChange(`${q.id}_photos`, files as any)}
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

  if (q.type === 'paintColorExplorer') {
    return (
      <div>
        <Label />
        <PaintExplorer
          selected={val}
          onSelect={(color: PaintColor) => {
            // Encode hex into the value so only ONE onChange call is needed,
            // avoiding the stale-closure race condition of two sequential setState calls.
            onChange(q.id, `${color.name} (${color.number})|${color.hex}`);
          }}
        />
        {err && <p className={errorText}>{err}</p>}
      </div>
    );
  }

  if (q.type === 'catalogDropdown') {
    const userPrice = (values[`${q.id}_userPrice`] ?? '') as string;
    return (
      <CatalogSelector
        q={q}
        value={val}
        onChange={v => onChange(q.id, v)}
        userPrice={userPrice}
        onPriceChange={v => onChange(`${q.id}_userPrice`, v)}
      />
    );
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
  onFilesChange,
}: {
  q: QuestionConfig;
  rawValue: string;
  onChange: (v: string) => void;
  onFilesChange?: (files: File[]) => void;
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

  const [photos, setPhotos] = useState<Record<string, File[]>>({});

  const setRowPhotos = (idx: number, fieldId: string, files: File[]) => {
    const key = `${idx}:${fieldId}`;
    const nextPhotos = { ...photos, [key]: files };
    setPhotos(nextPhotos);
    // mirror the count into the record so the JSON stays serializable
    const next = records.map((r, i) => i === idx ? { ...r, [fieldId]: String(files.length) } : r);
    commit(next);
    if (onFilesChange) onFilesChange(Object.values(nextPhotos).flat());
  };

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
              const rowFiles = photos[`${idx}:${child.id}`] ?? [];
              return (
                <div key={child.id}>
                  <label className={lbl}>
                    {child.label}
                    {child.required && <span className="ml-0.5 text-red-500">*</span>}
                  </label>
                  {child.multiple ? (
                    <MultiUpload
                      files={rowFiles}
                      onChange={f => setRowPhotos(idx, child.id, f)}
                    />
                  ) : (
                    <UploadBox
                      value={rowFiles[0] ?? null}
                      onChange={f => setRowPhotos(idx, child.id, f ? [f] : [])}
                    />
                  )}
                </div>
              );
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

function CatalogSelector({ q, value, onChange, userPrice, onPriceChange }: {
  q: QuestionConfig;
  value: string;
  onChange: (v: string) => void;
  userPrice?: string;
  onPriceChange?: (v: string) => void;
}) {
  const [activeSize, setActiveSize] = useState('');
  const productPrices = useProductPrices();
  const cats = q.catalog ?? [];
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  // Find the selected product name for the note
  const selectedProduct = value
    ? cats.flatMap(c => c.products).find(p => p.url === value || p.name === value)
    : null;

  const pill = (on: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${on ? 'bg-[#2F9BF0] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cats.find(c => c.size === activeSize)?.products.map(p => {
            const isSelected = value === p.url || value === p.name;
            const lftPrice = pricePerLft(productPrices, p.url);

            if (p.name === 'None of the above') {
              return (
                <div
                  key={p.url}
                  onClick={() => onChange(p.url)}
                  className={`relative col-span-1 sm:col-span-2 flex h-auto cursor-pointer items-center justify-between overflow-hidden rounded-xl border-2 bg-white p-4 transition-all duration-200 hover:shadow-md ${isSelected ? 'border-[#2F9BF0] shadow-md ring-4' : 'border-slate-200 hover:border-[#2F9BF0]/40'}`}
                >
                  <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                  <input
                    type="radio"
                    name={q.id}
                    value={p.url}
                    checked={isSelected}
                    onChange={() => onChange(p.url)}
                    className="h-5 w-5 transition-transform cursor-pointer"
                    style={{ transform: isSelected ? 'scale(1.15)' : 'scale(1)' }}
                  />
                </div>
              );
            }

            return (
              <div
                key={p.url}
                onClick={() => onChange(p.url)}
                className={`relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 bg-white transition-all duration-200 hover:shadow-md ${isSelected ? 'border-[#2F9BF0] shadow-md ring-4' : 'border-slate-200 hover:border-[#2F9BF0]/40'
                  }`}
              >
                {/* Image Container with larger height (h-72) and full width */}
                <div
                  className="group relative flex h-72 w-full flex-col items-center justify-center bg-white border-b border-slate-100 overflow-hidden p-4"
                  onClick={(e) => {
                    if (p.image) {
                      e.stopPropagation();
                      setPreviewImage({ url: p.image, name: p.name });
                    }
                  }}
                  title="Click to view larger image"
                >
                  {p.image ? (
                    <>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                      {/* Zoom Icon overlay on hover */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 p-2 rounded-full shadow-lg">
                          <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </div>
                      </div>
                    </>
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
                    {lftPrice != null && (
                      <span className="shrink-0 text-xs font-bold text-[#2F9BF0]">${lftPrice.toFixed(2)}/lft</span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                    >
                      Store Link
                    </a>
                    {/* Radio button at bottom right */}
                    <input
                      type="radio"
                      name={q.id}
                      value={p.url}
                      checked={isSelected}
                      onChange={() => onChange(p.url)}
                      className="h-5 w-5 transition-transform cursor-pointer"
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
        <div className="mt-4 rounded-xl border border-[#2F9BF0]/20 bg-gradient-to-br from-blue-50 to-white p-5 space-y-4">
          {/* Check icon + selected indicator */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#2F9BF0]">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              {selectedProduct && (
                <p className="text-sm font-bold text-slate-800">{selectedProduct.name}</p>
              )}
              <p className="text-sm text-slate-600">
                Please visit:{' '}
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#2F9BF0] underline decoration-[#2F9BF0]/30 underline-offset-2 transition hover:decoration-[#2F9BF0] break-all"
                >
                  {value}
                </a>
              </p>
              <p className="text-xs font-medium text-slate-500">and enter price below</p>
            </div>
          </div>

          {/* Price input */}
          <div className="flex items-center gap-3 pl-9">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={userPrice ?? ''}
                onChange={e => onPriceChange?.(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-7 pr-14 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-[#2F9BF0] focus:outline-none focus:ring-2 focus:ring-[#2F9BF0]/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">per piece</span>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 transition-opacity duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col p-6 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 pr-8 line-clamp-1">{previewImage.name}</h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 rounded-full p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-slate-50 rounded-xl min-h-[300px] md:min-h-[500px]">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="mt-4 text-center text-xs text-slate-400 font-medium">
              Click anywhere outside or hit the close button to return.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}