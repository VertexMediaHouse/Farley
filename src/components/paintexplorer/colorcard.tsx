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
      className={`flex flex-col overflow-hidden rounded-lg border-2 bg-white text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0] ${
        isSelected ? 'border-[#2F9BF0] shadow-[0_0_0_3px_rgba(47,155,240,0.18)]' : 'border-slate-200'
      }`}
    >
      <div className="relative">
        <div className="h-16 w-full" style={{ background: color.hex }} />
        {isSelected && (
          <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#2F9BF0] text-[10px] font-black text-white">
            ✓
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-2.5 py-2">
        <span className="truncate text-sm font-bold leading-tight text-slate-900">{color.name}</span>
        <span className="text-xs text-slate-500">{color.brand}</span>
        <span className="font-mono text-xs text-slate-400">{color.number}</span>
      </div>
    </button>
  );
}

export default memo(ColorCardImpl, (prev, next) =>
  prev.color === next.color && prev.isSelected === next.isSelected
);