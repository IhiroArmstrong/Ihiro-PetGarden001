/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle lantern observer — cold boot + state transitions.
 * StateManager starts IDLE without firing onChange; boot must start observer too.
 */

import {
  LANTERN_PEEK_IDLE_MS,
  startLanternIdleObserverPeek,
  stopLanternIdleObserverPeek
} from './quietTogetherPresence.js';

/**
 * @param {string} sessionState
 * @returns {boolean}
 */
export function shouldScheduleLanternPeekForSessionState(sessionState) {
  return sessionState === 'IDLE';
}

/**
 * @param {string} sessionState
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {number} [opts.delayMs]
 * @returns {boolean} whether the idle observer was started
 */
export function syncLanternIdleObserverPeek(sessionState, opts = {}) {
  if (!shouldScheduleLanternPeekForSessionState(sessionState)) {
    stopLanternIdleObserverPeek();
    return false;
  }
  startLanternIdleObserverPeek({
    storage: opts.storage ?? null,
    delayMs: opts.delayMs ?? LANTERN_PEEK_IDLE_MS,
    ...opts
  });
  return true;
}

/** @deprecated use syncLanternIdleObserverPeek */
export function scheduleLanternPeekWhenIdle(sessionState, opts = {}) {
  return syncLanternIdleObserverPeek(sessionState, opts);
}
