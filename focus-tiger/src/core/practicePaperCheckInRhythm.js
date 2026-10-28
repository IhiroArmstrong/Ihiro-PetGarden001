/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T65 — read-only rolling 7-day end check-in labels for Practice Paper (T52 ledger).
 */

import { shiftLocalDateKey } from './PracticeDaysStore.js';
import { localDayKey, normalizeCheckInRows } from './awakenCheckInStore.js';
import { PRACTICE_PAPER_WINDOW_DAYS } from './practicePaperFacts.js';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** @typedef {'ease' | 'restless' | 'tired'} AwakenCheckInLabel */

/**
 * @param {AwakenCheckInLabel} label
 * @returns {string}
 */
export function awakenCheckInLabelLocaleKey(label) {
  if (label === 'ease') return 'AWAKEN_CHECKIN_LABEL_EASE';
  if (label === 'restless') return 'AWAKEN_CHECKIN_LABEL_RESTLESS';
  return 'AWAKEN_CHECKIN_LABEL_TIRED';
}

/**
 * @param {string} todayKey
 * @returns {string[]}
 */
export function rollingSevenDayKeysEndingToday(todayKey) {
  if (!DATE_KEY_RE.test(todayKey)) return [];
  const keys = [];
  for (let offset = PRACTICE_PAPER_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    keys.push(shiftLocalDateKey(todayKey, -offset));
  }
  return keys;
}

/**
 * @param {unknown} rows
 * @param {string} todayKey
 * @returns {null | { slots: { dateKey: string, label: AwakenCheckInLabel | null }[] }}
 */
export function getPracticePaperCheckInRhythm(rows, todayKey) {
  const today = DATE_KEY_RE.test(todayKey) ? todayKey : '';
  const dayKeys = rollingSevenDayKeysEndingToday(today);
  if (!today || dayKeys.length === 0) return null;

  const windowSet = new Set(dayKeys);
  const list = normalizeCheckInRows(rows);
  /** @type {Map<string, { ts: number, label: AwakenCheckInLabel }>} */
  const bestByDay = new Map();

  for (const row of list) {
    if (row.phase !== 'end') continue;
    const label = row.label;
    if (label !== 'ease' && label !== 'restless' && label !== 'tired') continue;
    const ts = Number(row.ts);
    if (!Number.isFinite(ts)) continue;
    const day = localDayKey(new Date(ts));
    if (!windowSet.has(day)) continue;
    const prev = bestByDay.get(day);
    if (!prev || ts >= prev.ts) {
      bestByDay.set(day, { ts, label });
    }
  }

  if (bestByDay.size === 0) return null;

  const slots = dayKeys.map((dateKey) => ({
    dateKey,
    label: bestByDay.get(dateKey)?.label ?? null
  }));

  return { slots };
}
