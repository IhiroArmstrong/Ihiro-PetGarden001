/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T62 · Evening practice end-time facts for Practice Paper (opt-in, local only).
 */

import { shiftLocalDateKey } from './PracticeDaysStore.js';
import { journeyLogDateKey } from './journeyLogGate.js';
import {
  PRACTICE_PAPER_WINDOW_DAYS,
  isPracticePaperHidden
} from './practicePaperFacts.js';

export const EVENING_PRACTICE_FACTS_CONSENT_KEY =
  'focus-tiger.evening-practice-facts-consent.v1';
export const EVENING_PRACTICE_FACTS_KEY =
  'focus-tiger.evening-practice-facts.v1';

export const EVENING_PRACTICE_FACT_END_AT_OR_AFTER_HOUR = 1;
export const EVENING_PRACTICE_FACT_END_BEFORE_HOUR = 6;
export const EVENING_PRACTICE_FACT_MAX_ENTRIES = 90;

export const PRACTICE_PAPER_EVENING_FACT_KEY = 'PRACTICE_PAPER_EVENING_FACT';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @typedef {{ date: string, endHour: number, endMinute: number }} EveningFactEntry
 * @typedef {{ enabled: boolean, consentedAt?: string }} EveningFactsConsent
 * @typedef {{ entries: EveningFactEntry[] }} EveningFactsState
 */

function safeParseJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw
 * @returns {EveningFactsConsent}
 */
