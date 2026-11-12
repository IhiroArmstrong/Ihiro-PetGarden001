/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** 与 `localStateKeys.js` 白名单同步；新增 key 时两边一起改。 */
export const HEALTH_SHORTCUT_LOG_ENABLED_KEY =
  'focus-tiger.health-shortcut-log-enabled.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function readHealthShortcutLogEnabled(storage) {
  if (!storage) return false;
  try {
    return storage.getItem(HEALTH_SHORTCUT_LOG_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @returns {boolean} true when persisted
 */
export function writeHealthShortcutLogEnabled(storage, enabled) {
  if (!storage) return false;
  try {
    if (enabled) storage.setItem(HEALTH_SHORTCUT_LOG_ENABLED_KEY, '1');
    else storage.removeItem(HEALTH_SHORTCUT_LOG_ENABLED_KEY);
    return true;
  } catch {
    return false;
  }
}
