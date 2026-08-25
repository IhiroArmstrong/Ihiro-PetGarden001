/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Renderer bridge for Yin Personal Memory (Electron preload only).
 * Web / narrow shell: no bridge → consent UI hidden, store unused.
 */

import { getDesktopShellBridge } from './desktopShell.js';
import { normalizeYinPersonalMemoryState } from './yinPersonalMemory/yinPersonalMemorySchema.js';

/**
 * @param {object} [globalObj]
 * @returns {null | { getState: () => Promise<unknown>, setConsent: (granted: boolean) => Promise<unknown> }}
 */
export function getYinPersonalMemoryBridge(globalObj = globalThis) {
  const shell = getDesktopShellBridge(globalObj);
  const memory = shell && shell.yinPersonalMemory;
  if (!memory || typeof memory.getState !== 'function') return null;
  if (typeof memory.setConsent !== 'function') return null;
  return memory;
}

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function hasYinPersonalMemoryBridge(globalObj = globalThis) {
  return getYinPersonalMemoryBridge(globalObj) != null;
}

/**
 * @param {object} [globalObj]
 * @returns {Promise<import('./yinPersonalMemory/yinPersonalMemorySchema.js').YinPersonalMemoryState>}
 */
export async function fetchYinPersonalMemoryState(globalObj = globalThis) {
  const bridge = getYinPersonalMemoryBridge(globalObj);
  if (!bridge) return normalizeYinPersonalMemoryState(null);
  try {
    const raw = await bridge.getState();
    return normalizeYinPersonalMemoryState(raw);
  } catch {
    return normalizeYinPersonalMemoryState(null);
  }
}

/**
 * @param {boolean} granted
 * @param {object} [globalObj]
 */
export async function saveYinPersonalMemoryConsent(granted, globalObj = globalThis) {
  const bridge = getYinPersonalMemoryBridge(globalObj);
  if (!bridge) return normalizeYinPersonalMemoryState(null);
  try {
    const raw = await bridge.setConsent(Boolean(granted));
    return normalizeYinPersonalMemoryState(raw);
  } catch {
    return normalizeYinPersonalMemoryState(null);
  }
}
