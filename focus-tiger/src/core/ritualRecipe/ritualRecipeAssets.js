/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Ritual Recipe resource id whitelist (catalog v0).
 * Sound ids must match `AMBIENT_TRACKS` — lock in ritualRecipeAssets.test.js.
 * @see docs/ritual-recipe-asset-catalog-v0.md
 */

export const RITUAL_RECIPE_DEFAULT_ROOM_ID = 'room.default';

/**
 * Catalog prompt ids. Default sitting uses null on every moment.
 * Deep / ADHD / Evening ids are design-locked for A4; A1c maps them to locale/pools.
 */
export const RITUAL_RECIPE_PROMPT_IDS = Object.freeze([
  'arrive.soft',
  'transition.hand',
  'reflect.line',
  'arrive.deep.quiet',
  'focus.deep.hold',
  'transition.deep.return',
  'reflect.deep.note',
  'arrive.evening.soft',
  'transition.evening.rest',
  'reflect.evening.close'
]);

export const RITUAL_RECIPE_SOUND_IDS = Object.freeze([
  'singing-bowl',
  'divine-life-society',
  'lord-of-the-dawn',
  'maestro-tlakaelel',
  'the-inner-sound',
  'somnia-variation-3',
  'somnia-variation-10',
  'rain',
  'dreamland',
  'invisible-beauty',
  'kiss-the-sky',
  'frozen-in-love'
]);

export const RITUAL_RECIPE_ROOM_IDS = Object.freeze([
  RITUAL_RECIPE_DEFAULT_ROOM_ID
]);

const PROMPT_SET = new Set(RITUAL_RECIPE_PROMPT_IDS);
const SOUND_SET = new Set(RITUAL_RECIPE_SOUND_IDS);
const ROOM_SET = new Set(RITUAL_RECIPE_ROOM_IDS);

/**
 * @param {unknown} id
 * @returns {boolean}
 */
export function isAllowedPromptId(id) {
  return typeof id === 'string' && PROMPT_SET.has(id);
}

/**
 * @param {unknown} id
 * @returns {boolean}
 */
export function isAllowedSoundId(id) {
  return typeof id === 'string' && SOUND_SET.has(id);
}

/**
 * @param {unknown} id
 * @returns {boolean}
 */
export function isAllowedRoomId(id) {
  return typeof id === 'string' && ROOM_SET.has(id);
}
