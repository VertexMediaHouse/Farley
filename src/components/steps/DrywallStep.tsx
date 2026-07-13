import { useState } from 'react';
import type { AreaValues } from '../../types/form';
import { drywallConfig } from '../../data/drywallConfig';
import StepHeader from '../StepHeader';
import NavigationButtons from '../NavigationButtons';
import AreaManager from '../AreaManager';
import { validateConfig } from '../FormRenderer';
import { useQuestionCopy } from '../../context/CopyProvider';

interface Props {
  areas: AreaValues[];
  onChange: (areas: AreaValues[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DrywallStep({ areas, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const questions = useQuestionCopy(drywallConfig, 'drywall');

  const updateArea = (i: number, id: string, val: AreaValues[string]) => {
    const next = areas.map((a, idx) => idx === i ? { ...a, [id]: val } : a);
    onChange(next);
  };

  const addArea = () => onChange([...areas, {}]);
  const removeArea = (i: number) => onChange(areas.filter((_, idx) => idx !== i));

  const validate = () => {
    const errs: Record<number, Record<string, string>> = {};
    areas.forEach((area, i) => {
      const e = validateConfig(drywallConfig, area);
      if (Object.keys(e).length) errs[i] = e;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div>
      <StepHeader title="Drywall Assessment" step={2} total={4} />
      <AreaManager
        areaLabel="Area"
        areas={areas}
        questions={questions}
        onAreaChange={updateArea}
        onAddArea={addArea}
        onRemoveArea={removeArea}
        errors={errors}
      />
      <NavigationButtons 
        step={2} 
        total={4} 
        onBack={onBack} 
        onNext={() => { if (validate()) onNext(); }} 
        onSkip={() => { onChange([]); onNext(); }}
      />
    </div>
  );
}
