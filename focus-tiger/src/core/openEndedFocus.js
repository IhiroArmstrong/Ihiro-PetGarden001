/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Open-ended focus clock (Brief A).
 * Pure functions. Session wiring lives in FocusSession / main.
 *
 * Elapsed = now − startedAt − pausedTotal − any open pause/suspend gap.
 * Downtime is never credited. Reward credit is capped separately from the clock.
 */

export const OPEN_ENDED_MODE = 'open';

/** Hard stop. The clock never displays past this. */
export const OPEN_ENDED_HARD_CAP_MS = 24 * 60 * 60 * 1000;

/** Minutes that may count toward coins / growth. Displayed time may be longer. */
export const OPEN_ENDED_REWARD_CAP_MS = 20 * 60 * 60 * 1000;

/** Gentle check-ins. Default on. Not a modal and not a second ticker. */
export const OPEN_ENDED_NUDGE_AT_MS = Object.freeze([
  90 * 60 * 1000,
  3 * 60 * 60 * 1000
]);

/**
 * @typedef {'open'} OpenEndedMode
 * @typedef {{
 *   mode: OpenEndedMode,
 *   startedAtMs: number,
 *   pausedTotalMs: number,
 *   lastActiveAtMs: number,
 *   openGapStartedAtMs?: number | null,
 *   closed?: boolean
 * }} OpenEndedSession
 */

/**
 * @param {unknown} n
 * @returns {number}
 */
function finiteMs(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

/**
 * @param {OpenEndedSession | null | undefined} session
 * @param {number} atMs
 * @returns {number}
 */
export function openGapMs(session, atMs) {
  const start = session?.openGapStartedAtMs;
  if (start == null || !Number.isFinite(Number(start))) return 0;
  return Math.max(0, finiteMs(atMs) - Number(start));
}

/**
 * @param {OpenEndedSession | null | undefined} session
 * @param {number} atMs
 * @returns {number}
 */
export function computeOpenEndedElapsedMs(session, atMs) {
  if (!session || session.mode !== OPEN_ENDED_MODE) return 0;
  const started = Number(session.startedAtMs);
  if (!Number.isFinite(started)) return 0;
  const paused = Math.max(0, finiteMs(session.pausedTotalMs));
  const raw = Math.max(
    0,
    finiteMs(atMs) - started - paused - openGapMs(session, atMs)
  );
  return Math.min(raw, OPEN_ENDED_HARD_CAP_MS);
}

/**
 * @param {number} elapsedMs
 * @returns {number}
 */
export function rewardCreditMsForElapsed(elapsedMs) {
  return Math.min(
    OPEN_ENDED_REWARD_CAP_MS,
    Math.max(0, finiteMs(elapsedMs))
  );
}

/**
 * @param {OpenEndedSession | null | undefined} session
 * @param {number} atMs
 * @returns {boolean}
 */
export function shouldAutoEndOpenEnded(session, atMs) {
  return computeOpenEndedElapsedMs(session, atMs) >= OPEN_ENDED_HARD_CAP_MS;
}

/**
 * @param {number} elapsedMs
 * @param {{ enabled?: boolean, alreadyShownMs?: readonly number[] }} [options]
 * @returns {number[]}
 */
export function nudgesReached(elapsedMs, options = {}) {
  if (options.enabled === false) return [];
  const seen = new Set(options.alreadyShownMs || []);
  return OPEN_ENDED_NUDGE_AT_MS.filter(
    (mark) => finiteMs(elapsedMs) >= mark && !seen.has(mark)
  );
}

/**
 * One static note per crossing. If several marks are newly due, show the latest
 * and treat the earlier ones as already shown.
 * @param {number} elapsedMs
 * @param {{ enabled?: boolean, alreadyShownMs?: readonly number[] }} [options]
 * @returns {{ showMs: number | null, markShownMs: number[] }}
 */
export function takeOpenEndedNudges(elapsedMs, options = {}) {
  const due = nudgesReached(elapsedMs, options);
  if (due.length === 0) {
    return { showMs: null, markShownMs: [] };
  }
  return { showMs: due[due.length - 1], markShownMs: due };
}

/**
 * Start a manual pause or a system suspend. Same bucket.
 * @param {OpenEndedSession} session
 * @param {number} atMs
 * @returns {OpenEndedSession}
 */
export function beginOpenGap(session, atMs) {
  if (session.openGapStartedAtMs != null) return session;
  return {
    ...session,
    openGapStartedAtMs: atMs,
    lastActiveAtMs: atMs
  };
}

/**
 * @param {OpenEndedSession} session
 * @param {number} atMs
 * @returns {OpenEndedSession}
 */
export function closeOpenGap(session, atMs) {
  if (session.openGapStartedAtMs == null) return session;
  const gap = Math.max(0, finiteMs(atMs) - Number(session.openGapStartedAtMs));
  return {
    ...session,
    pausedTotalMs: Math.max(0, finiteMs(session.pausedTotalMs)) + gap,
    openGapStartedAtMs: null,
    lastActiveAtMs: atMs
  };
}

/**
 * Restart found an unfinished open session.
 * Never returns the wall-clock span across the dead gap as the credited time.
 * @param {OpenEndedSession | null | undefined} session
 * @param {number} nowMs
 */
export function planOpenEndedRestart(session, nowMs) {
  if (!session || session.mode !== OPEN_ENDED_MODE || session.closed === true) {
    return { action: /** @type {'none'} */ ('none') };
  }

  const endElapsedMs = computeOpenEndedElapsedMs(session, session.lastActiveAtMs);
  if (endElapsedMs >= OPEN_ENDED_HARD_CAP_MS) {
    return {
      action: /** @type {'auto-end'} */ ('auto-end'),
      reason: 'hard-cap',
      elapsedMs: OPEN_ENDED_HARD_CAP_MS,
      rewardCreditMs: rewardCreditMsForElapsed(OPEN_ENDED_HARD_CAP_MS)
    };
  }

  const lastActive = Number(session.lastActiveAtMs);
  const deadGapMs = Math.max(0, finiteMs(nowMs) - lastActive);
  let paused = Math.max(0, finiteMs(session.pausedTotalMs));
  if (session.openGapStartedAtMs != null) {
    paused += openGapMs(session, lastActive) + deadGapMs;
  } else {
    paused += deadGapMs;
  }

  /** @type {OpenEndedSession} */
  const resumedSession = {
    ...session,
    pausedTotalMs: paused,
    openGapStartedAtMs: null
  };
  const resumeElapsedMs = computeOpenEndedElapsedMs(resumedSession, nowMs);
  const silentWallClockElapsedMs = computeOpenEndedElapsedMs(
    {
      ...session,
      openGapStartedAtMs: null,
      pausedTotalMs: Math.max(0, finiteMs(session.pausedTotalMs))
    },
    nowMs
  );

  return {
    action: /** @type {'ask'} */ ('ask'),
    choices: /** @type {const} */ (['resume', 'end-at-last-active']),
    resumeElapsedMs,
    endElapsedMs,
    rewardCreditMsIfEnd: rewardCreditMsForElapsed(endElapsedMs),
    rewardCreditMsIfResume: rewardCreditMsForElapsed(resumeElapsedMs),
    silentWallClockElapsedMs,
    resumedSession
  };
}
