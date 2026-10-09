/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Dismiss is per device. Portrait + narrow only; never blocks Sit. */
export const LANDSCAPE_HINT_STORAGE_KEY =
  'focus-tiger.landscape-hint-dismissed.v1';

/**
 * All three must hold. Crowding heuristic is out of v1.
 * @param {{ narrow: boolean, portrait: boolean, dismissed: boolean }} input
 */
export function shouldShowLandscapeSuggest({ narrow, portrait, dismissed }) {
  return Boolean(narrow && portrait && !dismissed);
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readLandscapeSuggestDismissed(storage) {
  if (!storage) return false;
  try {
    return storage.getItem(LANDSCAPE_HINT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function writeLandscapeSuggestDismissed(storage) {
  if (!storage) return;
  try {
    storage.setItem(LANDSCAPE_HINT_STORAGE_KEY, '1');
  } catch {
    // private mode / quota — bar still hides for this paint
  }
}
