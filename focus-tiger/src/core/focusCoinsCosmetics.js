/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L2 安静痕迹：已有莲花上叠晨露、蒲团金线 class、称号 data 属性。
 * 不改 Tea / Sanctuary badgeIds，不长新朵。
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
    lotusDew: owned.includes(LOTUS_DEW_OWNED_ID),
    sumeruCushion: owned.includes(SUMERU_CUSHION_OWNED_ID),
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
  filter: brightness(1.08) saturate(1.15);
}
#app.${SUMERU_CUSHION_CLASS} #sprite-stage {
  filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.22));
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
        rarePebble: false,
        equippedTitle: null
      };
  if (enabled && doc) ensureCosmeticStyles(doc);
  pondEl?.classList?.toggle(LOTUS_DEW_CLASS, state.lotusDew);
  appEl?.classList?.toggle(SUMERU_CUSHION_CLASS, state.sumeruCushion);
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
