import type { ShadeGroup } from './types';

interface ShadeSelectorProps {
  shades: ShadeGroup[];
  selectedShade: string | null;
  onSelect: (shade: string) => void;
}

export default function ShadeSelector({ shades, selectedShade, onSelect }: ShadeSelectorProps) {
  return (
    <div
      role="listbox"
      aria-label="Shades"
      className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3"
    >
      {shades.map((sg) => {
        const isSelected = selectedShade === sg.shade;
        return (
          <button
            type="button"
            key={sg.shade}
            onClick={() => onSelect(sg.shade)}
            role="option"
            aria-selected={isSelected}
            className={`flex flex-col items-center gap-1.5 rounded-lg border-2 bg-white p-2 transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0] ${
              isSelected ? 'border-[#2F9BF0] shadow-[0_0_0_3px_rgba(47,155,240,0.15)]' : 'border-slate-200'
            }`}
          >
            <div
              className="aspect-square w-full rounded-md border border-black/5"
              style={{ background: sg.representative.hex }}
            />
            <span className="text-center text-xs font-semibold leading-tight text-slate-700">{sg.shade}</span>
          </button>
        );
      })}
    </div>
  );
}