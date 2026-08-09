import type { RawPaintColor, PaintColor, ShadeGroup, CatalogTree } from './types';

// ─── Color math ──────────────────────────────────────────────────────────────

interface HSL {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
    case gn: h = (bn - rn) / d + 2; break;
    default: h = (rn - gn) / d + 4; break;
  }
  h *= 60;
  return { h, s, l };
}

// ─── Family classification ──────────────────────────────────────────────────
// Order matters: achromatic / near-achromatic checks first, then hue bands.

const FAMILY_ORDER = [
  'Popular', 'White', 'Black', 'Gray', 'Neutral',
  'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Brown',
] as const;

function classifyFamily(hsl: HSL): string {
  const { h, s, l } = hsl;

  // Very light, low saturation -> White
  if (l >= 0.90 && s <= 0.18) return 'White';
  // Very dark -> Black
  if (l <= 0.28 && s <= 0.12) return 'Black';
  // Low saturation, mid lightness -> Gray (unless it leans warm, then Neutral)
  if (s <= 0.08) return 'Gray';
  if (s <= 0.16) {
    // slightly tinted grays: warm hues (20-60) read as "Neutral" (greige/taupe family)
    if ((h >= 15 && h <= 65) || h >= 340) return 'Neutral';
    return 'Gray';
  }

  // Warm hue band (tan/beige/brown/orange territory, h 15-45) is the trickiest:
  // saturation and lightness -- not hue alone -- decide whether something reads
  // as a true saturated orange vs. a muted neutral/beige vs. a brown.
  if (h >= 15 && h <= 45) {
    // Muted + light/mid lightness = beige/tan -> Neutral, regardless of exact hue
    if (s <= 0.35 && l >= 0.55) return 'Neutral';
    // Muted + darker = brown
    if (s <= 0.45 && l < 0.55) return 'Brown';
    // Fairly saturated but darker still reads as brown, not orange
    if (l <= 0.40) return 'Brown';
    // What's left (saturated + bright) is genuinely orange
    return 'Orange';
  }

  // Hue-band buckets
  if (h < 15 || h >= 345) return 'Red';
  if (h < 70) return 'Yellow';
  if (h < 170) return 'Green';
  if (h < 255) return 'Blue';
  if (h < 345) return 'Purple';
  return 'Neutral';
}

// ─── Shade classification (per family) ──────────────────────────────────────
// Each family gets a small, meaningful set of shade buckets rather than a
// generic "light/medium/dark" split.

function classifyShade(family: string, hsl: HSL): string {
  const { h, s, l } = hsl;

  switch (family) {
    case 'White':
      if (s <= 0.04) return 'Pure White';
      if (h >= 15 && h <= 65) return 'Warm White';
      if (h >= 170 && h <= 260) return 'Cool White';
      return 'Off White';

    case 'Black':
      return l <= 0.06 ? 'True Black' : 'Charcoal Black';

    case 'Gray':
      if (l >= 0.65) return 'Light Gray';
      if (l <= 0.30) return 'Charcoal Gray';
      if ((h >= 15 && h <= 65) || h >= 340) return 'Warm Gray';
      if (h >= 170 && h <= 260) return 'Cool Gray';
      if (h > 65 && h < 170) return 'Green Gray';
      if (h >= 260 && h < 340) return 'Blue Gray';
      return 'Mid Gray';

    case 'Neutral':
      if (l >= 0.70) return 'Light Neutral';
      if (l <= 0.35) return 'Dark Neutral';
      if (h >= 15 && h <= 45) return 'Greige';
      return 'Taupe';

    case 'Brown':
      if (l >= 0.55) return 'Light Brown';
      if (l <= 0.28) return 'Dark Brown';
      if (s >= 0.35) return 'Warm Brown';
      return 'Mid Brown';

    case 'Red':
      if (l >= 0.75) return 'Blush';
      if (l <= 0.30) return 'Deep Red';
      if (h >= 350 || h < 5) return 'True Red';
      return 'Pink Red';

    case 'Orange':
      if (l >= 0.75) return 'Peach';
      if (l <= 0.35) return 'Burnt Orange';
      return 'True Orange';

    case 'Yellow':
      if (l >= 0.80) return 'Pale Yellow';
      if (l <= 0.40) return 'Gold';
      return 'True Yellow';

    case 'Green':
      if (l >= 0.75) return 'Mint';
      if (l <= 0.30) return 'Deep Green';
      if (h < 110) return 'Yellow Green';
      if (h < 150) return 'True Green';
      return 'Teal Green';

    case 'Blue':
      if (l >= 0.80) return 'Sky Blue';
      if (l <= 0.30) return 'Navy';
      if (h < 200) return 'Teal Blue';
      if (h < 230) return 'True Blue';
      return 'Slate Blue';

    case 'Purple':
      if (l >= 0.78) return 'Lavender';
      if (l <= 0.32) return 'Deep Purple';
      if (h < 280) return 'Violet';
      return 'True Purple';

    default:
      return 'Other';
  }
}

