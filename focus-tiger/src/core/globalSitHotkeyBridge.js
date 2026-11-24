/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { getDesktopShellBridge, isDesktopShellRuntime } from './desktopShell.js';
import { DEFAULT_GLOBAL_SIT_ACCELERATOR } from './globalSitHotkeyPolicy.js';

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function canUseGlobalSitHotkey(globalObj = globalThis) {
  if (!isDesktopShellRuntime(globalObj)) return false;
  const shell = getDesktopShellBridge(globalObj);
  return typeof shell?.getGlobalSitHotkey === 'function';
}

/**
 * @param {object} [globalObj]
 * @returns {Promise<{
 *   accelerator: string,
 *   registered: boolean,
 *   available: boolean
 * }>}
 */
export async function readGlobalSitHotkey(globalObj = globalThis) {
  const fallback = {
    accelerator: DEFAULT_GLOBAL_SIT_ACCELERATOR,
    registered: false,
    available: false
  };
  if (!canUseGlobalSitHotkey(globalObj)) return fallback;
  try {
    const value = await getDesktopShellBridge(globalObj).getGlobalSitHotkey();
    return {
      accelerator:
        typeof value?.accelerator === 'string' && value.accelerator
          ? value.accelerator
          : DEFAULT_GLOBAL_SIT_ACCELERATOR,
      registered: value?.registered === true,
      available: value?.available !== false
    };
  } catch {
    return fallback;
  }
}

/**
 * @param {string} accelerator
 * @param {object} [globalObj]
 * @returns {Promise<{
 *   ok: boolean,
 *   accelerator: string,
 *   registered: boolean,
 *   reason: string,
 *   saved: boolean
 * }>}
 */
export async function writeGlobalSitHotkey(accelerator, globalObj = globalThis) {
  if (!canUseGlobalSitHotkey(globalObj)) {
    return {
      ok: false,
      accelerator: DEFAULT_GLOBAL_SIT_ACCELERATOR,
      registered: false,
      reason: 'unavailable',
      saved: false
    };
  }
  try {
    const value = await getDesktopShellBridge(globalObj).setGlobalSitHotkey(
      accelerator
    );
    return {
      ok: value?.ok === true,
      accelerator:
        typeof value?.accelerator === 'string' && value.accelerator
          ? value.accelerator
          : DEFAULT_GLOBAL_SIT_ACCELERATOR,
      registered: value?.registered === true,
      reason: typeof value?.reason === 'string' ? value.reason : 'invalid',
      saved: value?.saved === true
    };
  } catch {
    return {
      ok: false,
      accelerator: DEFAULT_GLOBAL_SIT_ACCELERATOR,
      registered: false,
      reason: 'register-failed',
      saved: false
    };
  }
}
