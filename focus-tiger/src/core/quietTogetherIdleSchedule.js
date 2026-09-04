/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle lantern peek scheduling — cold boot + state transitions.
 * StateManager starts IDLE without firing onChange; boot must schedule too.
 */

import {
  LANTERN_PEEK_IDLE_MS,
  scheduleLanternPeek
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
 * @returns {boolean} whether a peek was scheduled
 */
export function scheduleLanternPeekWhenIdle(sessionState, opts = {}) {
  if (!shouldScheduleLanternPeekForSessionState(sessionState)) return false;
  scheduleLanternPeek({
    storage: opts.storage ?? null,
    delayMs: opts.delayMs ?? LANTERN_PEEK_IDLE_MS,
    ...opts
  });
  return true;
}
