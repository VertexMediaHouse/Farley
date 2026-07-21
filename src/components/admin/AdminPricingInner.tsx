import { useState, useMemo, useEffect } from 'react';
import { flattenRates, setRate, bulkAdjust } from '../../lib/rates';
import type { RateRow } from '../../lib/rates';
import type { PricingRule } from '../../lib/pricing';
import { fetchPriceOverrides, savePriceOverrides } from '../../lib/priceOverrides';
import { getInitialPricingRules, applyPricingRules } from '../../data/pricingMapper';

// ─── Label maps ───────────────────────────────────────────────────────────────

const QUESTION_LABELS: Record<string, string> = {
  'drywall':                      'Drywall surface rates',
  'dividing_wall':                'Dividing wall surcharge',
  'crack_repair_wall_under_5':    'Crack repair wall — under 5 lft',
  'crack_repair_ceiling_under_5': 'Crack repair ceiling — under 5 lft',
  'crack_repair_wall_extra_lft':    'Crack repair wall — per extra lft (above 5)',
  'crack_repair_ceiling_extra_lft': 'Crack repair ceiling — per extra lft (above 5)',
  'floor_surcharge':              'Floor-level surcharge',
  'staircase_fee':                'Staircase flat fee',
  'demolition_sqft':              'Demolition (per sqft)',
  'demolition_lft':               'Demolition (per lft)',
  'popcorn_scraping':             'Popcorn ceiling scraping (by height)',
  'haul_away_under_50':           'Haul away ≤ 50 sqft — flat',
  'haul_away_above_50':           'Haul away > 50 sqft — per sqft',
  'insulation_per_sqft':          'Insulation — per sqft',
  'corner_metal':                 'Corner metal (per unit)',
  'arch_corner_metal':            'Arch corner metal — per lft',
  'texture_rates':                'Finish / Texture rates',
  'baseboard_lft':                'Baseboard — per lft (by height)',
  'door_casing_lft':              'Door casing — per lft',
  'paint_sqft':                   'Painting labor — per sqft',
  'paint_linear':                 'Painting labor — per lft',
  'trip_charge':                  'Trip charge (per project)',
};

const SECTIONS = [
  {
    id: 'sec_drywall',
    title: 'Drywall',
    icon: '🧱',
    questions: ['drywall', 'dividing_wall', 'crack_repair_wall_under_5', 'crack_repair_ceiling_under_5', 'crack_repair_wall_extra_lft', 'crack_repair_ceiling_extra_lft'],
  },
  {
    id: 'sec_location',
    title: 'Location & Access',
    icon: '🏢',
    questions: ['floor_surcharge', 'staircase_fee'],
  },
  {
    id: 'sec_demo',
    title: 'Demolition & Removal',
    icon: '🔨',
    questions: ['demolition_sqft', 'demolition_lft', 'popcorn_scraping', 'haul_away_under_50', 'haul_away_above_50'],
  },
  {
    id: 'sec_materials',
    title: 'Insulation & Corner Metal',
    icon: '🏗️',
    questions: ['insulation_per_sqft', 'corner_metal', 'arch_corner_metal'],
  },
  {
    id: 'sec_finish',
    title: 'Finish & Texture',
    icon: '🎨',
    questions: ['texture_rates'],
  },
  {
    id: 'sec_trim',
    title: 'Trim & Baseboard',
    icon: '📐',
    questions: ['baseboard_lft', 'door_casing_lft'],
  },
  {
    id: 'sec_paint',
    title: 'Painting',
    icon: '🖌️',
    questions: ['paint_sqft', 'paint_linear', 'trip_charge'],
  },
];



// ─── Rate Input Row ───────────────────────────────────────────────────────────

interface RateInputProps {
  row: RateRow;
  originalAmount: number;
  onChange: (newAmount: number) => void;
}

