/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * @typedef {import('./idleChromeOrchestration.js').SecondaryChromeEntry} SecondaryChromeEntry
 */

export const MENU_FAVORITES_DENY_PROXIES = Object.freeze(
  /** @type {const} */ ([])
);

/**
 * @param {SecondaryChromeEntry | null | undefined} entry
 * @returns {boolean}
 */
export function isSecondaryChromeEntryFavoritable(entry) {
  if (!entry?.proxy) return false;
  if (entry.kind === 'group-label' || entry.kind === 'sub-group-label') return false;
  if (entry.interactive === false) return false;
  if (MENU_FAVORITES_DENY_PROXIES.includes(/** @type {string} */ (entry.proxy))) {
    return false;
  }
  return true;
}