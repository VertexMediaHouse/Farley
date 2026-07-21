import { useState } from 'react';
import type { AreaValues } from '../../types/form';
import type { ServicePath } from '../../data/stepConfig';
import { STEP_CONFIGS, STEP_META, TOTAL_STEPS } from '../../data/stepConfig';
import StepHeader from '../StepHeader';
import NavigationButtons from '../NavigationButtons';
import AreaManager from '../AreaManager';
import { validateConfig } from '../FormRenderer';
import { useQuestionCopy } from '../../context/CopyProvider';

interface Props {
  path: ServicePath;
  areas: AreaValues[];
  onChange: (areas: AreaValues[]) => void;
  onBack: () => void;
  onNext: () => void;
  isLast?: boolean;
}

export default function ServiceStep({ path, areas, onChange, onBack, onNext, isLast }: Props) {
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const baseConfig = STEP_CONFIGS[path];
  const questions = useQuestionCopy(baseConfig, path);
  const { step, title } = STEP_META[path];

  const updateArea = (i: number, id: string, val: AreaValues[string]) => {
    onChange(areas.map((a, idx) => idx === i ? { ...a, [id]: val } : a));
  };

  const validate = () => {
    const errs: Record<number, Record<string, string>> = {};
    areas.forEach((area, i) => {
      const e = validateConfig(baseConfig, area);
      if (Object.keys(e).length) errs[i] = e;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const proceed = () => { if (validate()) onNext(); };
  const skip = () => { onChange([]); onNext(); };

  return (
    <div>
      <StepHeader title={title} step={step} total={TOTAL_STEPS} />
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
        step={step}
        total={TOTAL_STEPS}
        onBack={onBack}
        onNext={proceed}
        onSubmit={isLast ? proceed : undefined}
        onSkip={skip}
        skipLabel={`Skip ${path}`}
      />
    </div>
  );
}
