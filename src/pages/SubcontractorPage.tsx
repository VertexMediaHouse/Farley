import { useState } from 'react';
import { input as inp, label as lbl, errorText, btnPrimary } from '../components/theme';

interface SubcontractorData {
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
}

const INITIAL: SubcontractorData = {
  fullName: '',
  companyName: '',
  phone: '',
  email: '',
};

export default function SubcontractorPage() {
  const [data, setData] = useState<SubcontractorData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof SubcontractorData, val: string) =>
    setData(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.fullName.trim()) e.fullName = 'Required';
    if (!data.companyName.trim()) e.companyName = 'Required';
    if (!data.phone.trim()) e.phone = 'Required';
    // Email is optional per spec
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    console.log('📋 Subcontractor Referral:', data);
    // Store locally for now — just collecting data
    try {
      const existing = JSON.parse(localStorage.getItem('fcd_subcontractor_referrals') ?? '[]') as SubcontractorData[];
      existing.push(data);
      localStorage.setItem('fcd_subcontractor_referrals', JSON.stringify(existing));
    } catch { /* ignore */ }
    setSubmitted(true);
  };

  const req = () => <span className="ml-0.5 text-red-500">*</span>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header band ─────────────────────────────────────── */}
      <div className="bg-[#12294A]">
        <div className="mx-auto max-w-xl px-6 pb-16 pt-10 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F9BF0]">
            Partner with us
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Subcontractor Referral Registration
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Interested in joining our network? Fill out the form below and we'll be in touch.
          </p>
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────────── */}
      <div className="mx-auto -mt-10 max-w-xl px-6 sm:px-8 pb-16">
        {submitted ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2F9BF0]/10 text-2xl text-[#2F9BF0]">
              ✓
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
              Registration received
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Thank you for your interest. We'll review your information and get back to you.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5"
          >
            <div>
              <label className={lbl}>Full Name{req()}</label>
              <input
                className={inp}
                placeholder="John Doe"
                value={data.fullName}
                onChange={e => set('fullName', e.target.value)}
              />
              {errors.fullName && <p className={errorText}>{errors.fullName}</p>}
            </div>

            <div>
              <label className={lbl}>Company Name{req()}</label>
              <input
                className={inp}
                placeholder="Your company"
                value={data.companyName}
                onChange={e => set('companyName', e.target.value)}
              />
              {errors.companyName && <p className={errorText}>{errors.companyName}</p>}
            </div>

            <div>
              <label className={lbl}>Phone Number{req()}</label>
              <input
                className={inp}
                type="tel"
                placeholder="(000) 000-0000"
                value={data.phone}
                onChange={e => set('phone', e.target.value)}
              />
              {errors.phone && <p className={errorText}>{errors.phone}</p>}
            </div>

            <div>
              <label className={lbl}>Email Address</label>
              <input
                className={inp}
                type="email"
                placeholder="email@company.com"
                value={data.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <button type="submit" className={btnPrimary}>
              Submit Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
