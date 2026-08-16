/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Five Moments Compass — first-run seen gate (Task B).
 * Key: focus-tiger.five-moments-compass-seen.v1
 */

export const FIVE_MOMENTS_COMPASS_SEEN_KEY =
  'focus-tiger.five-moments-compass-seen.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenFiveMomentsCompass(storage) {
  if (!storage?.getItem) return false;
  try {
    return storage.getItem(FIVE_MOMENTS_COMPASS_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function markFiveMomentsCompassSeen(storage) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(FIVE_MOMENTS_COMPASS_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * First-run card offer: product shell Idle, not yet seen.
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldOfferFiveMomentsCompassFirstCard(storage) {
  return !hasSeenFiveMomentsCompass(storage);
}

/** @typedef {'arrive' | 'focus' | 'recover' | 'transition' | 'reflect'} FiveMomentId */

export const FIVE_MOMENT_IDS = Object.freeze([
  'arrive',
  'focus',
  'recover',
  'transition',
  'reflect'
]);

export const FIVE_MOMENT_LABEL_KEYS = Object.freeze({
  arrive: 'FIVE_MOMENTS_ARRIVE',
  focus: 'FIVE_MOMENTS_FOCUS',
  recover: 'FIVE_MOMENTS_RECOVER',
  transition: 'FIVE_MOMENTS_TRANSITION',
  reflect: 'FIVE_MOMENTS_REFLECT'
});

/**
 * Compass chip → existing product surface.
 * Transition maps to the work-transition ritual (the day-axis blank is the
 * auto-detect story, not this voluntary jump).
 *
 * @param {string} momentId
 * @returns {
 *   | { type: 'arrival' }
 *   | { type: 'companion' }
 *   | { type: 'ritual', proxy: string }
 *   | { type: 'journey-log' }
 *   | null
 * }
 */
export function resolveFiveMomentAction(momentId) {
  switch (momentId) {
    case 'arrive':
      return { type: 'arrival' };
    case 'focus':
      return { type: 'companion' };
    case 'recover':
      return { type: 'ritual', proxy: 'ritual-emotional-reset' };
    case 'transition':
      return { type: 'ritual', proxy: 'ritual-work-transition' };
    case 'reflect':
      return { type: 'journey-log' };
    default:
      return null;
  }
}
