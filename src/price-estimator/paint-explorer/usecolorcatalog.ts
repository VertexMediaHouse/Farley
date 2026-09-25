import { useMemo } from 'react';
import { buildCatalogTree } from './classifycolor';
import type { CatalogTree, RawPaintColor } from './types';
import rawColors from './colors.json';

// Module-level cache: buildCatalogTree runs at most once per page load,
// regardless of how many components/instances use this hook.
let cachedTree: CatalogTree | null = null;

function getTree(): CatalogTree {
  if (!cachedTree) {
    cachedTree = buildCatalogTree(rawColors as RawPaintColor[]);
  }
  return cachedTree;
}

/**
 * Returns the fully grouped Family -> Shade -> Colors catalog.
 * The grouping is computed once (module-level cache) and every call
 * to this hook after the first just returns the same reference,
 * so consumers can safely use it in dependency arrays without
 * triggering re-renders.
 */
export function useColorCatalog(): CatalogTree {
  // useMemo here is mostly documentation-of-intent; getTree() already
  // memoizes at module scope so this is stable across the whole app.
  return useMemo(() => getTree(), []);
}