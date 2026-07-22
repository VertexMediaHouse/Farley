import { useState } from "react";
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
  onBack: () => void;
  onNext: () => void;
}

const req = () => <span className="ml-0.5 text-red-500">*</span>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isValidEmail = (s: string) => emailRe.test(s.trim());

const isValidPhone = (s: string) => {
  const d = s.replace(/\D/g, "");
  return d.length === 10 || (d.length === 11 && d.startsWith("1"));
};

export default function ClientInfoStep({ data, onChange, onBack, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof ContactData, val: string) => {
    onChange({ ...data, [key]: val });
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};

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
      <h2 className="text-xl font-semibold text-slate-900">
        Final Step: Client Information
      </h2>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        Please complete your contact details below to receive your project estimate.
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

      <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-800 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-lg bg-[#2F9BF0] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1E86D8] transition"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}
