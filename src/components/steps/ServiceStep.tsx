import { useState } from 'react';
import type { AreaValues } from '../../price-estimator/questions/form';
import type { ServicePath } from '../../price-estimator/questions/stepConfig';
import { STEP_CONFIGS, STEP_META, TOTAL_STEPS } from '../../price-estimator/questions/stepConfig';
import StepHeader from '../StepHeader';
import NavigationButtons from '../NavigationButtons';
import AreaManager from '../AreaManager';
import { validateConfig } from '../FormRenderer';
import { useQuestionCopy } from '../../context/CopyProvider';

type AreaValuesUpdater = AreaValues[] | ((prev: AreaValues[]) => AreaValues[]);

interface Props {
  path: ServicePath;
  areas: AreaValues[];
  onChange: (updater: AreaValuesUpdater) => void;
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
    onChange((prev: AreaValues[]) => prev.map((a, idx) => idx === i ? { ...a, [id]: val } : a));
  };


  const validate = () => {
    const errs: Record<number, Record<string, string>> = {};
    areas.forEach((area, i) => {
      const e = validateConfig(questions, area);
      if (Object.keys(e).length) errs[i] = e;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const proceed = () => { if (validate()) onNext(); };
  const skip = () => { onChange(() => []); onNext(); };

  return (
    <div>
      <StepHeader title={title} step={step} total={TOTAL_STEPS} />
      <AreaManager
        areaLabel="Area"
        areas={areas}
        questions={questions}
        onAreaChange={updateArea}
        onAddArea={() => onChange(prev => [...prev, {}])}
        onRemoveArea={i => onChange(prev => prev.filter((_, idx) => idx !== i))}
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
