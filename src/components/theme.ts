// Central design tokens for the estimate flow.
// Palette matches the live site: deep navy chrome + the bright blue from the "Get Quote" button.

export const BRAND = {
  ink: '#12294A',        // navy — header band, structure, active states
  inkHover: '#1C3A64',
  accent: '#2F9BF0',     // site blue — primary CTA, links, highlights
  accentHover: '#1E86D8',
} as const;

/* ── Form fields ─────────────────────────────────────────── */
export const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 outline-none transition ' +
  'focus:border-[#2F9BF0] focus:ring-4 focus:ring-[#2F9BF0]/15';

export const label = 'mb-1.5 block text-sm font-medium text-slate-700';

export const errorText = 'mt-1.5 text-xs font-medium text-red-600';

/* ── Buttons ─────────────────────────────────────────────── */
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff861c] px-7 py-2.5 ' +
  'text-sm font-semibold text-white shadow-[0_3px_13px_rgba(255,134,28,0.4)] transition-all duration-300 ' +
  'hover:bg-[#d9700f] hover:-translate-y-[3px] hover:scale-[1.08] focus:outline-none focus:ring-4 focus:ring-[#ff861c]/25 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 [animation:backToTopPulse_2.5s_ease-in-out_infinite]';

// Final submit — navy, so it reads as the terminal action rather than another "next".
export const btnSubmit =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#12294A] px-7 py-2.5 ' +
  'text-sm font-semibold text-white shadow-sm transition ' +
  'hover:bg-[#1C3A64] focus:outline-none focus:ring-4 focus:ring-[#12294A]/20';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 py-2.5 ' +
  'text-sm font-semibold text-slate-600 transition ' +
  'hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900';

/* ── Surfaces ────────────────────────────────────────────── */
export const card =
  'rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300';

export const eyebrow =
  'text-xs font-semibold uppercase tracking-[0.15em] text-[#2F9BF0]';