/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { getDesktopShellBridge, isDesktopShellRuntime } from './desktopShell.js';

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function canUseAlwaysOnTop(globalObj = globalThis) {
  if (!isDesktopShellRuntime(globalObj)) return false;
  const shell = getDesktopShellBridge(globalObj);
  return typeof shell?.getAlwaysOnTop === 'function';
}

/**
 * @param {object} [globalObj]
 * @returns {Promise<boolean>}
 */
export async function readAlwaysOnTopEnabled(globalObj = globalThis) {
  if (!canUseAlwaysOnTop(globalObj)) return false;
  try {
    const value = await getDesktopShellBridge(globalObj).getAlwaysOnTop();
    return value === true;
  } catch {
    return false;
  }
}

/**
 * @param {boolean} enabled
 * @param {object} [globalObj]
 * @returns {Promise<{ enabled: boolean, saved: boolean }>}
 */
export async function writeAlwaysOnTopEnabled(enabled, globalObj = globalThis) {
  const next = Boolean(enabled);
  if (!canUseAlwaysOnTop(globalObj)) return { enabled: false, saved: false };
  try {
    const value = await getDesktopShellBridge(globalObj).setAlwaysOnTop(next);
    return { enabled: value === true, saved: true };
  } catch {
    return { enabled: !next, saved: false };
  }
}
