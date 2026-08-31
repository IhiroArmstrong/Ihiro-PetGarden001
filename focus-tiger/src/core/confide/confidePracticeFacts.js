/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Slice 0 · Confide practice duration facts.
 * User-visible numbers must match Journey Log (SCENARIO_TESTS · AG).
 * Safety / emotion classify still wins. Not a Memory store. Not generate.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { journeyLogDateKey, readJourneyLog } from '../journeyLogGate.js';

const DURATION_RES = [
  /\bhow\s+long\s+have\s+i\s+(been\s+)?practi[cs]e(?:d|ing)?\b/i,
  /\bhow\s+long\s+have\s+i\s+(been\s+)?sitt(?:ing|en)\b/i,
  /\bhow\s+many\s+(days|minutes|hours)\s+have\s+i\s+(been\s+)?practi[cs]e(?:d|ing)?\b/i,
  /\b(?:total\s+)?sitting\s+time\b/i,
  /\b(?:total\s+)?sit(?:ting)?\s+(?:time|minutes|hours)\s+on\s+this\s+device\b/i,
  /练了多久|坐了多久|练习了多久|練習多久|坐了几天|练了几天|練習了幾天|同坐多久|一共坐了多久/
];

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isPracticeDurationQuestion(text) {
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return false;
  return DURATION_RES.some((re) => re.test(raw));
}

/**
 * @param {string | null | undefined} route
 * @param {string} text
 * @returns {boolean}
 */
export function shouldAnswerWithPracticeFacts(route, text) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  return isPracticeDurationQuestion(text);
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ dayCount: number, knownMinutes: number | null, unknownMinuteDays: number }}
 */
export function summarizePracticeFactsFromJourneyLog(storage) {
  const entries = readJourneyLog(storage).entries;
  if (!entries.length) {
    return { dayCount: 0, knownMinutes: null, unknownMinuteDays: 0 };
  }
  /** @type {Map<string, number>} */
  const byDate = new Map();
  for (const entry of entries) {
    const date = journeyLogDateKey(entry.at);
    const mins = Math.max(0, Number(entry.minutes) || 0);
    byDate.set(date, (byDate.get(date) || 0) + mins);
  }
  let knownMinutes = 0;
  for (const mins of byDate.values()) knownMinutes += mins;
  return {
    dayCount: byDate.size,
    knownMinutes: Math.round(knownMinutes),
    unknownMinuteDays: 0
  };
}

/**
 * @param {{ getPracticeDayEntries?: () => { date: string, totalMinutes: number | null }[] } | null | undefined} store
 * @param {Storage | null | undefined} [storage]
 * @returns {{ dayCount: number, knownMinutes: number | null, unknownMinuteDays: number }}
 */
export function summarizePracticeFacts(store, storage = null) {
  const journeySummary = summarizePracticeFactsFromJourneyLog(storage);
  if (journeySummary.dayCount > 0) return journeySummary;

  const rows = store?.getPracticeDayEntries?.() || [];
  const dayCount = rows.length;
  let knownMinutes = 0;
  let unknownMinuteDays = 0;
  let knownDayCount = 0;
  for (const row of rows) {
    const mins = row?.totalMinutes;
    if (mins == null || !Number.isFinite(Number(mins))) {
      unknownMinuteDays += 1;
      continue;
    }
    knownDayCount += 1;
    knownMinutes += Math.max(0, Number(mins));
  }
  return {
    dayCount,
    knownMinutes: knownDayCount > 0 ? Math.round(knownMinutes) : null,
    unknownMinuteDays
  };
}

/**
 * @param {string} template
 * @param {Record<string, string | number>} vars
 */
function fill(template, vars) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] == null ? '' : String(vars[key])
  );
}

/**
 * @param {{ dayCount: number, knownMinutes: number | null, unknownMinuteDays: number }} summary
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatPracticeDurationReply(summary, tFn) {
  const lookup = typeof tFn === 'function' ? tFn : () => '';
  const dayCount = Number(summary?.dayCount) || 0;
  if (dayCount <= 0) return lookup('CONFIDE_PRACTICE_FACTS_NONE');

  const known = summary?.knownMinutes;
  const unknown = Number(summary?.unknownMinuteDays) || 0;
  if (known == null) {
    return fill(lookup('CONFIDE_PRACTICE_FACTS_DAYS_ONLY'), { days: dayCount });
  }
  if (unknown > 0) {
    return fill(lookup('CONFIDE_PRACTICE_FACTS_DAYS_PARTIAL'), {
      days: dayCount,
      minutes: known
    });
  }
  return fill(lookup('CONFIDE_PRACTICE_FACTS_DAYS_MINUTES'), {
    days: dayCount,
    minutes: known
  });
}
