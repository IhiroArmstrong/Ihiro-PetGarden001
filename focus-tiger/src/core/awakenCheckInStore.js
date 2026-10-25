/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T52 — local-only awaken micro check-in ledger (calibrates invite timing; never uploaded).
 */

import { getStorage, setStorage } from '../utils/Storage.js';

export const AWAKEN_CHECKIN_STORAGE_KEY = 'focus-tiger.awaken-check-ins.v1';
export const AWAKEN_CHECKIN_MAX_ENTRIES = 240;

/** @typedef {'ease' | 'restless' | 'tired'} AwakenCheckInLabel */
/** @typedef {'mid' | 'end'} AwakenCheckInPhase */

/**
 * @param {Date} [date]
 * @returns {string} local YYYY-MM-DD
 */
export function localDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * @param {unknown} rows
 * @returns {object[]}
 */
export function normalizeCheckInRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) =>
      row &&
      typeof row === 'object' &&
      typeof row.sessionId === 'string' &&
      typeof row.ts === 'number' &&
      (row.label === 'ease' ||
        row.label === 'restless' ||
        row.label === 'tired' ||
        row.label == null)
  );
}

/**
 * @param {number} ts
 * @param {Date} [reference]
 */
export function isSameLocalDay(ts, reference = new Date()) {
  const day = localDayKey(reference);
  return localDayKey(new Date(ts)) === day;
}

/**
 * @param {object[]} rows
 * @param {Date} [reference]
 * @returns {number}
 */
export function countMidCheckInsToday(rows, reference = new Date()) {
  const list = normalizeCheckInRows(rows);
  return list.filter(
    (row) => row.phase === 'mid' && isSameLocalDay(Number(row.ts), reference)
  ).length;
}

/**
 * @param {object} entry
 * @param {string} [key]
 * @returns {boolean} whether persist succeeded
 */
export function appendAwakenCheckIn(entry, key = AWAKEN_CHECKIN_STORAGE_KEY) {
  const rows = normalizeCheckInRows(getStorage(key, []));
  rows.push(entry);
  const trimmed =
    rows.length > AWAKEN_CHECKIN_MAX_ENTRIES
      ? rows.slice(-AWAKEN_CHECKIN_MAX_ENTRIES)
      : rows;
  try {
    setStorage(key, trimmed);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {AwakenCheckInLabel} label
 * @param {object} meta
 * @param {string} meta.sessionId
 * @param {AwakenCheckInPhase} meta.phase
 * @param {number} [meta.ts]
 */
export function recordAwakenCheckIn(label, meta) {
  const ts = Number(meta.ts) || Date.now();
  return appendAwakenCheckIn({
    sessionId: meta.sessionId,
    ts,
    label,
    phase: meta.phase
  });
}
