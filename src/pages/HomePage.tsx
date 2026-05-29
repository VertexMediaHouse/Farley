import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Counter, FadeSection, SectionLabel, StaggerRow } from '../utils'
import SuccessModal from '../components/SuccessModal'
import { featuredProjects, stats, testimonials } from '../data'
import { calculateEstimate } from '../services/estimateEngine'
import { uploadFilesToDrive } from '../services/driveService'
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
    electrical?: boolean;
  };
  trim_services: string;
  trim_style: string;
  trim_areas: Array<{ label: string; feet: string }>;
  drywall_type?: string;
  corner_metal_type?: string;
  corner_metal_length?: string;
  corner_metal_qty?: string;
  soffit_type?: string;
  electrical_services?: string;
  electrical_light_size?: string;
  electrical_light_count?: string;
  electrical_fan_count?: string;
  electrical_fixture_count?: string;
  is_two_story?: string;
  is_occupied?: string;
  is_emergency?: string;
  is_late_day?: string;
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
    electrical: false,
  },
  drywall_work_type: '',
  drywall_areas: '',
  drywall_demo: '',
  drywall_insulation: '',
  drywall_insulation_areas: '',
  drywall_texture: '',
  drywall_type: '',
  corner_metal_type: '',
  corner_metal_length: '',
  corner_metal_qty: '',
  soffit_type: '',
  electrical_services: '',
  electrical_light_size: '',
  electrical_light_count: '',
  electrical_fan_count: '',
  electrical_fixture_count: '',
  drywall_has_dims: '',
  paint_needs_paint: '',
  paint_needed: '',
  paint_type: '',
  paint_touch_up_area: '',
  paint_corner_has_dims: '',
  paint_dims: '',
  paint_has_paint: '',
  paint_color_selected: '',
  trim_services: '',
  trim_style: '',
  trim_areas: [{ label: '', feet: '' }],
  trim_photo: '',
  general_has_dims: '',
  is_two_story: '',
  is_occupied: '',
  is_emergency: '',
  is_late_day: '',
  additional_info: '',
  has_photos: '',
};

