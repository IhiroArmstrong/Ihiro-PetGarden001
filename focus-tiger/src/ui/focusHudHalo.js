/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Map session focusLevel → ring / core CSS vars (progress ring + breathing center light).
 * Opacities stay high for glanceability on warm beige chrome.
 * @param {number} level 0..1
 * @returns {{ fill: number, ringOpacity: number, coreOpacity: number }}
 */
export function focusLevelToHaloVars(level) {
  const fill = Math.min(1, Math.max(0, Number(level) || 0));
  return {
    fill,
    ringOpacity: 0.78 + fill * 0.2,
    coreOpacity: 0.88 + fill * 0.12
  };
}
