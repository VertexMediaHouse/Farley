import { useState } from "react";
import StepHeader from "../StepHeader";
import NavigationButtons from "../NavigationButtons";
import { input as inp, label as lbl, errorText } from "../theme";

interface ContactData {
  isCommercial: string;
  isSubcontractor: string;
  fullName: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
}

interface Props {
  data: ContactData;
  onChange: (data: ContactData) => void;
  onNext: () => void;
}

const req = () => <span className="ml-0.5 text-red-500">*</span>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isValidEmail = (s: string) => emailRe.test(s.trim());

const isValidPhone = (s: string) => {
  const d = s.replace(/\D/g, "");
  return d.length === 10 || (d.length === 11 && d.startsWith("1"));
};

export default function ContactStep({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof ContactData, val: string) => {
    onChange({ ...data, [key]: val });
    // clear the field's error as soon as the user edits it
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const isCom = data.isCommercial === 'yes';
  const isSub = data.isSubcontractor === 'yes';

  const validate = () => {
    const e: Record<string, string> = {};

    if (isSub) {
      if (!data.fullName.trim()) e.fullName = "Required";
      if (!data.companyName.trim()) e.companyName = "Required";

      if (!data.phoneNumber.trim()) e.phoneNumber = "Required";
      else if (!isValidPhone(data.phoneNumber)) e.phoneNumber = "Enter a valid 10-digit phone number";

      if (data.emailAddress.trim() && !isValidEmail(data.emailAddress))
        e.emailAddress = "Enter a valid email address";
    }

    if (!data.clientName.trim()) e.clientName = "Required";

    if (data.clientEmail.trim() && !isValidEmail(data.clientEmail))
      e.clientEmail = "Enter a valid email address";

    if (data.clientPhone.trim() && !isValidPhone(data.clientPhone))
      e.clientPhone = "Enter a valid 10-digit phone number";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <StepHeader title="Contact Information" step={1} total={4} />

      {/* ── Commercial work toggle ───────────────────────────── */}
      <div className="mt-8 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <span className="text-sm font-semibold text-slate-700">Is this commercial work?</span>
        <button
          type="button"
          role="switch"
          aria-checked={isCom}
          onClick={() => set('isCommercial', isCom ? 'no' : 'yes')}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F9BF0] focus-visible:ring-offset-2 ${
            isCom ? 'bg-[#2F9BF0]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isCom ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-xs font-semibold ${isCom ? 'text-[#2F9BF0]' : 'text-slate-400'}`}>
          {isCom ? 'Yes' : 'No'}
        </span>
      </div>

      {/* ── Subcontractor toggle ───────────────────────────── */}
      <div className="mt-8 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <span className="text-sm font-semibold text-slate-700">Are you a subcontractor?</span>
        <button
          type="button"
          role="switch"
          aria-checked={isSub}
          onClick={() => set('isSubcontractor', isSub ? 'no' : 'yes')}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F9BF0] focus-visible:ring-offset-2 ${
            isSub ? 'bg-[#2F9BF0]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isSub ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-xs font-semibold ${isSub ? 'text-[#2F9BF0]' : 'text-slate-400'}`}>
          {isSub ? 'Yes' : 'No'}
        </span>
      </div>

      {/* ── Subcontractor Referral Registration ─────────────── */}
      {isSub && (
        <div className="mt-8 animate-[fadeSlide_0.3s_ease-out]">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 mb-4">
            Subcontractor Referral Registration
          </p>
          <div className="space-y-5">
            <div>
              <label className={lbl}>Full Name{req()}</label>
              <input className={inp} placeholder="Full name" value={data.fullName} onChange={e => set("fullName", e.target.value)} />
              {errors.fullName && <p className={errorText}>{errors.fullName}</p>}
            </div>

            <div>
              <label className={lbl}>Company Name{req()}</label>
              <input className={inp} placeholder="Company name" value={data.companyName} onChange={e => set("companyName", e.target.value)} />
              {errors.companyName && <p className={errorText}>{errors.companyName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Phone Number{req()}</label>
                <input
                  className={inp}
                  type="tel"
                  inputMode="tel"
                  placeholder="(000) 000-0000"
                  value={data.phoneNumber}
                  onChange={e => set("phoneNumber", e.target.value)}
                  aria-invalid={!!errors.phoneNumber}
                />
                {errors.phoneNumber && <p className={errorText}>{errors.phoneNumber}</p>}
              </div>
              <div>
                <label className={lbl}>Email Address</label>
                <input
                  className={inp}
                  type="email"
                  inputMode="email"
                  placeholder="your@email.com"
                  value={data.emailAddress}
                  onChange={e => set("emailAddress", e.target.value)}
                  aria-invalid={!!errors.emailAddress}
                />
                {errors.emailAddress && <p className={errorText}>{errors.emailAddress}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Client Info ────────────────────────────────────── */}
      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 mb-4">
          Client's Info
        </p>
        <div className="space-y-5">
          <div>
            <label className={lbl}>Name{req()}</label>
            <input className={inp} placeholder="Client name" value={data.clientName} onChange={e => set("clientName", e.target.value)} />
            {errors.clientName && <p className={errorText}>{errors.clientName}</p>}
          </div>

          <div>
            <label className={lbl}>Address</label>
            <input className={inp} placeholder="Street address" value={data.clientAddress} onChange={e => set("clientAddress", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Email</label>
              <input
                className={inp}
                type="email"
                inputMode="email"
                placeholder="client@email.com"
                value={data.clientEmail}
                onChange={e => set("clientEmail", e.target.value)}
                aria-invalid={!!errors.clientEmail}
              />
              {errors.clientEmail && <p className={errorText}>{errors.clientEmail}</p>}
            </div>
            <div>
              <label className={lbl}>Phone</label>
              <input
                className={inp}
                type="tel"
                inputMode="tel"
                placeholder="(000) 000-0000"
                value={data.clientPhone}
                onChange={e => set("clientPhone", e.target.value)}
                aria-invalid={!!errors.clientPhone}
              />
              {errors.clientPhone && <p className={errorText}>{errors.clientPhone}</p>}
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons step={1} total={4} onBack={() => {}} onNext={handleNext} />
    </div>
  );
}