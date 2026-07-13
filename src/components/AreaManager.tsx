import type { AreaValues, QuestionConfig } from '../types/form';
import FormRenderer from './FormRenderer';
import { card } from './theme';

interface AreaManagerProps {
  areaLabel: string;
  areas: AreaValues[];
  questions: QuestionConfig[];
  onAreaChange: (index: number, id: string, value: AreaValues[string]) => void;
  onAddArea: () => void;
  onRemoveArea: (index: number) => void;
  errors?: Record<string, Record<string, string>>;
}

export default function AreaManager({
  areaLabel,
  areas,
  questions,
  onAreaChange,
  onAddArea,
  onRemoveArea,
  errors = {},
}: AreaManagerProps) {
  return (
    <div className="mt-6 space-y-5">
      {areas.map((area, i) => (
        <div key={i} className={card}>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {areaLabel} {areas.length > 1 ? i + 1 : ''}
            </h4>
            {areas.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveArea(i)}
                className="text-xs font-medium text-slate-400 transition hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
          <FormRenderer
            questions={questions}
            values={area}
            onChange={(id, val) => onAreaChange(i, id, val)}
            errors={errors[i] ?? {}}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={onAddArea}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition hover:border-[#12294A] hover:bg-slate-50 hover:text-[#12294A]"
      >
        <span className="text-lg leading-none">+</span> Add another {areaLabel.toLowerCase()}
      </button>
    </div>
  );
}