export function normalizeEveningFactsConsent(raw) {
  if (!raw || typeof raw !== 'object') return { enabled: false };
  const o = /** @type {Record<string, unknown>} */ (raw);
  const enabled = o.enabled === true;
  const consentedAt =
    typeof o.consentedAt === 'string' && o.consentedAt ? o.consentedAt : undefined;
  return enabled
    ? { enabled: true, ...(consentedAt ? { consentedAt } : {}) }
    : { enabled: false };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {EveningFactsConsent}
 */
export function readEveningFactsConsent(storage) {
  if (!storage) return { enabled: false };
  try {
    return normalizeEveningFactsConsent(
      safeParseJson(storage.getItem(EVENING_PRACTICE_FACTS_CONSENT_KEY))
    );
  } catch {
    return { enabled: false };
  }
}

/**
 * @param {unknown} raw
 * @returns {EveningFactsState}
 */
export function normalizeEveningFactsState(raw) {
  if (!raw || typeof raw !== 'object') return { entries: [] };
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (!Array.isArray(o.entries)) return { entries: [] };
  /** @type {EveningFactEntry[]} */
  const entries = [];
  for (const row of o.entries) {
    if (!row || typeof row !== 'object') continue;
    const r = /** @type {Record<string, unknown>} */ (row);
    const date = typeof r.date === 'string' ? r.date : '';
    const endHour = Number(r.endHour);
    const endMinute = Number(r.endMinute);
    if (!DATE_KEY_RE.test(date)) continue;
    if (!Number.isFinite(endHour) || endHour < 0 || endHour > 23) continue;
    if (!Number.isFinite(endMinute) || endMinute < 0 || endMinute > 59) continue;
    entries.push({
      date,
      endHour: Math.floor(endHour),
      endMinute: Math.floor(endMinute)
    });
  }
  const byDate = new Map();
  for (const e of entries) {
    const prev = byDate.get(e.date);
    if (!prev || endTimeMinutes(e) > endTimeMinutes(prev)) {
      byDate.set(e.date, e);
    }
  }
  const merged = [...byDate.values()].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
  return {
    entries: merged.slice(-EVENING_PRACTICE_FACT_MAX_ENTRIES)
  };
}

/**
 * @param {EveningFactEntry} entry
 */
function endTimeMinutes(entry) {
  return entry.endHour * 60 + entry.endMinute;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {EveningFactsState}
 */
export function readEveningFactsState(storage) {
  if (!storage) return { entries: [] };
  try {
    return normalizeEveningFactsState(
      safeParseJson(storage.getItem(EVENING_PRACTICE_FACTS_KEY))
    );
  } catch {
    return { entries: [] };
  }
}

function writeEveningFactsState(storage, state) {
  if (!storage) return false;
  try {
    storage.setItem(
      EVENING_PRACTICE_FACTS_KEY,
      JSON.stringify(normalizeEveningFactsState(state))
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearEveningPracticeFactsLedger(storage) {
  if (!storage) return false;
  try {
    storage.removeItem(EVENING_PRACTICE_FACTS_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @param {() => Date} [now]
 */
export function setEveningPracticeFactsConsent(
  storage,
  enabled,
  now = () => new Date()
) {
  if (!storage) return false;
  try {
    if (!enabled) {
      storage.removeItem(EVENING_PRACTICE_FACTS_CONSENT_KEY);
      clearEveningPracticeFactsLedger(storage);
      return true;
    }
    storage.setItem(
      EVENING_PRACTICE_FACTS_CONSENT_KEY,
      JSON.stringify({
        enabled: true,
        consentedAt: now().toISOString()
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {number} hour
 * @param {number} minute
 */
export function isQualifyingEveningEndLocalTime(hour, minute) {
  const h = Number(hour);
  const m = Number(minute);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return false;
  const mins = h * 60 + m;
  const start = EVENING_PRACTICE_FACT_END_AT_OR_AFTER_HOUR * 60;
  const end = EVENING_PRACTICE_FACT_END_BEFORE_HOUR * 60;
  return mins >= start && mins < end;
}

/**
 * @param {string} todayKey
 * @param {number} startOffset
 * @param {number} length
 */
function rollingWindowKeys(todayKey, startOffset, length) {
  const keys = new Set();
  for (let i = 0; i < length; i += 1) {
    keys.add(shiftLocalDateKey(todayKey, -(startOffset + i)));
  }
  return keys;
}

/**
 * @param {EveningFactsState} state
 * @param {string} todayKey
 */
export function countLateEveningDaysInWindow(state, todayKey) {
  if (!DATE_KEY_RE.test(todayKey)) return 0;
  const window = rollingWindowKeys(todayKey, 0, PRACTICE_PAPER_WINDOW_DAYS);
  let n = 0;
  for (const entry of state.entries) {
    if (!window.has(entry.date)) continue;
    if (!isQualifyingEveningEndLocalTime(entry.endHour, entry.endMinute)) {
      continue;
    }
    n += 1;
  }
  return n;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} todayKey
 * @returns {{ show: boolean, count: number, localeKey: string } | null}
 */
export function getEveningPracticePaperFact(storage, todayKey) {
  if (isPracticePaperHidden(storage)) return null;
  const consent = readEveningFactsConsent(storage);
  if (!consent.enabled) return null;
  const state = readEveningFactsState(storage);
  const count = countLateEveningDaysInWindow(state, todayKey);
  if (count < 1) return null;
  return {
    show: true,
    count,
    localeKey: PRACTICE_PAPER_EVENING_FACT_KEY
  };
}

/**
 * Record from a Journey row after timed focus ends.
 *
 * @param {Storage | null | undefined} storage
 * @param {{ at: string, minutes: number }} row
 */
export function recordEveningPracticeFactFromJourneyEntry(storage, row) {
  if (!storage || !row || typeof row.at !== 'string' || !row.at) return false;
  const consent = readEveningFactsConsent(storage);
  if (!consent.enabled) return false;
  const mins = Number(row.minutes);
  if (!Number.isFinite(mins) || mins < 1) return false;
  const start = new Date(row.at);
  if (Number.isNaN(start.getTime())) return false;
  const end = new Date(start.getTime() + mins * 60_000);
  const endHour = end.getHours();
  const endMinute = end.getMinutes();
  if (!isQualifyingEveningEndLocalTime(endHour, endMinute)) return false;
  const date = journeyLogDateKey(end.toISOString());
  if (!DATE_KEY_RE.test(date)) return false;
  const prev = readEveningFactsState(storage);
  const nextEntry = { date, endHour, endMinute };
  const entries = [...prev.entries];
  const idx = entries.findIndex((e) => e.date === date);
  if (idx >= 0) {
    if (endTimeMinutes(nextEntry) <= endTimeMinutes(entries[idx])) {
      return false;
    }
    entries[idx] = nextEntry;
  } else {
    entries.push(nextEntry);
  }
  return writeEveningFactsState(storage, { entries });
}
