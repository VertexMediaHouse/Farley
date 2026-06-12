import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateEstimate } from '../services/estimateEngine'
import { uploadFilesToDrive } from '../services/driveService'
import type { EstimateResult } from '../types/estimate'

// ─── Form Types ────────────────────────────────────────────────────────────────

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
  drywall_area?: string | string[];
  trim_services: string[] | string;
  // New drywall area fields (square footage) and photo uploads
  drywall_wall_sqft?: string;
  drywall_wall_photo?: string;
  drywall_ceiling_sqft?: string;
  drywall_ceiling_photo?: string;
  drywall_bathroom_wall_sqft?: string;
  drywall_bathroom_wall_photo?: string;
  drywall_bathroom_ceiling_sqft?: string;
  drywall_bathroom_ceiling_photo?: string;
  // Demolition specific inputs
  drywall_demo_wall_sqft?: string;
  drywall_demo_ceiling_sqft?: string;
  drywall_demo_insulation_sqft?: string;
  drywall_demo_baseboard_ft?: string;
  // Soffits measurement (sqft)
  drywall_soffits_sqft?: string;
  trim_baseboard_height?: string;
  trim_baseboard_photo?: string;
  trim_base_material?: string[] | string;
  trim_base_linear_feet?: string;
  trim_base_primed?: string;
  trim_casing_material?: string[] | string;
  trim_casing?: string;
  trim_casing_photo?: string;
  trim_casing_linear_feet?: string;
  trim_casing_primed?: string;
  trim_knows_price?: string;
  trim_base_price?: string;
  trim_casing_price?: string;
  trim_search_fee_ok?: string;
  drywall_type?: string;
  corner_metal_type?: string;
  corner_metal_length?: string;
  corner_metal_qty?: string;
  corner_metal_both?: string;
  corner_metal_corners_count?: string;
  arch_needed?: string;
  arch_count?: string;
  soffit_type?: string;
  soffit_linear_feet?: string;
  ceiling_height_greater_than_8ft?: string;
  ceiling_height_specify?: string;
  electrical_services?: string;
  electrical_light_size?: string;
  electrical_light_count?: string;
  electrical_fan_count?: string;
  electrical_fixture_count?: string;
  is_two_story?: string;
  is_occupied?: string;
  is_emergency?: string;
  is_late_day?: string;
  drywall_existing_texture?: string;
  paint_primer?: string;
  paint_area?: string[];
  paint_wall_sqft?: string;
  paint_wall_photo?: string;
  paint_ceiling_sqft?: string;
  paint_ceiling_photo?: string;
  paint_bath_ceiling_sqft?: string;
  paint_bath_ceiling_photo?: string;
  paint_bath_wall_sqft?: string;
  paint_bath_wall_photo?: string;
  paint_trim_area?: string[];
  paint_trim_linear_ft?: string;
  paint_trim_photo?: string;
  paint_baseboards_linear_ft?: string;
  paint_baseboards_photo?: string;
  paint_ceiling_height_over_8ft?: string;
  paint_ceiling_height?: string;
  paint_customer_providing?: string;
  paint_contractor_providing?: string;
  paint_brand_color?: string;
  paint_sku_photo?: string;
  paint_additional_info?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
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
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EstimateWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  // ─── File handling ───────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

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
      services: {
        ...prev.services,
        [service]: !prev.services[service],
      },
    }))
  }

  const handleOptionSelect = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  // ─── Combined Step Helpers ───────────────────────────────────────────────────
  const [combinedItems, setCombinedItems] = useState<Record<string, { photo: File | null, sqft: string }[]>>({});

  const getStepItems = (stepId: string) => {
    return combinedItems[stepId] || [{ photo: null, sqft: '' }];
  };

  const addRow = (stepId: string) => {
    setCombinedItems(prev => ({
      ...prev,
      [stepId]: [...(prev[stepId] || [{ photo: null, sqft: '' }]), { photo: null, sqft: '' }]
    }));
  };

  const removeRow = (stepId: string, index: number, dimensionId: string) => {
    setCombinedItems(prev => {
      const current = prev[stepId] || [{ photo: null, sqft: '' }];
      const newItems = current.filter((_, i) => i !== index);
      const total = newItems.reduce((acc, item) => acc + (parseFloat(item.sqft) || 0), 0);
      setAnswers(a => ({ ...a, [dimensionId]: total > 0 ? total.toString() : '' }));
      return { ...prev, [stepId]: newItems };
    });
  };

  const updateSqft = (stepId: string, index: number, value: string, dimensionId: string) => {
    setCombinedItems(prev => {
      const current = prev[stepId] || [{ photo: null, sqft: '' }];
      const newItems = current.map((item, i) => i === index ? { ...item, sqft: value } : item);
      const total = newItems.reduce((acc, item) => acc + (parseFloat(item.sqft) || 0), 0);
      setAnswers(a => ({ ...a, [dimensionId]: total > 0 ? total.toString() : '' }));
      return { ...prev, [stepId]: newItems };
    });
  };

  const updatePhoto = (stepId: string, index: number, file: File | null) => {
    setCombinedItems(prev => {
      const current = prev[stepId] || [{ photo: null, sqft: '' }];
      return {
        ...prev,
        [stepId]: current.map((item, i) => i === index ? { ...item, photo: file } : item)
      };
    });
    if (file) {
      setUploadedFiles(prev => [...prev, file]);
    }
  };

  const getDynamicSteps = () => {
    const stepsList: any[] = []

    // 1. Drywall questions
    if (answers.services.drywall) {
      // ── Step 1: Area selection ────────────────────────────────────────────
      stepsList.push({
        id: 'drywall_area',
        title: 'What area needs drywall?',
        subtitle: 'Please add all areas. (Allow multiple selections)',
        type: 'checkbox',
        options: [
          'Walls — ½"',
          'Ceiling — 5/8"',
          'Bathroom walls — Greenboard ½"',
          'Bathroom ceiling — Greenboard 5/8"'
        ]
      })

      // ── Per-area sqft + photo steps (dynamic based on selection) ─────────
      const selectedAreas: string[] = Array.isArray(answers.drywall_area)
        ? answers.drywall_area
        : (answers.drywall_area ? [answers.drywall_area] : [])

      if (selectedAreas.some(a => a.startsWith('Walls'))) {
        stepsList.push({
          id: 'drywall_wall',
          title: 'Wall drywall — How many sqft & photos?',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_wall_sqft', placeholder: 'e.g. 200' },
            photo: { id: 'drywall_wall_photo', title: 'Wall photos' }
          }
        })
      }

      if (selectedAreas.some(a => a.startsWith('Ceiling'))) {
        stepsList.push({
          id: 'drywall_ceiling',
          title: 'Ceiling drywall — How many sqft & photos?',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_ceiling_sqft', placeholder: 'e.g. 150' },
            photo: { id: 'drywall_ceiling_photo', title: 'Ceiling photos' }
          }
        })
      }

      if (selectedAreas.some(a => a.startsWith('Bathroom walls'))) {
        stepsList.push({
          id: 'drywall_bathroom_wall',
          title: 'Bathroom wall drywall — How many sqft & photos?',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_bathroom_wall_sqft', placeholder: 'e.g. 80' },
            photo: { id: 'drywall_bathroom_wall_photo', title: 'Bathroom wall photos' }
          }
        })
      }

      if (selectedAreas.some(a => a.startsWith('Bathroom ceiling'))) {
        stepsList.push({
          id: 'drywall_bathroom_ceiling',
          title: 'Bathroom ceiling drywall — How many sqft & photos?',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_bathroom_ceiling_sqft', placeholder: 'e.g. 50' },
            photo: { id: 'drywall_bathroom_ceiling_photo', title: 'Bathroom ceiling photos' }
          }
        })
      }

      // ── Step 2: Demolition ────────────────────────────────────────────────
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
          'Remove Popcorn Ceiling'
        ]
      })

      const demo: string[] = Array.isArray(answers.drywall_demolition)
        ? answers.drywall_demolition
        : (answers.drywall_demolition ? [answers.drywall_demolition] : [])

      const demoRequireDimensions = demo.filter(d => d !== 'No Demo Needed');
      if (demoRequireDimensions.length > 0) {
        stepsList.push({
          id: 'drywall_demolition_details',
          title: 'Demolition Details — Provide amounts for selected items',
          type: 'demolition_combined',
          options: demoRequireDimensions
        });
      }

      stepsList.push({
        id: 'drywall_has_soffits',
        title: 'Do you have any Soffits?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      if (answers.drywall_has_soffits === 'Yes') {
        stepsList.push({
          id: 'drywall_soffits',
          title: 'Soffits — Sqft & photos',
          type: 'combined',
          fields: {
            dimension: { id: 'drywall_soffits_sqft', placeholder: 'e.g. 40' },
            photo: { id: 'drywall_soffits_photos', title: 'Soffit photos' }
          }
        })
      }

      // Popcorn and baseboard are combined above. Keep the photo step for Popcorn.
      if (demo.includes('Remove Popcorn Ceiling')) {
        stepsList.push({
          id: 'drywall_popcorn_photo',
          title: 'Please add photos of the Popcorn Ceiling',
          type: 'photo_upload'
        })
      }
      // ── Compute area flags early (used by ceiling height, vaulted, insulation) ──
      const hasWallArea = selectedAreas.some(a => a.startsWith('Walls') || a.startsWith('Bathroom walls'))
      const hasCeilingArea = selectedAreas.some(a => a.startsWith('Ceiling') || a.startsWith('Bathroom ceiling'))

      // ── Step 4: Ceiling height ────────────────────────────────────────────
      if (hasCeilingArea) {
        stepsList.push({
          id: 'ceiling_height',
          title: 'Ceiling height > 8ft?',
          type: 'yesno_combined',
          fields: {
            yes: { id: 'ceiling_height_specify', title: 'Specify height (ft)', placeholder: 'e.g. 10' }
          },
          options: ['Yes', 'No']
        })
      }

      // ── Step 5: Vaulted ceiling ───────────────────────────────────────────
      if (hasCeilingArea) {
        stepsList.push({
          id: 'drywall_vaulted_ceiling',
          title: 'Vaulted ceiling? (Provide dimensions if Yes)',
          type: 'yesno_combined',
          fields: {
            yes: { id: 'drywall_vaulted_dimensions', title: 'Vaulted dimensions' }
          },
          options: ['Yes', 'No']
        })
      }
      // ── Step 6: Insulation (auto-shown based on selected areas) ──────────
      if (hasWallArea || hasCeilingArea) {
        stepsList.push({
          id: 'drywall_insulation',
          title: 'Do you need Insulation?',
          subtitle: hasWallArea && hasCeilingArea
            ? 'Wall insulation — R13 | Ceiling insulation — R19'
            : hasWallArea ? 'Wall insulation — R13' : 'Ceiling insulation — R19',
          type: 'radio',
          options: ['Yes', 'No']
        })
      }

      // ── Step 7: Corner metal ──────────────────────────────────────────────
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
        ]
      })

      const cornerMetals: string[] = Array.isArray(answers.drywall_corner_metal)
        ? answers.drywall_corner_metal
        : (answers.drywall_corner_metal ? [answers.drywall_corner_metal] : [])
      const needsCorners = cornerMetals.some(c => c !== 'No Corner Metal Needed')

      if (needsCorners) {
        stepsList.push({
          id: 'drywall_corner_count',
          title: 'How many Corners?',
          type: 'text',
          placeholder: 'e.g. 4'
        })

        const needsLength =
          cornerMetals.includes('Standard 90 Degree Corner Metal') ||
          cornerMetals.includes('Bullnose Corner Metal')
        if (needsLength) {
          stepsList.push({
            id: 'drywall_corner_length',
            title: 'What is the length of corner metal?',
            type: 'radio',
            options: ['8ft', '10ft', 'Other']
          })
        }
      }

      // ── Step 8: Texture / Finish ──────────────────────────────────────────
      stepsList.push({
        id: 'drywall_texture',
        title: 'What texture/finish do you want?',
        type: 'radio',
        options: ['Smooth Finish', 'Orange Peel', 'Knock Down', 'Match Existing Texture']
      })

      if (answers.drywall_texture === 'Match Existing Texture') {
        stepsList.push({
          id: 'drywall_texture_existing',
          title: 'What is the existing texture?',
          type: 'text',
          placeholder: 'e.g. skip trowel'
        })
        stepsList.push({
          id: 'drywall_texture_photo',
          title: 'Please add a photo of the existing texture',
          type: 'photo_upload'
        })
      }

      // ── Step 9: Occupied ──────────────────────────────────────────────────
      stepsList.push({
        id: 'is_occupied',
        title: 'Is the room currently occupied or does it have furniture?',
        type: 'radio',
        options: ['Yes', 'No'],
        warningCondition: 'Yes',
        warningMessage: 'Have all furniture removed before work starts'
      })

      stepsList.push({
        id: 'additional_info',
        title: 'Additional request?',
        type: 'textarea',
        placeholder: 'Any additional details...',
      })

      stepsList.push({
        id: 'drywall_photo',
        title: 'Upload work photo to drive:',
        type: 'photo_upload'
      })

      stepsList.push({
        id: 'contact_info_pane',
        title: 'Additional info',
        type: 'contact_info_optional'
      })
    }

    // 2. Paint questions
    if (answers.services.paint) {
      stepsList.push({
        id: 'paint_primer',
        title: 'Would you like primer before paint?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      stepsList.push({
        id: 'paint_area',
        title: 'What area needs paint?',
        subtitle: 'Please add all areas. (Allow multiple selection)',
        type: 'checkbox',
        options: ['Wall', 'Ceiling', 'Bath ceiling', 'Bath wall']
      })

      const selectedPaintAreas: string[] = Array.isArray(answers.paint_area)
        ? answers.paint_area
        : (answers.paint_area ? [answers.paint_area] : [])

      if (selectedPaintAreas.includes('Wall')) {
        stepsList.push({
          id: 'paint_wall',
          title: 'Wall — Sqft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_wall_sqft', placeholder: 'e.g. 200' },
            photo: { id: 'paint_wall_photo', title: 'Wall photo' }
          }
        })
      }
      if (selectedPaintAreas.includes('Ceiling')) {
        stepsList.push({
          id: 'paint_ceiling',
          title: 'Ceiling — Sqft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_ceiling_sqft', placeholder: 'e.g. 150' },
            photo: { id: 'paint_ceiling_photo', title: 'Ceiling photo' }
          }
        })
      }
      if (selectedPaintAreas.includes('Bath ceiling')) {
        stepsList.push({
          id: 'paint_bath_ceiling',
          title: 'Bath ceiling — Sqft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_bath_ceiling_sqft', placeholder: 'e.g. 50' },
            photo: { id: 'paint_bath_ceiling_photo', title: 'Bath ceiling photo' }
          }
        })
      }
      if (selectedPaintAreas.includes('Bath wall')) {
        stepsList.push({
          id: 'paint_bath_wall',
          title: 'Bath wall — Sqft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_bath_wall_sqft', placeholder: 'e.g. 100' },
            photo: { id: 'paint_bath_wall_photo', title: 'Bath wall photo' }
          }
        })
      }

      stepsList.push({
        id: 'paint_trim_area',
        title: 'What trim and baseboards need painting?',
        subtitle: 'Allow multiple selection',
        type: 'checkbox',
        options: ['Trim', 'Baseboards']
      })

      const selectedTrimAreas: string[] = Array.isArray(answers.paint_trim_area)
        ? answers.paint_trim_area
        : (answers.paint_trim_area ? [answers.paint_trim_area] : [])

      if (selectedTrimAreas.includes('Trim')) {
        stepsList.push({
          id: 'paint_trim',
          title: 'Trim — Linear ft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_trim_linear_ft', placeholder: 'e.g. 50' },
            photo: { id: 'paint_trim_photo', title: 'Trim photo' }
          }
        })
      }
      if (selectedTrimAreas.includes('Baseboards')) {
        stepsList.push({
          id: 'paint_baseboards',
          title: 'Baseboards — Linear ft & photo',
          type: 'combined',
          fields: {
            dimension: { id: 'paint_baseboards_linear_ft', placeholder: 'e.g. 100' },
            photo: { id: 'paint_baseboards_photo', title: 'Baseboards photo' }
          }
        })
      }

      stepsList.push({
        id: 'paint_ceiling_height',
        title: 'Is paint ceiling height > 8ft?',
        type: 'yesno_combined',
        fields: {
          yes: { id: 'paint_ceiling_height_detail', title: 'Specify height (ft)', placeholder: 'e.g. 10' }
        },
        options: ['Yes', 'No']
      })

      stepsList.push({
        id: 'paint_customer_providing',
        title: 'Will you be providing paint?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      if (answers.paint_customer_providing === 'No') {
        stepsList.push({
          id: 'paint_contractor_providing',
          title: 'Would you like us to get the paint for you?',
          type: 'radio',
          options: ['Yes', 'No']
        })

        if (answers.paint_contractor_providing === 'Yes') {
          stepsList.push({
            id: 'paint_match_existing',
            title: 'Would you like us to match your existing color? Note this will not be a 100% color match.',
            type: 'radio',
            options: ['Yes', 'No']
          })

          // Both paths (Colour Match / New Paint) ask for color/brand and a picture of the sku
          stepsList.push({
            id: 'paint_brand_color',
            title: 'Please provide paint colour & brand',
            type: 'text',
            placeholder: 'e.g. Sherwin Williams Alabaster'
          })

          stepsList.push({
            id: 'paint_sku_photo',
            title: 'Can you share pictures of the paint sku?',
            type: 'photo_upload'
          })
        }
      }

      const isPaintContinuing = answers.paint_customer_providing === 'Yes' || answers.paint_contractor_providing === 'Yes';

      if (isPaintContinuing) {
        stepsList.push({
          id: 'paint_additional_info',
          title: 'Do you have any other information that you would like to share?',
          type: 'textarea',
          placeholder: 'Any additional details about the paint...'
        })
      }

      stepsList.push({
        id: 'paint_dimensions_pane',
        title: 'Please provide dimensions of the room',
        type: 'dimensions_optional'
      })

      if (!answers.services.drywall) {
        stepsList.push({
          id: 'is_occupied',
          title: 'Is room currently occupied?',
          type: 'radio',
          options: ['Yes', 'No'],
          warningCondition: 'Yes',
          warningMessage: 'Have all furniture removed before work starts'
        })

        stepsList.push({
          id: 'additional_info',
          title: 'Additional request?',
          type: 'textarea',
          placeholder: 'Any additional details...',
        })
      }

      if (!answers.services.drywall) {
        stepsList.push({
          id: 'paint_photo',
          title: 'Upload work photo to drive:',
          type: 'photo_upload'
        })
      }

      if (!answers.services.drywall) {
        stepsList.push({
          id: 'contact_info_pane',
          title: 'Additional info',
          type: 'contact_info_optional'
        })
      }
    }

    // 3. Trim questions
    if (answers.services.trim) {
      stepsList.push({
        id: 'trim_services',
        title: 'What service do you need?',
        type: 'checkbox',
        options: [
          'Install New Baseboards',
          'Replace Existing Baseboards'
        ]
      })

      stepsList.push({
        id: 'trim_baseboard',
        title: 'Baseboard height and photos',
        subtitle: 'If over 6" please share what size',
        type: 'combined',
        fields: {
          dimension: { id: 'trim_baseboard_height', placeholder: 'e.g. 4 inch' },
          photo: { id: 'trim_baseboard_photo', title: 'Baseboard photos' }
        }
      })

      stepsList.push({
        id: 'trim_base_material',
        title: 'What material is your base?',
        type: 'checkbox_with_input',
        options: ['MDF', 'Real wood'],
        inputField: {
          id: 'trim_base_linear_feet',
          label: 'Linear feet',
          placeholder: 'linear feet'
        }
      })

      stepsList.push({
        id: 'trim_base_primed',
        title: 'Is it primed already?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      stepsList.push({
        id: 'trim_casing_material',
        title: 'What material is your Casing?',
        type: 'checkbox',
        options: ['MDF', 'Real wood']
      })

      stepsList.push({
        id: 'trim_casing',
        title: 'Door casing do you have',
        type: 'radio',
        options: ['3"', '4"', '5"', '6"', 'Other']
      })

      stepsList.push({
        id: 'trim_casing_combined',
        title: 'Casing — Photo & Linear Ft',
        type: 'combined',
        fields: {
          dimension: { id: 'trim_casing_linear_feet', placeholder: 'e.g. 50' },
          photo: { id: 'trim_casing_photo', title: 'Casing photos' }
        }
      })

      stepsList.push({
        id: 'trim_casing_primed',
        title: 'Is it primed all already?',
        type: 'radio',
        options: ['Yes', 'No']
      })
      
      stepsList.push({
        id: 'trim_knows_price',
        title: 'Do you know what the price per linear foot is for your base, or casing?',
        type: 'radio',
        options: ['Yes', 'No']
      })
      
      if (answers.trim_knows_price === 'Yes') {
        stepsList.push({
          id: 'trim_prices',
          title: 'Enter linear price for Base & Casing',
          type: 'price_pair',
          fields: {
            base: { id: 'trim_base_price', label: 'Base ($/linear ft)', placeholder: 'e.g. 5.00' },
            casing: { id: 'trim_casing_price', label: 'Casing ($/linear ft)', placeholder: 'e.g. 5.00' }
          }
        })
      }
      
      if (answers.trim_knows_price === 'No') {
        stepsList.push({
          id: 'trim_search_fee_ok',
          title: 'Are you ok with a $50 an hour fee for searching for your trim?',
          type: 'radio',
          options: ['Yes', 'No'],
          warningCondition: 'No',
          warningMessage: 'Please Provide Trim details before work starts.'
        })
      }
      
      if (!answers.services.drywall && !answers.services.paint) {
        stepsList.push({
          id: 'is_occupied',
          title: 'Is room currently occupied?',
          type: 'radio',
          options: ['Yes', 'No'],
          warningCondition: 'Yes',
          warningMessage: 'Have all furniture removed before work starts'
        })

        stepsList.push({
          id: 'additional_info',
          title: 'Additional request?',
          type: 'textarea',
          placeholder: 'Any additional details...',
        })
      }

      if (!answers.services.drywall && !answers.services.paint) {
        stepsList.push({
          id: 'contact_info_pane',
          title: 'additional info',
          type: 'contact_info_optional'
        })
      }
    }

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

    const currentDynamicStep = dynamicSteps[currentStepIndex - 1]
    if (!currentDynamicStep) return false

    // Optional panes
    if (
      currentDynamicStep.type === 'dimensions_optional' ||
      currentDynamicStep.type === 'contact_info_optional' ||
      currentDynamicStep.type === 'photo_upload' ||
      currentDynamicStep.id === 'additional_info' ||
      currentDynamicStep.id === 'soffit_linear_feet'
    ) {
      return true
    }

    if (currentDynamicStep.type === 'vaulted_dimensions') {
      return (
        answers.drywall_vaulted_width?.trim() !== '' &&
        answers.drywall_vaulted_height?.trim() !== '' &&
        answers.drywall_vaulted_surrounding?.trim() !== ''
      )
    }

    if (currentDynamicStep.type === 'price_pair') {
      const base = answers[currentDynamicStep.fields.base.id]
      const casing = answers[currentDynamicStep.fields.casing.id]
      return base?.trim() !== '' && casing?.trim() !== ''
    }

    if (currentDynamicStep.type === 'checkbox') {
      const val = answers[currentDynamicStep.id]
      const arr = Array.isArray(val) ? val : (val ? [val] : [])
      return arr.length > 0
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

    if (currentDynamicStep.type === 'text' || currentDynamicStep.type === 'number' || currentDynamicStep.type === 'textarea') {
      return val !== undefined && val.trim() !== ''
    }

    return true
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

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

  const handleRadioChange = (id: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [id]: option }))
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
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

                  {dynamicSteps[currentStepIndex - 1].type === 'radio' &&
                    dynamicSteps[currentStepIndex - 1].warningCondition &&
                    answers[dynamicSteps[currentStepIndex - 1].id] === dynamicSteps[currentStepIndex - 1].warningCondition && (
                      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '8px', color: '#b45309', fontSize: '0.9rem', fontWeight: 600 }}>
                        ⚠️ {dynamicSteps[currentStepIndex - 1].warningMessage}
                      </div>
                    )}

                  {dynamicSteps[currentStepIndex - 1].type === 'checkbox' && (
                    <div className="radio-options-list">
                      {dynamicSteps[currentStepIndex - 1].options?.map((option: string) => {
                        const stepId = dynamicSteps[currentStepIndex - 1].id
                        const currentVals = Array.isArray(answers[stepId]) ? answers[stepId] : (answers[stepId] ? [answers[stepId]] : [])
                        const isSelected = currentVals.includes(option)

                        return (
                          <button
                            key={option}
                            type="button"
                            className={`radio-option-card${isSelected ? ' selected' : ''}`}
                            onClick={() => {
                              setAnswers((prev) => {
                                const prevVals = Array.isArray(prev[stepId]) ? prev[stepId] : (prev[stepId] ? [prev[stepId]] : [])
                                let newVals = [...prevVals]

                                if (option === 'All above') {
                                  if (isSelected) {
                                    newVals = []
                                  } else {
                                    newVals = ['Walls', 'Ceiling', 'Bathroom', 'All above']
                                  }
                                } else {
                                  if (isSelected) {
                                    newVals = newVals.filter(v => v !== option && v !== 'All above')
                                  } else {
                                    newVals.push(option)
                                    if (newVals.includes('Walls') && newVals.includes('Ceiling') && newVals.includes('Bathroom')) {
                                      if (!newVals.includes('All above')) newVals.push('All above')
                                    }
                                  }
                                }

                                return { ...prev, [stepId]: newVals }
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

                  {(dynamicSteps[currentStepIndex - 1].type === 'text' || dynamicSteps[currentStepIndex - 1].type === 'number') && (
                    <div className="input-group">
                      <input
                        type={dynamicSteps[currentStepIndex - 1].type}
                        className="theme-text-input"
                        placeholder={dynamicSteps[currentStepIndex - 1].placeholder || "Type your answer here..."}
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
                        placeholder={dynamicSteps[currentStepIndex - 1].placeholder || "Provide additional details here..."}
                        value={answers[dynamicSteps[currentStepIndex - 1].id] || ''}
                        onChange={e => handleTextChange(dynamicSteps[currentStepIndex - 1].id, e.target.value)}
                      />
                    </div>
                  )}

                  {(dynamicSteps[currentStepIndex - 1].type === 'dimensions_and_address' || dynamicSteps[currentStepIndex - 1].type === 'dimensions_optional') && (
                    <div className="wizard-step-pane active" style={{ padding: 0 }}>
                      <div className="dimensions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '15px' }}>
                        <div className="input-group">
                          <label htmlFor="length" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Room Length (ft)</label>
                          <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              id="length"
                              type="number"
                              placeholder="e.g. 15"
                              value={answers.length}
                              onChange={e => handleTextChange('length', e.target.value)}
                              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                          </div>
                        </div>

                        <div className="input-group">
                          <label htmlFor="width" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Room Width (ft)</label>
                          <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              id="width"
                              type="number"
                              placeholder="e.g. 12"
                              value={answers.width}
                              onChange={e => handleTextChange('width', e.target.value)}
                              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                          </div>
                        </div>

                        <div className="input-group">
                          <label htmlFor="height" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Ceiling Height (ft)</label>
                          <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              id="height"
                              type="number"
                              placeholder="e.g. 9"
                              value={answers.height}
                              onChange={e => handleTextChange('height', e.target.value)}
                              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                          </div>
                        </div>
                      </div>
                      {dynamicSteps[currentStepIndex - 1].type === 'dimensions_and_address' && (
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
                      )}
                    </div>
                  )}

                  {dynamicSteps[currentStepIndex - 1].type === 'vaulted_dimensions' && (
                    <div className="wizard-step-pane active" style={{ padding: 0 }}>
                      <div className="dimensions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '15px' }}>
                        <div className="input-group">
                          <label htmlFor="drywall_vaulted_width" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Vaulted Ceiling Width (ft)</label>
                          <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              id="drywall_vaulted_width"
                              type="number"
                              placeholder="e.g. 12"
                              value={answers.drywall_vaulted_width || ''}
                              onChange={e => handleTextChange('drywall_vaulted_width', e.target.value)}
                              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                          </div>
                        </div>

                        <div className="input-group">
                          <label htmlFor="drywall_vaulted_height" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Vaulted Ceiling Height (ft)</label>
                          <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              id="drywall_vaulted_height"
                              type="number"
                              placeholder="e.g. 10"
                              value={answers.drywall_vaulted_height || ''}
                              onChange={e => handleTextChange('drywall_vaulted_height', e.target.value)}
                              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                          </div>
                        </div>

                        <div className="input-group">
                          <label htmlFor="drywall_vaulted_surrounding" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Surrounding Wall Height (ft)</label>
                          <div className="input-with-unit" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              id="drywall_vaulted_surrounding"
                              type="number"
                              placeholder="e.g. 8"
                              value={answers.drywall_vaulted_surrounding || ''}
                              onChange={e => handleTextChange('drywall_vaulted_surrounding', e.target.value)}
                              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {dynamicSteps[currentStepIndex - 1].type === 'checkbox_with_input' && (
                    <div>
                      <div className="radio-options-list">
                        {dynamicSteps[currentStepIndex - 1].options?.map((option: string) => {
                          const stepId = dynamicSteps[currentStepIndex - 1].id
                          const currentVals = Array.isArray(answers[stepId]) ? answers[stepId] : (answers[stepId] ? [answers[stepId]] : [])
                          const isSelected = currentVals.includes(option)

                          return (
                            <button
                              key={option}
                              type="button"
                              className={`radio-option-card${isSelected ? ' selected' : ''}`}
                              onClick={() => {
                                setAnswers((prev) => {
                                  const prevVals = Array.isArray(prev[stepId]) ? prev[stepId] : (prev[stepId] ? [prev[stepId]] : [])
                                  let newVals = [...prevVals]
                                  if (isSelected) {
                                    newVals = newVals.filter(v => v !== option)
                                  } else {
                                    newVals.push(option)
                                  }
                                  return { ...prev, [stepId]: newVals }
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
                        const stepId = dynamicSteps[currentStepIndex - 1].id
                        const currentVals = Array.isArray(answers[stepId]) ? answers[stepId] : (answers[stepId] ? [answers[stepId]] : [])
                        const inputField = dynamicSteps[currentStepIndex - 1].inputField

                        if (currentVals.length > 0 && inputField) {
                          return (
                            <div className="input-group" style={{ marginTop: '16px' }}>
                              <label htmlFor={inputField.id} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                {inputField.label}
                              </label>
                              <input
                                id={inputField.id}
                                type="text"
                                className="theme-text-input"
                                placeholder={inputField.placeholder}
                                value={answers[inputField.id] || ''}
                                onChange={e => handleTextChange(inputField.id, e.target.value)}
                              />
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}

                  {dynamicSteps[currentStepIndex - 1].type === 'contact_info_optional' && (
                    <div className="wizard-step-pane active" style={{ padding: 0 }}>
                      <div className="input-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Full Name</label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={answers.contact_name || ''}
                          onChange={e => handleTextChange('contact_name', e.target.value)}
                          className="theme-text-input"
                        />
                      </div>
                      <div className="input-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number</label>
                        <input
                          type="text"
                          placeholder="Your Phone Number"
                          value={answers.contact_phone || ''}
                          onChange={e => handleTextChange('contact_phone', e.target.value)}
                          className="theme-text-input"
                        />
                      </div>
                      <div className="input-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Email Address</label>
                        <input
                          type="email"
                          placeholder="Your Email"
                          value={answers.contact_email || ''}
                          onChange={e => handleTextChange('contact_email', e.target.value)}
                          className="theme-text-input"
                        />
                      </div>
                      <div className="input-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Project Address</label>
                        <input
                          type="text"
                          placeholder="Street Address, City, State, ZIP"
                          value={answers.contact_address || ''}
                          onChange={e => handleTextChange('contact_address', e.target.value)}
                          className="theme-text-input"
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
                      <h5 style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Upload Photos</h5>
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

                  {/* Combined dimension + photo step */}
                  {dynamicSteps[currentStepIndex - 1].type === 'combined' && dynamicSteps[currentStepIndex - 1].fields?.dimension && dynamicSteps[currentStepIndex - 1].fields?.photo && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 150px 50px',
                          gap: '12px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#334155',
                        }}
                      >
                        <div>Photo</div>
                        <div>Sq Ft</div>
                        <div></div>
                      </div>

                      {getStepItems(dynamicSteps[currentStepIndex - 1].id).map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 150px 50px',
                            gap: '12px',
                            alignItems: 'center',
                          }}
                        >
                          {/* Upload */}
                          <div>
                            <label
                              htmlFor={`photo-${dynamicSteps[currentStepIndex - 1].id}-${index}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                border: '1px dashed var(--blue)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: 'rgba(47,174,255,0.05)',
                                minHeight: '48px',
                              }}
                            >
                              📸 {item.photo ? item.photo.name : 'Upload Photo'}
                            </label>

                            <input
                              id={`photo-${dynamicSteps[currentStepIndex - 1].id}-${index}`}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) =>
                                updatePhoto(
                                  dynamicSteps[currentStepIndex - 1].id,
                                  index,
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                          </div>

                          {/* SqFt */}
                          <input
                            type="number"
                            placeholder="Sq Ft"
                            value={item.sqft}
                            onChange={(e) =>
                              updateSqft(
                                dynamicSteps[currentStepIndex - 1].id,
                                index,
                                e.target.value,
                                dynamicSteps[currentStepIndex - 1].fields.dimension.id
                              )
                            }
                            className="theme-text-input"
                          />

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => removeRow(
                              dynamicSteps[currentStepIndex - 1].id,
                              index,
                              dynamicSteps[currentStepIndex - 1].fields.dimension.id
                            )}
                            disabled={getStepItems(dynamicSteps[currentStepIndex - 1].id).length === 1}
                            style={{
                              border: 'none',
                              background: 'rgba(239,68,68,0.1)',
                              color: '#ef4444',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              padding: '8px',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {/* Add More */}
                      <button
                        type="button"
                        onClick={() => addRow(dynamicSteps[currentStepIndex - 1].id)}
                        style={{
                          alignSelf: 'flex-start',
                          marginTop: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid var(--blue)',
                          background: 'transparent',
                          color: 'var(--blue)',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ➕ Add More
                      </button>
                    </div>
                  )}

                  {dynamicSteps[currentStepIndex - 1].type === 'price_pair' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                          {dynamicSteps[currentStepIndex - 1].fields.base.label}
                        </label>
                        <input
                          type="text"
                          className="theme-text-input"
                          placeholder={dynamicSteps[currentStepIndex - 1].fields.base.placeholder}
                          value={answers[dynamicSteps[currentStepIndex - 1].fields.base.id] || ''}
                          onChange={e => handleTextChange(dynamicSteps[currentStepIndex - 1].fields.base.id, e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                          {dynamicSteps[currentStepIndex - 1].fields.casing.label}
                        </label>
                        <input
                          type="text"
                          className="theme-text-input"
                          placeholder={dynamicSteps[currentStepIndex - 1].fields.casing.placeholder}
                          value={answers[dynamicSteps[currentStepIndex - 1].fields.casing.id] || ''}
                          onChange={e => handleTextChange(dynamicSteps[currentStepIndex - 1].fields.casing.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Demolition combined step */}
                  {dynamicSteps[currentStepIndex - 1].type === 'demolition_combined' && (
                    <div className="demolition-combined-step">
                      {(dynamicSteps[currentStepIndex - 1].options || []).map((item: string) => {
                        let id = '';
                        let placeholder = '';
                        let title = '';

                        if (item === 'Remove Existing Wall Drywall') {
                          id = 'drywall_demo_wall_sqft';
                          title = 'Remove Existing Wall Drywall (sqft)';
                          placeholder = 'e.g. 200';
                        } else if (item === 'Remove Existing Ceiling Drywall') {
                          id = 'drywall_demo_ceiling_sqft';
                          title = 'Remove Existing Ceiling Drywall (sqft)';
                          placeholder = 'e.g. 150';
                        } else if (item === 'Remove Insulation (sqft)') {
                          id = 'drywall_demo_insulation_sqft';
                          title = 'Remove Insulation (sqft)';
                          placeholder = 'e.g. 100';
                        } else if (item === 'Remove Base Board (linear ft)') {
                          id = 'drywall_demo_baseboard_ft';
                          title = 'Remove Base Board (linear ft)';
                          placeholder = 'e.g. 40';
                        } else if (item === 'Remove Popcorn Ceiling') {
                          id = 'drywall_popcorn_sqft';
                          title = 'Remove Popcorn Ceiling (sqft) - Base rate $300';
                          placeholder = 'e.g. 150';
                        }

                        if (!id) return null;

                        return (
                          <div key={item} className="input-group" style={{ marginBottom: '16px', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'rgba(0,0,0,0.02)' }}>
                            <label htmlFor={id} style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
                              {title}
                            </label>
                            <input
                              id={id}
                              type="number"
                              placeholder={placeholder}
                              value={answers[id] || ''}
                              onChange={e => handleTextChange(id, e.target.value)}
                              className="theme-text-input"
                              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Yes/No + dimension combined step */}
                  {dynamicSteps[currentStepIndex - 1].type === 'yesno_combined' && dynamicSteps[currentStepIndex - 1].fields?.yes && (
                    <div className="yesno-combined-step" style={{ marginBottom: '20px' }}>
                      {/* Radio options */}
                      <div className="radio-options-list" style={{ marginBottom: '16px' }}>
                        {dynamicSteps[currentStepIndex - 1].options.map(option => {
                          const isSelected = answers[dynamicSteps[currentStepIndex - 1].id] === option;
                          return (
                            <div key={option} className="radio-option-card-wrapper">
                              <button
                                type="button"
                                className={`radio-option-card${isSelected ? ' selected' : ''}`}
                                onClick={() => handleRadioChange(dynamicSteps[currentStepIndex - 1].id, option)}
                              >
                                <span className="radio-indicator">
                                  {isSelected && <span className="radio-dot" />}
                                </span>
                                <span className="radio-label-text">{option}</span>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      {/* Show dimension field only if Yes */}
                      {answers[dynamicSteps[currentStepIndex - 1].id] === 'Yes' && (
                        <div className="input-group" style={{ marginBottom: '12px' }}>
                          <label htmlFor={dynamicSteps[currentStepIndex - 1].fields.yes.id} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                            {dynamicSteps[currentStepIndex - 1].fields.yes.title}
                          </label>
                          <input
                            id={dynamicSteps[currentStepIndex - 1].fields.yes.id}
                            type="number"
                            placeholder={dynamicSteps[currentStepIndex - 1].fields.yes.placeholder || 'e.g. 10'}
                            className="theme-text-input"
                            value={answers[dynamicSteps[currentStepIndex - 1].fields.yes.id] || ''}
                            onChange={e => handleTextChange(dynamicSteps[currentStepIndex - 1].fields.yes.id, e.target.value)}
                          />
                        </div>
                      )}
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

          {/* Cal.com CTA button removed per user request. */}

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
    </>
  )
}
