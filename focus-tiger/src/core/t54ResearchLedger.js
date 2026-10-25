/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T54 stage-2 local practice log. Append-only. Not practice-days / journey-log / T50 ring.
 */

import {
  canUploadT54ResearchPayload,
  T54_RESEARCH_INGEST_PATH
} from './t54ResearchReceive.js';

export const T54_RESEARCH_LOG_STORAGE_KEY = 'focus-tiger.t54-research-log.v1';
export const T54_RESEARCH_CONSENT_STORAGE_KEY =
  'focus-tiger.t54-research-consent.v1';

export const T54_LOG_SOURCE = Object.freeze({
  SELF_OPEN: 'self_open',
  SILENCE_NUDGE: 'silence_nudge',
  HONESTY_MAKEUP: 'honesty_makeup',
  RITUAL: 'ritual'
});

export const T54_LOG_END = Object.freeze({
  COMPLETED: 'completed',
  EARLY_RISE: 'early_rise',
  LEFT_MIDWAY: 'left_midway'
});

const FORBIDDEN_LEDGER_KEYS = Object.freeze([
  'focus-tiger.practice-days.v1',
  'focus-tiger.journey-log.v1',
  'focus-tiger.ype-companion-style.v1',
  'focus-tiger.lotus-pond.v1',
  'focus-tiger.session-presence-ring.v1',
  'focus-tiger.retention-funnel.v1',
  'focus-tiger.focus-coins.v1'
]);

const MAX_ROWS = 200;

/**
 * @param {unknown} storage
 * @returns {Storage | null}
 */
function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Timed-focus ends only. Honesty makeup / 1-min breath must not use SELF_OPEN.
 *
 * @param {unknown} source
 */
export function isTimedFocusLogSource(source) {
  return source === T54_LOG_SOURCE.SELF_OPEN || source === T54_LOG_SOURCE.SILENCE_NUDGE;
}

/**
 * @param {Storage | null | undefined} storage
 */
export function hasT54ResearchConsent(storage) {
  const store = resolveStorage(storage);
  if (!store) return false;
  try {
    const raw = store.getItem(T54_RESEARCH_CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.granted === true;
  } catch {
    return false;
  }
}

/**
 * @param {object} input
 * @param {string} input.source
 */
export function shouldAppendT54TimedFocusLog(input) {
  return isTimedFocusLogSource(input?.source);
}

/**
 * @param {object} input
 * @param {number} input.startedAtMs
 * @param {string} [input.source]
 * @param {number | null} [input.plannedMinutes]
 * @param {number} input.actualMinutes
 * @param {string} input.endKind
 * @param {string | null} [input.nudgeId]
 * @param {string | null} [input.studyId]
 * @param {string | null} [input.userResponse]
 * @param {Storage | null} [input.storage]
 * @returns {object | null} row or null if skipped / write failed
 */
export function appendT54TimedFocusLog(input) {
  if (!shouldAppendT54TimedFocusLog(input)) return null;
  const store = resolveStorage(input.storage);
  if (!store) return null;
  const startedAtMs = Number(input.startedAtMs);
  if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) return null;
  const row = {
    startedAt: new Date(startedAtMs).toISOString(),
    source: input.source,
    plannedMinutes:
      input.plannedMinutes == null ? null : Number(input.plannedMinutes),
    actualMinutes: Number(input.actualMinutes) || 0,
    endKind: input.endKind || T54_LOG_END.COMPLETED,
    nudgeId: input.nudgeId ?? null,
    studyId: input.studyId ?? null,
    userResponse: input.userResponse ?? null
  };
  try {
    const parsed = JSON.parse(store.getItem(T54_RESEARCH_LOG_STORAGE_KEY) ?? '[]');
    const rows = Array.isArray(parsed) ? parsed : [];
    rows.push(row);
    store.setItem(
      T54_RESEARCH_LOG_STORAGE_KEY,
      JSON.stringify(rows.slice(-MAX_ROWS))
    );
    return row;
  } catch {
    return null;
  }
}

/**
 * Default off. Lab query `t54ResearchUpload=1` may enable, still blocked without consent.
 *
 * @param {string} [search]
 */
export function isT54LabUploadEnabled(search = '') {
  try {
    const q = new URLSearchParams(String(search).replace(/^\?/, ''));
    return q.get('t54ResearchUpload') === '1';
  } catch {
    return false;
  }
}

/**
 * @param {{ storage?: Storage | null, search?: string }} [opts]
 */
export function shouldPostT54ResearchIngest({ storage, search } = {}) {
  return canUploadT54ResearchPayload({
    consented: hasT54ResearchConsent(storage),
    labUploadEnabled: isT54LabUploadEnabled(search)
  });
}

/**
 * Call from timed FocusSession end only. Does not POST unless lab + consent.
 *
 * @param {object} opts
 * @param {object} opts.session
 * @param {boolean} opts.endedEarly
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.search]
 */
export function noteTimedFocusEndedForT54({
  session,
  endedEarly,
  storage,
  search = ''
}) {
  if (!session || typeof session.getElapsedSeconds !== 'function') return null;
  const startedAtMs = Number(session.startedAtMs);
  const actualMinutes = Math.max(
    0,
    Math.round(Number(session.getElapsedSeconds() || 0) / 60)
  );
  const open = typeof session.isOpenEnded === 'function' && session.isOpenEnded();
  const row = appendT54TimedFocusLog({
    storage,
    source: T54_LOG_SOURCE.SELF_OPEN,
    startedAtMs,
    plannedMinutes: open ? null : session.targetMinutes ?? null,
    actualMinutes,
    endKind: endedEarly ? T54_LOG_END.EARLY_RISE : T54_LOG_END.COMPLETED
  });
  if (row && shouldPostT54ResearchIngest({ storage, search })) {
    return { row, ingestPath: T54_RESEARCH_INGEST_PATH };
  }
  return row ? { row, ingestPath: null } : null;
}

export { T54_RESEARCH_INGEST_PATH, FORBIDDEN_LEDGER_KEYS };
