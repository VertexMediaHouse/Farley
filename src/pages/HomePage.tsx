import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Counter, FadeSection, SectionLabel, StaggerRow } from '../utils'
import SuccessModal from '../components/SuccessModal'
import { featuredProjects, stats, testimonials } from '../data'
import { calculateEstimate } from '../services/estimateEngine'
import type { EstimateResult } from '../types/estimate'

const services = [
  {
    img: '/images/img14.jpeg',
    title: 'Drywall Repair',
    copy: 'Repairing holes, cracks, dents, water damage, and damaged drywall surfaces.',
    href: '/services#drywall-repair',
  },
  {
    img: '/images/img13.jpeg',
    title: 'Drywall Installation & Finishing',
    copy: 'Complete hang, tape, mud, texture, and smooth finish services.',
    href: '/services#drywall-installation-finishing',
  },
  {
    img: '/images/img20.jpeg',
    title: 'Ceiling Repair & Texture Matching',
    copy: 'Ceiling drywall repair, texture blending, and acoustic ceiling repair.',
    href: '/services#ceiling-repair-texture-matching',
  },
  {
    img: '/images/img12.jpeg',
    title: 'Patchwork & Small Repairs',
    copy: 'Professional drywall patch repair and wall restoration services.',
    href: '/services#patchwork-small-repairs',
  },
  {
    img: '/images/img5.jpeg',
    title: 'Interior Painting & Surface Prep',
    copy: 'Painting, prep work, touch-ups, and finishing services.',
    href: '/services#interior-painting-surface-prep',
  },
  {
    img: '/images/img17.jpeg',
    title: 'Residential & Commercial Maintenance',
    copy: 'General interior maintenance and repair support for homes and businesses.',
    href: '/services#residential-commercial-maintenance',
  },
]

const steps = [
  { n: '1', title: 'Contact Us', copy: 'Call or request a free estimate online.' },
  { n: '2', title: 'Inspection', copy: 'We review the project and provide clear recommendations.' },
  { n: '3', title: 'Estimate', copy: 'Receive a detailed quote for drywall repair or maintenance work.' },
  { n: '4', title: 'Scheduling', copy: 'Fast scheduling and dependable communication.' },
  { n: '5', title: 'Completion', copy: 'Clean, professional results completed on time.' },
]

