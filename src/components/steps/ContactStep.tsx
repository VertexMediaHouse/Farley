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

  const isCom = data.isCommercial === 'Commercial';
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

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <StepHeader title="Contact Information" step={1} total={4} />

      {/* ── Commercial work ───────────────────────────── */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm font-semibold text-slate-700">
          Work Type of work is it?
        </p>

        <div className="mt-3 flex items-center gap-8">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="isCommercial"
              checked={isCom}
              onChange={() => set("isCommercial", "Commercial")}
              className="h-4 w-4"
            />
            <span className="text-sm text-slate-700">Commercial</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="isCommercial"
              checked={!isCom}
              onChange={() => set("isCommercial", "Residential")}
              className="h-4 w-4"
            />
            <span className="text-sm text-slate-700">Residential</span>
          </label>
        </div>
      </div>

      {/* ── Subcontractor ───────────────────────────── */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm font-semibold text-slate-700">
          Are you a subcontractor?
        </p>

        <div className="mt-3 flex items-center gap-8">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="isSubcontractor"
              checked={isSub}
              onChange={() => set("isSubcontractor", "yes")}
              className="h-4 w-4"
            />
            <span className="text-sm text-slate-700">Yes</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="isSubcontractor"
              checked={!isSub}
              onChange={() => set("isSubcontractor", "no")}
              className="h-4 w-4"
            />
            <span className="text-sm text-slate-700">No</span>
          </label>
        </div>
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

      <NavigationButtons step={1} total={4} onBack={() => { }} onNext={handleNext} />
    </div>
  );
}