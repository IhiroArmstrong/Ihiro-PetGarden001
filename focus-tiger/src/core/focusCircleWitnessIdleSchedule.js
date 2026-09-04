/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle circle witness observer — mirrors presence idle schedule.
 */

import {
  FOCUS_CIRCLE_WITNESS_PEEK_IDLE_MS,
  startFocusCircleWitnessIdleObserverPeek,
  stopFocusCircleWitnessIdleObserverPeek
} from './focusCircleWitness.js';

/**
 * @param {string} sessionState
 * @returns {boolean}
 */
export function shouldScheduleFocusCircleWitnessPeekForSessionState(
  sessionState
) {
  return sessionState === 'IDLE';
}

/**
 * @param {string} sessionState
 * @param {object} [opts]
 * @returns {boolean}
 */
export function syncFocusCircleWitnessIdleObserverPeek(sessionState, opts = {}) {
  if (!shouldScheduleFocusCircleWitnessPeekForSessionState(sessionState)) {
    stopFocusCircleWitnessIdleObserverPeek();
    return false;
  }
  startFocusCircleWitnessIdleObserverPeek({
    storage: opts.storage ?? null,
    delayMs: opts.delayMs ?? FOCUS_CIRCLE_WITNESS_PEEK_IDLE_MS,
    ...opts
  });
  return true;
}
