/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Practice Paper facts — rolling 7 local calendar days.
 * Rhythm sentences read practice-days keys. The Sit & Breath card reads
 * every Journey Log row. No arrive split. Does not write ledgers.
 */

import { shiftLocalDateKey } from './PracticeDaysStore.js';
import {
  JOURNEY_LOG_MAX_ENTRIES,
  journeyLogDateKey
} from './journeyLogGate.js';

export const PRACTICE_PAPER_QUIETER_DELTA = 2;
export const PRACTICE_PAPER_WINDOW_DAYS = 7;
export const PRACTICE_PAPER_HIDDEN_KEY = 'focus-tiger.practice-paper-hidden.v1';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export const PRACTICE_PAPER_RHYTHM_KEYS = Object.freeze([
  'PRACTICE_PAPER_RHYTHM_1',
  'PRACTICE_PAPER_RHYTHM_2',
  'PRACTICE_PAPER_RHYTHM_3',
  'PRACTICE_PAPER_RHYTHM_4',
  'PRACTICE_PAPER_RHYTHM_5',
  'PRACTICE_PAPER_RHYTHM_6',
  'PRACTICE_PAPER_RHYTHM_7',
  'PRACTICE_PAPER_RHYTHM_8'
]);

/**
 * Calendar-day count between two YYYY-MM-DD keys.
 * Walks local calendar days so DST 23h/25h days do not shift the window.
 * @param {string} fromKey
 * @param {string} toKey
 * @returns {number}
 */
export function localCalendarDayDiff(fromKey, toKey) {
  if (!DATE_KEY_RE.test(fromKey) || !DATE_KEY_RE.test(toKey)) return 0;
  if (fromKey === toKey) return 0;
  const step = fromKey < toKey ? 1 : -1;
  let cursor = fromKey;
  let n = 0;
  while (cursor !== toKey && n < 40000) {
    cursor = shiftLocalDateKey(cursor, step);
    n += 1;
  }
  return step * n;
}

/**
 * @param {string} todayKey
 * @param {number} startOffset inclusive days before today
 * @param {number} length
 * @returns {Set<string>}
 */
function rollingWindowKeys(todayKey, startOffset, length) {
  const keys = new Set();
  for (let i = 0; i < length; i += 1) {
    keys.add(shiftLocalDateKey(todayKey, -(startOffset + i)));
  }
  return keys;
}

/**
 * @param {Iterable<unknown>} practiceDays
 * @returns {string[]}
 */
function normalizePracticeDayKeys(practiceDays) {
  const keys = [];
  for (const value of practiceDays ?? []) {
    if (typeof value === 'string' && DATE_KEY_RE.test(value)) {
      keys.push(value);
    } else if (value && typeof value === 'object' && DATE_KEY_RE.test(value.date)) {
      keys.push(value.date);
    }
  }
  return [...new Set(keys)].sort();
}

/**
 * @param {Iterable<unknown>} practiceDays
 * @param {string} todayKey
 * @returns {{ line: number, key: string }}
 */
export function getPracticePaperSentence(practiceDays, todayKey) {
  const today = DATE_KEY_RE.test(todayKey) ? todayKey : '';
  const keys = normalizePracticeDayKeys(practiceDays);
  const total = keys.length;
  if (!today || total === 0) {
    return { line: 1, key: PRACTICE_PAPER_RHYTHM_KEYS[0] };
  }

  const earliest = keys[0];
  const firstPracticeAgeDays = localCalendarDayDiff(earliest, today);
  if (firstPracticeAgeDays < 7) {
    return { line: 2, key: PRACTICE_PAPER_RHYTHM_KEYS[1] };
  }

  const windowA = rollingWindowKeys(today, 0, PRACTICE_PAPER_WINDOW_DAYS);
  const windowB = rollingWindowKeys(
    today,
    PRACTICE_PAPER_WINDOW_DAYS,
    PRACTICE_PAPER_WINDOW_DAYS
  );
  let A = 0;
  let B = 0;
  for (const key of keys) {
    if (windowA.has(key)) A += 1;
    else if (windowB.has(key)) B += 1;
  }

  if (A === 0 && B === 0) {
    return { line: 3, key: PRACTICE_PAPER_RHYTHM_KEYS[2] };
  }
  if (A === 0 && B > 0) {
    return { line: 4, key: PRACTICE_PAPER_RHYTHM_KEYS[3] };
  }
  if (A > 0 && B === 0 && total > A) {
    return { line: 5, key: PRACTICE_PAPER_RHYTHM_KEYS[4] };
  }
  if (A > 0 && B > 0 && A >= B) {
    return { line: 6, key: PRACTICE_PAPER_RHYTHM_KEYS[5] };
  }
  if (A < B && B - A === 1) {
    return { line: 7, key: PRACTICE_PAPER_RHYTHM_KEYS[6] };
  }
  if (A < B && B - A >= PRACTICE_PAPER_QUIETER_DELTA) {
    return { line: 8, key: PRACTICE_PAPER_RHYTHM_KEYS[7] };
  }
  return { line: 6, key: PRACTICE_PAPER_RHYTHM_KEYS[5] };
}

/**
 * @param {unknown} journeyLog
 * @returns {{ at: string, minutes: number, arrive?: boolean, reflect?: boolean }[]}
 */
function normalizeLogEntries(journeyLog) {
  const raw = Array.isArray(journeyLog)
    ? journeyLog
    : journeyLog && typeof journeyLog === 'object'
      ? journeyLog.entries
      : null;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (row) =>
      row &&
      typeof row === 'object' &&
      typeof row.at === 'string' &&
      Number.isFinite(Number(row.minutes))
  );
}

/**
 * @param {unknown} journeyLog
 * @param {string} todayKey
 * @returns {{
 *   uniqueDays: number,
 *   lastMinutes: number | null,
 *   incomplete: boolean
 * }}
 */
export function getSitBreathFacts(journeyLog, todayKey) {
  const today = DATE_KEY_RE.test(todayKey) ? todayKey : '';
  const entries = normalizeLogEntries(journeyLog);
  if (!today || entries.length === 0) {
    return { uniqueDays: 0, lastMinutes: null, incomplete: false };
  }

  const windowA = rollingWindowKeys(today, 0, PRACTICE_PAPER_WINDOW_DAYS);
  const days = new Set();
  for (const row of entries) {
    const key = journeyLogDateKey(row.at);
    if (windowA.has(key)) days.add(key);
  }

  const newest = entries[entries.length - 1];
  const newestKey = journeyLogDateKey(newest.at);
  const lastMinutes = windowA.has(newestKey)
    ? Math.min(90, Math.max(1, Math.floor(Number(newest.minutes))))
    : null;

  const oldestKey = journeyLogDateKey(entries[0].at);
  const incomplete =
    entries.length >= JOURNEY_LOG_MAX_ENTRIES && windowA.has(oldestKey);

  return {
    uniqueDays: days.size,
    lastMinutes: days.size === 0 ? null : lastMinutes,
    incomplete
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function isPracticePaperHidden(storage) {
  try {
    return storage?.getItem(PRACTICE_PAPER_HIDDEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} hidden
 * @returns {boolean} whether stored state matches the request
 */
export function setPracticePaperHidden(storage, hidden) {
  try {
    if (!storage) return false;
    if (hidden) storage.setItem(PRACTICE_PAPER_HIDDEN_KEY, '1');
    else storage.removeItem(PRACTICE_PAPER_HIDDEN_KEY);
    return isPracticePaperHidden(storage) === Boolean(hidden);
  } catch {
    return false;
  }
}