function RateInput({ row, originalAmount, onChange }: RateInputProps) {
  const initialVal = typeof row.amount === 'number' ? row.amount.toFixed(2) : '';
  const [val, setVal] = useState(initialVal);

  useEffect(() => {
    const newVal = typeof row.amount === 'number' ? row.amount.toFixed(2) : '';
    setVal(newVal);
  }, [row.amount]);

  const handleBlur = () => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) {
      // fallback to original amount if available, otherwise empty string
      const fallback = typeof row.amount === 'number' ? row.amount.toFixed(2) : '';
      setVal(fallback);
      return;
    }
    onChange(parsed);
    setVal(parsed.toFixed(2));
  };

  const isNoCharge = row.amount === 0;
  const pct = originalAmount > 0 ? Math.abs(row.amount - originalAmount) / originalAmount : 0;
  const isFatFinger = pct > 0.25;
  const isChanged = row.amount !== originalAmount;

  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg -mx-1 transition-colors ${isChanged ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
      <div className="flex-1 min-w-0 mr-4">
        <span className="text-sm text-slate-700 truncate">{row.label}</span>
        {isChanged && (
          <span className="ml-2 text-xs text-slate-400 line-through">{typeof originalAmount === 'number' ? originalAmount.toFixed(2) : ''}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isFatFinger && (
          <span className="text-amber-500 text-xs font-bold whitespace-nowrap" title="Changed by more than 25%">
            ⚠ {row.amount > originalAmount ? '+' : ''}{Math.round(((row.amount - originalAmount) / originalAmount) * 100)}%
          </span>
        )}
        <div className={`flex items-center border rounded-md shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#2F9BF0] focus-within:border-transparent ${isChanged ? 'border-[#2F9BF0] bg-white' : 'border-slate-300 bg-white'}`}>
          <span className="text-slate-400 pl-2.5 pr-1 text-sm">$</span>
          <input
            type="number"
            className="w-20 text-right py-1 pr-2 focus:outline-none text-sm font-mono font-medium bg-transparent"
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={handleBlur}
            step="0.01"
            min="0"
          />
        </div>
        <span className="text-xs text-slate-400 w-14 text-left">{row.unit}</span>
        <button
          title={isNoCharge ? 'Restore rate' : 'Set to no charge'}
          onClick={() => onChange(isNoCharge ? (originalAmount || 1) : 0)}
          className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${isNoCharge ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'}`}
        >
          {isNoCharge ? 'Free' : '—'}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminPricingInner() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [draftRules, setDraftRules] = useState<Record<string, PricingRule>>({});
  const [publishedRules, setPublishedRules] = useState<Record<string, PricingRule>>({});
  const [loading, setLoading] = useState(true);

  const [showBulkAdjust, setShowBulkAdjust] = useState<string | null>(null);
  const [bulkPct, setBulkPct] = useState(5);
  const [bulkRound, setBulkRound] = useState<'none'|'nearest'|'up'>('nearest');
  const [preview, setPreview] = useState<{ avgDelta: number; rows: any[] } | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Load on mount: Supabase overrides merged over hard-coded defaults ─────
  // This is the exact same pattern as question_overrides.
  useEffect(() => {
    const defaults = getInitialPricingRules();
    fetchPriceOverrides()
      .then(saved => {
        // Merge: saved values win over defaults (same rule as question overrides)
        const merged = { ...defaults, ...saved };
        setDraftRules(merged);
        setPublishedRules(merged);
        // Apply to in-memory constants so calculateEstimate uses updated rates
        applyPricingRules(merged);
      })
      .catch(() => {
        setDraftRules(defaults);
        setPublishedRules(defaults);
      })
      .finally(() => setLoading(false));
  }, []);

  // Flat rows for current section
  const originalRows = useMemo(() =>
    Object.entries(publishedRules).flatMap(([qid, rule]) =>
      flattenRates(qid, QUESTION_LABELS[qid] || qid, rule, {})),
    [publishedRules]);

  const draftRows = useMemo(() =>
    Object.entries(draftRules).flatMap(([qid, rule]) =>
      flattenRates(qid, QUESTION_LABELS[qid] || qid, rule, {})),
    [draftRules]);

  const changedCount = useMemo(() =>
    draftRows.filter(dr => {
      const orig = originalRows.find(o => o.questionId === dr.questionId && o.path === dr.path);
      return orig && orig.amount !== dr.amount;
    }).length,
    [draftRows, originalRows]);

  // Live total of all draft rates
  const total = useMemo(() => {
    return draftRows.reduce((sum, r) => sum + (typeof r.amount === 'number' ? r.amount : 0), 0);
  }, [draftRows]);

  const handleRateChange = (row: RateRow, newAmount: number) => {
    if (newAmount < 0) return;
    const rule = draftRules[row.questionId];
    if (!rule) return;
    setDraftRules(prev => ({ ...prev, [row.questionId]: setRate(rule, row.path, newAmount) }));
  };

  const applyBulk = (sectionId: string) => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;
    const next = { ...draftRules };
    for (const qid of section.questions) {
      const rule = next[qid]; if (!rule) continue;
      const rows = flattenRates(qid, QUESTION_LABELS[qid] || qid, rule, {});
      let updated = rule;
      for (const r of bulkAdjust(rows, bulkPct, bulkRound)) {
        updated = setRate(updated, r.path, r.amount);
      }
      next[qid] = updated;
    }
    setDraftRules(next);
    setShowBulkAdjust(null);
  };

  const handlePreview = () => {
    // Mock preview — real implementation would replay recent submissions
    setPreview({ avgDelta: 4.2, rows: [{ id: 'a91f', was: 2840, now: 3410 }] });
  };

  const handlePublish = async () => {
    if (changedCount === 0) return;

    const hasFatFinger = draftRows.some(dr => {
      const orig = originalRows.find(o => o.questionId === dr.questionId && o.path === dr.path);
      return orig && orig.amount > 0 && Math.abs(dr.amount - orig.amount) / orig.amount > 0.25;
    });
    if (hasFatFinger && !window.confirm('Some rates changed by more than 25%. Continue?')) return;

    setSaving(true);
    try {
      // 1. Persist to Supabase — same upsert pattern as question_overrides
      await savePriceOverrides(draftRules);

      // 2. Apply to in-memory constants so calculateEstimate sees new values
      applyPricingRules(draftRules);

      // 3. Promote draft → published baseline
      setPublishedRules({ ...draftRules });
      setPreview(null);
      showToast('✓ Prices published and saved');
    } catch (err) {
      console.error('Failed to save price overrides:', err);
      alert('Could not save prices. Check your Supabase connection or table permissions.');
    } finally {
      setSaving(false);
    }
  };

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const activeSectionData = SECTIONS.find(s => s.id === activeSection) ?? SECTIONS[0];

  const getSectionChanges = (s: typeof SECTIONS[0]) =>
    draftRows.filter(dr => {
      if (!s.questions.includes(dr.questionId)) return false;
      const orig = originalRows.find(o => o.questionId === dr.questionId && o.path === dr.path);
      return orig && orig.amount !== dr.amount;
    }).length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-3">⚙️</div>
          <p className="text-sm">Loading pricing rules…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      {/* Success toast */}
      {toast && (
        <div className="absolute top-4 right-4 z-[70] bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-[fadeSlide_0.3s_ease-out]">
          {toast}
        </div>
      )}
      {/* Section sidebar */}
      <div className="w-52 shrink-0 border-r border-slate-100 bg-slate-50/60 overflow-y-auto">
        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Live Total</p>
          <p className="text-xl font-bold text-[#2F9BF0] mb-3">${total.toFixed(2)}</p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Sections</p>
          <div className="space-y-0.5">
            {SECTIONS.map(s => {
              const changes = getSectionChanges(s);
              const isActive = (activeSection ?? SECTIONS[0].id) === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition-colors ${
                    isActive ? 'bg-[#12294A] text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{s.icon}</span>
                    <span className="font-medium">{s.title}</span>
                  </span>
                  {changes > 0 && (
                    <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-[#2F9BF0]/10 text-[#2F9BF0]'}`}>
                      {changes}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main editing area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Page header */}
          <div className="bg-white px-8 py-6 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                {activeSectionData.icon} {activeSectionData.title}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Edit rates — changes won't go live until you publish</p>
            </div>
            <button
              onClick={() => setShowBulkAdjust(activeSectionData.id)}
              className="text-sm font-medium text-[#2F9BF0] hover:text-[#1e7bc4] flex items-center gap-1 border border-[#2F9BF0]/30 px-3 py-1.5 rounded-lg"
            >
              Adjust all ▾
            </button>
          </div>

          {/* Rate cards */}
          <div className="p-8 space-y-6">
            {activeSectionData.questions.map(qid => {
              const rows = draftRows.filter(r => r.questionId === qid);
              if (!rows.length) return null;
              const changed = rows.filter(r => {
                const o = originalRows.find(x => x.questionId === r.questionId && x.path === r.path);
                return o && o.amount !== r.amount;
              }).length;
              return (
                <div key={qid} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className={`px-5 py-3 flex items-center justify-between border-b ${changed ? 'border-blue-100 bg-blue-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    <h3 className="text-sm font-semibold text-slate-800">{QUESTION_LABELS[qid] ?? qid}</h3>
                    {changed > 0 && (
                      <span className="text-xs font-medium text-[#2F9BF0] bg-[#2F9BF0]/10 px-2 py-0.5 rounded-full">
                        {changed} edited
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-2 space-y-0.5">
                    {rows.map((r, i) => {
                      const orig = originalRows.find(o => o.questionId === r.questionId && o.path === r.path);
                      return (
                        <RateInput
                          key={`${r.questionId}-${r.path}-${i}`}
                          row={r}
                          originalAmount={orig?.amount ?? r.amount}
                          onChange={val => handleRateChange(r, val)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky bottom action bar */}
        <div className="border-t border-slate-200 bg-white px-8 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {changedCount === 0 ? (
              <span className="text-sm text-slate-400">No unsaved changes</span>
            ) : (
              <>
                <span className="text-sm font-medium text-slate-600">
                  <span className="font-bold text-[#12294A]">{changedCount}</span> rate{changedCount !== 1 ? 's' : ''} changed
                </span>
                <button
                  onClick={handlePreview}
                  className="text-sm font-medium text-[#2F9BF0] hover:text-[#1e7bc4] underline underline-offset-2"
                >
                  Preview impact
                </button>
              </>
            )}
          </div>
          <button
            onClick={handlePublish}
            disabled={changedCount === 0 || saving}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              changedCount > 0 && !saving
                ? 'bg-[#2F9BF0] text-white hover:bg-[#1e7bc4] shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Publishing…' : 'Publish changes'}
          </button>
        </div>
      </div>

      {/* Bulk Adjust modal */}
      {showBulkAdjust && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Bulk Adjust</h3>
            <p className="text-sm text-slate-500 mb-5">
              {SECTIONS.find(s => s.id === showBulkAdjust)?.title} — all rates in this section
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Change by %</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <input type="number" className="flex-1 bg-transparent py-2 px-3 focus:outline-none text-slate-900"
                  value={bulkPct} onChange={e => setBulkPct(parseFloat(e.target.value) || 0)} />
                <span className="px-3 text-slate-500 font-medium">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Use a negative number to decrease rates.</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Rounding</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none text-slate-900"
                value={bulkRound} onChange={e => setBulkRound(e.target.value as any)}>
                <option value="none">No rounding</option>
                <option value="nearest">Nearest quarter ($.25, $.50, $.75…)</option>
                <option value="up">Round up to whole dollar</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowBulkAdjust(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
                Cancel
              </button>
              <button onClick={() => applyBulk(showBulkAdjust)}
                className="px-4 py-2 text-sm font-semibold bg-[#12294A] text-white rounded-lg hover:bg-[#1C3A64] transition">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Impact Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Impact of these changes</h3>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-1">
                Average quote{' '}
                <strong className={preview.avgDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {preview.avgDelta > 0 ? '+' : ''}{preview.avgDelta.toFixed(1)}%
                </strong>{' '}
                across your last 30 estimates.
              </p>
              {preview.rows[0] && (
                <p className="text-sm text-slate-600 mt-1">
                  Largest swing: #{preview.rows[0].id} —{' '}
                  <span className="line-through text-slate-400">${preview.rows[0].was}</span>
                  {' → '}
                  <span className="font-semibold">${preview.rows[0].now}</span>
                </p>
              )}
              <div className="mt-5 bg-amber-50 text-amber-800 rounded-lg p-4 text-sm flex gap-3 border border-amber-200/50">
                <span className="text-amber-500 text-base leading-none shrink-0">ℹ</span>
                <p>Publishing applies to all new estimates immediately. You can always revert by republishing previous values.</p>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setPreview(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition">
                Back to Editing
              </button>
              <button onClick={handlePublish}
                className="px-5 py-2 text-sm font-semibold bg-[#12294A] text-white rounded-lg hover:bg-[#1C3A64] shadow-sm transition">
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
