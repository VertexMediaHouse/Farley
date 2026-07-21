import { useEffect, useState } from 'react'
import type { EstimateResult, LineItem } from '../lib/estimate'
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

const BASE_SERVICE_FEE_MIN = 700;

interface GroupedEntry {
  item: LineItem;
  idx: number;
}

function groupByArea(lineItems: LineItem[]): Record<string, GroupedEntry[]> {
  const groups: Record<string, GroupedEntry[]> = {};
  lineItems.forEach((item, idx) => {
    if (!groups[item.area]) groups[item.area] = [];
    groups[item.area].push({ item, idx });
  });
  return groups;
}

export default function EstimatePage() {
  const [data, setData] = useState<EstimateData | null>(null)
  const [editedItems, setEditedItems] = useState<LineItem[] | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  
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

  // Initialize the editable copy once the base estimate data has loaded
  useEffect(() => {
    if (data && !editedItems) {
      setEditedItems(data.estimate.lineItems.map(i => ({ ...i })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  
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
  
  // Guard against malformed / partial estimate objects
  if (!estimate || !Array.isArray(estimate.lineItems) || typeof estimate.subtotal !== 'number') {
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
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '12px' }}>Estimate Data Incomplete</h2>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '24px', fontSize: '0.95rem' }}>
          Something went wrong generating your estimate. Please return to the form and submit again.
        </p>
        <Link to="/" className="btn btn-blue" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Go to Homepage &rarr;
        </Link>
      </div>
    )
  }

  // Fall back to the original items until the edited copy is initialized
  const items = editedItems ?? estimate.lineItems;

  const updateQuantity = (idx: number, value: string) => {
    const q = parseFloat(value);
    setEditedItems(prev => {
      if (!prev) return prev;
      const copy = [...prev];
      const item = copy[idx];
      if (item.rate != null && !isNaN(q) && q >= 0) {
        copy[idx] = { ...item, quantity: q, amount: q * item.rate };
      }
      return copy;
    });
  };

  const projectItems = items.filter(i => i.area === 'Project');
  const removeItem = (idx: number) => {
    setEditedItems(prev => (prev ? prev.filter((_, i) => i !== idx) : prev));
  };

  const resetToOriginal = () => {
    setEditedItems(estimate.lineItems.map(i => ({ ...i })));
  };

  const outOfStockItems = items.filter(item => item.isOutOfStock);
  const isPendingReview = outOfStockItems.length > 0;
  const followUpQuestions = outOfStockItems.map(
    item => `${item.label} (${item.area}) is currently out of stock — we'll follow up with material alternatives.`
  );

  // Totals recalculate live off the edited items, not the original estimate.subtotal
  const liveSubtotal = items.reduce((sum, i) => sum + (i.isOutOfStock ? 0 : i.amount), 0);
  const baseServiceFee = Math.max(700, BASE_SERVICE_FEE_MIN - liveSubtotal);
  const grandTotal = liveSubtotal + baseServiceFee;

  const groupedItems = groupByArea(items);
  const isEdited = editedItems !== null &&
    JSON.stringify(editedItems) !== JSON.stringify(estimate.lineItems);

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
                background: isPendingReview ? 'rgba(255, 134, 28, 0.1)' : 'rgba(47, 174, 255, 0.1)',
                color: isPendingReview ? '#ff861c' : '#2faeff',
                padding: '6px 12px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {isPendingReview ? 'Pending Review' : 'Preliminary Quote'}
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Pending Review / Photo Warnings / Follow-Up Questions Banner */}
          {isPendingReview && (
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

              {followUpQuestions.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '8px', color: '#b45309' }}>
                    Follow-Up Clarifications Needed:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {followUpQuestions.map((q, idx) => (
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
          {answers.has_photos !== 'Yes' && (
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
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Requested Services:</strong>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                {Object.entries(answers.services || {})
                  .filter(([_, active]) => active)
                  .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
                  .join(', ') || 'None Selected'}
              </span>
            </div>
          </div>

          {/* Edit Mode Notice (hidden on print) */}
          <div className="no-print" style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: '#1e40af',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <span>
              {isEditing
                ? "✏️ Editing enabled. Adjust measurements or remove items — totals update automatically."
                : "🔒 This estimate is locked. Click Edit Estimate to make changes."}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isEditing && isEdited && (
                <button
                  type="button"
                  onClick={resetToOriginal}
                  style={{
                    border: '1px solid #93c5fd',
                    background: '#ffffff',
                    color: '#1e40af',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Reset to original
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditing(v => !v)}
                style={{
                  border: isEditing ? '1px solid #1e40af' : '1px solid #93c5fd',
                  background: isEditing ? '#1e40af' : '#ffffff',
                  color: isEditing ? '#ffffff' : '#1e40af',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isEditing ? 'Done editing' : 'Edit Estimate ✏️'}
              </button>
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
                <span>Subtotal (All Items):</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>${liveSubtotal.toFixed(2)}</span>
              </div>
              <div className="final-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b' }}>
                <span>Fixed Charge (Minimum $700):</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>${baseServiceFee.toFixed(2)}</span>
              </div>
              {projectItems.map((item, i) => (
                <div key={`project-${i}`} className="final-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b' }}>
                  <span>{item.label}{item.detail ? ` (${item.detail})` : ''}:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>${item.amount.toFixed(2)}</span>
                </div>
              ))}

              {/* Line Items grouped by Area — amounts read-only, removable */}
              {Object.entries(groupedItems)
                .filter(([areaName]) => areaName !== 'Project')
                .map(([areaName, entries]) => (<div key={areaName}>
                  <h3 style={{ marginTop: '20px', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{areaName}</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ textAlign: 'left', padding: '6px' }}>Description</th>
                        <th style={{ textAlign: 'left', padding: '6px' }}>Detail</th>
                        <th style={{ textAlign: 'right', padding: '6px' }}>Amount</th>
                        <th className="no-print" style={{ textAlign: 'center', padding: '6px', width: '36px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(({ item, idx }) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px' }}>
                            <span>{item.label}</span>
                          </td>
                          <td style={{ padding: '6px' }}>
                            {item.isOutOfStock ? (
                              <span style={{ color: '#b45309', fontWeight: 700 }}>{item.detail}</span>
                            ) : item.unit ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={item.quantity}
                                    onChange={e => updateQuantity(idx, e.target.value)}
                                    style={{
                                      width: '70px',
                                      textAlign: 'right',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '4px',
                                      padding: '4px 6px',
                                      fontSize: '0.9rem',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                ) : (
                                  <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                                )}
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.unit}</span>
                              </div>
                            ) : (
                              <span>{item.detail}</span>
                            )}
                          </td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>
                            {item.isOutOfStock ? (
                              <span style={{ fontWeight: 600 }}>—</span>
                            ) : item.quantity != null && item.rate != null ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.quantity}
                                    onChange={e => updateQuantity(idx, e.target.value)}
                                    style={{
                                      width: '70px',
                                      textAlign: 'right',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '4px',
                                      padding: '4px 6px',
                                      fontSize: '0.9rem',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.unit} @ ${item.rate}</span>
                                </div> */}
                                <span style={{ fontWeight: 700 }}>${item.amount.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span style={{ fontWeight: 600 }}>${item.amount.toFixed(2)}</span>
                            )
                            }
                          </td>
                          <td className="no-print" style={{ padding: '6px', textAlign: 'center' }}>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                title="Remove item"
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  lineHeight: 1,
                                  padding: '4px'
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                ))}

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
                <span style={{ fontSize: '1.6rem', color: '#2faeff', fontWeight: 900 }}>${grandTotal.toFixed(2)}</span>
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
      <style dangerouslySetInnerHTML={{
        __html: `
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
          input {
            border: none !important;
            background: transparent !important;
          }
        }
      `}} />
    </div>
  )
}