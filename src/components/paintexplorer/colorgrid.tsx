import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { PaintColor } from './types';
import ColorCard from './colorcard';

interface ColorGridProps {
  colors: PaintColor[];
  selectedNumber: string | null;
  onSelect: (color: PaintColor) => void;
}

const CARD_HEIGHT = 96;
const GAP = 12; // visible gutters between swatches, matching the reference image
const MIN_CARD_WIDTH = 150;
const OVERSCAN_ROWS = 3;

export default function ColorGrid({ colors, selectedNumber, onSelect }: ColorGridProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(600);
  const [viewportHeight, setViewportHeight] = useState(420);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportWidth(entry.contentRect.width);
        setViewportHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = Math.max(3, Math.floor(viewportWidth / MIN_CARD_WIDTH));
  const rowCount = Math.ceil(colors.length / cols);
  const rowHeight = CARD_HEIGHT + GAP;
  const totalHeight = rowCount * rowHeight - GAP;

  const firstVisibleRow = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN_ROWS);
  const visibleRowCount = Math.ceil(viewportHeight / rowHeight) + OVERSCAN_ROWS * 2;
  const lastVisibleRow = Math.min(rowCount, firstVisibleRow + visibleRowCount);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleRows = useMemo(() => {
    const rows: { rowIndex: number; items: PaintColor[] }[] = [];
    for (let r = firstVisibleRow; r < lastVisibleRow; r++) {
      const start = r * cols;
      const items = colors.slice(start, start + cols);
      if (items.length === 0) continue;
      rows.push({ rowIndex: r, items });
    }
    return rows;
  }, [firstVisibleRow, lastVisibleRow, cols, colors]);

  const shownStart = colors.length === 0 ? 0 : firstVisibleRow * cols + 1;
  const shownEnd = Math.min(colors.length, lastVisibleRow * cols);

  if (colors.length === 0) {
    return <div className="p-6 text-center text-sm text-slate-400">No colors in this shade.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end text-xs font-semibold text-slate-500">
        <span>
          Showing {shownStart} – {shownEnd} of {colors.length} colors
        </span>
      </div>
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        role="listbox"
        aria-label="Paint colors"
        className="h-[420px] overflow-y-auto overflow-x-visible rounded-xl border border-slate-200 bg-white p-3 sm:h-[420px] max-[480px]:h-[360px]"
      >
        <div className="relative w-full" style={{ height: totalHeight }}>
          {visibleRows.map(({ rowIndex, items }) => (
            <div
              key={rowIndex}
              className="absolute left-0 right-0 grid"
              style={{
                top: rowIndex * rowHeight,
                height: CARD_HEIGHT,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                columnGap: GAP,
              }}
            >
              {items.map((color) => (
                <ColorCard
                  key={`${color.brand}-${color.number}-${color.name}`}
                  color={color}
                  isSelected={selectedNumber === color.number}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}