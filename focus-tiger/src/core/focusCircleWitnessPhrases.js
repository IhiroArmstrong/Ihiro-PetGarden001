/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/** Frozen phrase pool — must match cloud `focusCircleWitnessPhrases.ts`. */

export const FOCUS_CIRCLE_WITNESS_LEAVE_PHRASE_KEYS = Object.freeze([
  'FOCUS_CIRCLE_WITNESS_LEAVE_1',
  'FOCUS_CIRCLE_WITNESS_LEAVE_2',
  'FOCUS_CIRCLE_WITNESS_LEAVE_3',
  'FOCUS_CIRCLE_WITNESS_LEAVE_4',
  'FOCUS_CIRCLE_WITNESS_LEAVE_5',
  'FOCUS_CIRCLE_WITNESS_LEAVE_6',
  'FOCUS_CIRCLE_WITNESS_LEAVE_7'
]);

export const FOCUS_CIRCLE_WITNESS_RESPOND_PHRASE_KEYS = Object.freeze([
  'FOCUS_CIRCLE_WITNESS_RESPOND_1',
  'FOCUS_CIRCLE_WITNESS_RESPOND_2',
  'FOCUS_CIRCLE_WITNESS_RESPOND_3',
  'FOCUS_CIRCLE_WITNESS_RESPOND_4',
  'FOCUS_CIRCLE_WITNESS_RESPOND_5'
]);

const LEAVE_SET = new Set(FOCUS_CIRCLE_WITNESS_LEAVE_PHRASE_KEYS);
const RESPOND_SET = new Set(FOCUS_CIRCLE_WITNESS_RESPOND_PHRASE_KEYS);

/**
 * @param {string} key
 * @returns {boolean}
 */
export function isWitnessLeavePhraseKey(key) {
  return LEAVE_SET.has(key);
}

/**
 * @param {string} key
 * @returns {boolean}
 */
export function isWitnessRespondPhraseKey(key) {
  return RESPOND_SET.has(key);
}
