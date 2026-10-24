/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { getDesktopShellBridge, isDesktopShellRuntime } from './desktopShell.js';

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function canUseWindowLayout(globalObj = globalThis) {
  if (!isDesktopShellRuntime(globalObj)) return false;
  const shell = getDesktopShellBridge(globalObj);
  return typeof shell?.applyWindowLayout === 'function';
}

/**
 * @param {object} [globalObj]
 * @returns {Promise<'regular' | 'companion' | 'fullscreen'>}
 */
export async function readWindowLayout(globalObj = globalThis) {
  if (!canUseWindowLayout(globalObj)) return 'regular';
  try {
    const value = await getDesktopShellBridge(globalObj).getWindowLayout();
    if (value === 'companion' || value === 'fullscreen') return value;
    return 'regular';
  } catch {
    return 'regular';
  }
}

/**
 * @param {'companion' | 'fullscreen'} action
 * @param {object} [globalObj]
 * @returns {Promise<{ layout: 'regular' | 'companion' | 'fullscreen', saved: boolean }>}
 */
export async function applyWindowLayout(action, globalObj = globalThis) {
  const next = action === 'fullscreen' ? 'fullscreen' : 'companion';
  if (!canUseWindowLayout(globalObj)) return { layout: 'regular', saved: false };
  try {
    const result = await getDesktopShellBridge(globalObj).applyWindowLayout(next);
    const layout =
      result?.layout === 'companion' || result?.layout === 'fullscreen'
        ? result.layout
        : 'regular';
    return { layout, saved: result?.saved !== false };
  } catch {
    return { layout: 'regular', saved: false };
  }
}
