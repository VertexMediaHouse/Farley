// curatedShades.ts
// Hand-picked "shade" swatches per family, per brand filter.
// Key format: `${family}` for "All", or `${family}:${brand}` for a specific brand.

export const CURATED_SHADES: Record<string, string[]> = {
  white: ['#EAD4C4', '#FAECD1', '#DFD5BB', '#E4DCBF', '#DBE0C4', '#DDE2E6'],
  'white:Behr': ['#DFD5BB', '#E4DCBF', '#DBE0C4'],
  'white:PPG - Glidden': ['#EAD4C4', '#FAECD1', '#DDE2E6'],

  gray: ['#6B655B', '#5E5C50', '#88927E', '#71847D', '#586766', '#4A5257', '#5E5967', '#584B4D'],
  'gray:Behr': ['#6B655B', '#88927E', '#586766', '#4A5257', '#584B4D'],
  'gray:PPG - Glidden': ['#817F6E', '#71847D', '#656874', '#F0DEE0'],

  black: [], // no shades
  'black:Behr': [],
  'black:PPG - Glidden': [],

  brown: ['#C9543A', '#A76945', '#BC6F37', '#C27F38', '#C1853B', '#BB852F', '#C39E44', '#C9AA37'],
  'brown:Behr': ['#BF5C42', '#C77B42', '#C1853B', '#C08F34', '#C9AA37'],
  'brown:PPG - Glidden': ['#C9543A', '#C27F38', '#BB852F', '#A28B36'],

  neutral: ['#E2C7B6', '#E1CFB2', '#EDE5BC'],
  'neutral:Behr': ['#E2C7B6', '#DAD0AD'],
  'neutral:PPG - Glidden': ['#E2BCB3', '#E1CFB2'],

  red: ['#AC3E5F', '#BE3C37', '#D04938', '#8C4F42'],
  'red:Behr': ['#9A4149', '#D04938'],
  'red:PPG - Glidden': ['#AC3A3E', '#A4493D'],

  orange: ['#EA7739', '#FFA035'],
  'orange:Behr': ['#FA9335', '#FFA035'],
  'orange:PPG - Glidden': [],

  yellow: ['#FFBD1B', '#FFC819'],
  'yellow:Behr': [],
  'yellow:PPG - Glidden': [],

  green: ['#A9A52A', '#7A8C31', '#698538', '#398749', '#027944', '#5AC7AC'],
  'green:Behr': ['#A9A52A', '#698538', '#1F6C53', '#5AC7AC'],
  'green:PPG - Glidden': ['#8C8449', '#027944'],

  blue: ['#00AAAC', '#00A0C6', '#0079B3', '#156A9B', '#1C70AD', '#265C98'],
  'blue:Behr': ['#00AAAC', '#00A0C6', '#156A9B', '#265C98'],
  'blue:PPG - Glidden': ['#005E88', '#1C70AD', '#234E86'],

  purple: ['#445397', '#905284', '#774041'],
  'purple:Behr': ['#3C4B7E', '#91507B'],
  'purple:PPG - Glidden': [],
};

export function getCuratedShades(family: string, brand: 'All' | string): string[] {
  const key = brand === 'All' ? family : `${family}:${brand}`;
  return CURATED_SHADES[key] ?? CURATED_SHADES[family] ?? [];
}