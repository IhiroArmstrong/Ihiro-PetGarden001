/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T50 Phase 0 — session presence shadow summary.
 * Local console + optional ring only. Never writes practice ledgers.
 * Labels from estimateSessionPresence must not reach UI.
 */

/** Same floor as AttentionSignals.onReturn (20s). Keep the number here to avoid core→input import. */
const LEAVE_COUNT_THRESHOLD_MS = 20_000;

const COMPANION_MODES = new Set(['stay', 'stepAway', 'acrossTools']);

export const SESSION_PRESENCE_RING_STORAGE_KEY =
  'focus-tiger.session-presence-ring.v1';
export const SESSION_PRESENCE_RING_MAX = 40;

/** Fixture / estimator knobs — not product-frozen. Changing them requires fixture updates. */
export const SESSION_PRESENCE_ESTIMATE_THRESHOLDS = Object.freeze({
  minActualSeconds: 60,
  settledMaxLeaveCount: 1,
  driftingMinLeaveCount: 3,
  strugglingMinPauseCount: 3
});

export const SESSION_PRESENCE_LABELS = Object.freeze({
  SETTLED: 'SETTLED',
  DRIFTING: 'DRIFTING',
  STRUGGLING: 'STRUGGLING',
  UNKNOWN: 'UNKNOWN'
});

const FORBIDDEN_LEDGER_KEYS = Object.freeze([
  'focus-tiger.practice-days.v1',
  'focus-tiger.lotus-pond.v1',
  'focus-tiger.daily-completions.v1',
  'focus-tiger.journey-log.v1',
  'focus-tiger.growth-journey-stage.v1',
  'focus-tiger.presence-signals.v1',
  'focus-tiger.retention-funnel.v1',
  'focus-tiger.practice-backup.v1',
  'focus-tiger.focus-coins.v1'
]);

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
 * @param {object} input
 * @param {string} input.companionMode
 * @param {number | null} input.plannedMinutes
 * @param {number} input.actualSeconds
 * @param {readonly number[]} input.leaveDurationsSeconds
 * @param {number} input.pauseCount
 * @param {boolean} input.extended
 * @param {boolean} input.endedEarly
 * @param {'fixed' | 'open'} input.durationMode
 */
export function buildSessionPresenceSummary({
  companionMode,
  plannedMinutes,
  actualSeconds,
  leaveDurationsSeconds,
  pauseCount,
  extended,
  endedEarly,
  durationMode
}) {
  const leaves = Array.isArray(leaveDurationsSeconds)
    ? leaveDurationsSeconds.filter((n) => Number.isFinite(n) && n > 0)
    : [];
  const leaveTotalSeconds = leaves.reduce((sum, n) => sum + n, 0);
  const leaveLongestSeconds = leaves.length ? Math.max(...leaves) : 0;
  return {
    companionMode: COMPANION_MODES.has(companionMode) ? companionMode : 'stay',
    plannedMinutes:
      plannedMinutes == null || durationMode === 'open'
        ? null
        : Number(plannedMinutes),
    actualSeconds: Math.max(0, Math.floor(Number(actualSeconds) || 0)),
    leaveCount: leaves.length,
    leaveTotalSeconds: Math.round(leaveTotalSeconds),
    leaveLongestSeconds: Math.round(leaveLongestSeconds),
    pauseCount: Math.max(0, Math.floor(Number(pauseCount) || 0)),
    extended: Boolean(extended),
    endedEarly: Boolean(endedEarly),
    durationMode: durationMode === 'open' ? 'open' : 'fixed'
  };
}

/**
 * Pure estimator. Zero product consumers in Phase 0.
 * Leave counts must not mark DRIFTING in stepAway / acrossTools.
 *
 * @param {ReturnType<typeof buildSessionPresenceSummary>} summary
 * @param {typeof SESSION_PRESENCE_ESTIMATE_THRESHOLDS} [thresholds]
 * @returns {'SETTLED' | 'DRIFTING' | 'STRUGGLING' | 'UNKNOWN'}
 */
export function estimateSessionPresence(
  summary,
  thresholds = SESSION_PRESENCE_ESTIMATE_THRESHOLDS
) {
  const actual = Number(summary?.actualSeconds) || 0;
  if (actual < thresholds.minActualSeconds) return SESSION_PRESENCE_LABELS.UNKNOWN;

  const endedEarly = Boolean(summary?.endedEarly);
  const pauseCount = Number(summary?.pauseCount) || 0;
  const leaveCount = Number(summary?.leaveCount) || 0;
  const mode = summary?.companionMode;
  const leaveDoesNotDriveDrift = mode === 'acrossTools' || mode === 'stepAway';

  if (endedEarly || pauseCount >= thresholds.strugglingMinPauseCount) {
    return SESSION_PRESENCE_LABELS.STRUGGLING;
  }
  if (!leaveDoesNotDriveDrift && leaveCount >= thresholds.driftingMinLeaveCount) {
    return SESSION_PRESENCE_LABELS.DRIFTING;
  }
  if (leaveCount <= thresholds.settledMaxLeaveCount && pauseCount === 0 && !endedEarly) {
    return SESSION_PRESENCE_LABELS.SETTLED;
  }
  if (leaveDoesNotDriveDrift) return SESSION_PRESENCE_LABELS.SETTLED;
  return SESSION_PRESENCE_LABELS.UNKNOWN;
}

