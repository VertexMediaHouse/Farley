import { useState } from 'react';
import type { AreaValues } from '../../types/form';
import { paintConfig } from '../../data/paintConfig';
import StepHeader from '../StepHeader';
import NavigationButtons from '../NavigationButtons';
import AreaManager from '../AreaManager';
import { validateConfig } from '../FormRenderer';
import { useQuestionCopy } from '../../context/CopyProvider';

interface Props {
  areas: AreaValues[];
  onChange: (areas: AreaValues[]) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function PaintStep({ areas, onChange, onSubmit, onBack }: Props) {
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const questions = useQuestionCopy(paintConfig, 'paint');

  const updateArea = (i: number, id: string, val: AreaValues[string]) =>
    onChange(areas.map((a, idx) => idx === i ? { ...a, [id]: val } : a));

  const validate = () => {
    const errs: Record<number, Record<string, string>> = {};
    areas.forEach((area, i) => {
      const e = validateConfig(paintConfig, area);
      if (Object.keys(e).length) errs[i] = e;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div>
      <StepHeader title="Painting" step={4} total={4} />
      <AreaManager
        areaLabel="Area"
        areas={areas}
        questions={questions}
        onAreaChange={updateArea}
        onAddArea={() => onChange([...areas, {}])}
        onRemoveArea={i => onChange(areas.filter((_, idx) => idx !== i))}
        errors={errors}
      />
      <NavigationButtons 
        step={4} 
        total={4} 
        onBack={onBack} 
        onNext={() => { if (validate()) onSubmit(); }} 
        onSubmit={() => { if (validate()) onSubmit(); }}
        onSkip={() => { onChange([]); onSubmit(); }}
      />
    </div>
  );
}
