/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  DEFAULT_GLOBAL_SIT_ACCELERATOR,
  T10_VOICE_PTT_ACCELERATOR,
  validateGlobalSitAccelerator
} from '../../src/core/globalSitHotkeyPolicy.js';

/**
 * @param {object} deps
 * @param {{ register: Function, unregister: Function }} deps.globalShortcut
 * @param {string} [deps.previousAccelerator]
 * @param {unknown} deps.accelerator
 * @param {() => void} deps.onFire
 * @returns {{ registered: boolean, accelerator: string, reason: string }}
 */
export function registerGlobalSitHotkey(deps) {
  const checked = validateGlobalSitAccelerator(
    deps.accelerator || DEFAULT_GLOBAL_SIT_ACCELERATOR
  );
  const previous = String(deps.previousAccelerator || '').trim();
  if (
    previous &&
    previous !== T10_VOICE_PTT_ACCELERATOR &&
    previous !== checked.accelerator
  ) {
    try {
      deps.globalShortcut.unregister(previous);
    } catch {
      /* never registered */
    }
  }
  if (!checked.ok) {
    return {
      registered: false,
      accelerator: previous || DEFAULT_GLOBAL_SIT_ACCELERATOR,
      reason: checked.reason
    };
  }
  let ok = false;
  try {
    ok = deps.globalShortcut.register(checked.accelerator, deps.onFire) === true;
  } catch {
    ok = false;
  }
  return {
    registered: ok,
    accelerator: checked.accelerator,
    reason: ok ? 'ok' : 'register-failed'
  };
}

/**
 * @param {{ unregister: Function }} globalShortcut
 * @param {string} accelerator
 */
export function unregisterGlobalSitHotkey(globalShortcut, accelerator) {
  const acc = String(accelerator || '').trim();
  if (!acc || acc === T10_VOICE_PTT_ACCELERATOR) return;
  try {
    globalShortcut.unregister(acc);
  } catch {
    /* ignore */
  }
}