/**
 * @param {object} session
 * @param {{ endedEarly: boolean }} opts
 */
export function snapshotFocusSessionForPresence(session, { endedEarly }) {
  const open = typeof session.isOpenEnded === 'function' && session.isOpenEnded();
  return {
    companionMode: session.companionMode,
    plannedMinutes: open ? null : session.targetMinutes,
    actualSeconds: Math.floor(Number(session.getElapsedSeconds?.() ?? 0)),
    durationMode: session.durationMode,
    endedEarly: Boolean(endedEarly)
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} [key]
 * @returns {object[]}
 */
export function readSessionPresenceRing(
  storage,
  key = SESSION_PRESENCE_RING_STORAGE_KEY
) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {object} summary
 * @param {Storage | null | undefined} storage
 * @param {string} [key]
 */
export function appendSessionPresenceSummary(
  summary,
  storage,
  key = SESSION_PRESENCE_RING_STORAGE_KEY
) {
  if (!storage || !summary || typeof summary !== 'object') return;
  if (key !== SESSION_PRESENCE_RING_STORAGE_KEY) return;
  if (FORBIDDEN_LEDGER_KEYS.includes(key)) return;
  try {
    const rows = readSessionPresenceRing(storage, key);
    rows.push(summary);
    const trimmed =
      rows.length > SESSION_PRESENCE_RING_MAX
        ? rows.slice(-SESSION_PRESENCE_RING_MAX)
        : rows;
    storage.setItem(key, JSON.stringify(trimmed));
  } catch {
    /* shadow log must not break sit end */
  }
}

export class SessionPresenceCollector {
  /**
   * @param {object} [options]
   * @param {Storage | null} [options.storage]
   * @param {() => number} [options.now]
   * @param {(...args: unknown[]) => void} [options.log]
   */
  constructor({
    storage = resolveStorage(null),
    now = () => Date.now(),
    log = console.log
  } = {}) {
    this.storage = storage;
    this.now = now;
    this.log = log;
    this._resetMemory();
  }

  _resetMemory() {
    this.active = false;
    /** @type {number[]} */
    this.leaveDurationsSeconds = [];
    this.pauseCount = 0;
    this.extended = false;
    this.awayStartedAt = null;
  }

  begin() {
    this._resetMemory();
    this.active = true;
  }

  noteAwayStart() {
    if (!this.active || this.awayStartedAt != null) return;
    this.awayStartedAt = this.now();
  }

  /**
   * AttentionSignals.onReturn already filters <20s and tray hide (SB-18).
   * @param {number} durationMs
   */
  noteLeave(durationMs) {
    if (!this.active) return;
    const ms = Number(durationMs);
    if (!Number.isFinite(ms) || ms < LEAVE_COUNT_THRESHOLD_MS) return;
    this.awayStartedAt = null;
    this.leaveDurationsSeconds.push(ms / 1000);
  }

  noteAwayResume() {
    if (!this.active) return;
    this.awayStartedAt = null;
  }

  noteUserPause() {
    if (!this.active) return;
    this.pauseCount += 1;
  }

  noteExtended() {
    if (!this.active) return;
    this.extended = true;
  }

  /**
   * @param {object} snapshot
   * @returns {object | null}
   */
  finalize(snapshot) {
    if (!this.active) return null;
    const leaveDurationsSeconds = [...this.leaveDurationsSeconds];
    if (this.awayStartedAt != null) {
      const openMs = Math.max(0, this.now() - this.awayStartedAt);
      if (openMs >= LEAVE_COUNT_THRESHOLD_MS) {
        leaveDurationsSeconds.push(openMs / 1000);
      }
    }
    const summary = buildSessionPresenceSummary({
      companionMode: snapshot.companionMode,
      plannedMinutes: snapshot.plannedMinutes,
      actualSeconds: snapshot.actualSeconds,
      leaveDurationsSeconds,
      pauseCount: this.pauseCount,
      extended: this.extended,
      endedEarly: snapshot.endedEarly,
      durationMode: snapshot.durationMode
    });
    this._resetMemory();
    this.log('[SessionPresence]', summary);
    appendSessionPresenceSummary(summary, this.storage);
    return summary;
  }
}
