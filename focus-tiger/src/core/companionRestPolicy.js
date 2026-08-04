/**
 * Companion rest / wake policy helpers (pure).
 *
 * Complements (does not replace) the existing 2h → DORMANT path:
 * - Idle / non-focus + ≥2h since session end → DORMANT sleep (HonestyCheckInController)
 * - FOCUSING + tab hidden ≥ LONG_AWAY_WAKE_MS → play dormantWake on return (stay focusing)
 * - Late-night Idle / inactivity → force DORMANT cloak
 * - Late-night Rise / natural end → cloak hold then Reflection (not rise stretch / celebrate)
 */

import { STATES } from './StateManager.js';
import { isLateNightHour } from './sceneAnimationDispatcher.js';

/** Tab hidden while focusing before long-away wake on return. */
export const LONG_AWAY_WAKE_MS = 30 * 60 * 1000;

/** Idle with no pointer/key activity before Expand A cloak sleep. */
export const IDLE_INACTIVITY_CLOAK_MS = 15 * 60 * 1000;

/**
 * @param {object} opts
 * @param {string} opts.sessionState
 * @param {number} opts.hiddenMs
 * @param {number} [opts.thresholdMs]
 * @returns {boolean}
 */
export function shouldPlayLongAwayWake({
  sessionState,
  hiddenMs,
  thresholdMs = LONG_AWAY_WAKE_MS
}) {
  if (sessionState !== STATES.FOCUSING) return false;
  if (!Number.isFinite(hiddenMs) || hiddenMs < 0) return false;
  return hiddenMs >= thresholdMs;
}

/**
 * Expand A: Idle long enough with no user activity → cloak / DORMANT.
 * @param {object} opts
 * @param {string} opts.sessionState
 * @param {number} opts.idleMs
 * @param {number} [opts.thresholdMs]
 * @returns {boolean}
 */
export function shouldIdleInactivityCloak({
  sessionState,
  idleMs,
  thresholdMs = IDLE_INACTIVITY_CLOAK_MS
}) {
  if (sessionState !== STATES.IDLE) return false;
  if (!Number.isFinite(idleMs) || idleMs < 0) return false;
  return idleMs >= thresholdMs;
}

/**
 * Expand B: late-night session end uses cloak hold instead of rise pool / celebrate.
 * @param {Date} [date]
 * @returns {boolean}
 */
export function shouldLateNightCloakOnSessionEnd(date = new Date()) {
  return isLateNightHour(date);
}

/**
 * Hold keys during Reflection after late-night cloak Rise / complete.
 * @param {string | null | undefined} key
 * @returns {boolean}
 */
export function isLateNightCloakHoldEmotion(key) {
  return key === 'cloakSleep' || key === 'starlightCloakSleep';
}
