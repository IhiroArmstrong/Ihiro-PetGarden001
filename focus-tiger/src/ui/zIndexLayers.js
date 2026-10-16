/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Product z-index constants. Numbers stay 1:1 with `docs/Z_INDEX.md`.
 * Do not invent a second allocation table here — add a registry row first.
 */

export const Z = Object.freeze({
  PARK: -1,
  WASH: 0,
  LOCAL: 1,
  SCENE: 2,
  SPRITE: 3,
  FX: 4,
  DRAWER_ABOVE_SHEET: 5,
  UI_OVERLAY: 10,
  KINDNESS: 11,
  CLUSTER: 12,
  CIRCLE: 13,
  WITNESS: 14,
  PANEL: 15,
  DOCK: 16,
  OVERLAY_DIM: 17,
  GLASS_CARD: 18,
  GLASS_CARD_FRONT: 19,
  DEV: 20,
  DEV_LAB: 21,
  AMBIENT: 22,
  SOUND_CHROME: 23,
  IDLE_FAB: 24,
  SUPPORT_DIM: 25,
  SUPPORT_MODAL: 26,
  SANCTUARY_CARD: 27,
  HINT_CHIP: 28,
  PRIVACY_SHEET: 29,
  NARROW_SHELL: 30,
  JOURNEY_LOG_DIM: 31,
  NARROW_STAGE: 32,
  NARROW_REMINDER: 33,
  HINT_BUBBLE: 34,
  REMINDER_PANEL: 35,
  NAV_FAN: 36,
  TOAST: 40,
  VOICE_UNDO: 42,
  LOADING: 100,
  TTS_OUTLIER: 12050
});

/** @type {ReadonlySet<number>} */
export const REGISTERED_Z_VALUES = Object.freeze(new Set(Object.values(Z)));

/**
 * @param {string} name
 * @returns {number}
 */
export function zIndexByName(name) {
  if (!Object.prototype.hasOwnProperty.call(Z, name)) return NaN;
  return Z[name];
}
