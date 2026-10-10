/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
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
 * Open Collections with at least one bonded desk piece, and this device
 * has not yet seen the sentence.
 * @param {Storage | null | undefined} storage
 * @param {number} ownedPieceCount
 * @returns {boolean}
 */
export function shouldPresentCollectionsArtBridge(storage, ownedPieceCount) {
  const count = Math.floor(Number(ownedPieceCount) || 0);
  if (count < 1) return false;
  return shouldShowCollectionsArtBridge(storage);
}

/**
 * Below the fold, or not laid out yet, does not count as seen.
 * @param {{ top: number, bottom: number, height: number, width: number } | null | undefined} bridgeRect
 * @param {{ top: number, bottom: number } | null | undefined} panelRect
 * @returns {boolean}
 */
export function isCollectionsArtBridgeInView(bridgeRect, panelRect) {
  if (!bridgeRect || !panelRect) return false;
  const height = Number(bridgeRect.height) || 0;
  const width = Number(bridgeRect.width) || 0;
  if (height <= 0 || width <= 0) return false;
  return bridgeRect.bottom > panelRect.top && bridgeRect.top < panelRect.bottom;
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
