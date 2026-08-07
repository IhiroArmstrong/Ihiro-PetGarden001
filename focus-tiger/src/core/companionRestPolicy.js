/**
 * Companion rest / wake policy helpers (pure).
 *
 * Complements (does not replace) the existing 2h → DORMANT path:
 * - Idle / non-focus + ≥2h since session end → DORMANT sleep (HonestyCheckInController)
 * - FOCUSING + tab hidden ≥ LONG_AWAY_WAKE_MS → play dormantWake on return (stay focusing)
 * - Late-night Idle → force DORMANT cloak (Expand A night only; **no** daytime Idle inactivity cloak)
 * - Late-night Rise / natural end → cloak hold then Reflection (not rise stretch / celebrate)
 *
 * 2026-08-04 plan A: daytime Idle ≥N min no-activity → cloak **removed** (QA long-hang false sleep).
 */

import { STATES } from './StateManager.js';
import { isLateNightHour } from './sceneAnimationDispatcher.js';

/** Tab hidden while focusing before long-away wake on return. */
export const LONG_AWAY_WAKE_MS = 30 * 60 * 1000;

export const FOREGROUND_RETURN_ACTIONS = Object.freeze({
  LONG_AWAY_WAKE: 'longAwayWake',
  SYNC_DORMANT_AND_LATE_NIGHT: 'syncDormantAndLateNight'
});

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
 * Visibility→visible: 2B long-away wake vs keep 2h DORMANT + late-night path.
 * @param {object} opts
 * @param {string} opts.sessionState
 * @param {number} opts.hiddenMs
 * @param {number} [opts.thresholdMs]
 * @returns {'longAwayWake'|'syncDormantAndLateNight'}
 */
export function resolveForegroundReturnAction(opts) {
  return shouldPlayLongAwayWake(opts)
    ? FOREGROUND_RETURN_ACTIONS.LONG_AWAY_WAKE
    : FOREGROUND_RETURN_ACTIONS.SYNC_DORMANT_AND_LATE_NIGHT;
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
 * Rise / natural-complete hold emotion when Expand B applies.
 * @param {object} opts
 * @param {Date} [opts.date]
 * @param {() => string} opts.pickDaytimeRiseEmotion
 * @returns {string}
 */
export function resolveSessionEndHoldEmotion({
  date = new Date(),
  pickDaytimeRiseEmotion
}) {
  if (shouldLateNightCloakOnSessionEnd(date)) return 'cloakSleep';
  return pickDaytimeRiseEmotion();
}

/**
 * Hold keys during Reflection after late-night cloak Rise / complete.
 * @param {string | null | undefined} key
 * @returns {boolean}
 */
export function isLateNightCloakHoldEmotion(key) {
  return key === 'cloakSleep' || key === 'starlightCloakSleep';
}
