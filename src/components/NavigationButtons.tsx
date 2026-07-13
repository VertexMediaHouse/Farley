import { btnGhost, btnPrimary, btnSubmit } from './theme';

interface NavigationButtonsProps {
  step: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  onSkip?: () => void;
}

export default function NavigationButtons({ step, total, onBack, onNext, onSubmit, onSkip }: NavigationButtonsProps) {
  const isLast = step === total;
  return (
    <div className="sticky bottom-0 -mx-6 mt-2 flex items-center justify-between border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:px-8">
      {step > 1 ? (
        <button type="button" onClick={onBack} className={btnGhost}>
          <span aria-hidden="true">←</span> Back
        </button>
      ) : (
        <span className="hidden text-xs text-slate-400 sm:block">
          Step {step} of {total}
        </span>
      )}
      <div className="flex gap-3">
        {onSkip && !isLast && (
          <button type="button" onClick={onSkip} className={btnGhost}>
            Skip this step
          </button>
        )}
        <button
          type="button"
          onClick={isLast ? onSubmit : onNext}
          className={isLast ? btnSubmit : btnPrimary}
        >
          {isLast ? 'Submit request' : 'Continue'} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}