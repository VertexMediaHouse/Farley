// ─── Raw catalog record (shape of colors.json entries) ─────────────────────

export interface RawPaintColor {
  family?: string; // ignored — scrape artifact, always "Explore Paint Colors"
  name: string;
  brand: string;
  number: string;
  hex: string;
  rgb: number[];
}

// ─── Classified color (what the rest of the app works with) ────────────────

export interface PaintColor {
  name: string;
  brand: string;
  number: string;
  hex: string;
  rgb: [number, number, number];
  /** Derived color family, e.g. "Blue", "Gray" */
  family: string;
  /** Derived shade within the family, e.g. "Cool Gray" */
  shade: string;
}

export interface ShadeGroup {
  shade: string;
  /** Representative color used for the shade swatch (median lightness color in the group) */
  representative: PaintColor;
  colors: PaintColor[];
}

export interface FamilyGroup {
  family: string;
  /** A handful of representative colors used for the family's mini palette preview */
  preview: PaintColor[];
  shades: ShadeGroup[];
  totalColors: number;
}

export type CatalogTree = FamilyGroup[];