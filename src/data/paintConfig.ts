import type { QuestionConfig } from '../types/form';

export const paintConfig: QuestionConfig[] = [
  {
    id: 'paintArea',
    label: 'What area needs paint?',
    type: 'dropdown',
    required: true,
    options: ['', 'Room wall', 'Ceiling', 'Bathroom wall', 'Bathroom Ceiling', 'Baseboards', 'Door Casing'],
  },
  {
    id: 'paintType',
    label: 'Would you like corner to corner painting or just touch ups?',
    type: 'dropdown',
    required: true,
    options: ['', 'Corner to corner', 'Touch ups'],
  },
  {
    id: 'paintMatchRequested',
    label: 'Would you like us to match your existing paint color?',
    type: 'dropdown',
    required: true,
    options: ['', 'Yes — Match my existing paint color', 'No — I will select/use a different paint color'],
  },
  {
    id: 'paintMatchPhotos',
    label: 'Upload clear photos of the existing wall/ceiling color, the repair area, and surrounding reference',
    type: 'photoUpload',
    multiple: true,
    required: true,
    condition: { field: 'paintMatchRequested', is: 'Yes — Match my existing paint color' }
  },
  {
    id: 'paintMatchSheen',
    label: 'Existing Paint Sheen',
    type: 'dropdown',
    required: true,
    options: ['', 'Flat', 'Matte', 'Eggshell', 'Satin', 'Semi-Gloss', 'Gloss', 'I Don\'t Know'],
    condition: { field: 'paintMatchRequested', is: 'Yes — Match my existing paint color' }
  },
  {
    id: 'paintMatchBrand',
    label: 'Do you know the existing paint brand? (Optional)',
    type: 'text',
    placeholder: 'e.g. Behr, Sherwin-Williams',
    condition: { field: 'paintMatchRequested', is: 'Yes — Match my existing paint color' }
  },
  {
    id: 'paintMatchNotice',
    label: 'PAINT COLOR MATCHING NOTICE',
    type: 'notice',
    noticeText: 'We will make every reasonable effort to match your existing paint color as closely as possible. However, an exact 100% paint match cannot be guaranteed.\n\nExisting paint can change over time due to aging, fading, sunlight exposure, wear, previous paint batches, application methods, sheen, and other conditions.\n\nFor the most uniform finished appearance, we recommend painting the affected surface corner-to-corner rather than performing only a localized touch-up. If you choose touch-up or partial-area painting instead of corner-to-corner painting, you understand that some color or sheen variation may remain visible.',
    condition: { field: 'paintMatchRequested', is: 'Yes — Match my existing paint color' }
  },
  {
    id: 'paintMatchAck',
    label: 'I understand that paint color matching is an approximation and that an exact match is not guaranteed. I understand that touch-up or partial-area painting may result in visible color or sheen differences.',
    type: 'checkbox',
    required: true,
    condition: { field: 'paintMatchRequested', is: 'Yes — Match my existing paint color' }
  },
  {
    id: 'paintHasPaint',
    label: 'Do you have the paint already to paint corner to corner for your project?',
    type: 'dropdown',
    required: true,
    options: ['', 'Yes', 'No'],
    condition: {
      field: 'paintType',
      is: 'Corner to corner',
      and: { field: 'paintMatchRequested', is: 'No — I will select/use a different paint color' }
    },
  },
  {
    id: 'paintColorExplorer',
    label: 'Pick your paint color',
    type: 'paintColorExplorer',
    required: true,
    condition: {
      field: 'paintHasPaint',
      is: 'No',
      and: { field: 'paintMatchRequested', is: 'No — I will select/use a different paint color' }
    },
  },
  {
    id: 'paintSheen',
    label: 'Paint Sheen',
    type: 'dropdown',
    required: true,
    options: ['', 'Flat', 'Egg shell', 'Satin', 'Semi gloss'],
    condition: {
      field: 'paintHasPaint',
      is: 'No',
      and: { field: 'paintMatchRequested', is: 'No — I will select/use a different paint color' }
    },
  },
  {
    id: 'paintHasPaintNotice',
    label: '',
    type: 'notice',
    noticeText: 'Please select from the HD paint options and we will include the correct amount of paint in your proposal based on the info you have entered above.',
    condition: { field: 'paintHasPaint', is: 'No' },
  },
  {
    id: 'squareFootage',
    label: 'Square Footage',
    type: 'number',
    placeholder: 'sq ft',
    condition: { field: 'paintArea', in: ['Room wall', 'Ceiling', 'Bathroom wall', 'Bathroom Ceiling'] },
  },
  {
    id: 'linearFeet',
    label: 'Linear feet',
    type: 'number',
    placeholder: 'ft',
    condition: { field: 'paintArea', in: ['Baseboards', 'Door Casing'] },
  },
  {
    id: 'photos',
    label: 'Upload Photos',
    type: 'photoUpload',
    multiple: true,
    condition: { field: 'paintArea', not: '' },
    required: true,
  },
  {
    id: 'projectLevel',
    label: 'What level is the project on?',
    type: 'dropdown',
    required: true,
    options: ['', 'First Floor', 'Second Floor', 'Third Floor+', 'Basement', 'Garage'],
  },
  {
    id: 'staircase',
    label: 'Is this on a staircase?',
    type: 'dropdown',
    required: true,
    options: ['', 'Yes', 'No'],
  },
  {
    id: 'ceilingAbove8',
    label: 'Is the ceiling height above 8 feet?',
    type: 'dropdown',
    options: ['', 'Yes', 'No'],
  },
  {
    id: 'ceilingHeight',
    label: 'Height (ft)',
    type: 'dropdown',
    required: true,
    options: [
      '',
      '9ft',
      '10ft',
      '11ft',
      '12ft'
    ],
    condition: { field: 'ceilingAbove8', is: 'Yes' },
  },
];
