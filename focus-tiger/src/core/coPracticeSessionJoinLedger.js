/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T66 — co-practice session join ledger (session id + offered-default vs completed minutes).
 * Local only; no UI; not in practice cloud backup or T54 research payload.
 */

import { getLocalDateKey } from '../utils/localDate.js';
import { getStorage, setStorage } from '../utils/Storage.js';
import {
  INVITE_OUTCOME_KINDS,
  INVITE_OUTCOME_VALUES,
  readInviteOutcomeRecords
} from './inviteOutcomeStore.js';
import { isYinAdaptationEnabled } from './yinAdaptationStore.js';
import { resolvePracticeAggregate } from './practiceAggregate.js';

export const SESSION_DURATION_OFFER_STORAGE_KEY =
  'focus-tiger.session-duration-offer.v1';

export const SESSION_DURATION_OFFER_MAX_ENTRIES = 240;

export const SESSION_DURATION_SOURCE_TIMED = 'timed';

/** @type {string | null} */
let activeCoPracticeSessionId = null;

let sessionIdSequence = 0;

/**
 * @param {number} [startedAtMs]
 * @returns {string}
 */
export function mintCoPracticeSessionId(startedAtMs = Date.now()) {
  sessionIdSequence += 1;
  return `sit-${startedAtMs}-${sessionIdSequence}`;
}

/** @returns {string | null} */
export function getActiveCoPracticeSessionId() {
  return activeCoPracticeSessionId;
}

/**
 * @param {unknown} rows
 * @returns {object[]}
 */
export function normalizeSessionDurationOfferRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) =>
      row &&
      typeof row === 'object' &&
      typeof row.sessionId === 'string' &&
      row.sessionId.length > 0 &&
      typeof row.offeredDefaultMinutes === 'number' &&
      Number.isFinite(row.offeredDefaultMinutes) &&
      row.source === SESSION_DURATION_SOURCE_TIMED &&
      (row.actualCompletedMinutes == null ||
        (typeof row.actualCompletedMinutes === 'number' &&
          Number.isFinite(row.actualCompletedMinutes))) &&
      (row.completedAt == null || typeof row.completedAt === 'number')
  );
}

/**
 * @param {string} [key]
 * @returns {object[]}
 */
export function readSessionDurationOfferRows(
  key = SESSION_DURATION_OFFER_STORAGE_KEY
) {
  return normalizeSessionDurationOfferRows(getStorage(key, []));
}

/**
 * @param {object[]} rows
 * @param {string} [key]
 * @returns {boolean}
 */
function writeSessionDurationOfferRows(rows, key = SESSION_DURATION_OFFER_STORAGE_KEY) {
  const trimmed =
    rows.length > SESSION_DURATION_OFFER_MAX_ENTRIES
      ? rows.slice(-SESSION_DURATION_OFFER_MAX_ENTRIES)
      : rows;
  try {
    setStorage(key, trimmed);
    return readSessionDurationOfferRows(key).length === trimmed.length;
  } catch {
    return false;
  }
}

/**
 * Timed focus actually started — mint session id and open duration-offer row.
 * @param {{ offeredDefaultMinutes: number, startedAtMs?: number, key?: string }} opts
 * @returns {string | null} sessionId when persisted
 */
export function beginCoPracticeTimedSession({
  offeredDefaultMinutes,
  startedAtMs = Date.now(),
  key = SESSION_DURATION_OFFER_STORAGE_KEY
}) {
  const offered = Math.round(Number(offeredDefaultMinutes));
  if (!Number.isFinite(offered) || offered <= 0) return null;
  const sessionId = mintCoPracticeSessionId(startedAtMs);
  const rows = readSessionDurationOfferRows(key);
  rows.push({
    sessionId,
    offeredDefaultMinutes: offered,
    actualCompletedMinutes: null,
    completedAt: null,
    source: SESSION_DURATION_SOURCE_TIMED
  });
  if (!writeSessionDurationOfferRows(rows, key)) {
    activeCoPracticeSessionId = null;
    return null;
  }
  activeCoPracticeSessionId = sessionId;
  return sessionId;
}

/**
 * @param {{ actualCompletedMinutes: number, completedAt?: number, key?: string }} opts
 * @returns {boolean}
 */
export function completeCoPracticeTimedSession({
  actualCompletedMinutes,
  completedAt = Date.now(),
  key = SESSION_DURATION_OFFER_STORAGE_KEY
}) {
  const sessionId = activeCoPracticeSessionId;
  if (!sessionId) return false;
  const actual = Math.round(Number(actualCompletedMinutes));
  if (!Number.isFinite(actual) || actual <= 0) {
    endCoPracticeTimedSessionActive();
    return false;
  }
  const rows = readSessionDurationOfferRows(key);
  const idx = rows.findIndex((row) => row.sessionId === sessionId);
  if (idx < 0) {
    endCoPracticeTimedSessionActive();
    return false;
  }
  rows[idx] = {
    ...rows[idx],
    actualCompletedMinutes: actual,
    completedAt: Number(completedAt) || Date.now()
  };
  const ok = writeSessionDurationOfferRows(rows, key);
  endCoPracticeTimedSessionActive();
  return ok;
}

