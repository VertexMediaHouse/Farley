import { useEffect, useState } from 'react'
import type { EstimateResult } from '../types/estimate'
import { Link } from 'react-router-dom'

interface EstimateData {
  answers: {
    has_photos: string;
    length: string;
    width: string;
    height: string;
    address: string;
    services: {
      drywall: boolean;
      paint: boolean;
      trim: boolean;
    };
  };
  estimate: EstimateResult;
}

export default function EstimatePage() {
  const [data, setData] = useState<EstimateData | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fcd_estimate_data')
      if (stored) {
        setData(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load estimate from session storage', e)
    }
  }, [])

  if (!data) {
    return (
      <div className="estimate-error-container" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        background: '#f8fafc',
        color: '#0f172a'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '12px' }}>No Active Estimate Found</h2>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '24px', fontSize: '0.95rem' }}>
          Please go back to our homepage and fill out the Estimator form wizard to generate your preliminary quote.
        </p>
        <Link to="/" className="btn btn-blue" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Go to Homepage &rarr;
        </Link>
      </div>
    )
  }

  const { answers, estimate } = data

  return (
    <div className="estimate-page-wrapper" style={{
      background: '#f8fafc',
      minHeight: '100vh',
      padding: '40px 20px',
      color: '#0f172a'
    }}>
      <div className="estimate-page-container" style={{
        maxWidth: '850px',
        margin: '0 auto',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        padding: '40px'
      }}>
        {/* Page Top Actions (Hidden when printing) */}
        <div className="estimate-page-actions" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '20px',
          marginBottom: '30px'
        }}>
          <Link to="/" className="btn-back-home" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'color 0.2s'
          }}>
            &larr; Return to Website
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-glass print-btn" onClick={() => window.print()} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              cursor: 'pointer'
            }}>
              Print / Save to PDF 🖨️
            </button>
            <button type="button" className="btn btn-blue" onClick={() => window.close()} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              cursor: 'pointer'
            }}>
              Close Tab ✕
            </button>
          </div>
        </div>

        {/* Invoice Layout */}
        <div className="estimate-invoice-card">
          {/* Header */}
          <div className="estimate-invoice-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '20px',
            flexWrap: 'wrap',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '24px',
            marginBottom: '30px'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#071023',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}>
                Farley Construction &amp; Development
              </h1>
              <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                Premium Interior Finishing &amp; Drywall Restoration
              </p>
            </div>
            <div style={{ textAlign: 'right', minWidth: '180px' }}>
              <div className="step-indicator success-indicator" style={{
                display: 'inline-block',
                background: estimate.isPendingReview ? 'rgba(255, 134, 28, 0.1)' : 'rgba(47, 174, 255, 0.1)',
                color: estimate.isPendingReview ? '#ff861c' : '#2faeff',
                padding: '6px 12px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {estimate.reviewStatus || 'Preliminary Quote'}
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Pending Review / Photo Warnings / Follow-Up Questions Banner */}
          {estimate.isPendingReview && (
            <div className="estimate-pending-review-banner" style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              color: '#92400e'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
                ⚠️ Action Required: Estimate Pending Final Review
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', lineHeight: '1.5', color: '#78350f' }}>
                This estimate has been flagged for manual verification by our operations team. Uploaded photos are being processed, or critical room dimensions are missing. Standard prices are calculated below, but final approval is subject to resolving the following items:
              </p>

              {estimate.followUpQuestions && estimate.followUpQuestions.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '8px', color: '#b45309' }}>
                    Follow-Up Clarifications Needed:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {estimate.followUpQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {answers.has_photos === 'Yes' && (
                <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                  📸 Photos Received! Our estimator will review the uploaded workspace images within 1 business day.
                </div>
              )}
            </div>
          )}

          {/* Photo Request Banner (if they selected No photos) */}
          {estimate.requiresPhotos && (
            <div className="estimate-photo-request-banner" style={{
              background: '#f0fdf4',
              border: '1px solid #dcfce7',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              color: '#166534'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d' }}>
                📸 Photo Upload Recommended for Final Approval
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: '#166534' }}>
                To obtain binding contract approval and bypass in-person inspection delays, please submit close-up photos of your walls, ceilings, and repair locations directly to <a href="mailto:info@farleyconstruction.com" style={{ color: '#15803d', fontWeight: 700, textDecoration: 'underline' }}>info@farleyconstruction.com</a> referencing this address: <strong>{answers.address || 'Project Address'}</strong>.
              </p>
            </div>
          )}

          {/* Project Details Grid */}
          <div className="estimate-project-details" style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '35px'
          }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Project Address:</strong>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{answers.address || 'Not Provided'}</span>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Room Dimensions:</strong>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{answers.length}'L x {answers.width}'W x {answers.height}'H</span>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Requested Services:</strong>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                {Object.entries(answers.services || {})
                  .filter(([_, active]) => active)
                  .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
                  .join(', ') || 'None Selected'}
              </span>
            </div>
          </div>

          {/* Tables Breakdowns */}
          <div className="estimate-tables-container" style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            <div className="estimate-final-summary" style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginTop: '15px'
            }}>
              <div className="final-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b' }}>
                <span>Subtotal Labor Charges:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>${estimate.subtotalLabor.toFixed(2)}</span>
              </div>
              <div className="final-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b' }}>
                <span>Subtotal Material Costs:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>${estimate.subtotalMaterials.toFixed(2)}</span>
              </div>
              <div className="final-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b' }}>
                <span>Subtotal Logistics &amp; Setup:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>${estimate.subtotalAdditional.toFixed(2)}</span>
              </div>
              <div className="final-row highlight-fee" style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                color: '#64748b',
                padding: '10px 0',
                borderTop: '1px dashed #cbd5e1',
                borderBottom: '1px dashed #cbd5e1'
              }}>
                <span>Fixed Base Service Fee:</span>
                <span style={{ fontWeight: 800, color: '#ff861c' }}>${estimate.baseServiceFee.toFixed(2)}</span>
              </div>
              <div className="final-row grand-total-row" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#071023',
                marginTop: '8px'
              }}>
                <span>Estimated Grand Total:</span>
                <span style={{ fontSize: '1.6rem', color: '#2faeff', fontWeight: 900 }}>${estimate.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Note Bottom */}
            <div style={{
              fontSize: '0.82rem',
              color: '#94a3b8',
              lineHeight: 1.5,
              borderTop: '1px solid #e2e8f0',
              paddingTop: '20px',
              marginTop: '10px'
            }}>
              <strong>Disclaimers &amp; Terms:</strong> This preliminary quote is calculated automatically based strictly on user-provided room dimensions, selected options, and material procurement formulas. A final, binding site contract is subject to standard in-person inspection of moisture levels, framing alignment, structural integrity, custom trim selection details, and local safety rules.
            </div>
          </div>
        </div>
      </div>

      {/* Printing Styles specific for this dedicated page wrapper */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .estimate-page-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .estimate-page-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .estimate-page-actions, .btn-back-home, .no-print {
            display: none !important;
          }
          .estimate-project-details {
            background: #ffffff !important;
            border: 1px solid #000000 !important;
          }
          .subtotal-row {
            background: #f1f5f9 !important;
          }
          .estimate-final-summary {
            background: #f8fafc !important;
            border: 1px solid #000000 !important;
          }
        }
      `}} />
    </div>
  )
}
