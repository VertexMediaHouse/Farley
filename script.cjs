const fs = require('fs')

let code = fs.readFileSync('src/components/EstimateWizard.tsx', 'utf8')

// 1. Update initialAnswers
code = code.replace(
  /  drywall_areas_checkbox: \[\],[\s\S]*?electrical_fixture_count: '',/,
  `  drywall_area: [],
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
  electrical_fixture_count: '',`
)

// 2. Replace the drywall steps block
const regex = /    \/\/ 1\. Drywall questions\s+if \(answers\.services\.drywall\) \{[\s\S]*?stepsList\.push\(\{\s*id: 'additional_info',/;
if (!regex.test(code)) {
  console.log('Regex did not match');
  process.exit(1);
}

const newSteps = `    // 1. Drywall questions
    if (answers.services.drywall) {
      stepsList.push({
        id: 'drywall_area',
        title: 'WHAT AREA NEEDS drywall?',
        type: 'checkbox',
        options: ['Walls', 'Ceiling', 'Bathroom walls', 'Bathroom ceiling']
      })

      stepsList.push({
        id: 'drywall_work_type',
        title: 'WHAT TYPE OF DRYWALL WORK?',
        type: 'checkbox',
        options: [
          'Small Hole Repair - 12x12"',
          'Medium Patch Repair - 24x24"',
          'Large Section Repair - 36x36"',
          'Full Wall Replacement',
          'Ceiling Replacement',
          'Entire Room Installation'
        ]
      })

      const drywallWork = Array.isArray(answers.drywall_work_type) ? answers.drywall_work_type : (answers.drywall_work_type ? [answers.drywall_work_type] : [])
      const needsPhoto = drywallWork.some(w => w.includes('Repair'))
      if (needsPhoto) {
        stepsList.push({
          id: 'drywall_work_photos',
          title: 'Please add photos next to each hole',
          type: 'photo_upload'
        })
      }

      const needsDimensions = drywallWork.some(w => 
        w === 'Full Wall Replacement' || w === 'Ceiling Replacement' || w === 'Entire Room Installation'
      )
      if (needsDimensions) {
        stepsList.push({
          id: 'drywall_dimensions_pane',
          title: 'Please provide dimensions',
          type: 'dimensions_optional'
        })
      }

      stepsList.push({
        id: 'drywall_demolition',
        title: 'DO YOU NEED DEMOLITION?',
        type: 'checkbox',
        options: [
          'No Demo Needed',
          'Remove Existing Wall Drywall',
          'Remove Existing Ceiling Drywall',
          'Remove Both',
          'Remove insulation sqft?',
          'Remove base board linear ft?',
          'Do you need popcorn ceiling removal?'
        ]
      })

      const demo = Array.isArray(answers.drywall_demolition) ? answers.drywall_demolition : (answers.drywall_demolition ? [answers.drywall_demolition] : [])
      if (demo.includes('Remove insulation sqft?')) {
        stepsList.push({
          id: 'drywall_demolition_insulation_sqft',
          title: 'How many sqft of insulation to remove?',
          type: 'text',
          placeholder: 'e.g. 50'
        })
      }

      if (demo.includes('Remove base board linear ft?')) {
        stepsList.push({
          id: 'drywall_demolition_baseboard_ft',
          title: 'How many linear ft of base board to remove?',
          type: 'text',
          placeholder: 'e.g. 20'
        })
      }

      stepsList.push({
        id: 'drywall_soffits',
        title: 'DO YOU HAVE ANY SOFFITS?',
        type: 'checkbox',
        options: ['Wall Soffits', 'Ceiling Soffits', 'None']
      })

      const soffits = Array.isArray(answers.drywall_soffits) ? answers.drywall_soffits : (answers.drywall_soffits ? [answers.drywall_soffits] : [])
      if (soffits.includes('Wall Soffits') || soffits.includes('Ceiling Soffits')) {
        stepsList.push({
          id: 'drywall_soffits_ft',
          title: 'Approximate Linear Feet',
          type: 'text',
          placeholder: 'e.g. 15'
        })
        stepsList.push({
          id: 'drywall_soffits_photos',
          title: 'Please add photos of your soffits',
          type: 'photo_upload'
        })
      }

      stepsList.push({
        id: 'ceiling_height_greater_than_8ft',
        title: 'Is the ceiling height more than 8ft. If so, how tall?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      if (answers.ceiling_height_greater_than_8ft === 'Yes') {
        stepsList.push({
          id: 'ceiling_height_specify',
          title: 'Please add height (in feet)',
          type: 'text',
          placeholder: 'e.g. 10'
        })
      }

      stepsList.push({
        id: 'drywall_vaulted_ceiling',
        title: 'Do you have vaulted ceiling?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      if (answers.drywall_vaulted_ceiling === 'Yes') {
        stepsList.push({
          id: 'drywall_vaulted_width',
          title: 'Vaulted Ceiling Width (ft)',
          type: 'text',
          placeholder: 'e.g. 12'
        })
        stepsList.push({
          id: 'drywall_vaulted_height',
          title: 'Vaulted Ceiling Height (ft)',
          type: 'text',
          placeholder: 'e.g. 10'
        })
        stepsList.push({
          id: 'drywall_vaulted_surrounding',
          title: 'Surrounding wall height (ft)',
          type: 'text',
          placeholder: 'e.g. 8'
        })
      }

      stepsList.push({
        id: 'drywall_insulation',
        title: 'DO YOU NEED INSULATION?',
        type: 'radio',
        options: ['Yes', 'No']
      })

      stepsList.push({
        id: 'drywall_corner_metal',
        title: 'DO YOU Need ANY CORNER METAL?',
        type: 'checkbox',
        options: [
          'No Corner Metal Needed',
          'Standard 90 Degree Corner Metal',
          'Bullnose Corner Metal',
          'Arch Standard 90 Degree Corner Metal',
          'Arch Bullnose Corner Metal'
        ]
      })

      const cornerMetals = Array.isArray(answers.drywall_corner_metal) ? answers.drywall_corner_metal : (answers.drywall_corner_metal ? [answers.drywall_corner_metal] : [])
      const needsCorners = cornerMetals.some(c => c !== 'No Corner Metal Needed')
      if (needsCorners) {
        stepsList.push({
          id: 'drywall_corner_count',
          title: 'HOW MANY CORNERS?',
          type: 'text',
          placeholder: 'e.g. 4'
        })
        
        if (cornerMetals.includes('Standard 90 Degree Corner Metal') || cornerMetals.includes('Bullnose Corner Metal')) {
          stepsList.push({
            id: 'drywall_corner_length',
            title: 'What length of corner metal?',
            type: 'radio',
            options: ['8ft', '10ft', 'Other']
          })
        }
      }

      stepsList.push({
        id: 'drywall_texture',
        title: 'WHAT TEXTURE/FINISH DO YOU WANT?',
        type: 'radio',
        options: ['Smooth Finish', 'Orange Peel', 'Knock Down', 'Match Existing']
      })

      if (answers.drywall_texture === 'Match Existing') {
        stepsList.push({
          id: 'drywall_texture_existing',
          title: 'What is the existing texture?',
          type: 'text',
          placeholder: 'e.g. skip trowel'
        })
        stepsList.push({
          id: 'drywall_texture_photo',
          title: 'Upload photo of existing texture',
          type: 'photo_upload'
        })
      }

      stepsList.push({
        id: 'additional_info',`

code = code.replace(regex, newSteps)

fs.writeFileSync('src/components/EstimateWizard.tsx', code)
console.log('Successfully updated Drywall steps!')
