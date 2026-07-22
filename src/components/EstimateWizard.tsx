import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateEstimate } from '../services/estimateEngine'
import { uploadFilesToDrive } from '../services/driveService'
import type { EstimateResult } from '../types/estimate'

// ─── Form Types ────────────────────────────────────────────────────────────────

interface FormAnswers {
  length: string
  width: string
  height: string
  address: string
  services: {
    drywall: boolean
    paint: boolean
    trim: boolean
    electrical?: boolean
  }
  drywall_area?: string | string[]
  trim_services: string[] | string
  drywall_wall_sqft?: string
  drywall_wall_photo?: string
  drywall_ceiling_sqft?: string
  drywall_ceiling_photo?: string
  drywall_bathroom_wall_sqft?: string
  drywall_bathroom_wall_photo?: string
  drywall_bathroom_ceiling_sqft?: string
  drywall_bathroom_ceiling_photo?: string
  drywall_demo_wall_sqft?: string
  drywall_demo_ceiling_sqft?: string
  drywall_demo_insulation_sqft?: string
  drywall_demo_baseboard_ft?: string
  drywall_soffits_sqft?: string
  trim_baseboard_height?: string
  trim_baseboard_photo?: string
  trim_base_material?: string[] | string
  trim_base_linear_feet?: string
  trim_base_primed?: string
  trim_casing_material?: string[] | string
  trim_casing?: string
  trim_casing_photo?: string
  trim_casing_linear_feet?: string
  trim_casing_primed?: string
  trim_knows_price?: string
  trim_base_price?: string
  trim_casing_price?: string
  trim_search_fee_ok?: string
  drywall_type?: string
  corner_metal_type?: string
  corner_metal_length?: string
  corner_metal_qty?: string
  corner_metal_both?: string
  corner_metal_corners_count?: string
  arch_needed?: string
  arch_count?: string
  soffit_type?: string
  soffit_linear_feet?: string
  ceiling_height_greater_than_8ft?: string
  ceiling_height_specify?: string
  electrical_services?: string
  electrical_light_size?: string
  electrical_light_count?: string
  electrical_fan_count?: string
  electrical_fixture_count?: string
  is_two_story?: string
  is_occupied?: string
  is_emergency?: string
  is_late_day?: string
  drywall_existing_texture?: string
  paint_primer?: string
  paint_area?: string[]
  paint_wall_sqft?: string
  paint_wall_photo?: string
  paint_ceiling_sqft?: string
  paint_ceiling_photo?: string
  paint_bath_ceiling_sqft?: string
  paint_bath_ceiling_photo?: string
  paint_bath_wall_sqft?: string
  paint_bath_wall_photo?: string
  paint_trim_area?: string[]
  paint_trim_linear_ft?: string
  paint_trim_photo?: string
  paint_baseboards_linear_ft?: string
  paint_baseboards_photo?: string
  paint_ceiling_height_over_8ft?: string
  paint_ceiling_height?: string
  paint_customer_providing?: string
  paint_contractor_providing?: string
  paint_brand_color?: string
  paint_sku_photo?: string
  paint_additional_info?: string
  // New photo-reuse fields
  paint_new_photos_needed?: string
  trim_new_photos_needed?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  contact_address?: string
  [key: string]: any
}