/** Clear in-memory active pointer (Rise / stop); ledger rows stay. */
export function endCoPracticeTimedSessionActive() {
  activeCoPracticeSessionId = null;
}

/**
 * T58 forget — wipe default-minute ledger.
 * @param {string} [key]
 * @returns {boolean}
 */
export function clearSessionDurationOfferRecords(
  key = SESSION_DURATION_OFFER_STORAGE_KEY
) {
  endCoPracticeTimedSessionActive();
  try {
    setStorage(key, []);
    return true;
  } catch {
    return false;
  }
}

const B_JOIN_KINDS = new Set([
  INVITE_OUTCOME_KINDS.AWAY,
  INVITE_OUTCOME_KINDS.EXTEND,
  INVITE_OUTCOME_KINDS.LONG_SIT
]);

/**
 * @param {object[]} [inviteRows]
 * @param {object[]} [durationRows]
 * @param {{ dayKeyFromTs?: (ts: number) => string }} [opts]
 * @returns {number}
 */
export function countCoPracticeBJoinDaySketches(
  inviteRows = readInviteOutcomeRecords(),
  durationRows = readSessionDurationOfferRows(),
  { dayKeyFromTs = (ts) => getLocalDateKey(new Date(ts)) } = {}
) {
  /** @type {Map<string, { completedAt: number }>} */
  const completedBySession = new Map();
  for (const row of durationRows) {
    if (row.actualCompletedMinutes == null) continue;
    completedBySession.set(row.sessionId, {
      completedAt: Number(row.completedAt) || 0
    });
  }
  /** @type {Set<string>} */
  const days = new Set();
  for (const inv of inviteRows) {
    if (!inv.sessionId || typeof inv.sessionId !== 'string') continue;
    if (!B_JOIN_KINDS.has(inv.kind)) continue;
    if (inv.outcome !== INVITE_OUTCOME_VALUES.ACCEPTED) continue;
    const completed = completedBySession.get(inv.sessionId);
    if (!completed) continue;
    const ts = completed.completedAt || inv.ts;
    days.add(dayKeyFromTs(ts));
  }
  return days.size;
}

/**
 * Rhythm-stable proxy (C) — not proof Yin adapted to the user.
 * @param {object[]} [durationRows]
 * @param {{
 *   bandwidthRatio?: number,
 *   sampleSize?: number,
 *   adaptationEnabled?: boolean
 * }} [opts]
 */
export function evaluateCoPracticeRhythmStableProxy(
  durationRows = readSessionDurationOfferRows(),
  {
    bandwidthRatio = 0.2,
    sampleSize = 10,
    adaptationEnabled = isYinAdaptationEnabled()
  } = {}
) {
  if (!adaptationEnabled) {
    return {
      available: false,
      reason: 'adaptation_off',
      hitCount: 0,
      sampleCount: 0,
      hitRatio: null
    };
  }
  const completed = durationRows
    .filter(
      (row) =>
        row.source === SESSION_DURATION_SOURCE_TIMED &&
        row.actualCompletedMinutes != null
    )
    .slice(-sampleSize);
  if (completed.length === 0) {
    return {
      available: true,
      hitCount: 0,
      sampleCount: 0,
      hitRatio: null
    };
  }
  const band = Math.max(0, Number(bandwidthRatio) || 0);
  let hitCount = 0;
  for (const row of completed) {
    const offered = row.offeredDefaultMinutes;
    const actual = row.actualCompletedMinutes;
    const tolerance = offered * band;
    if (Math.abs(actual - offered) <= tolerance) hitCount += 1;
  }
  return {
    available: true,
    hitCount,
    sampleCount: completed.length,
    hitRatio: hitCount / completed.length
  };
}

/**
 * DEV / `?product=1` read-only rollup (no user-facing UI).
 * @param {Storage | null | undefined} [storage]
 */
export function summarizeCoPracticeJoinLedgerForDev(storage) {
  void storage;
  const aggregate = resolvePracticeAggregate();
  return {
    scoreEligibleLifetimeMinutes: aggregate.scoreEligibleLifetimeMinutes ?? 0,
    bJoinDaySketches: countCoPracticeBJoinDaySketches(),
    rhythmStableProxy: evaluateCoPracticeRhythmStableProxy()
  };
}
