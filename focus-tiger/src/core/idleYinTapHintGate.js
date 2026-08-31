/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * First-run discovery bubble above Yin's head (not an onboarding auto-tip,
 * not a toast after tap).
 */

export const IDLE_YIN_TAP_HINT_STORAGE_KEY = 'focus-tiger.idle-yin-tap-hint.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenIdleYinTapHint(storage) {
  try {
    return storage?.getItem(IDLE_YIN_TAP_HINT_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function markIdleYinTapHintSeen(storage) {
  try {
    storage?.setItem(IDLE_YIN_TAP_HINT_STORAGE_KEY, '1');
  } catch {
    // private mode
  }
}

/**
 * @param {object} [opts]
 * @param {boolean} [opts.seen]
 * @param {string} [opts.sessionState]
 * @param {boolean} [opts.overlayBusy]
 * @param {boolean} [opts.flowerWelcomeVisible]
 * @param {boolean} [opts.armed]
 * @returns {boolean}
 */
export function shouldShowIdleYinTapHint({
  seen = false,
  sessionState = '',
  overlayBusy = false,
  flowerWelcomeVisible = false,
  armed = false
} = {}) {
  if (seen) return false;
  if (sessionState !== 'IDLE') return false;
  if (overlayBusy) return false;
  if (flowerWelcomeVisible) return false;
  if (!armed) return false;
  return true;
}
