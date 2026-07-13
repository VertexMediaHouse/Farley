export function adaptV2ToV1Estimate(drywall: any[], trim: any[], paint: any[], contact: any) {
  const formData: any = {
    length: '0',
    width: '0',
    height: '0',
    address: contact.clientAddress || '',
    services: {
      drywall: drywall.length > 0 && Object.keys(drywall[0]).length > 0,
      paint: paint.length > 0 && Object.keys(paint[0]).length > 0,
      trim: trim.length > 0 && Object.keys(trim[0]).length > 0,
      electrical: false,
    },
    has_photos: 'No',
  };

  // --- DRYWALL ---
  let wallSqft = 0, ceilSqft = 0, bathWallSqft = 0, bathCeilSqft = 0;
  let demoWallSqft = 0, demoCeilSqft = 0, demoInsSqft = 0, demoBaseFt = 0;
  let hasTexture = '';
  let insulation = false;
  let cornerMetal: string[] = [];
  let cornerCount = 0;
  let popcornSqft = 0;
  
  drywall.forEach(area => {
    const type = area.repairType;
    const sqft = parseFloat(area.crackSquareFootage) || parseFloat(area.demolitionSquareFootage) || 0; 
    if (type === 'Walls' || type === 'Crack Repair Wall') wallSqft += sqft;
    if (type === 'Ceiling' || type === 'Crack Repair Ceiling') ceilSqft += sqft;
    if (type === 'Bathroom Walls') bathWallSqft += sqft;
    if (type === 'Bathroom Ceiling') bathCeilSqft += sqft;
    
    const demo = area.needDemolition;
    const demoSqft = parseFloat(area.demolitionSquareFootage) || 0;
    const demoFt = parseFloat(area.demolitionLinearFeet) || 0;
    
    if (demo === 'Remove Existing Wall Drywall') demoWallSqft += demoSqft;
    if (demo === 'Remove Existing Ceiling Drywall') demoCeilSqft += demoSqft;
    if (demo === 'Remove Existing Wall Insulation' || demo === 'Remove Existing Ceiling Insulation') demoInsSqft += demoSqft;
    if (demo === 'Baseboard') demoBaseFt += demoFt;
    if (demo === 'Popcorn Ceiling Scraping') popcornSqft += demoSqft;
    
    if (area.texture && !hasTexture) hasTexture = area.texture;
    if (area.needInsulation && area.needInsulation !== 'No') insulation = true;
    if (area.needCornerMetal && area.needCornerMetal !== 'No') {
      if (area.needCornerMetal === 'Standard 90°') cornerMetal.push('Standard 90 Degree Corner Metal');
      else if (area.needCornerMetal === 'Bullnose') cornerMetal.push('Bullnose Corner Metal');
      else if (area.needCornerMetal === 'Arch Bullnose') cornerMetal.push('Arch Bullnose Corner Metal');
      else if (area.needCornerMetal === 'Arch 90°') cornerMetal.push('Arch Standard 90 Degree Corner Metal');
      cornerCount += parseFloat(area.cornerQuantity) || 1;
    }
  });

  if (hasTexture) formData.drywall_texture = hasTexture;

  formData.drywall_wall_sqft = wallSqft;
  formData.drywall_ceiling_sqft = ceilSqft;
  formData.drywall_bathroom_wall_sqft = bathWallSqft;
  formData.drywall_bathroom_ceiling_sqft = bathCeilSqft;
  
  const demoArr: string[] = [];
  if (demoWallSqft > 0) demoArr.push('Remove Existing Wall Drywall');
  if (demoCeilSqft > 0) demoArr.push('Remove Existing Ceiling Drywall');
  if (demoInsSqft > 0) demoArr.push('Remove Insulation (sqft)');
  if (demoBaseFt > 0) demoArr.push('Remove Base Board (linear ft)');
  if (popcornSqft > 0) demoArr.push('Popcorn Ceiling Removal');
  formData.drywall_demolition = demoArr;
  formData.drywall_demo_wall_sqft = demoWallSqft;
  formData.drywall_demo_ceiling_sqft = demoCeilSqft;
  formData.drywall_demo_insulation_sqft = demoInsSqft;
  formData.drywall_demo_baseboard_ft = demoBaseFt;
  formData.drywall_popcorn_sqft = popcornSqft;

  if (insulation) formData.drywall_insulation = 'Yes';
  if (cornerMetal.length > 0) {
    formData.drywall_corner_metal = cornerMetal;
    formData.drywall_corner_count = cornerCount;
    formData.drywall_corner_length = '8ft';
  }

  // --- TRIM ---
  let baseboardFeet = 0;
  let casingFeet = 0;
  trim.forEach(area => {
    const bf = parseFloat(area.baseboardLinearFeet) || 0;
    const cf = parseFloat(area.casingLinearFeet) || 0;
    baseboardFeet += bf;
    casingFeet += cf;
  });
  formData.trim_base_linear_feet = baseboardFeet;
  formData.trim_casing_linear_feet = casingFeet;
  if (baseboardFeet > 0 || casingFeet > 0) {
     formData.trim_services = 'install new baseboard'; // default to install
  }

  // --- PAINT ---
  let paintWallSqft = 0, paintCeilSqft = 0, paintTrimFt = 0;
  paint.forEach(area => {
    // Assuming some fields like squareFootage, linearFeet
    const sqft = parseFloat(area.squareFootage) || 0;
    const ft = parseFloat(area.linearFeet) || 0;
    if (area.surfaceType === 'Walls') paintWallSqft += sqft;
    if (area.surfaceType === 'Ceiling') paintCeilSqft += sqft;
    if (area.surfaceType === 'Trim' || area.surfaceType === 'Baseboard') paintTrimFt += ft;
  });

  const paintAreaArr = [];
  if (paintWallSqft > 0) paintAreaArr.push('Wall');
  if (paintCeilSqft > 0) paintAreaArr.push('Ceiling');
  formData.paint_area = paintAreaArr;
  formData.paint_wall_sqft = paintWallSqft;
  formData.paint_ceiling_sqft = paintCeilSqft;

  const paintTrimArr = [];
  if (paintTrimFt > 0) paintTrimArr.push('Trim');
  formData.paint_trim_area = paintTrimArr;
  formData.paint_trim_linear_ft = paintTrimFt;

  return formData;
}
