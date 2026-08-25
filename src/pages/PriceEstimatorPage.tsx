import { useEffect, useState } from 'react';
import StepSidebar from '../components/StepSideBar';
import ContactStep from '../components/steps/ContactStep';
import ClientInfoStep from '../components/steps/ClientInfoStep';
import ServiceStep from '../components/steps/ServiceStep';
import { useEstimateDraft } from '../hooks/useEstimateDraft';

const PRICE_LOOKUP_SECONDS = 120;

function PriceLookupOverlay() {
  const [secondsLeft, setSecondsLeft] = useState(PRICE_LOOKUP_SECONDS);

  useEffect(() => {
    setSecondsLeft(PRICE_LOOKUP_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#fff',
          borderRadius: '18px',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            margin: '0 auto 22px',
            borderRadius: '50%',
            border: '5px solid #e2e8f0',
            borderTopColor: '#2F9BF0',
            animation: 'estimate-spin 0.9s linear infinite',
          }}
        />
        {secondsLeft > 0 ? (
          <>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.45rem', color: '#0f172a' }}>
              Preparing your estimate…
            </h2>
            <p style={{ margin: '0 auto 14px', maxWidth: '360px', lineHeight: 1.6, color: '#475569' }}>
              We're checking current Home Depot pricing for your area and calculating your estimate.
            </p>
            <p style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '0.95rem' }}>
              This may take up to <strong>{secondsLeft}s</strong>.
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              Please don't close this page.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.45rem', color: '#d97706' }}>
              Home Depot servers are busy
            </h2>
            <p style={{ margin: '0 auto 14px', maxWidth: '360px', lineHeight: 1.6, color: '#475569' }}>
              Please wait while we fetch your pricing data. This is taking longer than expected.
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              Please don't close this page.
            </p>
          </>
        )}
        <style>{`@keyframes estimate-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

const NEXT_STEPS = [
  'We review your details',
  'We call if anything needs clarifying',
  'Your quote lands within 24 hours',
];

const PHONE = '(949) 792-4283';
const PHONE_HREF = 'tel:+19497924283';

import { Helmet } from 'react-helmet-async'

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
    handleReset,
    isSubmitting,
    submitError,
  } = useEstimateDraft();

  const showModal = step === 5;

  return (
    <>
      <Helmet>
        <title>Free Drywall &amp; Interior Repair Estimate - Farley CD Inc</title>
        <meta name="description" content="Get a free, instant estimate for drywall repair, texture matching, and interior painting projects in Mission Viejo, CA from Farley CD Inc." />
        <link rel="canonical" href="https://drywallfcdinc.com/priceestimator" />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
        {isSubmitting && <PriceLookupOverlay />}
        <div className="bg-[#12294A]">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F9BF0]">
              Free project estimate
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Tell us about your project
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
              Four short steps &mdash; about three minutes. We&rsquo;ll send your quote within 24 hours.
            </p>
          </div>
          {!sent && (
            <button
              onClick={handleReset}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
            >
              Reset Form
            </button>
          )}
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
              We've got your project details. Expect a quote within 24 hours.
            </p>
            <a
              href={PHONE_HREF}
              className="mt-6 inline-flex rounded-lg bg-[#12294A] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C3A64]"
            >
              Call {PHONE}
            </a>
          </div>
        ) : (
          <div className="relative grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
            <div className="hidden lg:block">
              <StepSidebar
                step={Math.min(step, 4)}
                onStepClick={goTo}
                restored={restored}
                phone={PHONE}
                phoneHref={PHONE_HREF}
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
                <div key={Math.min(step, 4)} className="animate-[fadeSlide_0.3s_ease-out]">
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
                  {(step === 4 || step === 5) && (
                    <ServiceStep
                      path="paint"
                      areas={paint}
                      onChange={setPaint}
                      onBack={() => goTo(3)}
                      onNext={() => goTo(5)}
                      isLast
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ── Client Info Modal Overlay ───────────────────── */}
            {showModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                onClick={(e) => { if (e.target === e.currentTarget) goTo(4); }}
              >
                <div
                  className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-[fadeSlide_0.25s_ease-out]"
                  style={{ maxHeight: '90vh', overflowY: 'auto' }}
                >
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => goTo(4)}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    aria-label="Close"
                  >
                    ✕
                  </button>

                  <div className="p-8">
                    {submitError && (
                      <div style={{
                        marginBottom: '16px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#b91c1c',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}>
                        {submitError}
                      </div>
                    )}
                    <ClientInfoStep
                      data={contact}
                      onChange={setContact}
                      onBack={() => goTo(4)}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}
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
    </>
  );
}