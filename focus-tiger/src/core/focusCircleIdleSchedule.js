/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle circle presence observer — mirrors lantern idle schedule.
 */

import {
  FOCUS_CIRCLE_PEEK_IDLE_MS,
  startFocusCircleIdleObserverPeek,
  stopFocusCircleIdleObserverPeek
} from './focusCirclePresence.js';

/**
 * @param {string} sessionState
 * @returns {boolean}
 */
export function shouldScheduleFocusCirclePeekForSessionState(sessionState) {
  return sessionState === 'IDLE';
}

/**
 * @param {string} sessionState
 * @param {object} [opts]
 * @returns {boolean}
 */
export function syncFocusCircleIdleObserverPeek(sessionState, opts = {}) {
  if (!shouldScheduleFocusCirclePeekForSessionState(sessionState)) {
    stopFocusCircleIdleObserverPeek();
    return false;
  }
  startFocusCircleIdleObserverPeek({
    storage: opts.storage ?? null,
    delayMs: opts.delayMs ?? FOCUS_CIRCLE_PEEK_IDLE_MS,
    ...opts
  });
  return true;
}
