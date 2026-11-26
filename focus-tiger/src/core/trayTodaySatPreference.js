/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** 与 `localStateKeys.js` 白名单同步；新增 key 时两边一起改。 */
export const TRAY_TODAY_SAT_ENABLED_KEY = 'focus-tiger.tray-today-sat-enabled.v1';

/**
 * Missing key = on (Brief). Stored `'0'` turns the tray minutes off.
 *
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function readTrayTodaySatEnabled(storage) {
  if (!storage) return true;
  try {
    return storage.getItem(TRAY_TODAY_SAT_ENABLED_KEY) !== '0';
  } catch {
    return true;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @returns {boolean}
 */
export function writeTrayTodaySatEnabled(storage, enabled) {
  if (!storage) return false;
  try {
    if (enabled) storage.setItem(TRAY_TODAY_SAT_ENABLED_KEY, '1');
    else storage.setItem(TRAY_TODAY_SAT_ENABLED_KEY, '0');
    return true;
  } catch {
    return false;
  }
}