export default function HomePage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

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

  const addTrimArea = () => {
    setAnswers((prev) => ({
      ...prev,
      trim_areas: [...(prev.trim_areas || []), { label: '', feet: '' }]
    }))
  }

  const removeTrimArea = (index: number) => {
    setAnswers((prev) => {
      const newAreas = [...(prev.trim_areas || [])]
      newAreas.splice(index, 1)
      return {
        ...prev,
        trim_areas: newAreas
      }
    })
  }

  const updateTrimArea = (index: number, field: 'label' | 'feet', value: string) => {
    setAnswers((prev) => {
      const newAreas = [...(prev.trim_areas || [])]
      newAreas[index] = { ...newAreas[index], [field]: value }
      return {
        ...prev,
        trim_areas: newAreas
      }
    })
  }

  const getDynamicSteps = () => {
    const stepsList: any[] = []

    // 1. Drywall questions
    if (answers.services.drywall) {
      stepsList.push({
        id: 'drywall_work_type',
        title: 'What kind of drywall work do you need?',
        type: 'radio',
        options: [
          'small hole repair',
          'medium patch repair',
          'larger sections repair',
          'full wall replacement',
          'celling replacement',
          'entire room installation'
        ]
      })

      stepsList.push({
        id: 'drywall_areas',
        title: 'What areas need work?',
        type: 'radio',
        options: ['walls', 'celling', 'both']
      })

      stepsList.push({
        id: 'drywall_demo',
        title: 'Do you need demolition?',
        type: 'radio',
        options: [
          'no demolition',
          'remove existing wall drywall',
          'remove existing cellng drywall',
          'remove both'
        ]
      })

      stepsList.push({
        id: 'drywall_insulation',
        title: 'Do you need insulation?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      if (answers.drywall_insulation === 'Yes') {
        stepsList.push({
          id: 'drywall_insulation_areas',
          title: 'What areas need insulation?',
          type: 'radio',
          options: ['wall', 'celling', 'both']
        })
      }

      stepsList.push({
        id: 'drywall_texture',
        title: 'What texture finish do you want?',
        type: 'radio',
        options: [
          'smooth finish',
          'orange peel',
          'knowkdown',
          'matching existing texture'
        ]
      })

      stepsList.push({
        id: 'drywall_type',
        title: 'What type of drywall?',
        type: 'radio',
        options: ['1/2', '5/8', 'green board']
      })

      stepsList.push({
        id: 'corner_metal_type',
        title: 'Do you need corner metal?',
        type: 'radio',
        options: ['none', 'standard', 'bullnose', 'arch']
      })

      if (answers.corner_metal_type === 'standard' || answers.corner_metal_type === 'bullnose') {
        stepsList.push({
          id: 'corner_metal_length',
          title: 'What length corner metal?',
          type: 'radio',
          options: ['8ft', '10ft']
        })

        stepsList.push({
          id: 'corner_metal_qty',
          title: 'How many pieces of corner metal?',
          type: 'text',
          placeholder: 'e.g. 4'
        })
      }

      stepsList.push({
        id: 'soffit_type',
        title: 'Do you have any soffits?',
        type: 'radio',
        options: ['none', 'ceiling soffits', 'wall soffits']
      })

      stepsList.push({
        id: 'electrical_services',
        title: 'Do you need any electrical work?',
        type: 'radio',
        options: [
          'none',
          'recessed lighting',
          'ceiling fan installation',
          'light fixture installation',
          'bathroom fan installation',
          'outlet/switch relocation',
          'new outlet installation',
          'tv mount wire concealment'
        ]
      })

      if (answers.electrical_services === 'recessed lighting') {
        stepsList.push({
          id: 'electrical_light_size',
          title: 'What size recessed lights?',
          type: 'radio',
          options: ['4 inch', '6 inch']
        })
        stepsList.push({
          id: 'electrical_light_count',
          title: 'How many recessed lights?',
          type: 'text',
          placeholder: 'e.g. 6'
        })
      }

      if (answers.electrical_services === 'ceiling fan installation' || answers.electrical_services === 'bathroom fan installation') {
        stepsList.push({
          id: 'electrical_fan_count',
          title: 'How many units?',
          type: 'text',
          placeholder: 'e.g. 2'
        })
      }

      if (answers.electrical_services === 'light fixture installation') {
        stepsList.push({
          id: 'electrical_fixture_count',
          title: 'How many fixtures?',
          type: 'text',
          placeholder: 'e.g. 3'
        })
      }

      stepsList.push({
        id: 'drywall_has_dims',
        title: 'Do you have dimensions?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      if (answers.drywall_has_dims === 'Yes') {
        stepsList.push({
          id: 'drywall_dims_pane',
          title: 'Please Provide Room Dimensions & Address',
          type: 'dimensions_and_address'
        })
      }

      stepsList.push({
        id: 'drywall_photo',
        title: 'Upload Photos (Recommended)',
        type: 'photo_upload'
      })
    }



    // 2. Paint questions
    if (answers.services.paint) {
      stepsList.push({
        id: 'paint_needs_paint',
        title: 'What needs paint?',
        type: 'radio',
        options: ['walls', 'celling', 'trim/baseboard', 'entire room']
      })

      stepsList.push({
        id: 'paint_type',
        title: 'What kind of painting services would you like?',
        type: 'radio',
        options: ['touch-up painting', 'corner to corner painting', 'other']
      })

      if (answers.paint_type === 'touch-up painting' || answers.paint_type === 'Touch-up painting') {
        stepsList.push({
          id: 'paint_touch_up_area',
          title: 'Please enter the approximate touch-up area (sqft):',
          type: 'text',
          placeholder: 'e.g. 30 (enter approximate area in square feet)',
        })
      }

      stepsList.push({
        id: 'paint_has_paint',
        title: 'Do you already have paint??',
        type: 'radio',
        options: ['Yes', 'No']
      })

      if (answers.paint_has_paint === 'No') {
        stepsList.push({
          id: 'paint_color_selected',
          title: 'Do you have a paint colour selected?',
          type: 'radio',
          options: ['Yes', 'No']
        })
      }

      stepsList.push({
        id: 'paint_photo',
        title: 'Upload Photos (Recommended)',
        type: 'photo_upload'
      })
    }

    // 3. Trim questions
    if (answers.services.trim) {
      stepsList.push({
        id: 'trim_services',
        title: 'What services do you need?',
        type: 'radio',
        options: [
          'install new baseboard',
          'replace existing baseboard',
          'repair existing trim',
          'paint existing trim'
        ]
      })

      stepsList.push({
        id: 'trim_style',
        title: 'What style do you want?',
        type: 'radio',
        options: [
          'standerd',
          'mordern',
          'match existing'
        ]
      })

      stepsList.push({
        id: 'trim_areas',
        title: 'Approximate linear feet.',
        type: 'trim_areas_input',
        placeholder: 'example: one wall - approx 10-15ft'
      })

      stepsList.push({
        id: 'trim_photo',
        title: 'Upload Photos (Recommended)',
        type: 'photo_upload'
      })
    }

    // If drywall is not selected, but paint is selected, we should ask for dimensions
    if (!answers.services.drywall && answers.services.paint) {
      stepsList.push({
        id: 'general_has_dims',
        title: 'Do you have room dimensions?',
        type: 'radio',
        options: ['Yes', 'No']
      })
      if (answers.general_has_dims === 'Yes') {
        stepsList.push({
          id: 'general_dims_pane',
          title: 'Please Provide Room Dimensions & Address',
          type: 'dimensions_and_address'
        })
      }
    }

    // 4. Last page questions
    stepsList.push({
      id: 'is_two_story',
      title: 'Is this a two-story or elevated work area?',
      type: 'radio',
      options: ['Yes', 'No']
    })

    stepsList.push({
      id: 'is_occupied',
      title: 'Is the room currently occupied or does it have furniture?',
      type: 'radio',
      options: ['Yes', 'No']
    })

    stepsList.push({
      id: 'is_emergency',
      title: 'Is this an emergency or same-day request?',
      type: 'radio',
      options: ['Yes', 'No']
    })

    stepsList.push({
      id: 'is_late_day',
      title: 'Would the job be starting late in the day?',
      type: 'radio',
      options: ['Yes', 'No']
    })

    stepsList.push({
      id: 'additional_info',
      title: 'Is there anything else you would like us to know about your project?',
      type: 'textarea',
      placeholder: 'Please include any additional details, special requests, access instructions, timelines, or concerns.',
    })



    return stepsList
  }

  const dynamicSteps = getDynamicSteps()
  const totalSteps = 1 + dynamicSteps.length
  const isLastStep = currentStepIndex === totalSteps - 1

  const isStepValid = () => {
    if (currentStepIndex === 0) {
      return answers.services.drywall || answers.services.paint || answers.services.trim
    }

    const currentDynamicStep = dynamicSteps[currentStepIndex - 1]
    if (!currentDynamicStep) return false

    if (currentDynamicStep.type === 'dimensions_and_address') {
      return (
        answers.length.trim() !== '' &&
        answers.width.trim() !== '' &&
        answers.height.trim() !== '' &&
        answers.address.trim() !== ''
      )
    }

    if (currentDynamicStep.type === 'photo_upload') {
      return true
    }

    if (currentDynamicStep.type === 'trim_areas_input') {
      const areas = answers.trim_areas || []
      if (areas.length === 0) return false
      return areas.every((area: any) => 
        area.label.trim() !== '' && 
        area.feet.trim() !== '' && 
        !isNaN(parseFloat(area.feet)) && 
        parseFloat(area.feet) > 0
      )
    }

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

  const handleSubmit = async () => {
    if (isStepValid()) {
      console.log('Wizard estimate request answers submitted:', answers)
      const enrichedAnswers = {
        ...answers,
        has_photos: uploadedFiles.length > 0 ? 'Yes' : 'No',
        services: {
          ...answers.services,
          electrical: !!(answers.electrical_services && answers.electrical_services !== 'none'),
        }
      }
      
      const result = calculateEstimate(enrichedAnswers)
      setEstimate(result)

      try {
        localStorage.setItem('fcd_estimate_data', JSON.stringify({ answers: enrichedAnswers, estimate: result }))
      } catch (e) {
        console.error('Failed to store estimate in localStorage', e)
      }

      // If no files to upload, just open the tab immediately
      if (uploadedFiles.length === 0) {
        window.open('/estimate', '_blank')
        return;
      }

      // If we have files, we MUST open the new tab synchronously before the 'await', 
      // otherwise browsers (like Safari/Chrome) will block the popup or alter its behavior.
      const newTab = window.open('about:blank', '_blank');
      if (newTab) {
        newTab.document.write('<html><head><title>Loading...</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#334155;"><h3>Uploading Photos & Generating Quote...</h3></body></html>');
      }

      setIsUploading(true)
      try {
        const uploadResult = await uploadFilesToDrive(uploadedFiles)
        console.log('Photos uploaded to Drive folder:', uploadResult.folderCreated)
      } catch (err) {
        console.error('Photo upload failed:', err)
      } finally {
        setIsUploading(false)
        if (newTab) {
          newTab.location.href = '/estimate'
        } else {
          // Fallback if popup blocker completely prevented the tab from opening
          window.location.href = '/estimate'
        }
      }
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
          
          <div className="hero-img-wrap fade-in-right">
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

                  {currentStepIndex >= 1 && dynamicSteps[currentStepIndex - 1] && (
                    <div className="wizard-step-pane active">
                      <h4 className="wizard-step-title">{dynamicSteps[currentStepIndex - 1].title}</h4>
                      {dynamicSteps[currentStepIndex - 1].placeholder && (
                        <p className="wizard-step-subtitle">{dynamicSteps[currentStepIndex - 1].placeholder}</p>
                      )}

                      <div className="dynamic-input-container">
                        {dynamicSteps[currentStepIndex - 1].type === 'radio' && (
                          <div className="radio-options-list">
                            {dynamicSteps[currentStepIndex - 1].options?.map((option: string) => {
                              const stepId = dynamicSteps[currentStepIndex - 1].id
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

                        {dynamicSteps[currentStepIndex - 1].type === 'text' && (
                          <div className="input-group">
                            <input
                              type="text"
                              className="theme-text-input"
                              placeholder="Type your answer here..."
                              value={answers[dynamicSteps[currentStepIndex - 1].id] || ''}
                              onChange={e => handleTextChange(dynamicSteps[currentStepIndex - 1].id, e.target.value)}
                            />
                          </div>
                        )}

                        {dynamicSteps[currentStepIndex - 1].type === 'textarea' && (
                          <div className="input-group">
                            <textarea
                              className="theme-textarea"
                              rows={4}
                              placeholder="Provide additional details here..."
                              value={answers[dynamicSteps[currentStepIndex - 1].id] || ''}
                              onChange={e => handleTextChange(dynamicSteps[currentStepIndex - 1].id, e.target.value)}
                            />
                          </div>
                        )}

                        {dynamicSteps[currentStepIndex - 1].type === 'dimensions_and_address' && (
                          <div className="wizard-step-pane active" style={{ padding: 0 }}>
                            <div className="dimensions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '15px' }}>
                              <div className="input-group">
                                <label htmlFor="length" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Room Length</label>
                                <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                                  <input 
                                    id="length"
                                    type="number" 
                                    placeholder="e.g. 15"
                                    value={answers.length}
                                    onChange={e => handleTextChange('length', e.target.value)}
                                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                  />
                                  <span className="unit-label" style={{ paddingLeft: '6px', fontSize: '0.9rem' }}>ft</span>
                                </div>
                              </div>

                              <div className="input-group">
                                <label htmlFor="width" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Room Width</label>
                                <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                                  <input 
                                    id="width"
                                    type="number" 
                                    placeholder="e.g. 12"
                                    value={answers.width}
                                    onChange={e => handleTextChange('width', e.target.value)}
                                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                  />
                                  <span className="unit-label" style={{ paddingLeft: '6px', fontSize: '0.9rem' }}>ft</span>
                                </div>
                              </div>

                              <div className="input-group">
                                <label htmlFor="height" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Ceiling Height</label>
                                <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                                  <input 
                                    id="height"
                                    type="number" 
                                    placeholder="e.g. 9"
                                    value={answers.height}
                                    onChange={e => handleTextChange('height', e.target.value)}
                                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                  />
                                  <span className="unit-label" style={{ paddingLeft: '6px', fontSize: '0.9rem' }}>ft</span>
                                </div>
                              </div>
                            </div>

                            <div className="input-group" style={{ marginTop: '12px' }}>
                              <label htmlFor="address" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Project Address</label>
                              <input 
                                id="address"
                                type="text" 
                                placeholder="Street Address, City, State, ZIP"
                                value={answers.address}
                                onChange={e => handleTextChange('address', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                              />
                            </div>
                          </div>
                        )}

                        {dynamicSteps[currentStepIndex - 1].type === 'photo_upload' && (
                          <div className="photo-upload-container" style={{
                            background: 'rgba(47, 174, 255, 0.04)',
                            border: '1px dashed var(--blue)',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span style={{ fontSize: '2.5rem' }}>📸</span>
                            <h5 style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Upload Project Photos</h5>
                            <p style={{ fontSize: '0.85rem', color: '#667085', margin: 0, lineHeight: '1.4' }}>
                              Help us understand your project better. Select photos of the wall or ceiling area to upload (optional).
                            </p>
                            <label
                              htmlFor="photo-file-input"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: 'var(--blue)',
                                color: '#fff',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                marginTop: '8px',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                              }}
                            >
                              📂 Choose Photos
                            </label>
                            <input
                              id="photo-file-input"
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleFileSelect}
                              style={{ display: 'none' }}
                            />
                            {uploadedFiles.length > 0 && (
                              <div style={{
                                width: '100%',
                                marginTop: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                textAlign: 'left'
                              }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected:
                                </span>
                                {uploadedFiles.map((file, idx) => (
                                  <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'rgba(0,0,0,0.03)',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.82rem'
                                  }}>
                                    <span style={{ color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                      {file.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(idx)}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '2px 8px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 700
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                              Photos will be uploaded when you submit the estimate.
                            </span>
                          </div>
                        )}

                        {dynamicSteps[currentStepIndex - 1].type === 'trim_areas_input' && (
                          <div className="trim-areas-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                              Add the rooms or walls where trim work is needed.
                              <br />
                              <strong>Example:</strong> "Living Room Wall" &mdash; 15 ft
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                              {(answers.trim_areas || []).map((area: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <input 
                                      type="text" 
                                      placeholder="e.g. Living Room Wall"
                                      value={area.label}
                                      onChange={e => updateTrimArea(idx, 'label', e.target.value)}
                                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', color: '#000000' }}
                                    />
                                  </div>
                                  <div style={{ width: '120px', display: 'flex', alignItems: 'center' }}>
                                    <input 
                                      type="number" 
                                      placeholder="Feet"
                                      value={area.feet}
                                      onChange={e => updateTrimArea(idx, 'feet', e.target.value)}
                                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', color: '#000000' }}
                                    />
                                    <span style={{ marginLeft: '6px', fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>ft</span>
                                  </div>
                                  {(answers.trim_areas || []).length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => removeTrimArea(idx)}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: 'none',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        display: 'grid',
                                        placeItems: 'center',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        transition: 'background 0.2s',
                                        flexShrink: 0
                                      }}
                                      title="Remove area"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={addTrimArea}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                background: 'rgba(59, 130, 246, 0.08)',
                                color: '#3b82f6',
                                border: '1px dashed rgba(59, 130, 246, 0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                marginTop: '8px',
                                transition: 'all 0.2s'
                              }}
                            >
                              ➕ Add Another Area
                            </button>
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
                    style={{ color: 'black' }}
                  >
                    ← Back
                  </button>

                  {isLastStep ? (
                    <button
                      type="button"
                      className="btn btn-orange wizard-submit-btn"
                      disabled={!isStepValid() || isUploading}
                      onClick={handleSubmit}
                    >
                      {isUploading ? 'Uploading Photos...' : 'Submit Estimate →'}
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
                </div>

                <div style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {answers.services.drywall && <span style={{ background: 'var(--blue)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Drywall Services</span>}
                    {answers.services.paint && <span style={{ background: 'var(--blue)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Painting Services</span>}
                    {answers.services.trim && <span style={{ background: 'var(--blue)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Trim &amp; Baseboard</span>}
                    {answers.services.electrical && <span style={{ background: 'var(--blue)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Electrical Services</span>}
                  </div>
                  
                  <div style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {answers.services.drywall && answers.drywall_work_type && <div>• {answers.drywall_work_type} {answers.drywall_texture ? `with ${answers.drywall_texture} finish` : ''}</div>}
                    {answers.services.paint && answers.paint_type && <div>• {answers.paint_type} for {answers.paint_needs_paint}</div>}
                    {answers.services.trim && answers.trim_services && <div>• {answers.trim_services} {answers.trim_style ? `(${answers.trim_style})` : ''}</div>}
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Total</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--blue)', lineHeight: '1.1' }}>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(estimate.grandTotal)}
                    </div>
                  </div>

                  {estimate.isPendingReview && (
                    <div style={{
                      background: 'rgba(234, 179, 8, 0.1)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      color: '#b45309',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>⚠️</span> This estimate includes items requiring on-site confirmation. Final price may vary.
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px', marginTop: '4px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Estimated Duration</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {estimate.grandTotal <= 1500 ? '1 day' : estimate.grandTotal <= 3000 ? '2–3 days' : estimate.grandTotal <= 6000 ? '3–5 days' : estimate.grandTotal <= 10000 ? '1–2 weeks' : '2+ weeks'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Deposit Required (30%)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Math.round(estimate.grandTotal * 0.30))}
                      </div>
                    </div>
                  </div>
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
                    onClick={() => navigate('/estimate')}
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
                  <button 
                    type="button" 
                    className="btn btn-glass" 
                    onClick={() => {
                      setEstimate(null)
                      setCurrentStepIndex(0)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: '#000000',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    ← Back / Edit Answers
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
