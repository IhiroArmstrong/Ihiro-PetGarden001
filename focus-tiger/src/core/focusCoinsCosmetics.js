/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Collections metadata on <html> only.
 * Iron rule (2026-08-20): never composite dew / cushion filters onto
 * lotus blooms or `#sprite-stage`. Owned stills live on the card face.
 */

export const LOTUS_DEW_OWNED_ID = 'space.lotus-dew';
export const SUMERU_CUSHION_OWNED_ID = 'space.sumeru-cushion';
export const RARE_PEBBLE_OWNED_ID = 'badge.rare.quiet-pebble';

/** Retired overlay class names — must never be applied. */
export const LOTUS_DEW_CLASS = 'lotus-pond--dew';
export const SUMERU_CUSHION_CLASS = 'scene--sumeru-cushion';

/**
 * @param {{ ownedIds?: string[], equippedTitle?: string | null }} snapshot
 */
export function focusCoinsCosmeticState(snapshot = {}) {
  const owned = Array.isArray(snapshot.ownedIds) ? snapshot.ownedIds : [];
  return {
    lotusDew: false,
    sumeruCushion: false,
    ownedLotusDew: owned.includes(LOTUS_DEW_OWNED_ID),
    ownedSumeruCushion: owned.includes(SUMERU_CUSHION_OWNED_ID),
    rarePebble: owned.includes(RARE_PEBBLE_OWNED_ID),
    equippedTitle:
      typeof snapshot.equippedTitle === 'string' ? snapshot.equippedTitle : null
  };
}

/**
 * @param {object} [snapshot]
 * @param {object} [roots]
 * @param {HTMLElement | null} [roots.documentElement]
 * @param {boolean} [roots.enabled]
 */
export function applyFocusCoinsCosmetics(
  snapshot = {},
  { documentElement = null, enabled = true } = {}
) {
  const state = enabled
    ? focusCoinsCosmeticState(snapshot)
    : {
        lotusDew: false,
        sumeruCushion: false,
        ownedLotusDew: false,
        ownedSumeruCushion: false,
        rarePebble: false,
        equippedTitle: null
      };
  if (documentElement?.dataset) {
    if (state.equippedTitle) {
      documentElement.dataset.focusCoinsTitle = state.equippedTitle;
    } else {
      delete documentElement.dataset.focusCoinsTitle;
    }
    if (state.rarePebble) {
      documentElement.dataset.focusCoinsRare = 'quiet-pebble';
    } else {
      delete documentElement.dataset.focusCoinsRare;
    }
  }
  return state;
}
