import type { FamilyGroup } from './types';

interface FamilySelectorProps {
  families: FamilyGroup[];
  selectedFamily: string | null;
  onSelect: (family: string) => void;
}

export default function FamilySelector({ families, selectedFamily, onSelect }: FamilySelectorProps) {
  return (
    <div
      role="listbox"
      aria-label="Color families"
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {families.map((fg) => {
        const isSelected = selectedFamily === fg.family;
        return (
          <button
            type="button"
            key={fg.family}
            onClick={() => onSelect(fg.family)}
            role="option"
            aria-selected={isSelected}
            className={`group flex flex-col items-center gap-2 rounded-xl border-2 bg-white p-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0] ${
              isSelected ? 'border-[#2F9BF0] shadow-[0_0_0_3px_rgba(47,155,240,0.15)]' : 'border-slate-200'
            }`}
          >
            <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-50 flex items-center justify-center">
              <img 
                src={`/images/${fg.family.toLowerCase()}.png`} 
                alt={`${fg.family} family`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  // Fallback in case image is missing
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="text-sm font-bold text-slate-900">{fg.family}</span>
          </button>
        );
      })}
    </div>
  );
}