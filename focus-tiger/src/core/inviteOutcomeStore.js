/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T57 — local-only focus invite outcome ledger (accepted / dismissed / ignored).
 * Never uploaded; not in practice cloud backup.
 */

import { AWAKEN_STATES } from './InterventionOrchestrator.js';
import { getStorage, setStorage } from '../utils/Storage.js';

export const INVITE_OUTCOME_STORAGE_KEY = 'focus-tiger.invite-outcomes.v1';
export const INVITE_OUTCOME_MAX_ENTRIES = 240;

export const INVITE_OUTCOME_KINDS = Object.freeze({
  AWAY: 'away',
  EXTEND: 'extend',
  LONG_SIT: 'long-sit'
});

export const INVITE_OUTCOME_VALUES = Object.freeze({
  ACCEPTED: 'accepted',
  DISMISSED: 'dismissed',
  IGNORED: 'ignored'
});

/** @typedef {'away' | 'extend' | 'long-sit'} InviteOutcomeKind */
/** @typedef {'accepted' | 'dismissed' | 'ignored'} InviteOutcomeValue */

/**
 * @param {{ show?: boolean, kind?: string, state?: string } | null | undefined} decision
 * @returns {InviteOutcomeKind | null}
 */
export function inviteKindFromAwakenDecision(decision) {
  if (!decision || decision.show !== true) return null;
  if (decision.kind === 'extend') return INVITE_OUTCOME_KINDS.EXTEND;
  if (decision.state === AWAKEN_STATES.LONG_SIT_INVITE) {
    return INVITE_OUTCOME_KINDS.LONG_SIT;
  }
  return INVITE_OUTCOME_KINDS.AWAY;
}

/**
 * @param {unknown} rows
 * @returns {object[]}
 */
export function normalizeInviteOutcomeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) =>
      row &&
      typeof row === 'object' &&
      (row.kind === INVITE_OUTCOME_KINDS.AWAY ||
        row.kind === INVITE_OUTCOME_KINDS.EXTEND ||
        row.kind === INVITE_OUTCOME_KINDS.LONG_SIT) &&
      (row.outcome === INVITE_OUTCOME_VALUES.ACCEPTED ||
        row.outcome === INVITE_OUTCOME_VALUES.DISMISSED ||
        row.outcome === INVITE_OUTCOME_VALUES.IGNORED) &&
      typeof row.ts === 'number'
  );
}

/**
 * @param {string} [key]
 * @returns {object[]}
 */
export function readInviteOutcomeRecords(key = INVITE_OUTCOME_STORAGE_KEY) {
  return normalizeInviteOutcomeRows(getStorage(key, []));
}

/**
 * @param {InviteOutcomeKind} kind
 * @param {InviteOutcomeValue} outcome
 * @param {number} [ts]
 * @param {string} [key]
 * @returns {boolean}
 */
export function recordInviteOutcome(kind, outcome, ts, key = INVITE_OUTCOME_STORAGE_KEY) {
  if (
    kind !== INVITE_OUTCOME_KINDS.AWAY &&
    kind !== INVITE_OUTCOME_KINDS.EXTEND &&
    kind !== INVITE_OUTCOME_KINDS.LONG_SIT
  ) {
    return false;
  }
  if (
    outcome !== INVITE_OUTCOME_VALUES.ACCEPTED &&
    outcome !== INVITE_OUTCOME_VALUES.DISMISSED &&
    outcome !== INVITE_OUTCOME_VALUES.IGNORED
  ) {
    return false;
  }
  const rows = readInviteOutcomeRecords(key);
  rows.push({ kind, outcome, ts: Number(ts) || Date.now() });
  const trimmed =
    rows.length > INVITE_OUTCOME_MAX_ENTRIES
      ? rows.slice(-INVITE_OUTCOME_MAX_ENTRIES)
      : rows;
  try {
    setStorage(key, trimmed);
    const roundTrip = readInviteOutcomeRecords(key);
    if (roundTrip.length !== trimmed.length) return false;
    const last = trimmed[trimmed.length - 1];
    const readLast = roundTrip[roundTrip.length - 1];
    if (
      !readLast ||
      readLast.kind !== last.kind ||
      readLast.outcome !== last.outcome ||
      readLast.ts !== last.ts
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * T58「忘掉」须调用：清空下场记录，连续计数从零开始。
 * @param {string} [key]
 * @returns {boolean}
 */
export function clearInviteOutcomeRecords(key = INVITE_OUTCOME_STORAGE_KEY) {
  try {
    setStorage(key, []);
    return true;
  } catch {
    return false;
  }
}
