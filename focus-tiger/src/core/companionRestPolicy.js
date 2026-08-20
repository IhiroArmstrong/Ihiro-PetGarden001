/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Companion rest / wake policy helpers (pure).
 *
 * Complements (does not replace) the existing 2h → DORMANT path:
 * - Occupancy / enter-sleep priority: `spriteChannelArbitration`
 * - Idle / non-focus + ≥2h since session end → DORMANT sleep (Honesty executes delta)
 *   **except** a short visibility return: hiddenMs must also be ≥2h
 *   (`shouldAllowEnterDormantOnForegroundReturn` helper; Welcome-then-sleep bug)
 * - FOCUSING + tab hidden ≥ LONG_AWAY_WAKE_MS → play dormantWake on return (stay focusing)
 * - Late-night Idle → DORMANT cloak (Expand A; hours aligned in `lateNightHour.js`)
 * - Session end into Reflection stays a companion moment (awake sitting / rise pool /
 *   celebrate / light complete). **Do not** cloakSleep while Reflection is open.
 *
 * 2026-08-04 plan A: daytime Idle ≥N min no-activity → cloak **removed** (QA long-hang false sleep).
 * 2026-08-18: Expand B session-end cloak into Reflection **revoked** (CORE_LOOP Reflect
 * still sitting with the user; cloak/sleep remains Expand A / 2h DORMANT / wellness boot).
 */

import { STATES } from './StateManager.js';
import { DORMANT_IDLE_MS } from '../utils/Constants.js';

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
 * Visibility→visible may enter DORMANT / late-night cloak only when the tab
 * was actually hidden ≥ 2h. A stale `focus-session-end` after this-session
 * Welcome must not put Yin to sleep on a ~1 min tab switch
 * (2026-08-18 user written: Welcome back → cannot sleep).
 *
 * Rise / explicit `syncDormantState()` still uses the 2h session-end stamp.
 *
 * @param {object} opts
 * @param {number} opts.hiddenMs
 * @param {number} [opts.thresholdMs]
 * @returns {boolean}
 */
export function shouldAllowEnterDormantOnForegroundReturn({
  hiddenMs,
  thresholdMs = DORMANT_IDLE_MS
} = {}) {
  if (!Number.isFinite(hiddenMs) || hiddenMs < 0) return false;
  if (!Number.isFinite(thresholdMs) || thresholdMs <= 0) return false;
  return hiddenMs >= thresholdMs;
}

/**
 * Whether session-end (Rise / timed complete) should play cloakSleep into Reflection.
 *
 * Always false: Reflect is still a companion moment (CORE_LOOP). Sleeping while
 * "What did you notice today?" is open reads as the whole process ending.
 * Late-night rest stays Expand A (Idle ≥23 → DORMANT) and 2h live sync.
 *
 * `date` kept for call-site compatibility; hour is intentionally unused.
 * @param {Date} [_date]
 * @returns {false}
 */
export function shouldLateNightCloakOnSessionEnd(_date = new Date()) {
  return false;
}

/**
 * Rise hold emotion into Reflection. Always the daytime rise pool —
 * never cloakSleep (Expand B session-end cloak revoked 2026-08-18).
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
 * Cloak-sleep hold keys (debug / leftover). Session-end no longer sets these
 * into Reflection; MoodController / onDone still treat them as hold-then-idle.
 * @param {string | null | undefined} key
 * @returns {boolean}
 */
export function isLateNightCloakHoldEmotion(key) {
  return key === 'cloakSleep' || key === 'starlightCloakSleep';
}
