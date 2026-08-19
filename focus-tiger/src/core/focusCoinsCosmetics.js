/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L2 traces that may appear beside Yin / in Collections metadata.
 * 2026-08-19: dew / cushion filters retired — never composite onto sprites
 * or the lotus garden. Titles + rare pebble remain data attributes only.
 */

export const LOTUS_DEW_OWNED_ID = 'space.lotus-dew';
export const SUMERU_CUSHION_OWNED_ID = 'space.sumeru-cushion';
export const RARE_PEBBLE_OWNED_ID = 'badge.rare.quiet-pebble';

export const LOTUS_DEW_CLASS = 'lotus-pond--dew';
export const SUMERU_CUSHION_CLASS = 'scene--sumeru-cushion';
export const COSMETIC_STYLE_ID = 'focus-coins-cosmetics-l2';

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

function ensureCosmeticStyles(doc) {
  if (!doc?.head || doc.getElementById(COSMETIC_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = COSMETIC_STYLE_ID;
  style.textContent = `
#lotus-pond.${LOTUS_DEW_CLASS} .lotus-pond-bloom {
  filter: none;
}
#app.${SUMERU_CUSHION_CLASS} #sprite-stage {
  filter: none;
}
`.trim();
  doc.head.appendChild(style);
}

/**
 * @param {object} [snapshot]
 * @param {object} [roots]
 * @param {ParentNode | null} [roots.pondEl]
 * @param {ParentNode | null} [roots.appEl]
 * @param {HTMLElement | null} [roots.documentElement]
 * @param {Document | null} [roots.document]
 * @param {boolean} [roots.enabled]
 */
export function applyFocusCoinsCosmetics(
  snapshot = {},
  {
    pondEl = null,
    appEl = null,
    documentElement = null,
    document: doc = null,
    enabled = true
  } = {}
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
  if (enabled && doc) ensureCosmeticStyles(doc);
  pondEl?.classList?.toggle(LOTUS_DEW_CLASS, false);
  appEl?.classList?.toggle(SUMERU_CUSHION_CLASS, false);
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
