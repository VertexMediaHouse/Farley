interface StepHeaderProps { title: string; step: number; total: number; }

export default function StepHeader({ title, step, total }: StepHeaderProps) {
  return (
    <div className="sticky top-0 z-10 -mx-6 border-b border-slate-100 bg-white/95 px-6 pb-4 pt-6 backdrop-blur sm:-mx-8 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
        Step {step} of {total}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}