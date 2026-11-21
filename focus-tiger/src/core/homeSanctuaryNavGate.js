/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Sanctuary home navigation — seen-state only (D-family pulse drawing removed at L2).
 * PO 拍板 2026-09-26 · fan: Home / Calendar / Collection.
 * Re-enable nav: pulse must enter hint registry (triggerMode: click), not this module.
 */

export const HOME_SANCTUARY_NAV_SEEN_KEY =
  'focus-tiger.home-sanctuary-nav-seen.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenHomeSanctuaryNav(storage) {
  if (!storage?.getItem) return false;
  try {
    return storage.getItem(HOME_SANCTUARY_NAV_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldShowHomeSanctuaryNavPulse(storage) {
  return !hasSeenHomeSanctuaryNav(storage);
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function markHomeSanctuaryNavSeen(storage) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(HOME_SANCTUARY_NAV_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}