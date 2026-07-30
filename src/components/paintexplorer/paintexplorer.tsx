import { useMemo, useState, useCallback } from 'react';
import { useColorCatalog } from './usecolorcatalog';
import FamilySelector from './familyselector';
import ShadeSelector from './shadeselector';
import ColorGrid from './colorgrid';
import type { PaintColor } from './types';

export interface PaintExplorerProps {
  /**
   * Currently selected value. Accepts either the HD paint code (string,
   * matches legacy `hdPaintCode` shape) or a full PaintColor object,
   * so this drops in regardless of how the parent form stores it.
   */
  selected?: string | PaintColor | null;
  onSelect: (color: PaintColor) => void;
}

type Step = 'family' | 'shade' | 'color';

export default function PaintExplorer({ selected, onSelect }: PaintExplorerProps) {
  const catalog = useColorCatalog();

  const [activeFamily, setActiveFamily] = useState<string | null>(null);
  const [activeShade, setActiveShade] = useState<string | null>(null);

  const selectedNumber = typeof selected === 'string' ? selected : selected?.number ?? null;

  const selectedColorObj = useMemo(() => {
    if (!selected) return null;
    if (typeof selected !== 'string') return selected;
    for (const fg of catalog) {
      for (const sg of fg.shades) {
        const found = sg.colors.find((c) => c.number === selected);
        if (found) return found;
      }
    }
    return null;
  }, [selected, catalog]);

  const familyGroup = useMemo(
    () => catalog.find((f) => f.family === activeFamily) ?? null,
    [catalog, activeFamily]
  );
  const shadeGroup = useMemo(
    () => familyGroup?.shades.find((s) => s.shade === activeShade) ?? null,
    [familyGroup, activeShade]
  );

  const step: Step = !activeFamily ? 'family' : !activeShade ? 'shade' : 'color';

  const goToFamilies = useCallback(() => {
    setActiveFamily(null);
    setActiveShade(null);
  }, []);
  const goToShades = useCallback(() => {
    setActiveShade(null);
  }, []);

  const handleFamilySelect = useCallback((family: string) => {
    setActiveFamily(family);
    setActiveShade(null);
  }, []);

  const handleShadeSelect = useCallback((shade: string) => {
    setActiveShade(shade);
  }, []);

  const handleColorSelect = useCallback(
    (color: PaintColor) => {
      onSelect(color);
    },
    [onSelect]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-[0.82rem] text-slate-500">
        <button
          type="button"
          onClick={goToFamilies}
          className="rounded px-1 py-0.5 font-semibold text-slate-500 hover:bg-blue-50 hover:text-[#2F9BF0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0]"
        >
          Color Family
        </button>
        {activeFamily && (
          <>
            <span className="text-slate-300">/</span>
            {activeShade ? (
              <button
                type="button"
                onClick={goToShades}
                className="rounded px-1 py-0.5 font-semibold text-slate-500 hover:bg-blue-50 hover:text-[#2F9BF0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0]"
              >
                {activeFamily}
              </button>
            ) : (
              <span className="font-bold text-slate-900">{activeFamily}</span>
            )}
          </>
        )}
        {activeShade && (
          <>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900">{activeShade}</span>
          </>
        )}
      </div>

      {/* Selected color summary */}
      {selectedColorObj && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <div
            className="h-10 w-10 flex-shrink-0 rounded-lg border border-black/10"
            style={{ background: selectedColorObj.hex }}
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-blue-800">{selectedColorObj.name}</span>
            <span className="text-xs text-blue-500">
              {selectedColorObj.brand} · {selectedColorObj.number}
            </span>
          </div>
        </div>
      )}

      {/* Step 1: Families */}
      {step === 'family' && (
        <FamilySelector families={catalog} selectedFamily={activeFamily} onSelect={handleFamilySelect} />
      )}

      {/* Step 2: Shades */}
      {step === 'shade' && familyGroup && (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToFamilies}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[0.82rem] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0]"
            >
              ← All families
            </button>
          </div>
          <ShadeSelector shades={familyGroup.shades} selectedShade={activeShade} onSelect={handleShadeSelect} />
        </>
      )}

      {/* Step 3: Colors */}
      {step === 'color' && shadeGroup && (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToShades}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[0.82rem] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0]"
            >
              ← {activeFamily} shades
            </button>
          </div>
          <ColorGrid colors={shadeGroup.colors} selectedNumber={selectedNumber} onSelect={handleColorSelect} />
        </>
      )}
    </div>
  );
}