import { useState } from 'react';
import { FaTools, FaRuler, FaPaintRoller, FaAddressCard, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import type { AreaValues } from '../types/form';
import { calculateEstimate } from '../lib/estimate';
import type { LineItem } from '../lib/estimate';

const STEPS = [
  { label: 'Contact',  hint: 'Where to send the quote',    Icon: FaAddressCard },
  { label: 'Drywall',  hint: 'Repairs, texture, location', Icon: FaTools },
  { label: 'Trim',     hint: 'Baseboard and casing',       Icon: FaRuler },
  { label: 'Painting', hint: 'Areas and finish level',     Icon: FaPaintRoller },
];


interface Props {
  step: number;
  onStepClick: (n: number) => void;
  restored: boolean;
  phone: string;
  phoneHref: string;
  drywall: AreaValues[];
  trim: AreaValues[];
  paint: AreaValues[];
  customQuestions?: any[];
}

/** An area counts once the user has actually answered something in it. */
function filledCount(areas: AreaValues[]) {
  return areas.filter(a =>
    Object.values(a).some(v => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
  ).length;
}

/** Format currency */
function fmt(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function StepSidebar({
  step, onStepClick, phone, phoneHref, drywall, trim, paint, customQuestions = [],
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const pct = Math.round((step / STEPS.length) * 100);

  const summary = [
    { label: 'Drywall',  n: filledCount(drywall) },
    { label: 'Trim',     n: filledCount(trim) },
    { label: 'Painting', n: filledCount(paint) },
  ];
  const started = summary.some(s => s.n > 0);

  const estimate = calculateEstimate({ drywall, trim, paint }, customQuestions);
  const hasEstimate = estimate.lineItems.length > 0;

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="space-y-4">

        {/* ── Progress + stepper ───────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Progress
            </span>
            <span className="text-xs font-semibold text-slate-500">{pct}%</span>
          </div>
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#2F9BF0] transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <ol className="space-y-1">
            {STEPS.map(({ label, hint, Icon }, i) => {
              const n = i + 1;
              const active = step === n;
              const done   = step > n;

              return (
                <li key={label}>
                  <button
                    type="button"
                    disabled={!done && !active}
                    onClick={() => done && onStepClick(n)}
                    className={`flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition ${
                      active ? 'bg-slate-50' : ''
                    } ${done ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors ${
                        active
                          ? 'bg-[#12294A] text-white'
                          : done
                          ? 'bg-[#2F9BF0]/10 text-[#2F9BF0]'
                          : 'border border-slate-200 bg-white text-slate-300'
                      }`}
                    >
                      {done ? '✓' : <Icon />}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold ${
                        active ? 'text-slate-900' : done ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {label}
                      </span>
                      <span className="block truncate text-xs text-slate-400">{hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        {hasEstimate && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Preliminary estimate
            </p>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {fmt(estimate.subtotal)}
              </span>
              <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-xs font-semibold text-[#2F9BF0] transition hover:text-[#1E86D8]"
              >
                {expanded ? 'Hide details' : 'Show details'}
                {expanded ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
              </button>
            </div>

            {expanded && (
              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                {estimate.lineItems.map((item: LineItem, idx: number) => (
                  <div key={idx} className="flex items-start justify-between text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-700 truncate">{item.label}</p>
                      <p className="text-slate-400">{item.detail}</p>
                      <p className="text-slate-300">{item.area}</p>
                    </div>
                    <span className="ml-3 shrink-0 font-semibold text-slate-600">
                      {fmt(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              * Preliminary estimate, subject to on-site confirmation.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Don't know how to fill?
          </p>
          <span className='display-flex justify-center text-center'> Watch this</span>

          {/* Video player placeholder */}
          <div className="mt-3 relative w-full overflow-hidden rounded-xl bg-[#0d1f36]" style={{ aspectRatio: '16/9' }}>
            {/* Thumbnail gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#12294A] via-[#0d1f36] to-[#0a1828]" />
            {/* Decorative scan lines */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)' }} />
            {/* Play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-transform hover:scale-105">
                <svg className="ml-0.5 h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-white/60 tracking-wide">Watch how it works</span>
            </div>
            {/* Duration badge */}
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white/80 backdrop-blur-sm">
              1:24
            </span>
          </div>

          <a
            href={phoneHref}
            className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#2F9BF0] hover:text-[#2F9BF0]"
          >
            Prefer to call? {phone}
          </a>
        </div>

        {/* ── Live project summary ─────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Your project so far
          </p>

          {started ? (
            <ul className="mt-3 space-y-2">
              {summary.map(({ label, n }) => (
                <li key={label} className="flex items-center justify-between text-sm">
                  <span className={n ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
                  <span className={n
                    ? 'rounded-full bg-[#2F9BF0]/10 px-2 py-0.5 text-xs font-semibold text-[#2F9BF0]'
                    : 'text-xs text-slate-300'}>
                    {n ? `${n} ${n === 1 ? 'area' : 'areas'}` : 'Not started'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Answer the questions and your areas will show up here as you go.
            </p>
          )}
        </div>

        {/* ── Preliminary estimate ─────────────────────────── */}
      </div>
    </aside>
  );
}