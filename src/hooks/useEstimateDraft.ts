import { useState, useEffect } from 'react';
import type { AreaValues } from '../types/form';
import {
  DEFAULT_CONTACT,
  loadDraft,
  saveDraft,
  submitEstimate,
  type ContactData,
} from '../lib/estimateForm';
import { useCustomQuestions, useProductPrices } from '../context/CopyProvider';

export function useEstimateDraft() {
  const customQuestions = useCustomQuestions();
  const productPrices = useProductPrices();

  const [step, setStep] = useState(1);
  const [drywall, setDrywall] = useState<AreaValues[]>([{}]);
  const [trim, setTrim] = useState<AreaValues[]>([{}]);
  const [paint, setPaint] = useState<AreaValues[]>([{}]);
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);
  const [sent, setSent] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const saved = loadDraft();
    if (!saved) return;
    if (saved.step) setStep(saved.step);
    if (saved.drywall?.length) setDrywall(saved.drywall);
    if (saved.trim?.length) setTrim(saved.trim);
    if (saved.paint?.length) setPaint(saved.paint);
    if (saved.contact) setContact(prev => ({ ...prev, ...saved.contact }));
    setRestored(true);
  }, []);

  useEffect(() => {
    saveDraft({ step, drywall, trim, paint, contact });
  }, [step, drywall, trim, paint, contact]);

  const goTo = (n: number) => {
    setStep(n);
    requestAnimationFrame(() => {
      document.getElementById('estimate-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleSubmit = () => {
    try {
      submitEstimate(drywall, trim, paint, contact, customQuestions, productPrices);
      setSent(true);
    } catch (e) {
      console.error('Failed to store estimate', e);
    }
  };

  return {
    step,
    goTo,
    drywall, setDrywall,
    trim, setTrim,
    paint, setPaint,
    contact, setContact,
    sent,
    restored,
    customQuestions,
    productPrices,
    handleSubmit,
  };
}