const benefits = [
  {
    title: 'Texture Matching ',
    svg: <img src="/images/carpentry.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Drywall Patch Repair',
    svg: <img src="/images/trustworthiness (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Ceiling Drywall Repair',
    svg: <img src="/images/drywall (1).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Hole in Wall Repair',
    svg: <img src="/images/worker.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Drywall Crack Repair',
    svg: <img src="/images/drywall (2).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Hang, Tape & Texture',
    svg: <img src="/images/trustworthiness (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Hand Textures & Smooth Finish',
    svg: <img src="/images/shield (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Residential & Commercial Service',
    svg: <img src="/images/user-avatar.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Property Maintenance Support',
    svg: <img src="/images/property (2).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Fast & Reliable Turnaround',
    svg: <img src="/images/clock (5).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
]

interface FormAnswers {
  length: string;
  width: string;
  height: string;
  address: string;
  services: {
    drywall: boolean;
    paint: boolean;
    trim: boolean;
  };
  [key: string]: any;
}

const initialAnswers: FormAnswers = {
  length: '',
  width: '',
  height: '',
  address: '',
  services: {
    drywall: false,
    paint: false,
    trim: false,
  },
};

export default function HomePage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)

  useEffect(() => {
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window as any, "https://app.cal.com/embed/embed.js", "init");

    const Cal = (window as any).Cal;
    if (Cal) {
      Cal("init", "15min", { origin: "https://app.cal.com" });
      Cal.ns["15min"]("ui", { "hideEventTypeDetails": false, "layout": "month_view" });
    }
  }, []);

  const handleTextChange = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (service: 'drywall' | 'paint' | 'trim') => {
    setAnswers((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service],
      },
    }))
  }

  const handleOptionSelect = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  // Calculate dynamic steps based on current selected services & answers
  const getDynamicSteps = () => {
    const stepsList: any[] = []

    // 1. Drywall questions (Drywall first)
    if (answers.services.drywall) {
      stepsList.push({
        id: 'drywall_has_dims',
        title: 'Do you have dimensions of areas needing drywall?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      if (answers.drywall_has_dims === 'Yes') {
        stepsList.push({
          id: 'drywall_dims',
          title: 'Please Provide Dimensions',
          type: 'textarea',
          placeholder: 'Provide dimensions (e.g., Room 1: 10x12 wall, Ceiling: 12x14)...',
        })
      }

      stepsList.push({
        id: 'drywall_areas',
        title: 'What areas need drywall?',
        type: 'radio',
        options: ['Wall', 'Ceiling', 'Both'],
      })

      stepsList.push({
        id: 'drywall_texture',
        title: 'What kind of texture do you want?',
        type: 'radio',
        options: ['Orange Peel', 'Smooth', 'Other'],
      })

      stepsList.push({
        id: 'drywall_ceiling_height',
        title: 'Ceiling height?',
        type: 'text',
        placeholder: 'e.g. 8 feet, 10 feet...',
      })

      stepsList.push({
        id: 'drywall_insulation',
        title: 'Do you need insulation installed?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      stepsList.push({
        id: 'drywall_popcorn',
        title: 'Do you need popcorn ceiling scraping ($2.50/sqft)?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      stepsList.push({
        id: 'drywall_skim',
        title: 'Do you need a Level 4 skim coat finish ($4.50/sqft)?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      stepsList.push({
        id: 'drywall_patch',
        title: 'Do you need patchwork or hole repairs ($3.00/sqft cleanup)?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      if (answers.drywall_patch === 'Yes') {
        stepsList.push({
          id: 'drywall_patch_area',
          title: 'Approximate patchwork / hole repair area (sqft):',
          type: 'text',
          placeholder: 'e.g. 20 (enter approximate area in square feet)',
        })
      }

      stepsList.push({
        id: 'drywall_demo',
        title: 'Do you need demolition of existing sheetrock?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      if (answers.drywall_demo === 'Yes') {
        stepsList.push({
          id: 'drywall_haul_away',
          title: '(Recommended) Add Haul-Away logistics service for demolition debris ($300)?',
          type: 'radio',
          options: ['Yes', 'No'],
        })
      }

      stepsList.push({
        id: 'drywall_electrical',
        title: 'Do you need electrical fixture installation?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      if (answers.drywall_electrical === 'Yes') {
        stepsList.push({
          id: 'elec_fan_qty',
          title: 'How many bathroom fans need installation ($250 each)?',
          type: 'text',
          placeholder: 'e.g. 1 (enter 0 if none)',
        })
        stepsList.push({
          id: 'elec_can_qty',
          title: 'How many 4" or 6" LED can lights need installation ($220 each)?',
          type: 'text',
          placeholder: 'e.g. 4 (enter 0 if none)',
        })
        stepsList.push({
          id: 'elec_surface_qty',
          title: 'How many surface mount lights need installation ($150 each)?',
          type: 'text',
          placeholder: 'e.g. 2 (enter 0 if none)',
        })
      }
    }

    // 2. Paint questions
    if (answers.services.paint) {
      stepsList.push({
        id: 'paint_needed',
        title: 'Do you need painting services?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      stepsList.push({
        id: 'paint_type',
        title: 'What type of painting service would you like?',
        type: 'radio',
        options: ['Touch-up painting', 'Corner-to-corner painting', 'Other'],
      })

      if (answers.paint_type === 'Touch-up painting') {
        stepsList.push({
          id: 'paint_touch_up_area',
          title: 'Please enter the approximate touch-up area (sqft):',
          type: 'text',
          placeholder: 'e.g. 30 (enter approximate area in square feet)',
        })
      }

      if (answers.paint_type === 'Corner-to-corner painting') {
        stepsList.push({
          id: 'paint_corner_has_dims',
          title: 'Do you have the dimensions of the areas to be painted?',
          type: 'radio',
          options: ['Yes', 'No'],
        })

        if (answers.paint_corner_has_dims === 'Yes') {
          stepsList.push({
            id: 'paint_dims',
            title: 'Please Provide Dimensions',
            type: 'textarea',
            placeholder: 'Provide painting dimensions (e.g., Walls: 400 sq ft, 2 coats)...',
          })
        }
      }

      stepsList.push({
        id: 'paint_has_paint',
        title: 'Do you already have the paint?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      stepsList.push({
        id: 'paint_color_selected',
        title: 'Do you have a paint colour selected?',
        type: 'radio',
        options: ['Yes', 'No'],
      })
    }

    // 3. Trim questions
    if (answers.services.trim) {
      stepsList.push({
        id: 'trim_install',
        title: 'Do you need baseboard or trim installation ($5/linear ft)?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      stepsList.push({
        id: 'trim_paint',
        title: 'Do you need baseboard or trim painted ($10/linear ft)?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      stepsList.push({
        id: 'trim_crown',
        title: 'Do you need crown molding installation ($7/linear ft)?',
        type: 'radio',
        options: ['Yes', 'No'],
      })
    }

    // 4. Last page questions
    stepsList.push({
      id: 'additional_info',
      title: 'Is there anything else you would like us to know about your project?',
      type: 'textarea',
      placeholder: 'Please include any additional details, special requests, access instructions, timelines, or concerns.',
    })

    stepsList.push({
      id: 'has_photos',
      title: 'Do you have photos of the work area to upload for final manual review?',
      type: 'radio',
      options: ['Yes', 'No'],
    })

    return stepsList
  }

  const dynamicSteps = getDynamicSteps()
  const totalSteps = 2 + dynamicSteps.length
  const isLastStep = currentStepIndex === totalSteps - 1

  const isStepValid = () => {
    if (currentStepIndex === 0) {
      return (
        answers.length.trim() !== '' &&
        answers.width.trim() !== '' &&
        answers.height.trim() !== '' &&
        answers.address.trim() !== ''
      )
    }

    if (currentStepIndex === 1) {
      return answers.services.drywall || answers.services.paint || answers.services.trim
    }

    const currentDynamicStep = dynamicSteps[currentStepIndex - 2]
    if (!currentDynamicStep) return false

    const val = answers[currentDynamicStep.id]
    if (currentDynamicStep.type === 'radio') {
      return val !== undefined && val !== ''
    }

    if (currentDynamicStep.id === 'additional_info') {
      return true // Optional
    }

    if (currentDynamicStep.type === 'text' || currentDynamicStep.type === 'textarea') {
      return val !== undefined && val.trim() !== ''
    }

    return true
  }

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }

  const handleSubmit = () => {
    if (isStepValid()) {
      console.log('Wizard estimate request answers submitted:', answers)
      const result = calculateEstimate(answers)
      setEstimate(result)

      try {
        sessionStorage.setItem('fcd_estimate_data', JSON.stringify({ answers, estimate: result }))
      } catch (e) {
        console.error('Failed to store estimate in sessionStorage', e)
      }

      window.open('/estimate', '_blank')
      setShowSuccess(true)
    }
  }


  return (
    <>
      <section id="home" className="hero">
        <div className="container hero-inner">
          <div className="hero-copy fade-in-up">
            <p className="hero-eyebrow">Residential &amp; Commercial</p>
            <h1 className="home-hero-title">
              <span className="hero-title-line typing-line typing-line--first">Drywall Repairs</span>
              <span className="hero-title-line typing-line typing-line--second">Specialists</span>
            </h1>
            <p className="hero-sub">
              Professional drywall repair, texture matching, ceiling repair, patchwork,  drywall installation, and interior maintenance services for homes, offices, retail spaces, apartments, and commercial properties.
            </p>
            <div className="btn-row">
              <a href="#contact" className="btn btn-orange">Get a Free Estimate<span aria-hidden="true">→</span></a>
              <a href="tel:+19497924283" className="btn btn-glass">Call Now<span aria-hidden="true">→</span></a>
            </div>
            <div className="hero-avatars">
              <img src="/images/image3.png" alt="Customer review avatars" className="review-img" />
              <div className="hero-trust">
                <span className="trust-top"> 5 <span aria-hidden="true">★</span> Verified</span>
                <span className="trust-bot">Google Reviews</span>
              </div>
            </div>
          </div>
          
          <div className="hero-img-wrap fade-in-right hero-img-float">
            {!estimate ? (
              <div className="estimate-wizard-card">
                <div className="wizard-header">
                  <h3>Estimate Calculator</h3>
                  <span className="step-indicator">Step {currentStepIndex + 1} of {totalSteps}</span>
                </div>

                <div className="wizard-progress-bar">
                  <div 
                    className="wizard-progress-fill" 
                    style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                  />
                </div>

                <div className="wizard-content">
                  {currentStepIndex === 0 && (
                    <div className="wizard-step-pane active">
                      <h4 className="wizard-step-title">Enter Room Dimensions &amp; Address</h4>
                      <p className="wizard-step-subtitle">Provide basic dimensions to start your estimate.</p>
                      
                      <div className="dimensions-grid">
                        <div className="input-group">
                          <label htmlFor="length">Room Length</label>
                          <div className="input-with-unit">
                            <input 
                              id="length"
                              type="number" 
                              placeholder="e.g. 15"
                              value={answers.length}
                              onChange={e => handleTextChange('length', e.target.value)}
                            />
                            <span className="unit-label">ft</span>
                          </div>
                        </div>

                        <div className="input-group">
                          <label htmlFor="width">Room Width</label>
                          <div className="input-with-unit">
                            <input 
                              id="width"
                              type="number" 
                              placeholder="e.g. 12"
                              value={answers.width}
                              onChange={e => handleTextChange('width', e.target.value)}
                            />
                            <span className="unit-label">ft</span>
                          </div>
                        </div>

                        <div className="input-group">
                          <label htmlFor="height">Ceiling Height</label>
                          <div className="input-with-unit">
                            <input 
                              id="height"
                              type="number" 
                              placeholder="e.g. 9"
                              value={answers.height}
                              onChange={e => handleTextChange('height', e.target.value)}
                            />
                            <span className="unit-label">ft</span>
                          </div>
                        </div>
                      </div>

                      <div className="input-group">
                        <label htmlFor="address">Project Address</label>
                        <input 
                          id="address"
                          type="text" 
                          placeholder="Street Address, City, State, ZIP"
                          value={answers.address}
                          onChange={e => handleTextChange('address', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {currentStepIndex === 1 && (
                    <div className="wizard-step-pane active">
                      <h4 className="wizard-step-title">What services do you need?</h4>
                      <p className="wizard-step-subtitle">Select all services that apply to your project.</p>
                      
                      <div className="services-selection-grid">
                        <button 
                          type="button"
                          className={`service-select-card${answers.services.drywall ? ' selected' : ''}`}
                          onClick={() => handleServiceToggle('drywall')}
                        >
                          <span className="service-card-icon">🧱</span>
                          <div className="service-card-text">
                            <strong>Drywall Services</strong>
                            <span>Hanging, taping, patchwork &amp; repair</span>
                          </div>
                          <div className="custom-checkbox">
                            {answers.services.drywall && <span className="checkmark">✓</span>}
                          </div>
                        </button>

                        <button 
                          type="button"
                          className={`service-select-card${answers.services.paint ? ' selected' : ''}`}
                          onClick={() => handleServiceToggle('paint')}
                        >
                          <span className="service-card-icon">🎨</span>
                          <div className="service-card-text">
                            <strong>Painting Services</strong>
                            <span>Surface preparation, touch-ups &amp; painting</span>
                          </div>
                          <div className="custom-checkbox">
                            {answers.services.paint && <span className="checkmark">✓</span>}
                          </div>
                        </button>

                        <button 
                          type="button"
                          className={`service-select-card${answers.services.trim ? ' selected' : ''}`}
                          onClick={() => handleServiceToggle('trim')}
                        >
                          <span className="service-card-icon">🪵</span>
                          <div className="service-card-text">
                            <strong>Trim &amp; Baseboard</strong>
                            <span>Installation and painting services</span>
                          </div>
                          <div className="custom-checkbox">
                            {answers.services.trim && <span className="checkmark">✓</span>}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStepIndex >= 2 && dynamicSteps[currentStepIndex - 2] && (
                    <div className="wizard-step-pane active">
                      <h4 className="wizard-step-title">{dynamicSteps[currentStepIndex - 2].title}</h4>
                      {dynamicSteps[currentStepIndex - 2].placeholder && (
                        <p className="wizard-step-subtitle">{dynamicSteps[currentStepIndex - 2].placeholder}</p>
                      )}

                      <div className="dynamic-input-container">
                        {dynamicSteps[currentStepIndex - 2].type === 'radio' && (
                          <div className="radio-options-list">
                            {dynamicSteps[currentStepIndex - 2].options?.map((option: string) => {
                              const stepId = dynamicSteps[currentStepIndex - 2].id
                              const isSelected = answers[stepId] === option || (option === 'Other' && answers[stepId]?.startsWith('Other:'))
                              
                              return (
                                <div key={option} className="radio-option-card-wrapper">
                                  <button
                                    type="button"
                                    className={`radio-option-card${isSelected ? ' selected' : ''}`}
                                    onClick={() => {
                                      if (option === 'Other') {
                                        handleOptionSelect(stepId, 'Other: ')
                                      } else {
                                        handleOptionSelect(stepId, option)
                                      }
                                    }}
                                  >
                                    <span className="radio-indicator">
                                      {isSelected && <span className="radio-dot" />}
                                    </span>
                                    <span className="radio-label-text">{option}</span>
                                  </button>
                                  
                                  {option === 'Other' && isSelected && (
                                    <div className="other-input-container">
                                      <input
                                        type="text"
                                        className="theme-text-input other-text-input"
                                        placeholder="Please specify..."
                                        value={answers[stepId]?.replace('Other: ', '') || ''}
                                        onChange={e => handleOptionSelect(stepId, `Other: ${e.target.value}`)}
                                        autoFocus
                                      />
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {dynamicSteps[currentStepIndex - 2].type === 'text' && (
                          <div className="input-group">
                            <input
                              type="text"
                              className="theme-text-input"
                              placeholder="Type your answer here..."
                              value={answers[dynamicSteps[currentStepIndex - 2].id] || ''}
                              onChange={e => handleTextChange(dynamicSteps[currentStepIndex - 2].id, e.target.value)}
                            />
                          </div>
                        )}

                        {dynamicSteps[currentStepIndex - 2].type === 'textarea' && (
                          <div className="input-group">
                            <textarea
                              className="theme-textarea"
                              rows={4}
                              placeholder="Provide additional details here..."
                              value={answers[dynamicSteps[currentStepIndex - 2].id] || ''}
                              onChange={e => handleTextChange(dynamicSteps[currentStepIndex - 2].id, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="wizard-actions">
                  <button
                    type="button"
                    className="btn btn-glass"
                    disabled={currentStepIndex === 0}
                    onClick={handlePrev}
                  >
                    ← Back
                  </button>

                  {isLastStep ? (
                    <button
                      type="button"
                      className="btn btn-orange wizard-submit-btn"
                      disabled={!isStepValid()}
                      onClick={handleSubmit}
                    >
                      Submit Estimate →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-blue"
                      disabled={!isStepValid()}
                      onClick={handleNext}
                    >
                      Next Step →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="estimate-wizard-card success-wizard-card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '40px 30px',
                gap: '24px',
                minHeight: '480px'
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(47, 174, 255, 0.1)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '2.2rem',
                  color: 'var(--blue)'
                }}>
                  🎉
                </div>
                
                <div>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: '10px'
                  }}>
                    Your Estimate is Ready!
                  </h3>
                  <p style={{
                    color: '#667085',
                    fontSize: '0.92rem',
                    lineHeight: '1.5',
                    maxWidth: '320px',
                    margin: '0 auto'
                  }}>
                    We have successfully calculated a detailed quote for your project dimensions.
                  </p>
                </div>

                <div className="wizard-actions-vertical" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  width: '100%',
                  marginTop: '10px'
                }}>
                  <button 
                    type="button" 
                    className="btn btn-blue" 
                    onClick={() => window.open('/estimate', '_blank')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    View Detailed Estimate 📄
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-glass" 
                    data-cal-link="dhrumil-sanghvi-4kxjvq/15min"
                    data-cal-namespace="15min"
                    data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: '#000000'
                    }}
                  >
                    Book a Site Visit 📅
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      <section className="stats-strip" aria-label="Company statistics">
        <div className="container stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-icon">{s.svg}</span>
              <div className="stat-text">
                <strong className="stat-val"><Counter value={s.value} /></strong>
                <span className="stat-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FadeSection id="about" className="section">
        <div className="container two-col">
          <div className="about-img-wrap">
            <img src="/images/img2.jpeg" alt="Farley construction team on site" className="about-img" />

            <div className="integrity-badge">
              <strong>Built on Integrity.</strong>
              <span>Focused on Excellence.</span>
            </div>
          </div>
          <div className="about-copy">
            <SectionLabel text="About Farley Construction" />
            <h2 className="about-split-h2">
              <span className="about-h2-top">Reliable Drywall Repair</span>
              <span className="about-h2-bottom">
                <span className="about-h2-amp">&amp;</span> Property Maintenance Services.
              </span>
            </h2>
            <p className="body-text">
              We specialize in drywall repair, drywall installation, texture matching, ceiling repair, patchwork,
              and interior maintenance services for residential and commercial properties.
            </p>
            <div className="about-clients-block">
              <p className="about-clients-label">We proudly work with:</p>
              <div className="about-client-pills">
                {[
                  { label: 'Homeowners', icon: '🏠' },
                  { label: 'Property Managers', icon: '🏢' },
                  { label: 'Commercial Facilities', icon: '🏗️' },
                  { label: 'Retail Spaces', icon: '🛍️' },
                  { label: 'Offices', icon: '💼' },
                  { label: 'Apartment Complexes', icon: '🏘️' },
                  { label: 'Real Estate Professionals', icon: '🤝' },
                ].map((c, i) => (
                  <span
                    key={c.label}
                    className="about-client-pill"
                    style={{ '--pill-i': i } as React.CSSProperties}
                  >
                    <span className="pill-icon" aria-hidden="true">{c.icon}</span>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/about" className="btn btn-orange">Learn More About Us <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </FadeSection>

      <FadeSection id="services" className="section bg-light">
        <div className="container">
          <header className="services-section-head">
            <SectionLabel text="Our Services" light />
            <div className="services-section-lead">
              <h2 className="services-section-title">
                Complete Drywall &amp; Interior Repair Services.
              </h2>
              <p className="services-intro">
                We provide professional drywall repair, texture matching, installation, and finishing for residential and commercial spaces — delivering clean, reliable results built to last
              </p>
            </div>
          </header>
          <div className="cards-3 stagger-cards services-cards-grid">
            {services.map((s, i) => (
              <article key={s.title} className="service-card card-hover" style={{ '--stagger-i': i } as React.CSSProperties}>
                <div className="card-img-wrap">
                  <img src={s.img} alt={s.title} />
                </div>
                <div className="card-body">
                  <h3>{s.title}</h3>
                  <p className="body-text service-card-desc">{s.copy}</p>
                  <Link to={s.href} className="btn btn-orange service-card-cta">
                    Learn More <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection className="section process-section">
        <div className="container">
          <SectionLabel text="Our Process" />
          <h2 className="center-text">A Clear Process. Proven Results.</h2>
          <StaggerRow className="process-row">
            {steps.map((s, i) => (
              <div key={s.n} className="process-step" style={{ '--stagger-i': i } as React.CSSProperties}>
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p className="body-text">{s.copy}</p>
                {i < steps.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </StaggerRow>
        </div>
      </FadeSection>

      <FadeSection className="section why-section">
        <div className="container two-col">
          <div className="why-copy">
            <SectionLabel text="Why Choose Us" />
            <h2>Drywall Services<br />Built Around<br />Your Needs.</h2>
            <p className="body-text">
              From patch repairs and texture matching to complete finishing work, we deliver the drywall services property owners rely on most
            </p>
            <div className="why-trust-chips">
              {['Fast Response', 'Clean Work', 'Small Jobs Welcome'].map((label) => (
                <span key={label} className="why-trust-chip">
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#3AABF0" /><path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {label}
                </span>
              ))}
            </div>
            <a href="#contact" className="btn btn-orange">Discuss Your Project <span aria-hidden="true">→</span></a>
          </div>
          <div className="benefit-grid stagger-cards">
            {benefits.map((b, i) => (
              <article key={b.title} className="benefit-card card-hover" style={{ '--stagger-i': i } as React.CSSProperties}>
                <span className="benefit-icon">{b.svg}</span>
                <h3>{b.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection id="projects" className="section project-section">
        <div className="container">
          <SectionLabel text="Featured Projects" />
          <h2>Quality Work. Real Results.</h2>
          <div className="cards-4 stagger-cards">
            {featuredProjects.map((p, i) => (
              <article key={p.title} className="project-card" style={{ '--stagger-i': i } as React.CSSProperties}>
                <div className="project-img-wrap">
                  <img src={p.img} alt={p.title} />
                  <div className="project-overlay">
                    <span className="proj-tag">{p.tag}</span>
                    <h3>{p.title}</h3>
                    <p className="proj-loc">{p.location}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <section className="testimonials-section">
        <div className="container">
          <SectionLabel text="Testimonials" />
          <h2 className="left-text">What Our Clients Say</h2>
          <p className="section-subtitle">
            Trusted by homeowners, investors, and businesses for quality construction and reliable project delivery.
          </p>
        </div>

        <div className="marquee-container">
          {/* Row 1: Right to Left */}
          <div className="marquee-track" style={{ '--speed': '50s' } as React.CSSProperties}>
            {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map((t, i) => (
              <div key={`t1-${i}`} className="testi-card">
                <div className="testi-stars">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} aria-hidden="true">★</span>
                  ))}
                </div>
                <p className="testi-content">{t.review}</p>
                <div className="testi-profile">
                  <div className="testi-avatar">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="testi-info">
                    <span className="testi-name">{t.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Left to Right */}
          <div className="marquee-track reverse" style={{ '--speed': '45s' } as React.CSSProperties}>
            {[...testimonials.slice(4, 8), ...testimonials.slice(4, 8)].map((t, i) => (
              <div key={`t2-${i}`} className="testi-card">
                <div className="testi-stars">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} aria-hidden="true">★</span>
                  ))}
                </div>
                <p className="testi-content">{t.review}</p>
                <div className="testi-profile">
                  <div className="testi-avatar">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="testi-info">
                    <span className="testi-name">{t.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FadeSection className="section cta-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-text">
              <h2>Ready to Start Your Project?</h2>
              <p className="body-text">
                Whether you need drywall patch repair, ceiling drywall repair, texture matching, or general interior maintenance services, we’re ready to help.
              </p>
            </div>
            <a href="#contact" className="btn btn-orange btn-lg">Request a Free Estimate <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </FadeSection>

      <FadeSection id="contact" className="section contact-section">
        <div className="container two-col contact-col">
          <div className="contact-info">
            <SectionLabel text="Get In Touch" />
            <h2>Let's Talk About<br />Your Project</h2>
            <p className="body-text">Tell us what you need and our team will get back to you with next steps.</p>
            <ul className="contact-list">
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/telephone.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Phone</strong><span>(949) 792-4283</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/mail (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Email</strong><span>andrew@farleycdinc.com</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/location (6).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Location</strong><span>27401 Los Altos<br />Mission Viejo, CA 92691</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/time.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Hours</strong><span>Mon - Fri: 7 AM - 5 PM</span></div>
              </li>
            </ul>
          </div>
          <form
            className="cp-form"
            onSubmit={async (e) => {
              e.preventDefault()

              const form = e.currentTarget

              const formData = new FormData()

              formData.append('entry.415223274', form.fullName.value)
              formData.append('entry.1096735123', form.companyName.value)
              formData.append('entry.715839994', form.email.value)
              formData.append('entry.1507681476', form.phone.value)
              formData.append('entry.738519468', form.propertyType.value)
              formData.append('entry.2083865356', form.serviceNeeded.value)
              formData.append('entry.4913284', form.projectDetails.value)

              await fetch(
                'https://docs.google.com/forms/d/e/1FAIpQLScYT08-Ck8LXE9IIbPppSWM0IBnKrH1Qs3sjSDcaAD6X-WgrQ/formResponse',
                {
                  method: 'POST',
                  mode: 'no-cors',
                  body: formData,
                }
              )

              setShowSuccess(true)
              form.reset()
            }}>
            <h2>Request a Quote</h2>
            <div className="cp-form-grid">
              <label>Full Name<input type="text" placeholder="Your full name" name="fullName" /></label>
              <label>Company Name<input type="text" placeholder="Company or organization" name="companyName" /></label>
              <label>Email Address<input type="email" placeholder="your@email.com" name="email" /></label>
              <label>Phone Number<input type="tel" placeholder="Phone number" name="phone" /></label>
              <label>Property Type<input type="text" placeholder="Select property type" name="propertyType" /></label>
              <label>Service Needed<input type="text" placeholder="Select service needed" name="serviceNeeded" /></label>
            </div>
            <label className="cp-message-label">
              Project Details
              <textarea rows={5} placeholder="Tell us about your project details" name="projectDetails" />
            </label>
            <button type="submit" className="btn btn-blue cp-submit">
              Request Your Free Estimate Today<span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </FadeSection>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />
    </>
  )
}
