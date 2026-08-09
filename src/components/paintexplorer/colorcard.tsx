import { memo } from 'react';
import type { PaintColor } from './types';

interface ColorCardProps {
  color: PaintColor;
  isSelected: boolean;
  onSelect: (color: PaintColor) => void;
}

function ColorCardImpl({ color, isSelected, onSelect }: ColorCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(color)}
      aria-pressed={isSelected}
      aria-label={`${color.name} by ${color.brand}, code ${color.number}`}
      className="group/card relative block h-full w-full outline-none"
    >
      <div
        className="h-full w-full transition-transform duration-150 group-hover/card:scale-[1.03]"
        style={{ background: color.hex }}
      />
      {isSelected && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2F9BF0] text-[11px] font-black text-white shadow">
          ✓
        </span>
      )}
      <span
        className={`pointer-events-none absolute inset-0 ring-2 ring-inset transition-colors duration-150 ${
          isSelected ? 'ring-[#2F9BF0]' : 'ring-transparent group-hover/card:ring-white/70'
        }`}
      />
      {/* Info popover — sits below the swatch, shown on hover/focus, matching the reference image */}
      <div className="pointer-events-none absolute left-0 right-0 top-full z-20 origin-top scale-y-95 border border-t-0 border-slate-200 bg-white px-3 py-2 text-left opacity-0 shadow-lg transition-all duration-100 group-hover/card:scale-y-100 group-hover/card:opacity-100 group-focus-visible/card:scale-y-100 group-focus-visible/card:opacity-100">
        <div className="text-sm font-bold leading-tight text-slate-900">{color.brand}</div>
        <div className="truncate text-xs font-medium leading-tight text-[#2F9BF0]">{color.name}</div>
      </div>
    </button>
  );
}

export default memo(ColorCardImpl, (prev, next) =>
  prev.color === next.color && prev.isSelected === next.isSelected
);