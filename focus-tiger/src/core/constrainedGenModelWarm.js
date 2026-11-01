/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Stage 0 operational definition of `modelWarm` for constrained-generation
 * gates. Not wired to any opening channel. Focusing unloads the GGUF
 * (`l1Runtime.setFocusing(true)` → `unload()`), so a focusing companion is
 * never warm.
 *
 * @param {{ phase?: string, focusing?: boolean } | null | undefined} status
 * @returns {boolean}
 */
export function isConstrainedGenModelWarm(status) {
  if (!status || typeof status !== 'object') return false;
  return status.phase === 'ready' && status.focusing !== true;
}

/**
 * @param {boolean} modelWarm
 * @returns {'none' | 'cold-start'}
 */
export function constrainedGenWarmFallbackReason(modelWarm) {
  return modelWarm === true ? 'none' : 'cold-start';
}