const initialAnswers: FormAnswers = {
  length: '',
  width: '',
  height: '',
  address: '',
  services: { drywall: false, paint: false, trim: false, electrical: false },
  drywall_area: [],
  drywall_areas_checkbox: [],
  drywall_work_type: [],
  drywall_work_photos: '',
  drywall_demolition: [],
  drywall_demolition_insulation_sqft: '',
  drywall_demolition_baseboard_ft: '',
  drywall_soffits: [],
  drywall_soffits_ft: '',
  drywall_soffits_photos: '',
  drywall_ceiling_over_8ft: '',
  drywall_ceiling_height: '',
  drywall_vaulted_ceiling: '',
  drywall_vaulted_width: '',
  drywall_vaulted_height: '',
  drywall_vaulted_surrounding: '',
  drywall_insulation: '',
  drywall_corner_metal: [],
  drywall_corner_count: '',
  drywall_corner_length: '',
  drywall_texture: '',
  drywall_texture_existing: '',
  drywall_texture_photo: '',
  ceiling_height_greater_than_8ft: '',
  ceiling_height_specify: '',
  electrical_services: '',
  electrical_light_size: '',
  electrical_light_count: '',
  electrical_fan_count: '',
  electrical_fixture_count: '',
  drywall_has_dims: '',
  paint_primer: '',
  paint_area: [],
  paint_type: '',
  paint_has_paint: '',
  paint_wall_sqft: '',
  paint_wall_photo: '',
  paint_ceiling_sqft: '',
  paint_ceiling_photo: '',
  paint_bath_ceiling_sqft: '',
  paint_bath_ceiling_photo: '',
  paint_bath_wall_sqft: '',
  paint_bath_wall_photo: '',
  paint_trim_area: [],
  paint_trim_linear_ft: '',
  paint_trim_photo: '',
  paint_baseboards_linear_ft: '',
  paint_baseboards_photo: '',
  paint_ceiling_height_over_8ft: '',
  paint_ceiling_height: '',
  paint_customer_providing: '',
  paint_contractor_providing: '',
  paint_match_existing: '',
  paint_brand_color: '',
  paint_sku_photo: '',
  paint_additional_info: '',
  paint_new_photos_needed: '',
  trim_new_photos_needed: '',
  trim_services: [],
  trim_baseboard_height: '',
  trim_baseboard_photo: '',
  trim_base_material: [],
  trim_base_linear_feet: '',
  trim_base_primed: '',
  trim_casing_material: [],
  trim_casing: '',
  trim_casing_photo: '',
  trim_casing_linear_feet: '',
  trim_casing_primed: '',
  trim_knows_price: '',
  trim_base_price: '',
  trim_casing_price: '',
  trim_search_fee_ok: '',
  is_two_story: '',
  is_occupied: '',
  is_emergency: '',
  is_late_day: '',
  additional_info: '',
  has_photos: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  contact_address: '',
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EstimateWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  // Initialize answers from localStorage if they exist, otherwise use initialAnswers
  const [answers, setAnswers] = useState<FormAnswers>(() => {
    try {
      const stored = localStorage.getItem('fcd_estimate_data')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.answers) {
          return { ...initialAnswers, ...parsed.answers }
        }
      }
    } catch (e) {
      console.error('Failed to parse stored estimate data', e)
    }
    return initialAnswers
  })
  
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // ─── Stable camera/gallery refs (never remounted — fixes iOS reload bug) ──────
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  // Tracks which combined-step row triggered the picker
  const pendingUploadCtx = useRef<{ stepId: string; index: number } | null>(null)
  // For photo_upload steps (no row context)
  const pendingGlobalUpload = useRef<boolean>(false)

  const navigate = useNavigate()

  // ─── Camera / gallery trigger helpers ────────────────────────────────────────

  const openCamera = useCallback((stepId: string, index: number) => {
    pendingUploadCtx.current = { stepId, index }
    pendingGlobalUpload.current = false
    setTimeout(() => cameraInputRef.current?.click(), 30)
  }, [])

  const openGallery = useCallback((stepId: string, index: number) => {
    pendingUploadCtx.current = { stepId, index }
    pendingGlobalUpload.current = false
    setTimeout(() => galleryInputRef.current?.click(), 30)
  }, [])

  const openGlobalCamera = useCallback(() => {
    pendingUploadCtx.current = null
    pendingGlobalUpload.current = true
    setTimeout(() => cameraInputRef.current?.click(), 30)
  }, [])

  const openGlobalGallery = useCallback(() => {
    pendingUploadCtx.current = null
    pendingGlobalUpload.current = true
    setTimeout(() => galleryInputRef.current?.click(), 30)
  }, [])

  const handleCameraChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (pendingGlobalUpload.current) {
      setUploadedFiles((prev) => [...prev, file])
    } else if (pendingUploadCtx.current) {
      const { stepId, index } = pendingUploadCtx.current
      updatePhoto(stepId, index, file)
    }
  }, [])

  const handleGalleryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (!files.length) return
    e.target.value = ''
    if (pendingGlobalUpload.current) {
      setUploadedFiles((prev) => [...prev, ...files])
    } else if (pendingUploadCtx.current) {
      const { stepId, index } = pendingUploadCtx.current
      updatePhoto(stepId, index, files[0])
    }
  }, [])

  // ─── File handling ───────────────────────────────────────────────────────────

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Form handlers ───────────────────────────────────────────────────────────

  const handleTextChange = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (service: 'drywall' | 'paint' | 'trim') => {
    setAnswers((prev) => ({
      ...prev,
      services: { ...prev.services, [service]: !prev.services[service] },
    }))
  }

  const handleOptionSelect = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  const handleRadioChange = (id: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [id]: option }))
  }

  // ─── Combined Step Helpers ───────────────────────────────────────────────────

  const [combinedItems, setCombinedItems] = useState<
    Record<string, { photo: File | null; sqft: string }[]>
  >(() => {
    try {
      const stored = localStorage.getItem('fcd_estimate_data')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.answers) {
          const loadedAnswers = parsed.answers
          const initialItems: Record<string, { photo: File | null; sqft: string }[]> = {}
          
          // Map stored dimension totals back to the first row of each combined step
          const mappings = [
            { stepId: 'drywall_wall', dimId: 'drywall_wall_sqft' },
            { stepId: 'drywall_ceiling', dimId: 'drywall_ceiling_sqft' },
            { stepId: 'drywall_bathroom_wall', dimId: 'drywall_bathroom_wall_sqft' },
            { stepId: 'drywall_bathroom_ceiling', dimId: 'drywall_bathroom_ceiling_sqft' },
            { stepId: 'drywall_soffits', dimId: 'drywall_soffits_sqft' },
            { stepId: 'paint_wall', dimId: 'paint_wall_sqft' },
            { stepId: 'paint_ceiling', dimId: 'paint_ceiling_sqft' },
            { stepId: 'paint_bath_ceiling', dimId: 'paint_bath_ceiling_sqft' },
            { stepId: 'paint_bath_wall', dimId: 'paint_bath_wall_sqft' },
            { stepId: 'paint_trim', dimId: 'paint_trim_linear_ft' },
            { stepId: 'paint_baseboards', dimId: 'paint_baseboards_linear_ft' },
            { stepId: 'trim_baseboard', dimId: 'trim_baseboard_height' },
            { stepId: 'trim_casing_combined', dimId: 'trim_casing_linear_feet' },
          ]
          
          for (const m of mappings) {
            if (loadedAnswers[m.dimId]) {
              initialItems[m.stepId] = [{ photo: null, sqft: loadedAnswers[m.dimId] }]
            }
          }
          return initialItems
        }
      }
    } catch (e) {}
    return {}
  })

  // Track thumbnail object URLs to avoid re-creating them
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})

  const getStepItems = (stepId: string) =>
    combinedItems[stepId] || [{ photo: null, sqft: '' }]

  const addRow = (stepId: string) => {
    setCombinedItems((prev) => ({
      ...prev,
      [stepId]: [...(prev[stepId] || [{ photo: null, sqft: '' }]), { photo: null, sqft: '' }],
    }))
  }

  const removeRow = (stepId: string, index: number, dimensionId: string) => {
    setCombinedItems((prev) => {
      const current = prev[stepId] || [{ photo: null, sqft: '' }]
      if (current.length <= 1) return prev
      const newItems = current.filter((_, i) => i !== index)
      const total = newItems.reduce((acc, item) => acc + (parseFloat(item.sqft) || 0), 0)
      setAnswers((a) => ({ ...a, [dimensionId]: total > 0 ? total.toString() : '' }))
      // Clean up thumb url
      const key = `${stepId}-${index}`
      setThumbUrls((prev) => {
        const next = { ...prev }
        if (next[key]) URL.revokeObjectURL(next[key])
        delete next[key]
        return next
      })
      return { ...prev, [stepId]: newItems }
    })
  }

  const updateSqft = (stepId: string, index: number, value: string, dimensionId: string) => {
    setCombinedItems((prev) => {
      const current = prev[stepId] || [{ photo: null, sqft: '' }]
      const newItems = current.map((item, i) => (i === index ? { ...item, sqft: value } : item))
      const total = newItems.reduce((acc, item) => acc + (parseFloat(item.sqft) || 0), 0)
      setAnswers((a) => ({ ...a, [dimensionId]: total > 0 ? total.toString() : '' }))
      return { ...prev, [stepId]: newItems }
    })
  }

  const updatePhoto = (stepId: string, index: number, file: File | null) => {
    setCombinedItems((prev) => {
      const current = prev[stepId] || [{ photo: null, sqft: '' }]
      return {
        ...prev,
        [stepId]: current.map((item, i) => (i === index ? { ...item, photo: file } : item)),
      }
    })
    const key = `${stepId}-${index}`
    setThumbUrls((prev) => {
      const next = { ...prev }
      if (next[key]) URL.revokeObjectURL(next[key])
      if (file) next[key] = URL.createObjectURL(file)
      else delete next[key]
      return next
    })
    if (file) setUploadedFiles((prev) => [...prev, file])
  }

  const clearRowPhoto = (stepId: string, index: number, _dimensionId: string) => {
    updatePhoto(stepId, index, null)
  }

  // ─── Dynamic Steps ───────────────────────────────────────────────────────────

  const getDynamicSteps = () => {
    const stepsList: any[] = []
    const multiService =
      [answers.services.drywall, answers.services.paint, answers.services.trim].filter(Boolean)
        .length > 1

    // ── 1. Drywall ──────────────────────────────────────────────────────────────
    if (answers.services.drywall) {
      if (multiService) {
        stepsList.push({
          id: 'section_intro_drywall',
          type: 'section_intro',
          icon: '🧱',
          label: 'Drywall Services',
          description: "Let's start with your drywall requirements — areas, demolition, texture & more.",
          color: '#f97316',
        })
      }

      stepsList.push({
        id: 'drywall_area',
        title: 'What area needs drywall?',
        subtitle: 'Please add all areas. (Allow multiple selections)',
        type: 'checkbox',
        options: [
          'Walls — ½"',
          'Ceiling — 5/8"',
          'Bathroom walls — Greenboard ½"',
          'Bathroom ceiling — Greenboard 5/8"',
        ],
      })

      const selectedAreas: string[] = Array.isArray(answers.drywall_area)
        ? answers.drywall_area
        : answers.drywall_area
          ? [answers.drywall_area]
          : []

      if (selectedAreas.some((a) => a.startsWith('Walls'))) {
        stepsList.push({
          id: 'drywall_wall',
          title: 'Wall drywall — How many sqft & photos?',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_wall_sqft', placeholder: 'e.g. 200' },
            photo: { id: 'drywall_wall_photo', title: 'Wall photos' },
          },
        })
      }
      if (selectedAreas.some((a) => a.startsWith('Ceiling'))) {
        stepsList.push({
          id: 'drywall_ceiling',
          title: 'Ceiling drywall — How many sqft & photos?',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_ceiling_sqft', placeholder: 'e.g. 150' },
            photo: { id: 'drywall_ceiling_photo', title: 'Ceiling photos' },
          },
        })
      }
      if (selectedAreas.some((a) => a.startsWith('Bathroom walls'))) {
        stepsList.push({
          id: 'drywall_bathroom_wall',
          title: 'Bathroom wall drywall — How many sqft & photos?',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_bathroom_wall_sqft', placeholder: 'e.g. 80' },
            photo: { id: 'drywall_bathroom_wall_photo', title: 'Bathroom wall photos' },
          },
        })
      }
      if (selectedAreas.some((a) => a.startsWith('Bathroom ceiling'))) {
        stepsList.push({
          id: 'drywall_bathroom_ceiling',
          title: 'Bathroom ceiling drywall — How many sqft & photos?',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_bathroom_ceiling_sqft', placeholder: 'e.g. 50' },
            photo: { id: 'drywall_bathroom_ceiling_photo', title: 'Bathroom ceiling photos' },
          },
        })
      }

      stepsList.push({
        id: 'drywall_demolition',
        title: 'Do you need demolition?',
        type: 'checkbox',
        options: [
          'No Demo Needed',
          'Remove Existing Wall Drywall',
          'Remove Existing Ceiling Drywall',
          'Remove Insulation (sqft)',
          'Remove Base Board (linear ft)',
          'Remove Popcorn Ceiling',
        ],
      })

      const demo: string[] = Array.isArray(answers.drywall_demolition)
        ? answers.drywall_demolition
        : answers.drywall_demolition
          ? [answers.drywall_demolition]
          : []

      const demoRequireDimensions = demo.filter((d) => d !== 'No Demo Needed')
      if (demoRequireDimensions.length > 0) {
        stepsList.push({
          id: 'drywall_demolition_details',
          title: 'Demolition Details — Provide amounts for selected items',
          type: 'demolition_combined',
          options: demoRequireDimensions,
        })
      }

      stepsList.push({
        id: 'drywall_has_soffits',
        title: 'Do you have any Soffits?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      if (answers.drywall_has_soffits === 'Yes') {
        stepsList.push({
          id: 'drywall_soffits',
          title: 'Soffits — Sqft & photos',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_soffits_sqft', placeholder: 'e.g. 40' },
            photo: { id: 'drywall_soffits_photos', title: 'Soffit photos' },
          },
        })
      }

      const hasWallArea = selectedAreas.some(
        (a) => a.startsWith('Walls') || a.startsWith('Bathroom walls')
      )
      const hasCeilingArea = selectedAreas.some(
        (a) => a.startsWith('Ceiling') || a.startsWith('Bathroom ceiling')
      )

      if (hasCeilingArea) {
        stepsList.push({
          id: 'ceiling_height',
          title: 'Ceiling height > 8ft?',
          type: 'yesno_combined',
          fields: { yes: { id: 'ceiling_height_specify', title: 'Specify height (ft)', placeholder: 'e.g. 10' } },
          options: ['Yes', 'No'],
        })
      }

      if (hasCeilingArea) {
        stepsList.push({
          id: 'drywall_vaulted_ceiling',
          title: 'Vaulted ceiling? (Provide dimensions if Yes)',
          type: 'yesno_combined',
          fields: { yes: { id: 'drywall_vaulted_dimensions', title: 'Vaulted dimensions' } },
          options: ['Yes', 'No'],
        })
      }

      if (hasWallArea || hasCeilingArea) {
        stepsList.push({
          id: 'drywall_insulation',
          title: 'Do you need Insulation?',
          subtitle:
            hasWallArea && hasCeilingArea
              ? 'Wall insulation — R13 | Ceiling insulation — R19'
              : hasWallArea
                ? 'Wall insulation — R13'
                : 'Ceiling insulation — R19',
          type: 'radio',
          options: ['Yes', 'No'],
        })
      }

      stepsList.push({
        id: 'drywall_corner_metal',
        title: 'Do you need any corner metals?',
        type: 'checkbox',
        options: [
          'No Corner Metal Needed',
          'Standard 90 Degree Corner Metal',
          'Bullnose Corner Metal',
          'Arch Standard 90 Degree Corner Metal',
          'Arch Bullnose Corner Metal',
        ],
      })

      const cornerMetals: string[] = Array.isArray(answers.drywall_corner_metal)
        ? answers.drywall_corner_metal
        : answers.drywall_corner_metal
          ? [answers.drywall_corner_metal]
          : []
      const needsCorners = cornerMetals.some((c) => c !== 'No Corner Metal Needed')

      if (needsCorners) {
        stepsList.push({
          id: 'drywall_corner_count',
          title: 'How many Corners?',
          type: 'text',
          placeholder: 'e.g. 4',
        })
        const needsLength =
          cornerMetals.includes('Standard 90 Degree Corner Metal') ||
          cornerMetals.includes('Bullnose Corner Metal')
        if (needsLength) {
          stepsList.push({
            id: 'drywall_corner_length',
            title: 'What is the length of corner metal?',
            type: 'radio',
            options: ['8ft', '10ft', 'Other'],
          })
        }
      }

      stepsList.push({
        id: 'drywall_texture',
        title: 'What texture/finish do you want?',
        type: 'radio',
        options: ['Smooth Finish', 'Orange Peel', 'Knock Down', 'Match Existing Texture'],
      })

      if (answers.drywall_texture === 'Match Existing Texture') {
        stepsList.push({
          id: 'drywall_texture_photo',
          title: 'Please add a photo of the existing texture',
          type: 'photo_upload',
        })
      }
    }

    // ── 2. Paint ────────────────────────────────────────────────────────────────
    if (answers.services.paint) {
      if (multiService) {
        stepsList.push({
          id: 'section_intro_paint',
          type: 'section_intro',
          icon: '🎨',
          label: 'Painting Services',
          description: "Great! Now let's cover your painting needs — areas, trim, paint supply & more.",
          color: '#6366f1',
        })
      }

      // // ── Photo reuse question (only when drywall already collected photos) ──
      // if (answers.services.drywall) {
      //   stepsList.push({
      //     id: 'paint_new_photos_needed',
      //     title: 'Do you have new photos to share for painting?',
      //     subtitle: 'The photos you already shared for drywall will be used. Let us know if you have additional ones.',
      //     type: 'radio',
      //     options: ['Yes, I have new photos to add', 'No, use the photos already shared'],
      //   })
      // }

      // stepsList.push({
      //   id: 'paint_primer',
      //   title: 'Would you like primer before paint?',
      //   type: 'radio',
      //   options: ['Yes', 'No'],
      // })

      stepsList.push({
        id: 'paint_area',
        title: 'What area needs paint?',
        subtitle: 'Please add all areas. (Allow multiple selection)',
        type: 'checkbox',
        options: ['Wall', 'Ceiling', 'Bath ceiling', 'Bath wall'],
      })

      // ── Paint type: Corner to corner vs Touch ups ──
      stepsList.push({
        id: 'paint_type',
        title: 'Would you like corner to corner painting or just touch ups?',
        type: 'radio',
        options: ['Corner to corner', 'Touch ups'],
        warningCondition: 'Touch ups',
        warningMessage: 'Touch-ups can only be possible if you already have the paint for this area. We cannot match existing paint.',
      })

      // ── Has paint already (only if corner to corner) ──
      if (answers.paint_type === 'Corner to corner') {
        stepsList.push({
          id: 'paint_has_paint',
          title: 'Do you have the paint already to paint corner to corner for your project?',
          type: 'radio',
          options: ['Yes', 'No'],
          warningCondition: 'No',
          warningMessage: 'Please select from the HD paint options and we will include the correct amount of paint in your proposal based on the info you have entered above.',
        })
      }

      const selectedPaintAreas: string[] = Array.isArray(answers.paint_area)
        ? answers.paint_area
        : answers.paint_area
          ? [answers.paint_area]
          : []

      if (selectedPaintAreas.includes('Wall')) {
        stepsList.push({
          id: 'paint_wall',
          title: 'Wall — Sqft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_wall_sqft', placeholder: 'e.g. 200' },
            photo: { id: 'paint_wall_photo', title: 'Wall photo' },
          },
        })
      }
      if (selectedPaintAreas.includes('Ceiling')) {
        stepsList.push({
          id: 'paint_ceiling',
          title: 'Ceiling — Sqft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_ceiling_sqft', placeholder: 'e.g. 150' },
            photo: { id: 'paint_ceiling_photo', title: 'Ceiling photo' },
          },
        })
      }
      if (selectedPaintAreas.includes('Bath ceiling')) {
        stepsList.push({
          id: 'paint_bath_ceiling',
          title: 'Bath ceiling — Sqft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_bath_ceiling_sqft', placeholder: 'e.g. 50' },
            photo: { id: 'paint_bath_ceiling_photo', title: 'Bath ceiling photo' },
          },
        })
      }
      if (selectedPaintAreas.includes('Bath wall')) {
        stepsList.push({
          id: 'paint_bath_wall',
          title: 'Bath wall — Sqft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_bath_wall_sqft', placeholder: 'e.g. 100' },
            photo: { id: 'paint_bath_wall_photo', title: 'Bath wall photo' },
          },
        })
      }

      stepsList.push({
        id: 'paint_trim_area',
        title: 'What trim and baseboards need painting?',
        subtitle: 'Allow multiple selection',
        type: 'checkbox',
        options: ['Trim', 'Baseboards'],
      })

      const selectedTrimAreas: string[] = Array.isArray(answers.paint_trim_area)
        ? answers.paint_trim_area
        : answers.paint_trim_area
          ? [answers.paint_trim_area]
          : []

      if (selectedTrimAreas.includes('Trim')) {
        stepsList.push({
          id: 'paint_trim',
          title: 'Trim — Linear ft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_trim_linear_ft', placeholder: 'e.g. 50' },
            photo: { id: 'paint_trim_photo', title: 'Trim photo' },
          },
        })
      }
      if (selectedTrimAreas.includes('Baseboards')) {
        stepsList.push({
          id: 'paint_baseboards',
          title: 'Baseboards — Linear ft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_baseboards_linear_ft', placeholder: 'e.g. 100' },
            photo: { id: 'paint_baseboards_photo', title: 'Baseboards photo' },
          },
        })
      }

      stepsList.push({
        id: 'paint_ceiling_height_over_8ft',
        title: 'Is paint ceiling height > 8ft?',
        type: 'yesno_combined',
        fields: { yes: { id: 'paint_ceiling_height', title: 'Specify height (ft)', placeholder: 'e.g. 10' } },
        options: ['Yes', 'No'],
      })

      stepsList.push({
        id: 'paint_customer_providing',
        title: 'Will you be providing paint?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      if (answers.paint_customer_providing === 'No') {
        stepsList.push({
          id: 'paint_contractor_providing',
          title: 'Would you like us to get the paint for you?',
          type: 'radio',
          options: ['Yes', 'No'],
        })

        if (answers.paint_contractor_providing === 'Yes') {
          stepsList.push({
            id: 'paint_match_existing',
            title: 'Would you like us to match your existing color? Note this will not be a 100% color match.',
            type: 'radio',
            options: ['Yes', 'No'],
          })
          stepsList.push({
            id: 'paint_brand_color',
            title: 'Can you share  the skew for the exact match?',
            type: 'text',
            placeholder: 'e.g. Sherwin Williams Alabaster',
          })
          stepsList.push({
            id: 'paint_sku_photo',
            title: 'Can you share pictures of the paint sku?',
            type: 'photo_upload',
          })
        }
      }

      const isPaintContinuing =
        answers.paint_customer_providing === 'Yes' ||
        (answers.paint_customer_providing === 'No' && answers.paint_contractor_providing === 'No')

      if (isPaintContinuing) {
        stepsList.push({
          id: 'paint_additional_info',
          title: 'Do you have any other information that you would like to share?',
          type: 'textarea',
          placeholder: 'Any additional details about the paint...',
        })
      }

      // stepsList.push({
      //   id: 'paint_dimensions_pane',
      //   title: 'Please provide dimensions of the room',
      //   type: 'dimensions_optional',
      // })

      // Only show standalone photo upload for paint if drywall is NOT selected
      // (if drywall is selected we already asked paint_new_photos_needed above,
      //  and only show upload if they answered "Yes")
      if (!answers.services.drywall) {
        stepsList.push({
          id: 'paint_photo',
          title: 'Upload work photo to drive:',
          type: 'photo_upload',
        })
      } else if (answers.paint_new_photos_needed === 'Yes, I have new photos to add') {
        stepsList.push({
          id: 'paint_photo',
          title: 'Upload your additional paint photos:',
          type: 'photo_upload',
        })
      }
    }

    // ── 3. Trim ─────────────────────────────────────────────────────────────────
    if (answers.services.trim) {
      if (multiService) {
        stepsList.push({
          id: 'section_intro_trim',
          type: 'section_intro',
          icon: '🪵',
          label: 'Trim & Baseboard',
          description: "Almost there! Finally, let's go through your trim and baseboard requirements.",
          color: '#10b981',
        })
      }

      // ── Photo reuse question (only when previous services already collected photos) ──
      if (answers.services.drywall || answers.services.paint) {
        stepsList.push({
          id: 'trim_new_photos_needed',
          title: 'Do you have new photos to share for trim & baseboard?',
          subtitle: 'Photos already shared will be used. Let us know if you have additional ones to add.',
          type: 'radio',
          options: ['Yes, I have new photos to add', 'No, use the photos already shared'],
        })
      }

      stepsList.push({
        id: 'trim_services',
        title: 'What service do you need?',
        type: 'checkbox',
        options: ['Install New Baseboards', 'Replace Existing Baseboards'],
      })

      stepsList.push({
        id: 'trim_baseboard',
        title: 'Baseboard height and photos',
        subtitle: 'If over 6" please share what size',
        type: 'combined',
        fields: {
          dimension: { id: 'trim_baseboard_height', placeholder: 'e.g. 4 inch' },
          photo: { id: 'trim_baseboard_photo', title: 'Baseboard photos' },
        },
      })

      stepsList.push({
        id: 'trim_base_material',
        title: 'What material is your base?',
        type: 'checkbox_with_input',
        options: ['MDF', 'Real wood'],
        inputField: { id: 'trim_base_linear_feet', label: 'Linear feet', placeholder: 'linear feet' },
      })

      stepsList.push({ id: 'trim_base_primed', title: 'Is it primed already?', type: 'radio', options: ['Yes', 'No'] })
      stepsList.push({ id: 'trim_casing_material', title: 'What material is your Casing?', type: 'checkbox', options: ['MDF', 'Real wood'] })
      stepsList.push({ id: 'trim_casing', title: 'Door casing do you have', type: 'radio', options: ['3"', '4"', '5"', '6"', 'Other'] })

      stepsList.push({
        id: 'trim_casing_combined',
        title: 'Casing — Photo & Linear Ft',
        type: 'combined',
        fields: {
          dimension: { id: 'trim_casing_linear_feet', placeholder: 'e.g. 50' },
          photo: { id: 'trim_casing_photo', title: 'Casing photos' },
        },
      })

      stepsList.push({ id: 'trim_casing_primed', title: 'Is it primed all already?', type: 'radio', options: ['Yes', 'No'] })
      stepsList.push({
        id: 'trim_knows_price',
        title: 'Do you know what the price per linear foot is for your base, or casing?',
        type: 'radio',
        options: ['Yes', 'No'],
      })

      if (answers.trim_knows_price === 'Yes') {
        stepsList.push({
          id: 'trim_prices',
          title: 'Enter linear price for Base & Casing',
          type: 'price_pair',
          fields: {
            base: { id: 'trim_base_price', label: 'Base ($/linear ft)', placeholder: 'e.g. 5.00' },
            casing: { id: 'trim_casing_price', label: 'Casing ($/linear ft)', placeholder: 'e.g. 5.00' },
          },
        })
      }

      if (answers.trim_knows_price === 'No') {
        stepsList.push({
          id: 'trim_search_fee_ok',
          title: 'Are you ok with a $50 an hour fee for searching for your trim?',
          type: 'radio',
          options: ['Yes', 'No'],
          warningCondition: 'No',
          warningMessage: 'Please Provide Trim details before work starts.',
        })
      }

      // Only show photo upload if they said they have new ones (or no prior service)
      if (!answers.services.drywall && !answers.services.paint) {
        stepsList.push({ id: 'trim_photo', title: 'Upload work photo to drive:', type: 'photo_upload' })
      } else if (answers.trim_new_photos_needed === 'Yes, I have new photos to add') {
        stepsList.push({ id: 'trim_photo', title: 'Upload your additional trim photos:', type: 'photo_upload' })
      }
    }

    // ── Common end questions ────────────────────────────────────────────────────
    stepsList.push({
      id: 'is_occupied',
      title: 'Is the room currently occupied or does it have furniture?',
      type: 'radio',
      options: ['Yes', 'No'],
      warningCondition: 'Yes',
      warningMessage: 'Have all furniture removed before work starts',
    })

    stepsList.push({
      id: 'additional_info',
      title: 'Additional request?',
      type: 'textarea',
      placeholder: 'Any additional details...',
    })

    stepsList.push({ id: 'contact_info_pane', title: 'Additional info', type: 'contact_info_optional' })

    return stepsList
  }

  const dynamicSteps = getDynamicSteps()
  const totalSteps = 1 + dynamicSteps.length
  const isLastStep = currentStepIndex === totalSteps - 1

  // ─── Validation ──────────────────────────────────────────────────────────────

  const isStepValid = () => {
    if (currentStepIndex === 0) {
      return answers.services.drywall || answers.services.paint || answers.services.trim
    }
    const step = dynamicSteps[currentStepIndex - 1]
    if (!step) return false

    const autoValid = [
      'dimensions_optional', 'contact_info_optional', 'photo_upload',
      'section_intro', 'combined', 'demolition_combined', 'yesno_combined',
    ]
    if (autoValid.includes(step.type)) return true
    if (step.id === 'additional_info') return true

    if (step.type === 'price_pair') {
      return (
        (answers[step.fields.base.id] || '').trim() !== '' &&
        (answers[step.fields.casing.id] || '').trim() !== ''
      )
    }
    if (step.type === 'checkbox') {
      const val = answers[step.id]
      const arr = Array.isArray(val) ? val : val ? [val] : []
      return arr.length > 0
    }
    const val = answers[step.id]
    if (step.type === 'radio') return val !== undefined && val !== ''
    if (step.type === 'text' || step.type === 'number' || step.type === 'textarea') {
      return val !== undefined && String(val).trim() !== ''
    }
    return true
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────

  const handleNext = () => { if (isStepValid()) setCurrentStepIndex((p) => p + 1) }
  const handlePrev = () => { setCurrentStepIndex((p) => Math.max(0, p - 1)) }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const generateThumbnails = async (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const img = new Image()
              img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_SIZE = 400
                let width = img.width
                let height = img.height
                if (width > height) {
                  if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width
                    width = MAX_SIZE
                  }
                } else {
                  if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height
                    height = MAX_SIZE
                  }
                }
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)
                resolve(canvas.toDataURL('image/jpeg', 0.7))
              }
              img.src = e.target?.result as string
            }
            reader.readAsDataURL(file)
          })
      )
    )
  }

  const handleSubmit = async () => {
    if (!isStepValid()) return
    
    // Generate thumbnails before storing in localStorage
    const thumbnails = uploadedFiles.length > 0 ? await generateThumbnails(uploadedFiles) : []

    const enrichedAnswers = {
      ...answers,
      has_photos: uploadedFiles.length > 0 ? 'Yes' : 'No',
      services: {
        ...answers.services,
        electrical: !!(answers.electrical_services && answers.electrical_services !== 'none'),
      },
    }
    const result = calculateEstimate(enrichedAnswers)
    setEstimate(result)
    try {
      localStorage.setItem('fcd_estimate_data', JSON.stringify({ answers: enrichedAnswers, estimate: result, thumbnails }))
    } catch (e) {
      console.error('Failed to store estimate in localStorage', e)
    }
    if (uploadedFiles.length === 0) {
      window.open('/estimate', '_blank')
      return
    }
    const newTab = window.open('about:blank', '_blank')
    if (newTab) {
      newTab.document.write(
        '<html><head><title>Loading...</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#334155;"><h3>Uploading Photos & Generating Quote...</h3></body></html>'
      )
    }
    setIsUploading(true)
    try {
      const uploadResult = await uploadFilesToDrive(uploadedFiles)
      console.log('Photos uploaded to Drive folder:', uploadResult.folderCreated)
    } catch (err) {
      console.error('Photo upload failed:', err)
    } finally {
      setIsUploading(false)
      if (newTab) newTab.location.href = '/estimate'
      else window.location.href = '/estimate'
    }
  }

  // ─── Success screen ───────────────────────────────────────────────────────────

  if (estimate) {
    return (
      <div className="estimate-wizard-card success-wizard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px 30px', gap: '24px', minHeight: '480px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(47,174,255,0.1)', display: 'grid', placeItems: 'center', fontSize: '2.2rem', color: 'var(--blue)' }}>🎉</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 0 }}>Your Estimate is Ready!</h3>
        <div style={{ width: '100%', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {answers.services.drywall && <span style={{ background: 'var(--blue)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Drywall Services</span>}
            {answers.services.paint && <span style={{ background: 'var(--blue)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Painting Services</span>}
            {answers.services.trim && <span style={{ background: 'var(--blue)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Trim &amp; Baseboard</span>}
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Total</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--blue)', lineHeight: '1.1' }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(estimate.grandTotal)}
            </div>
          </div>
          {estimate.isPendingReview && (
            <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#b45309', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              ⚠️ This estimate includes items requiring on-site confirmation. Final price may vary.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Estimated Duration</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                {estimate.grandTotal <= 1500 ? '1 day' : estimate.grandTotal <= 3000 ? '2–3 days' : estimate.grandTotal <= 6000 ? '3–5 days' : estimate.grandTotal <= 10000 ? '1–2 weeks' : '2+ weeks'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Deposit Required (30%)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Math.round(estimate.grandTotal * 0.3))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <button type="button" className="btn btn-blue" onClick={() => navigate('/estimate')} style={{ width: '100%', padding: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
            View Detailed Estimate 📄
          </button>
          <button type="button" className="btn btn-glass" onClick={() => { setEstimate(null); setCurrentStepIndex(0) }} style={{ width: '100%', padding: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: '#000', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)' }}>
            ← Back / Edit Answers
          </button>
        </div>
      </div>
    )
  }

  // ─── Wizard UI ───────────────────────────────────────────────────────────────
  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset the entire form? All your answers will be lost.')) {
      setAnswers(initialAnswers)
      setCombinedItems({})
      setThumbUrls({})
      setUploadedFiles([])
      setCurrentStepIndex(0)
      setEstimate(null)
      localStorage.removeItem('fcd_estimate_data')
    }
  }

  const currentStep = dynamicSteps[currentStepIndex - 1]

  // Shared button styles for camera/gallery buttons
  const camBtnStyle: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', padding: '10px 8px', border: '1.5px solid var(--blue)',
    borderRadius: '8px', cursor: 'pointer', background: 'rgba(47,174,255,0.08)',
    fontSize: '0.82rem', fontWeight: 700, color: 'var(--blue)', whiteSpace: 'nowrap',
  }
  const uploadBtnStyle: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', padding: '10px 8px', border: '1.5px dashed #94a3b8',
    borderRadius: '8px', cursor: 'pointer', background: 'rgba(0,0,0,0.02)',
    fontSize: '0.82rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap',
  }

  return (
    <div className="estimate-wizard-card">

      {/*
        ─── STABLE HIDDEN INPUTS ───────────────────────────────────────────────
        Mounted ONCE at root, never inside a conditional or .map().
        This is the key fix for iOS camera refresh bug — the DOM nodes
        stay alive across re-renders so the camera can return safely.
      */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCameraChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleGalleryChange}
      />

      <div className="wizard-header">
        <h3>Estimate Calculator</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button" 
            onClick={handleResetForm}
            style={{
              background: 'transparent',
              border: '1px solid #ef4444',
              color: '#ef4444',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Clear all answers and start over"
          >
            Reset Form
          </button>
          <span className="step-indicator">Step {currentStepIndex + 1} of {totalSteps}</span>
        </div>
      </div>

      <div className="wizard-progress-bar">
        <div className="wizard-progress-fill" style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }} />
      </div>

      <div className="wizard-content">

        {/* ── Step 0: Service selection ─────────────────────────────────────────── */}
        {currentStepIndex === 0 && (
          <div className="wizard-step-pane active">
            <h4 className="wizard-step-title">What services do you need?</h4>
            <p className="wizard-step-subtitle">Select all services that apply to your project.</p>
            <div className="services-selection-grid">
              {([
                { key: 'drywall', icon: '🧱', label: 'Drywall Services', sub: 'Hanging, taping, patchwork & repair' },
                { key: 'paint', icon: '🎨', label: 'Painting Services', sub: 'Surface preparation, touch-ups & painting' },
                { key: 'trim', icon: '🪵', label: 'Trim & Baseboard', sub: 'Installation and painting services' },
              ] as const).map(({ key, icon, label, sub }) => (
                <button
                  key={key}
                  type="button"
                  className={`service-select-card${answers.services[key] ? ' selected' : ''}`}
                  onClick={() => handleServiceToggle(key)}
                >
                  <span className="service-card-icon">{icon}</span>
                  <div className="service-card-text">
                    <strong>{label}</strong>
                    <span>{sub}</span>
                  </div>
                  <div className="custom-checkbox">
                    {answers.services[key] && <span className="checkmark">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Dynamic steps ─────────────────────────────────────────────────────── */}
        {currentStepIndex >= 1 && currentStep && (
          <div className="wizard-step-pane active">

            {/* Section intro */}
            {currentStep.type === 'section_intro' && (() => {
              const allServices = (
                [answers.services.drywall && 'Drywall', answers.services.paint && 'Painting', answers.services.trim && 'Trim'] as (string | false)[]
              ).filter(Boolean) as string[]
              const currentIdx = allServices.findIndex((_, i) => {
                if (currentStep.id === 'section_intro_drywall') return allServices[i] === 'Drywall'
                if (currentStep.id === 'section_intro_paint') return allServices[i] === 'Painting'
                return allServices[i] === 'Trim'
              })
              const colors: Record<string, string> = { section_intro_drywall: '#f97316', section_intro_paint: '#6366f1', section_intro_trim: '#10b981' }
              const color = colors[currentStep.id] || currentStep.color
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {allServices.map((svc, i) => (
                      <span key={svc} style={{ padding: '4px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: i === currentIdx ? color : 'rgba(148,163,184,0.15)', color: i === currentIdx ? '#fff' : '#94a3b8', border: `1.5px solid ${i === currentIdx ? color : 'rgba(148,163,184,0.25)'}` }}>
                        {i < currentIdx ? '✓ ' : ''}{svc}
                      </span>
                    ))}
                  </div>
                  <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}22, ${color}44)`, border: `3px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.6rem', marginBottom: '20px', boxShadow: `0 0 32px ${color}33` }}>
                    {currentStep.icon}
                  </div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)' }}>{currentStep.label}</h3>
                  <p style={{ margin: '0 0 28px', fontSize: '0.95rem', color: 'var(--text-secondary, #64748b)', maxWidth: '340px', lineHeight: 1.6 }}>{currentStep.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '280px' }}>
                    <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${color}55)` }} />
                    <span style={{ fontSize: '0.78rem', color, fontWeight: 600, whiteSpace: 'nowrap' }}>Section {currentIdx + 1} of {allServices.length}</span>
                    <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${color}55)` }} />
                  </div>
                </div>
              )
            })()}

            {/* All non-intro step content */}
            {currentStep.type !== 'section_intro' && (
              <>
                <h4 className="wizard-step-title">{currentStep.title}</h4>
                {currentStep.subtitle && <p className="wizard-step-subtitle">{currentStep.subtitle}</p>}

                <div className="dynamic-input-container">

                  {/* Radio */}
                  {currentStep.type === 'radio' && (
                    <>
                      <div className="radio-options-list">
                        {currentStep.options?.map((option: string) => {
                          const isSelected = answers[currentStep.id] === option || (option === 'Other' && answers[currentStep.id]?.startsWith('Other:'))
                          return (
                            <div key={option} className="radio-option-card-wrapper">
                              <button
                                type="button"
                                className={`radio-option-card${isSelected ? ' selected' : ''}`}
                                onClick={() => handleOptionSelect(currentStep.id, option === 'Other' ? 'Other: ' : option)}
                              >
                                <span className="radio-indicator">{isSelected && <span className="radio-dot" />}</span>
                                <span className="radio-label-text">{option}</span>
                              </button>
                              {option === 'Other' && isSelected && (
                                <div className="other-input-container">
                                  <input
                                    type="text"
                                    className="theme-text-input other-text-input"
                                    placeholder="Please specify..."
                                    value={answers[currentStep.id]?.replace('Other: ', '') || ''}
                                    onChange={(e) => handleOptionSelect(currentStep.id, `Other: ${e.target.value}`)}
                                    autoFocus
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {currentStep.warningCondition && answers[currentStep.id] === currentStep.warningCondition && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '8px', color: '#b45309', fontSize: '0.9rem', fontWeight: 600 }}>
                          ⚠️ {currentStep.warningMessage}
                        </div>
                      )}
                    </>
                  )}

                  {/* Checkbox */}
                  {currentStep.type === 'checkbox' && (
                    <div className="radio-options-list">
                      {currentStep.options?.map((option: string) => {
                        const currentVals = Array.isArray(answers[currentStep.id]) ? answers[currentStep.id] : answers[currentStep.id] ? [answers[currentStep.id]] : []
                        const isSelected = currentVals.includes(option)
                        return (
                          <button
                            key={option}
                            type="button"
                            className={`radio-option-card${isSelected ? ' selected' : ''}`}
                            onClick={() => {
                              setAnswers((prev) => {
                                const prevVals = Array.isArray(prev[currentStep.id]) ? prev[currentStep.id] : prev[currentStep.id] ? [prev[currentStep.id]] : []
                                const newVals = isSelected ? prevVals.filter((v: string) => v !== option) : [...prevVals, option]
                                return { ...prev, [currentStep.id]: newVals }
                              })
                            }}
                          >
                            <div className="custom-checkbox" style={{ marginRight: '12px' }}>
                              {isSelected && <span className="checkmark">✓</span>}
                            </div>
                            <span className="radio-label-text">{option}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Text / Number */}
                  {(currentStep.type === 'text' || currentStep.type === 'number') && (
                    <div className="input-group">
                      <input
                        type={currentStep.type}
                        className="theme-text-input"
                        placeholder={currentStep.placeholder || 'Type your answer here...'}
                        value={answers[currentStep.id] || ''}
                        onChange={(e) => handleTextChange(currentStep.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* Textarea */}
                  {currentStep.type === 'textarea' && (
                    <div className="input-group">
                      <textarea
                        className="theme-textarea"
                        rows={4}
                        placeholder={currentStep.placeholder || 'Provide additional details here...'}
                        value={answers[currentStep.id] || ''}
                        onChange={(e) => handleTextChange(currentStep.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* Dimensions */}
                  {(currentStep.type === 'dimensions_and_address' || currentStep.type === 'dimensions_optional') && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '15px' }}>
                        {[
                          { id: 'length', label: 'Room Length (ft)', placeholder: 'e.g. 15' },
                          { id: 'width', label: 'Room Width (ft)', placeholder: 'e.g. 12' },
                          { id: 'height', label: 'Ceiling Height (ft)', placeholder: 'e.g. 9' },
                        ].map((f) => (
                          <div key={f.id} className="input-group">
                            <label htmlFor={f.id} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>{f.label}</label>
                            <input id={f.id} type="number" placeholder={f.placeholder} value={(answers as any)[f.id]} onChange={(e) => handleTextChange(f.id, e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                          </div>
                        ))}
                      </div>
                      {currentStep.type === 'dimensions_and_address' && (
                        <div className="input-group" style={{ marginTop: '12px' }}>
                          <label htmlFor="address" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Project Address</label>
                          <input id="address" type="text" placeholder="Street Address, City, State, ZIP" value={answers.address} onChange={(e) => handleTextChange('address', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checkbox with inline input */}
                  {currentStep.type === 'checkbox_with_input' && (
                    <div>
                      <div className="radio-options-list">
                        {currentStep.options?.map((option: string) => {
                          const currentVals = Array.isArray(answers[currentStep.id]) ? answers[currentStep.id] : answers[currentStep.id] ? [answers[currentStep.id]] : []
                          const isSelected = currentVals.includes(option)
                          return (
                            <button
                              key={option}
                              type="button"
                              className={`radio-option-card${isSelected ? ' selected' : ''}`}
                              onClick={() => {
                                setAnswers((prev) => {
                                  const prevVals = Array.isArray(prev[currentStep.id]) ? prev[currentStep.id] : prev[currentStep.id] ? [prev[currentStep.id]] : []
                                  const newVals = isSelected ? prevVals.filter((v: string) => v !== option) : [...prevVals, option]
                                  return { ...prev, [currentStep.id]: newVals }
                                })
                              }}
                            >
                              <div className="custom-checkbox" style={{ marginRight: '12px' }}>
                                {isSelected && <span className="checkmark">✓</span>}
                              </div>
                              <span className="radio-label-text">{option}</span>
                            </button>
                          )
                        })}
                      </div>
                      {(() => {
                        const currentVals = Array.isArray(answers[currentStep.id]) ? answers[currentStep.id] : answers[currentStep.id] ? [answers[currentStep.id]] : []
                        const inputField = currentStep.inputField
                        if (currentVals.length > 0 && inputField) {
                          return (
                            <div className="input-group" style={{ marginTop: '16px' }}>
                              <label htmlFor={inputField.id} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>{inputField.label}</label>
                              <input id={inputField.id} type="text" className="theme-text-input" placeholder={inputField.placeholder} value={answers[inputField.id] || ''} onChange={(e) => handleTextChange(inputField.id, e.target.value)} />
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}

                  {/* Contact info */}
                  {currentStep.type === 'contact_info_optional' && (
                    <div>
                      {[
                        { id: 'contact_name', label: 'Full Name', type: 'text', placeholder: 'Your Name' },
                        { id: 'contact_phone', label: 'Phone Number', type: 'text', placeholder: 'Your Phone Number' },
                        { id: 'contact_email', label: 'Email Address', type: 'email', placeholder: 'Your Email' },
                        { id: 'contact_address', label: 'Project Address', type: 'text', placeholder: 'Street Address, City, State, ZIP' },
                      ].map((f) => (
                        <div key={f.id} className="input-group" style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>{f.label}</label>
                          <input type={f.type} placeholder={f.placeholder} value={answers[f.id] || ''} onChange={(e) => handleTextChange(f.id, e.target.value)} className="theme-text-input" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Photo upload (camera + upload via stable refs) ── */}
                  {currentStep.type === 'photo_upload' && (
                    <div style={{ background: 'rgba(47,174,255,0.04)', border: '1px dashed var(--blue)', borderRadius: '12px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '2.5rem' }}>📸</span>
                      <h5 style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Add Photos</h5>
                      <p style={{ fontSize: '0.85rem', color: '#667085', margin: 0, lineHeight: '1.4' }}>
                        Take a photo directly or upload from your device (optional).
                      </p>

                      {/* Two-button row — calls stable refs, no label/input pairing */}
                      <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '320px' }}>
                        <button type="button" style={{ ...camBtnStyle, background: 'var(--blue)', color: '#fff', border: '1.5px solid var(--blue)' }} onClick={openGlobalCamera}>
                          📷 Take Photo
                        </button>
                        <button type="button" style={{ ...uploadBtnStyle }} onClick={openGlobalGallery}>
                          📂 Upload File
                        </button>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div style={{ width: '100%', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected:
                          </span>
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem' }}>
                              <span style={{ color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{file.name}</span>
                              <button type="button" onClick={() => removeFile(idx)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Photos will be uploaded when you submit the estimate.</span>
                    </div>
                  )}

                  {/* ── Combined dimension + photo (stable ref camera, thumbnail preview) ── */}
                  {currentStep.type === 'combined' && currentStep.fields?.dimension && currentStep.fields?.photo && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 40px', gap: '10px', fontWeight: 700, fontSize: '0.82rem', color: '#334155' }}>
                        <div>Photo</div>
                        <div>{currentStep.fields.dimension.placeholder?.includes('inch') ? 'Height' : 'Sq Ft / Linear Ft'}</div>
                        <div />
                      </div>

                      {getStepItems(currentStep.id).map((item, index) => {
                        const thumbKey = `${currentStep.id}-${index}`
                        const thumbUrl = thumbUrls[thumbKey]
                        return (
                          <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 40px', gap: '10px', alignItems: 'center' }}>

                            {/* Photo cell: thumbnail OR camera+upload buttons */}
                            <div>
                              {thumbUrl ? (
                                <div style={{ position: 'relative', display: 'inline-flex' }}>
                                  <img src={thumbUrl} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--blue)' }} />
                                  <button
                                    type="button"
                                    onClick={() => clearRowPhoto(currentStep.id, index, currentStep.fields.dimension.id)}
                                    style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  >✕</button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {/* These buttons trigger the STABLE refs at the root */}
                                  <button type="button" style={camBtnStyle} onClick={() => openCamera(currentStep.id, index)}>
                                    📷
                                  </button>
                                  <button type="button" style={uploadBtnStyle} onClick={() => openGallery(currentStep.id, index)}>
                                    📂
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Sqft / measurement input */}
                            <input
                              type="number"
                              placeholder={currentStep.fields.dimension.placeholder || 'Amount'}
                              value={item.sqft}
                              onChange={(e) => updateSqft(currentStep.id, index, e.target.value, currentStep.fields.dimension.id)}
                              className="theme-text-input"
                            />

                            {/* Remove row */}
                            <button
                              type="button"
                              onClick={() => removeRow(currentStep.id, index, currentStep.fields.dimension.id)}
                              disabled={getStepItems(currentStep.id).length === 1}
                              style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', padding: '8px', opacity: getStepItems(currentStep.id).length === 1 ? 0.3 : 1 }}
                            >✕</button>
                          </div>
                        )
                      })}

                      <button
                        type="button"
                        onClick={() => addRow(currentStep.id)}
                        style={{ alignSelf: 'flex-start', marginTop: '4px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--blue)', background: 'transparent', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer' }}
                      >➕ Add More</button>
                    </div>
                  )}

                  {/* Price pair */}
                  {currentStep.type === 'price_pair' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {(['base', 'casing'] as const).map((key) => (
                        <div key={key} className="input-group">
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>{currentStep.fields[key].label}</label>
                          <input type="text" className="theme-text-input" placeholder={currentStep.fields[key].placeholder} value={answers[currentStep.fields[key].id] || ''} onChange={(e) => handleTextChange(currentStep.fields[key].id, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Demolition combined */}
                  {currentStep.type === 'demolition_combined' && (
                    <div>
                      {(currentStep.options || []).map((item: string) => {
                        const map: Record<string, { id: string; title: string; placeholder: string }> = {
                          'Remove Existing Wall Drywall': { id: 'drywall_demo_wall_sqft', title: 'Remove Existing Wall Drywall (sqft)', placeholder: 'e.g. 200' },
                          'Remove Existing Ceiling Drywall': { id: 'drywall_demo_ceiling_sqft', title: 'Remove Existing Ceiling Drywall (sqft)', placeholder: 'e.g. 150' },
                          'Remove Insulation (sqft)': { id: 'drywall_demo_insulation_sqft', title: 'Remove Insulation (sqft)', placeholder: 'e.g. 100' },
                          'Remove Base Board (linear ft)': { id: 'drywall_demo_baseboard_ft', title: 'Remove Base Board (linear ft)', placeholder: 'e.g. 40' },
                          'Remove Popcorn Ceiling': { id: 'drywall_popcorn_sqft', title: 'Remove Popcorn Ceiling (sqft) - Base rate $300', placeholder: 'e.g. 150' },
                        }
                        const field = map[item]
                        if (!field) return null
                        return (
                          <div key={item} className="input-group" style={{ marginBottom: '16px', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'rgba(0,0,0,0.02)' }}>
                            <label htmlFor={field.id} style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>{field.title}</label>
                            <input id={field.id} type="number" placeholder={field.placeholder} value={answers[field.id] || ''} onChange={(e) => handleTextChange(field.id, e.target.value)} className="theme-text-input" style={{ width: '100%' }} />
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Yes/No + conditional dimension */}
                  {currentStep.type === 'yesno_combined' && currentStep.fields?.yes && (
                    <div style={{ marginBottom: '20px' }}>
                      <div className="radio-options-list" style={{ marginBottom: '16px' }}>
                        {currentStep.options.map((option: string) => {
                          const isSelected = answers[currentStep.id] === option
                          return (
                            <div key={option} className="radio-option-card-wrapper">
                              <button type="button" className={`radio-option-card${isSelected ? ' selected' : ''}`} onClick={() => handleRadioChange(currentStep.id, option)}>
                                <span className="radio-indicator">{isSelected && <span className="radio-dot" />}</span>
                                <span className="radio-label-text">{option}</span>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      {answers[currentStep.id] === 'Yes' && (
                        <div className="input-group" style={{ marginBottom: '12px' }}>
                          {currentStep.id === 'drywall_vaulted_ceiling' ? (
                            <>
                              <label htmlFor="drywall_vaulted_ceiling" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Length (ft)</label>
                              <input
                                id="drywall_vaulted_ceiling"
                                type="number"
                                placeholder="e.g. 10"
                                className="theme-text-input"
                                value={answers.drywall_vaulted_ceiling || ''}
                                onChange={(e) => handleTextChange('drywall_vaulted_ceiling', e.target.value)}
                              />
                              <label htmlFor="drywall_vaulted_width" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', marginTop: '8px' }}>Width (ft)</label>
                              <input
                                id="drywall_vaulted_width"
                                type="number"
                                placeholder="e.g. 12"
                                className="theme-text-input"
                                value={answers.drywall_vaulted_width || ''}
                                onChange={(e) => handleTextChange('drywall_vaulted_width', e.target.value)}
                              />
                              <label htmlFor="drywall_vaulted_height" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', marginTop: '8px' }}>Height (ft)</label>
                              <input
                                id="drywall_vaulted_height"
                                type="number"
                                placeholder="e.g. 8"
                                className="theme-text-input"
                                value={answers.drywall_vaulted_height || ''}
                                onChange={(e) => handleTextChange('drywall_vaulted_height', e.target.value)}
                              />
                            </>
                          ) : (
                            <input
                              id={currentStep.fields.yes.id}
                              type="number"
                              placeholder={currentStep.fields.yes.placeholder || 'e.g. 10'}
                              className="theme-text-input"
                              value={answers[currentStep.fields.yes.id] || ''}
                              onChange={(e) => handleTextChange(currentStep.fields.yes.id, e.target.value)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="wizard-actions">
        <button type="button" className="btn btn-glass" disabled={currentStepIndex === 0} onClick={handlePrev} style={{ color: 'black' }}>
          ← Back
        </button>
        {isLastStep ? (
          <button type="button" className="btn btn-orange wizard-submit-btn" disabled={!isStepValid() || isUploading} onClick={handleSubmit}>
            {isUploading ? 'Uploading Photos...' : 'Submit Estimate →'}
          </button>
        ) : (
          <button type="button" className="btn btn-blue" disabled={!isStepValid()} onClick={handleNext}>
            Next Step →
          </button>
        )}
      </div>
    </div>
  )
}