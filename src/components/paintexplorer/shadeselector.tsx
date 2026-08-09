import type { ShadeGroup } from './types';

interface ShadeSelectorProps {
  shades: ShadeGroup[];
  selectedShade: string | null;
  onSelect: (shade: string) => void;
}

export default function ShadeSelector({ shades, selectedShade, onSelect }: ShadeSelectorProps) {
  return (
    <div role="listbox" aria-label="Shades" className="flex flex-wrap gap-x-0 gap-y-3">
      {shades.map((sg) => {
        const isSelected = selectedShade === sg.shade;
        return (
          <button
            type="button"
            key={sg.shade}
            onClick={() => onSelect(sg.shade)}
            role="option"
            aria-selected={isSelected}
            title={`${sg.shade} (${sg.colors.length})`}
            className={`group relative -ml-2.5 h-24 w-24 flex-shrink-0 border-2 bg-white shadow-sm transition-all duration-150 first:ml-0 hover:z-10 hover:-translate-y-1 hover:shadow-md focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0] ${
              isSelected
                ? 'z-10 -translate-y-1 border-[#2F9BF0] shadow-[0_0_0_3px_rgba(47,155,240,0.18)]'
                : 'border-white'
            }`}
            style={{ background: sg.representative.hex }}
          >
            <span
              className={`pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.7rem] font-semibold text-slate-500 transition-opacity duration-150 ${
                isSelected ? 'opacity-100 text-[#2F9BF0]' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {sg.shade}
            </span>
          </button>
        );
      })}
    </div>
  );
}