import type { QuestionConfig } from '../types/form';

export const trimConfig: QuestionConfig[] = [
  {
    id: 'service',
    label: 'What service do you need?',
    type: 'dropdown',
    required: true,
    options: [
      '',
      'Install new Baseboards in place of old?',
      'Replace existing Baseboards?',
      'Install new door Casing?',
      'Replace existing Casing?',
    ],
  },
  {
    id: 'photos',
    label: 'Upload Photos',
    type: 'photoUpload',
    multiple: true,
    condition: { field: 'service', not: '' },
  },
  {
    id: 'baseboardLinearFeet',
    label: 'Add linear ft (Baseboard)',
    type: 'number',
    required: true,
    placeholder: 'ft',
    condition: { field: 'service', in: ['Install new Baseboards in place of old?', 'Replace existing Baseboards?'] },
  },
  {
    id: 'baseboardHeight',
    label: 'Add height',
    type: 'dropdown',
    options: ['', '6', '7', '8', '9', '10'],
    condition: { field: 'service', in: ['Install new Baseboards in place of old?', 'Replace existing Baseboards?'] },
  },
  {
    id: 'casingLinearFeet',
    label: 'Add linear ft (Casing)',
    type: 'number',
    required: true,
    placeholder: 'ft',
    condition: { field: 'service', in: ['Install new door Casing?', 'Replace existing Casing?'] },
  },
  {
    id: 'baseboardNotice',
    label: '',
    type: 'notice',
    noticeText: 'If you are not able to make a selection on the base board or casing please select provided base/trim. We can still install your provided base. Please enter linear feet.',
    condition: { field: 'service', in: ['Install new Baseboards in place of old?', 'Replace existing Baseboards?', 'Install new door Casing?', 'Replace existing Casing?'] },
  },
  {
    id: 'baseboardCatalog',
    label: 'Select Baseboard / Casing from Catalog',
    type: 'catalogDropdown',
    condition: { field: 'service', in: ['Install new Baseboards in place of old?', 'Replace existing Baseboards?', 'Install new door Casing?', 'Replace existing Casing?'] },
    catalog: [
      {
        size: 'Baseboard 3”',
        products: [
          { name: 'Kelleher LWM623 9 16" × 3 1 4" MDF Baseboard Molding MDF221A', url: 'https://www.homedepot.com/p/Kelleher-LWM623-9-16-in-x-3-1-4-in-MDF-Baseboard-Molding-MDF221A/202071604', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Builders Choice Pro Pack OP306 1 2" × 3 1 2" × 144" Primed MDF Baseboard Moulding 8 Pack 96 Total Linear Feet HDFB306 PP', url: 'https://www.homedepot.com/p/Builders-Choice-Pro-Pack-OP306-1-2-in-x-3-1-2-in-x-144-in-Primed-MDF-Baseboard-Moulding-8-Pack-96-Total-Linear-Feet-HDFB306-PP/306717387', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'FINISHED ELEGANCE 1" × 3" × 8 ft MDF Molding Board 10003223', url: 'https://www.homedepot.com/p/FINISHED-ELEGANCE-1-in-x-3-in-x-8-ft-MDF-Molding-Board-10003223/204468315', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Woodgrain Millwork 713 9 16" × 3 1 4" × 96" Primed Finger Jointed Baseboard Moulding 1 Piece 8 Total Linear Feet 10000568', url: 'https://www.homedepot.com/p/Woodgrain-Millwork-713-9-16-in-x-3-1-4-in-x-96-in-Primed-Finger-Jointed-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10000568/203209374', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
        ]
      },
      {
        size: 'Baseboard 4”',
        products: [
          { name: 'FINISHED ELEGANCE 1" × 4" × 8 ft MDF Molding Boards 10003222', url: 'https://www.homedepot.com/p/FINISHED-ELEGANCE-1-in-x-4-in-x-8-ft-MDF-Molding-Boards-10003222/204468314', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Alexandria Moulding Pro Pack 1 2" × 4" × 84" Primed E1E MDF Baseboard Moulding 4 Pack 28 Total Linear Feet 01240 96084PK', url: 'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-1-2-in-x-4-in-x-84-in-Primed-E1E-MDF-Baseboard-Moulding-4-Pack-28-Total-Linear-Feet-01240-96084PK/331387080', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Alexandria Moulding Pro Pack 9 16" × 4 1 4" × 96" Primed White Pine Baseboard Moulding 4 Pack 32 Total Linear Feet 00LK4 93096PK', url: 'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-9-16-in-x-4-1-4-in-x-96-in-Primed-White-Pine-Baseboard-Moulding-4-Pack-32-Total-Linear-Feet-00LK4-93096PK/331519591', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Alexandria Moulding Pro Pack 5 8" × 4 1 4" × 96" Primed MDF Baseboard Moulding 4 Pack 32 Total Linear Feet 90412 96096PK', url: 'https://www.homedepot.com/p/Alexandria-Moulding-Pro-Pack-5-8-in-x-4-1-4-in-x-96-in-Primed-MDF-Baseboard-Moulding-4-Pack-32-Total-Linear-Feet-90412-96096PK/331387087', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
        ]
      },
      {
        size: 'Baseboard 5”',
        products: [
          { name: 'Woodgrain Millwork 1866 9 16" × 5 1 4" × 96" Primed MDF Baseboard Moulding 1 Piece 8 Total Linear Feet 10001790', url: 'https://www.homedepot.com/p/Woodgrain-Millwork-1866-9-16-in-x-5-1-4-in-x-96-in-Primed-MDF-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10001790/203209462', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Woodgrain Millwork 11 16" × 5 1 2" × 96" Primed MDF Craftsman Baseboard Moulding 1 Piece 8 Total Linear Feet 10026967', url: 'https://www.homedepot.com/p/Woodgrain-Millwork-11-16-in-x-5-1-2-in-x-96-in-Primed-MDF-Craftsman-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10026967/302793194', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'HOUSE OF FARA 5 8" D × 5 1 4" W × 96" L Primed Pine Wood Finger Joint Baseboard Moulding 5709PFJ', url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-5-8-in-D-x-5-1-4-in-W-x-96-in-L-Primed-Pine-Wood-Finger-Joint-Baseboard-Moulding-5709PFJ/340059370', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Woodgrain Millwork 618 9 16" × 5 1 4" × 96" Primed Finger Jointed Baseboard Moulding 1 Piece 8 Total Linear Feet 10001781', url: 'https://www.homedepot.com/p/Woodgrain-Millwork-618-9-16-in-x-5-1-4-in-x-96-in-Primed-Finger-Jointed-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-10001781/203209486', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
        ]
      },
      {
        size: 'Baseboard 6”',
        products: [
          { name: 'Unbranded 1" × 6" × 8 ft Radiata Pine Finger Joint Primed Board 280552', url: 'https://www.homedepot.com/p/Unbranded-1-in-x-6-in-x-8-ft-Radiata-Pine-Finger-Joint-Primed-Board-280552/304468198', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Builder s Choice 257 5 8" × 6" Primed MDF Baseboard Moulding Sold by Linear Foot HDFB257', url: 'https://www.homedepot.com/p/Builder-s-Choice-257-5-8-in-x-6-in-Primed-MDF-Baseboard-Moulding-Sold-by-Linear-Foot-HDFB257/206005284', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'HOUSE OF FARA 8665 3 4" × 6 1 2" × 96" MDF Baseboard Moulding 1 Piece 8 Total Linear Feet 8665', url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-8665-3-4-in-x-6-1-2-in-x-96-in-MDF-Baseboard-Moulding-1-Piece-8-Total-Linear-Feet-8665/202087580', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'HOUSE OF FARA 11 16" D × 6" W × 96" L Primed Pine Wood Finger Joint Baseboard Moulding H20PFJ', url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-6-in-W-x-96-in-L-Primed-Pine-Wood-Finger-Joint-Baseboard-Moulding-H20PFJ/339857100', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
        ]
      },
      {
        size: 'Casing 2”',
        products: [
          { name: 'WM 356 11 16" × 2 1 4" × 84" Primed Finger Jointed Casing 10000527', url: 'https://www.homedepot.com/p/WM-356-11-16-in-x-2-1-4-in-x-84-in-Primed-Finger-Jointed-Casing-10000527/206001677', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Woodgrain Millwork 25E2 11 16" × 2 1 2" × 96" Craftsman Primed MDF Casing 1 Piece 8 Total Linear Feet 10026964', url: 'https://www.homedepot.com/p/Woodgrain-Millwork-25E2-11-16-in-x-2-1-2-in-x-96-in-Craftsman-Primed-MDF-Casing-1-Piece-8-Total-Linear-Feet-10026964/302792237', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: '711 5 8" × 2 1 2" × 7 ft MDF Casing MDF424A 1', url: 'https://www.homedepot.com/p/711-5-8-in-x-2-1-2-in-x-7-ft-MDF-Casing-MDF424A-1/204685095', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'HOUSE OF FARA 11 16" D × 2 1 2" W × 84" L Primed Pine Wood PFJ Casing Moulding 361PFJ', url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-2-1-2-in-W-x-84-in-L-Primed-Pine-Wood-PFJ-Casing-Moulding-361PFJ/334803846', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
        ]
      },
      {
        size: 'Casing 3”',
        products: [
          { name: 'RB03 1" × 3 1 2" × 96" Primed MDF Casing 1 Piece 8 Total Linear Feet 10002037', url: 'https://www.homedepot.com/p/RB03-1-in-x-3-1-2-in-x-96-in-Primed-MDF-Casing-1-Piece-8-Total-Linear-Feet-10002037/204167646', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Woodgrain Millwork LWM 445 5 8" × 3 1 4" × 96" Primed Finger Jointed Casing 10000550', url: 'https://www.homedepot.com/p/Woodgrain-Millwork-LWM-445-5-8-in-x-3-1-4-in-x-96-in-Primed-Finger-Jointed-Casing-10000550/203209381', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'HOUSE OF FARA 11 16" D × 3 1 4" W × 96" L Primed Pine Finger Joint Wood Casing Moulding W360 PFJ', url: 'https://www.homedepot.com/p/HOUSE-OF-FARA-11-16-in-D-x-3-1-4-in-W-x-96-in-L-Primed-Pine-Finger-Joint-Wood-Casing-Moulding-W360-PFJ/340684060', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
          { name: 'Builders Choice Pro Pack 434 11 16" × 3 1 2" × 84" Craftsman Finished MDF Primed White Casing 5 Pack 35 Total Linear Feet FECS434DP', url: 'https://www.homedepot.com/p/Builders-Choice-Pro-Pack-434-11-16-in-x-3-1-2-in-x-84-in-Craftsman-Finished-MDF-Primed-White-Casing-5-Pack-35-Total-Linear-Feet-FECS434DP/304065772', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
        ]
      }
    ]
  },
  {
    id: 'projectLevel',
    label: 'Is this on:',
    type: 'dropdown',
    required: true,
    options: ['', 'First Floor', 'Second Floor', 'Third Floor+', 'Basement', 'Garage'],
  },
  {
    id: 'staircase',
    label: 'Is this on a staircase?',
    type: 'dropdown',
    options: ['', 'Yes', 'No'],
  },
  {
    id: 'staircasePhoto',
    label: 'Add photo',
    type: 'photoUpload',
    multiple: true,
    condition: { field: 'staircase', is: 'Yes' },
  },
  {
    id: 'staircaseHeight',
    label: 'Add the height to the project from stair level.',
    type: 'number',
    required: true,
    placeholder: 'ft',
    condition: { field: 'staircase', is: 'Yes' },
  },
];
