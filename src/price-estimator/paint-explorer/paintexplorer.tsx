import { useMemo, useState, useCallback } from 'react';
import { useColorCatalog } from './usecolorcatalog';
import FamilySelector from './familyselector';
import ShadeStep from './ShadeStep';
import ColorGrid from './colorgrid';
import type { PaintColor } from './types';
import { getCuratedShades } from './curatedShades';

export interface PaintExplorerProps {
  selected?: string | PaintColor | null;
  onSelect: (color: PaintColor) => void;
}

type Step = 'family' | 'shade' | 'color';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function colorDistSq(rgb1: number[], rgb2: number[]) {
  return Math.pow(rgb1[0] - rgb2[0], 2) + Math.pow(rgb1[1] - rgb2[1], 2) + Math.pow(rgb1[2] - rgb2[2], 2);
}

function findClosestHex(targetHex: string, hexes: string[]) {
  if (!hexes.length) return targetHex;
  const targetRgb = hexToRgb(targetHex);
  let minDiff = Infinity;
  let closest = hexes[0];
  for (const hex of hexes) {
    const rgb = hexToRgb(hex);
    const diff = colorDistSq(targetRgb, rgb);
    if (diff < minDiff) {
      minDiff = diff;
      closest = hex;
    }
  }
  return closest;
}

export default function PaintExplorer({ selected, onSelect }: PaintExplorerProps) {
  const catalog = useColorCatalog();

  const [activeFamily, setActiveFamily] = useState<string | null>(null);
  const [activeShade, setActiveShade] = useState<string | null>(null);
  const [activeBrandFilter, setActiveBrandFilter] = useState<'All brands' | 'Behr' | 'Glidden'>('All brands');

  const parsedNumber = useMemo(() => {
    if (!selected) return null;
    if (typeof selected !== 'string') return selected.number;
    // Strip any pipe-encoded hex suffix: "Name (Number)|#hex" → "Name (Number)"
    const withoutHex = selected.split('|')[0].trim();
    // Extract color code from "Name (Number)" format
    const match = withoutHex.match(/\(([^)]+)\)$/);
    return match ? match[1] : withoutHex;
  }, [selected]);

  const selectedNumber = parsedNumber;

  const selectedColorObj = useMemo(() => {
    if (!parsedNumber) return null;
    if (typeof selected !== 'string' && selected) return selected;
    for (const fg of catalog) {
      for (const sg of fg.shades) {
        const found = sg.colors.find((c) => c.number === parsedNumber);
        if (found) return found;
      }
    }
    return null;
  }, [parsedNumber, selected, catalog]);

  const familyGroup = useMemo(
    () => catalog.find((f) => f.family === activeFamily) ?? null,
    [catalog, activeFamily]
  );
  
  const filteredShades = useMemo(() => {
    if (!familyGroup) return [];
    if (activeBrandFilter === 'All brands') return familyGroup.shades;
    return familyGroup.shades
      .map((sg) => ({
        ...sg,
        colors: sg.colors.filter((c) => c.brand.toLowerCase().includes(activeBrandFilter.toLowerCase())),
      }))
      .filter((sg) => sg.colors.length > 0);
  }, [familyGroup, activeBrandFilter]);

  const currentBrandFilter = activeBrandFilter === 'All brands' ? 'All' : activeBrandFilter === 'Glidden' ? 'PPG - Glidden' : activeBrandFilter;
  
  const allCuratedHexes = useMemo(() => {
    if (!activeFamily) return [];
    return getCuratedShades(activeFamily.toLowerCase(), currentBrandFilter);
  }, [activeFamily, currentBrandFilter]);

  const needsShadeSelection = allCuratedHexes.length > 0;
  
  const step: Step = !activeFamily 
    ? 'family' 
    : (needsShadeSelection && !activeShade) 
      ? 'shade' 
      : 'color';

  const shadeGroupColors = useMemo(() => {
    if (!familyGroup || !activeFamily) return [];
    const allBrandColors = filteredShades.flatMap((sg) => sg.colors);
    
    if (!needsShadeSelection) {
      return allBrandColors.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    if (!activeShade) return [];
    
    return allBrandColors.filter((c) => {
      const closest = findClosestHex(c.hex, allCuratedHexes);
      return closest.toLowerCase() === activeShade.toLowerCase();
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeShade, familyGroup, filteredShades, activeFamily, allCuratedHexes, needsShadeSelection]);

  const goToFamilies = useCallback(() => {
    setActiveFamily(null);
    setActiveShade(null);
    setActiveBrandFilter('All brands');
  }, []);
  
  const goToShades = useCallback(() => {
    setActiveShade(null);
  }, []);

  const handleFamilySelect = useCallback((family: string) => {
    setActiveFamily(family);
    setActiveShade(null);
    setActiveBrandFilter('All brands');
  }, []);

  const handleShadeSelect = useCallback((shadeHex: string) => {
    setActiveShade(shadeHex);
  }, []);

  const handleColorSelect = useCallback(
    (color: PaintColor) => {
      onSelect(color);
    },
    [onSelect]
  );

  const BrandFilterRow = (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">Filters</span>
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1">
        {(['All brands', 'Behr', 'Glidden'] as const).map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => {
              setActiveBrandFilter(brand);
              setActiveShade(null); // Reset shade selection when filter changes
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${activeBrandFilter === brand
                ? 'bg-[#2F9BF0] text-white'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            {brand === 'All brands' ? 'All Brands' : brand}
          </button>
        ))}
      </div>
    </div>
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
        {activeShade && needsShadeSelection && (
          <>
            <span className="text-slate-300">/</span>
            <div
              className="h-4 w-4 rounded-sm border border-black/10"
              style={{ background: activeShade }}
            />
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
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-slate-800">
            <span className="text-slate-400">Step 1</span> Select a color family below
          </h3>
          <FamilySelector families={catalog} selectedFamily={activeFamily} onSelect={handleFamilySelect} />
        </div>
      )}

      {/* Step 2: Shades */}
      {step === 'shade' && familyGroup && (
        <div className="flex flex-col gap-4">
          <button type="button" onClick={goToFamilies} className="inline-flex w-fit items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-[0.82rem] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0]">
            ← All families
          </button>
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-slate-800">
              <span className="text-slate-400">Step 2</span> Select a shade of {activeFamily?.toLowerCase()} below
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {BrandFilterRow}
            </div>
            <div className="overflow-x-auto pb-8 pl-1 pt-1">
              <ShadeStep
                family={activeFamily?.toLowerCase() || ''}
                brand={activeBrandFilter === 'All brands' ? 'All' : activeBrandFilter === 'Glidden' ? 'PPG - Glidden' : activeBrandFilter}
                selectedShade={activeShade}
                onSelectShade={handleShadeSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Colors */}
      {step === 'color' && shadeGroupColors.length > 0 && (
        <div className="flex flex-col gap-3">
          <button 
            type="button" 
            onClick={needsShadeSelection ? goToShades : goToFamilies} 
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[0.82rem] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9BF0]"
          >
            ← {needsShadeSelection ? `${activeFamily} shades` : 'All families'}
          </button>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              <span className="text-slate-400">Step {needsShadeSelection ? '3' : '2'}</span> Select a color below
            </h3>
            {!needsShadeSelection && BrandFilterRow}
          </div>
          
          <ColorGrid colors={shadeGroupColors} selectedNumber={selectedNumber} onSelect={handleColorSelect} />
        </div>
      )}
    </div>
  );
}