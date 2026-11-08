/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T91 · audit-fix-10-03 (process leg): after a safety_redirect corpus reply,
 * disable Confide L3 generate until this app process exits.
 * Closing the Confide panel must not clear the lock (that was the 3-turn
 * session-card hole). Web tab reload / Electron quit resets it.
 */

/** @typedef {{ lockedUntilProcessExit: boolean }} ConfideSafetyGenerateLatchState */

let processLatch = createConfideSafetyGenerateLatchState();

/**
 * @returns {ConfideSafetyGenerateLatchState}
 */
export function createConfideSafetyGenerateLatchState() {
  return { lockedUntilProcessExit: false };
}

/**
 * Shared lock for this JS process (one Electron renderer / one tab).
 * @returns {ConfideSafetyGenerateLatchState}
 */
export function getConfideSafetyGenerateLatchState() {
  return processLatch;
}

/** @internal tests only */
export function resetConfideSafetyGenerateLatchForTests() {
  processLatch = createConfideSafetyGenerateLatchState();
}

/**
 * @param {ConfideSafetyGenerateLatchState | null | undefined} [state]
 */
export function armConfideSafetyGenerateLatch(state = processLatch) {
  if (!state) return;
  state.lockedUntilProcessExit = true;
}

/**
 * Kept so send-path call sites stay stable. Process lock does not count down.
 * @param {ConfideSafetyGenerateLatchState | null | undefined} [_state]
 */
export function tickConfideSafetyGenerateLatchOnUserSend(_state) {}

/**
 * @param {ConfideSafetyGenerateLatchState | null | undefined} state
 * @returns {boolean}
 */
export function isConfideSafetyGenerateLatchActive(state) {
  return Boolean(state && state.lockedUntilProcessExit);
}
