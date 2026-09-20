/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Essence（精進 / Shōjin）L0 ledger — pure functions only.
 *
 * Grant rules mirror Focus Coins for Slice 1 (same events, points, caps).
 * No redeem, no Collections, no entitlement writes.
 *
 * @see docs/planning/focus-essence-coin-split-audit.md
 * @see docs/task-briefs/task-focus-essence-slice1.md
 */

import {
  GRANT_KIND,
  computeFocusCoinsGrant,
  emptyFocusCoinsDayState,
  emptyFocusCoinsSessionState,
  focusCoinsDayTotal
} from './focusCoinsLedger.js';

export { GRANT_KIND };

export const FOCUS_ESSENCE_DISPLAY_NAME_EN = 'Focus Essence';
export const FOCUS_ESSENCE_DISPLAY_NAME_JA = '精進';

/** @typedef {import('./focusCoinsLedger.js').FocusCoinsDayState} FocusEssenceDayState */
/** @typedef {import('./focusCoinsLedger.js').FocusCoinsSessionState} FocusEssenceSessionState */
/** @typedef {import('./focusCoinsLedger.js').FocusCoinsGrantEvent} FocusEssenceGrantEvent */

/** @returns {FocusEssenceDayState} */
export function emptyFocusEssenceDayState() {
  return emptyFocusCoinsDayState();
}

/** @returns {FocusEssenceSessionState} */
export function emptyFocusEssenceSessionState() {
  return emptyFocusCoinsSessionState();
}

/**
 * @param {FocusEssenceDayState} day
 * @returns {number}
 */
export function focusEssenceDayTotal(day) {
  return focusCoinsDayTotal(day);
}

/**
 * Award Focus Essence for one completed (or incomplete) event.
 *
 * @param {FocusEssenceGrantEvent} event
 * @param {FocusEssenceDayState} [day]
 * @param {FocusEssenceSessionState} [session]
 * @param {{ yesterdayPracticed?: boolean }} [opts]
 */
export function computeFocusEssenceGrant(
  event,
  day = emptyFocusEssenceDayState(),
  session = emptyFocusEssenceSessionState(),
  opts = {}
) {
  return computeFocusCoinsGrant(event, day, session, opts);
}
