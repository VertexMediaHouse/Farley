// ShadeStep.tsx — Step 2: pick a shade
import { getCuratedShades } from './curatedShades';

interface ShadeStepProps {
  family: string;
  brand: 'All' | string;
  selectedShade: string | null;
  onSelectShade: (hex: string) => void;
}

export default function ShadeStep({ family, brand, selectedShade, onSelectShade }: ShadeStepProps) {
  const shades = getCuratedShades(family, brand);

  if (shades.length === 0) {
    return (
      <div className="py-2 text-xs text-slate-400">No shade breakdown for this selection.</div>
    );
  }

  return (
    <div className="_navBars_t9xpw_10 flex w-fit gap-2">
      {shades.map((hex) => {
        const isActive = selectedShade === hex;
        // reuse the same luminance-based text-color logic your markup implies (_white_/_black_)
        const isDark = isLuminanceDark(hex);
        return (
          <button
            key={hex}
            type="button"
            data-testid="color-shades"
            aria-label={`Shade ${hex}`}
            aria-pressed={isActive}
            onClick={() => onSelectShade(hex)}
            style={{ background: hex }}
            className={[
              '_navBar-15_t9xpw_1 flex aspect-square w-24 h-24 rounded-md shadow-sm transition-transform hover:scale-105',
              isDark ? 'text-white' : 'text-slate-900',
              isActive ? '_active_t9xpw_31 ring-4 ring-offset-2 ring-[#2F9BF0]' : 'border border-black/10',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}

function isLuminanceDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.6;
}