// ─── Classify one raw record ─────────────────────────────────────────────────

export function classifyColor(raw: RawPaintColor): PaintColor | null {
  if (!raw.hex || !raw.rgb || raw.rgb.length < 3 || !raw.name) return null;
  const [r, g, b] = raw.rgb;
  const hsl = rgbToHsl(r, g, b);
  
  let family = classifyFamily(hsl);
  if (raw.family && typeof raw.family === 'string') {
    family = raw.family.charAt(0).toUpperCase() + raw.family.slice(1).toLowerCase();
  }
  
  const shade = classifyShade(family, hsl);
  return {
    name: raw.name,
    brand: raw.brand || 'Unknown',
    number: raw.number || '',
    hex: raw.hex,
    rgb: [r, g, b],
    family,
    shade,
  };
}

// ─── Build the full Family -> Shade -> Colors tree ───────────────────────────

function pickRepresentative(colors: PaintColor[]): PaintColor {
  // median by perceived lightness so the swatch isn't an outlier
  const sorted = [...colors].sort((a, b) => {
    const la = rgbToHsl(...a.rgb).l;
    const lb = rgbToHsl(...b.rgb).l;
    return la - lb;
  });
  return sorted[Math.floor(sorted.length / 2)];
}

export function buildCatalogTree(rawColors: RawPaintColor[]): CatalogTree {
  const classified: PaintColor[] = [];
  for (const raw of rawColors) {
    const c = classifyColor(raw);
    if (c) classified.push(c);
  }

  const byFamily = new Map<string, Map<string, PaintColor[]>>();
  for (const color of classified) {
    if (!byFamily.has(color.family)) byFamily.set(color.family, new Map());
    const shadeMap = byFamily.get(color.family)!;
    if (!shadeMap.has(color.shade)) shadeMap.set(color.shade, []);
    shadeMap.get(color.shade)!.push(color);
  }

  // Artificial 'Popular' family using top 60 colors
  const popularColors = classified.slice(0, 60);
  const popularShadeMap = new Map<string, PaintColor[]>();
  for (const color of popularColors) {
    if (!popularShadeMap.has(color.shade)) popularShadeMap.set(color.shade, []);
    popularShadeMap.get(color.shade)!.push(color);
  }
  byFamily.set('Popular', popularShadeMap);

  const tree: CatalogTree = [];
  for (const family of FAMILY_ORDER) {
    const shadeMap = byFamily.get(family);
    if (!shadeMap || shadeMap.size === 0) continue;

    const shades: ShadeGroup[] = Array.from(shadeMap.entries())
      .map(([shade, colors]) => ({
        shade,
        representative: pickRepresentative(colors),
        colors: colors.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => b.colors.length - a.colors.length);

    const totalColors = shades.reduce((sum, s) => sum + s.colors.length, 0);
    // preview swatches: one representative per shade, up to 6, spread across shades
    const preview = shades.slice(0, 6).map((s) => s.representative);

    tree.push({ family, preview, shades, totalColors });
  }

  return tree;
}