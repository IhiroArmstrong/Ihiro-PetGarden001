/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

export const STORAGE_KEY = 'focus-tiger.presence-field-enabled.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function readPresenceFieldEnabled(storage) {
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @returns {boolean} true when persisted
 */
export function writePresenceFieldEnabled(storage, enabled) {
  if (!storage) return false;
  try {
    if (enabled) storage.setItem(STORAGE_KEY, '1');
    else storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
