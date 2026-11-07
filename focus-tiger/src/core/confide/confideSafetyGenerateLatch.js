/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T91 · audit-fix-10-03 (session leg): after a safety_redirect corpus reply,
 * disable Confide L3 generate for the next N user sends in this card session.
 * Round count may be tuned when external advisor01 confirms; mechanism ships first.
 */

import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';

/** @typedef {{ turnsRemaining: number }} ConfideSafetyGenerateLatchState */

export const DEFAULT_CONFIDE_SAFETY_GENERATE_LOCK_TURNS = 3;

/**
 * @returns {ConfideSafetyGenerateLatchState}
 */
export function createConfideSafetyGenerateLatchState() {
  return { turnsRemaining: 0 };
}

/**
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {number}
 */
export function resolveConfideSafetyGenerateLockTurns(env) {
  const raw = Number(confideBrowserSafeEnv(env).FT_CONFIDE_SAFETY_GENERATE_LOCK_TURNS);
  if (Number.isFinite(raw) && raw >= 1 && raw <= 12) return Math.floor(raw);
  return DEFAULT_CONFIDE_SAFETY_GENERATE_LOCK_TURNS;
}

/**
 * @param {ConfideSafetyGenerateLatchState | null | undefined} state
 * @param {number} [turns]
 */
export function armConfideSafetyGenerateLatch(state, turns = DEFAULT_CONFIDE_SAFETY_GENERATE_LOCK_TURNS) {
  if (!state) return;
  const n = Number(turns);
  state.turnsRemaining = Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_CONFIDE_SAFETY_GENERATE_LOCK_TURNS;
}

/**
 * Call once per user send (before routing).
 * @param {ConfideSafetyGenerateLatchState | null | undefined} state
 */
export function tickConfideSafetyGenerateLatchOnUserSend(state) {
  if (!state || state.turnsRemaining <= 0) return;
  state.turnsRemaining -= 1;
}

/**
 * @param {ConfideSafetyGenerateLatchState | null | undefined} state
 * @returns {boolean}
 */
export function isConfideSafetyGenerateLatchActive(state) {
  return Boolean(state && state.turnsRemaining > 0);
}
