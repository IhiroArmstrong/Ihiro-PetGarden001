/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * One quiet note after the first desk piece is bonded in Yin's Collections.
 * Opens Yin's Art Collection. Never repeats. Not a shop row.
 */

export const COLLECTIONS_ART_BRIDGE_SEEN_KEY =
  'focus-tiger.collections-art-bridge-seen.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenCollectionsArtBridge(storage) {
  if (!storage?.getItem) return false;
  try {
    return storage.getItem(COLLECTIONS_ART_BRIDGE_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldShowCollectionsArtBridge(storage) {
  return !hasSeenCollectionsArtBridge(storage);
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function markCollectionsArtBridgeSeen(storage) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(COLLECTIONS_ART_BRIDGE_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}
