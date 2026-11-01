/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * User-facing "delete all local data" orchestration (Privacy / DEV reset).
 * Keeps localStorage whitelist + Electron companion prefs in sync.
 */

import { clearInputRhythm } from './inputRhythmBridge.js';
import {
  clearAllFocusTigerLocalState,
  clearDevResetSessionState
} from './localStateKeys.js';

/**
 * @param {object} [options]
 * @param {Storage | null} [options.storage]
 * @param {Storage | null} [options.sessionStorage]
 * @param {typeof globalThis} [options.globalObj]
 * @returns {Promise<{ clearedLocalKeys: string[], inputRhythmCleared: boolean }>}
 */
export async function clearAllFocusTigerUserData({
  storage,
  sessionStorage,
  globalObj = globalThis
} = {}) {
  const clearedLocalKeys = clearAllFocusTigerLocalState(storage);
  clearDevResetSessionState(sessionStorage);
  const rhythm = await clearInputRhythm(globalObj);
  return {
    clearedLocalKeys,
    inputRhythmCleared: rhythm.cleared === true
  };
}
