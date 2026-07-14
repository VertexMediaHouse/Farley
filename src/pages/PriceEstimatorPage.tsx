import StepSidebar from '../components/StepSideBar';
import ContactStep from '../components/steps/ContactStep';
import ServiceStep from '../components/steps/ServiceStep';
import { useEstimateDraft } from '../hooks/useEstimateDraft';

const NEXT_STEPS = [
  'We review your details',
  'We call if anything needs clarifying',
  'Your quote lands within 24 hours',
];

const PHONE = '(949) 792-4283';
const PHONE_HREF = 'tel:+19497924283';

export default function PriceEstimatorPage() {
  const {
    step, goTo,
    drywall, setDrywall,
    trim, setTrim,
    paint, setPaint,
    contact, setContact,
    sent, restored,
    customQuestions,
    handleSubmit,
  } = useEstimateDraft();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#12294A]">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F9BF0]">
            Free project estimate
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Tell us about your project
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
            Four short steps — about three minutes. We’ll send your quote within 24 hours.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-14 max-w-6xl px-6 sm:px-8">
        {sent ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2F9BF0]/10 text-2xl text-[#2F9BF0]">
              ✓
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
              Request received
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              We’ve got your project details. Expect a quote within 24 hours.
            </p>
            <a
              href={PHONE_HREF}
              className="mt-6 inline-flex rounded-lg bg-[#12294A] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C3A64]"
            >
              Call {PHONE}
            </a>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
            <div className="hidden lg:block">
              <StepSidebar
                step={step}
                onStepClick={goTo}
                restored={restored}
                phone="(555) 555-5555"
                phoneHref="tel:5555555555"
                drywall={drywall}
                trim={trim}
                paint={paint}
                customQuestions={customQuestions}
              />
            </div>

            <div className="flex h-[calc(100vh-4rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm pt-4">
              <div
                id="estimate-scroll"
                className="panel-scroll flex-1 overflow-y-auto px-6 sm:px-8"
              >
                <div key={step} className="animate-[fadeSlide_0.3s_ease-out]">
                  {step === 1 && (
                    <ContactStep data={contact} onChange={setContact} onNext={() => goTo(2)} />
                  )}
                  {step === 2 && (
                    <ServiceStep
                      path="drywall"
                      areas={drywall}
                      onChange={setDrywall}
                      onBack={() => goTo(1)}
                      onNext={() => goTo(3)}
                    />
                  )}
                  {step === 3 && (
                    <ServiceStep
                      path="trim"
                      areas={trim}
                      onChange={setTrim}
                      onBack={() => goTo(2)}
                      onNext={() => goTo(4)}
                    />
                  )}
                  {step === 4 && (
                    <ServiceStep
                      path="paint"
                      areas={paint}
                      onChange={setPaint}
                      onBack={() => goTo(3)}
                      onNext={handleSubmit}
                      isLast
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto mt-6 max-w-[140vh] px-6 sm:px-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
          What happens next
        </p>
        <ol className="mt-3 space-y-2.5">
          {NEXT_STEPS.map((text, i) => (
            <li key={text} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
                {i + 1}
              </span>
              <span className="text-xs leading-relaxed text-slate-600">{text}</span>
            </li>
          ))}
        </ol>
        <a
          href={PHONE_HREF}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#2F9BF0] hover:text-[#2F9BF0]"
        >
          Prefer to call? {PHONE}
        </a>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .panel-scroll { scrollbar-gutter: stable; }
        .panel-scroll::-webkit-scrollbar { width: 8px; }
        .panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .panel-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0; border-radius: 999px;
        }
        .panel-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[fadeSlide_0\\.3s_ease-out\\] { animation: none; }
        }
      `}</style>
    </div>
  );
}
