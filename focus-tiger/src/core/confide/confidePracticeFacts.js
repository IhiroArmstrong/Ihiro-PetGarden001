/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Slice 0 + Phase 1B · Confide practice facts.
 * User-visible numbers must match Journey Log (SCENARIO_TESTS · AG).
 * Safety / emotion classify still wins. Not a Memory store. Not generate.
 * Temporal Compare: two windows side by side — never character judgments.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { journeyLogDateKey, readJourneyLog } from '../journeyLogGate.js';

export const PRACTICE_COMPARE_WINDOW_DAYS = 14;
export const PRACTICE_USUAL_MIN_SESSIONS = 3;

export const PRACTICE_FACTS_KIND = Object.freeze({
  DURATION: 'duration',
  USUAL_TIME: 'usual_time',
  SHOWING_UP: 'showing_up',
  COMPARE_VOLUME: 'compare_volume',
  COMPARE_EASE: 'compare_ease'
});

const DURATION_RES = [
  /\bhow\s+long\s+have\s+i\s+(been\s+)?practi[cs]e(?:d|ing)?\b/i,
  /\bhow\s+long\s+have\s+i\s+(been\s+)?sitt(?:ing|en)\b/i,
  /\bhow\s+many\s+(days|minutes|hours)\s+have\s+i\s+(been\s+)?practi[cs]e(?:d|ing)?\b/i,
  /\b(?:total\s+)?sitting\s+time\b/i,
  /\b(?:total\s+)?sit(?:ting)?\s+(?:time|minutes|hours)\s+on\s+this\s+device\b/i,
  /练了多久|坐了多久|练习了多久|練習多久|坐了几天|练了几天|練習了幾天|同坐多久|一共坐了多久/
];

const USUAL_TIME_RES = [
  /\bwhen\s+do\s+i\s+usually\s+(practi[cs]e|sit)\b/i,
  /\bwhat\s+time\s+(of\s+day\s+)?do\s+i\s+usually\s+(practi[cs]e|sit)\b/i,
  /通常什么时候(练|坐)|一般什么时候(练|坐)|通常什麼時候(練|坐)/
];

const SHOWING_UP_RES = [
  /\bhow\s+have\s+i\s+been\s+showing\s+up\b/i,
  /最近有没有来(坐|练)|最近有沒有來(坐|練)|我最近来坐了吗/
];

const COMPARE_VOLUME_RES = [
  /\bam\s+i\s+practi[cs](?:e|ing)\s+(longer|more)\s+than\s+before\b/i,
  /\bhave\s+i\s+been\s+practi[cs](?:e|ing)\s+(longer|more)\s+than\s+before\b/i,
  /\bpracti[cs](?:e|ing)\s+(longer|more)\s+than\s+before\b/i,
  /坚持得比以前久|練得比以前久|练得比以前久|比以前(练|坐)得(更)?(久|多)/
];

const COMPARE_EASE_RES = [
  /\bgetting\s+into\s+practice\s+more\s+easily\b/i,
  /\beasier\s+to\s+(get\s+into|enter)\s+(practice|a\s+sit)\b/i,
  /更容易进入状态|更容易進入狀態|进状态(顺不顺|容易)/
];

const BUCKET_KEYS = Object.freeze({
  morning: 'CONFIDE_PRACTICE_BUCKET_MORNING',
  afternoon: 'CONFIDE_PRACTICE_BUCKET_AFTERNOON',
  evening: 'CONFIDE_PRACTICE_BUCKET_EVENING',
  night: 'CONFIDE_PRACTICE_BUCKET_NIGHT'
});

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isPracticeDurationQuestion(text) {
  return classifyPracticeFactsKind(text) === PRACTICE_FACTS_KIND.DURATION;
}

/**
 * @param {string} text
 * @returns {(typeof PRACTICE_FACTS_KIND)[keyof typeof PRACTICE_FACTS_KIND] | null}
 */
export function classifyPracticeFactsKind(text) {
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return null;
  if (COMPARE_EASE_RES.some((re) => re.test(raw))) return PRACTICE_FACTS_KIND.COMPARE_EASE;
  if (USUAL_TIME_RES.some((re) => re.test(raw))) return PRACTICE_FACTS_KIND.USUAL_TIME;
  if (SHOWING_UP_RES.some((re) => re.test(raw))) return PRACTICE_FACTS_KIND.SHOWING_UP;
  if (COMPARE_VOLUME_RES.some((re) => re.test(raw))) {
    return PRACTICE_FACTS_KIND.COMPARE_VOLUME;
  }
  if (DURATION_RES.some((re) => re.test(raw))) return PRACTICE_FACTS_KIND.DURATION;
  return null;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isPracticeFactsQuestion(text) {
  return classifyPracticeFactsKind(text) != null;
}

/**
 * @param {string | null | undefined} route
 * @param {string} text
 * @returns {boolean}
 */
export function shouldAnswerWithPracticeFacts(route, text) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  return isPracticeFactsQuestion(text);
}

/**
 * @param {Date} reference
 * @param {number} windowDays
 * @returns {{ startMs: number, endMs: number }}
 */
export function inclusiveDayWindowBounds(reference, windowDays) {
  const days = Math.max(1, Math.floor(Number(windowDays) || 1));
  const end = new Date(reference);
  end.setHours(23, 59, 59, 999);
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { startMs: start.getTime(), endMs: end.getTime() };
}

/**
 * @param {Date} reference
 * @param {number} windowDays
 * @returns {Date}
 */
export function priorWindowReference(reference, windowDays) {
  const priorEnd = new Date(reference);
  priorEnd.setHours(12, 0, 0, 0);
  priorEnd.setDate(priorEnd.getDate() - windowDays);
  return priorEnd;
}

/**
 * @param {string | null | undefined} iso
 * @param {{ startMs: number, endMs: number }} bounds
 * @returns {boolean}
 */
function isoInBounds(iso, bounds) {
  const t = new Date(iso || '').getTime();
  if (Number.isNaN(t)) return false;
  return t >= bounds.startMs && t <= bounds.endMs;
}

/**
 * @param {number} hour
 * @returns {'morning' | 'afternoon' | 'evening' | 'night'}
 */
export function practiceHourBucket(hour) {
  const h = Number(hour);
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
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
 * @param {import('../journeyLogGate.js').JourneyLogEntry[]} entries
 * @param {{ startMs: number, endMs: number }} bounds
 */
function summarizeJourneyWindow(entries, bounds) {
  const inWindow = (entries || []).filter((row) => isoInBounds(row.at, bounds));
  let minutes = 0;
  let arriveCount = 0;
  for (const row of inWindow) {
    minutes += Math.max(0, Number(row.minutes) || 0);
    if (row.arrive) arriveCount += 1;
  }
  return {
    sessionCount: inWindow.length,
    minutes: Math.round(minutes),
    arriveCount
  };
}

/**
 * @param {{ date: string, totalMinutes: number | null }[]} rows
 * @param {{ startMs: number, endMs: number }} bounds
 */
function summarizePracticeDayWindow(rows, bounds) {
  let sessionCount = 0;
  let minutes = 0;
  for (const row of rows || []) {
    const key = String(row?.date || '');
    const parts = key.split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) continue;
    const noon = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getTime();
    if (noon < bounds.startMs || noon > bounds.endMs) continue;
    sessionCount += 1;
    const mins = row?.totalMinutes;
    if (mins != null && Number.isFinite(Number(mins))) {
      minutes += Math.max(0, Number(mins));
    }
  }
  return { sessionCount, minutes: Math.round(minutes), arriveCount: 0 };
}

/**
 * @param {{ getPracticeDayEntries?: () => { date: string, totalMinutes: number | null }[] } | null | undefined} store
 * @param {Storage | null | undefined} storage
 * @param {Date} reference
 */
export function summarizePracticeCompareWindows(store, storage, reference) {
  const windowDays = PRACTICE_COMPARE_WINDOW_DAYS;
  const recentBounds = inclusiveDayWindowBounds(reference, windowDays);
  const priorBounds = inclusiveDayWindowBounds(
    priorWindowReference(reference, windowDays),
    windowDays
  );
  const journey = readJourneyLog(storage).entries;
  if (journey.length) {
    return {
      windowDays,
      recent: summarizeJourneyWindow(journey, recentBounds),
      prior: summarizeJourneyWindow(journey, priorBounds),
      hasArriveField: true
    };
  }
  const rows = store?.getPracticeDayEntries?.() || [];
  return {
    windowDays,
    recent: summarizePracticeDayWindow(rows, recentBounds),
    prior: summarizePracticeDayWindow(rows, priorBounds),
    hasArriveField: false
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {Record<'morning' | 'afternoon' | 'evening' | 'night', number> & { total: number }}
 */
export function tallyPracticeHourBuckets(storage) {
  const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const entries = readJourneyLog(storage).entries;
  for (const row of entries) {
    const hour = new Date(row.at).getHours();
    if (Number.isNaN(hour)) continue;
    counts[practiceHourBucket(hour)] += 1;
  }
  return {
    ...counts,
    total: counts.morning + counts.afternoon + counts.evening + counts.night
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

/**
 * @param {ReturnType<typeof tallyPracticeHourBuckets>} tally
 * @param {(key: string) => string} tFn
 */
export function formatPracticeUsualTimeReply(tally, tFn) {
  const lookup = typeof tFn === 'function' ? tFn : () => '';
  const total = Number(tally?.total) || 0;
  if (total < PRACTICE_USUAL_MIN_SESSIONS) {
    return lookup('CONFIDE_PRACTICE_FACTS_USUAL_INSUFFICIENT');
  }
  const ranked = ['morning', 'afternoon', 'evening', 'night']
    .map((id) => ({ id, count: Number(tally?.[id]) || 0 }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
  if (!ranked.length) return lookup('CONFIDE_PRACTICE_FACTS_USUAL_INSUFFICIENT');
  const top = ranked[0];
  const tied = ranked.filter((row) => row.count === top.count);
  if (tied.length > 1) {
    const parts = tied
      .map((row) => `${lookup(BUCKET_KEYS[row.id])} (${row.count})`)
      .join(', ');
    return fill(lookup('CONFIDE_PRACTICE_FACTS_USUAL_SPLIT'), { parts });
  }
  return fill(lookup('CONFIDE_PRACTICE_FACTS_USUAL_TIME'), {
    bucket: lookup(BUCKET_KEYS[top.id]),
    count: top.count,
    total
  });
}

/**
 * @param {{ sessionCount: number, minutes: number }} recent
 * @param {(key: string) => string} tFn
 */
export function formatPracticeShowingUpReply(recent, tFn) {
  const lookup = typeof tFn === 'function' ? tFn : () => '';
  const count = Number(recent?.sessionCount) || 0;
  const days = PRACTICE_COMPARE_WINDOW_DAYS;
  if (count <= 0) {
    return fill(lookup('CONFIDE_PRACTICE_FACTS_SHOWING_NONE'), { days });
  }
  return fill(lookup('CONFIDE_PRACTICE_FACTS_SHOWING'), {
    days,
    count,
    minutes: Number(recent?.minutes) || 0
  });
}

/**
 * @param {{
 *   windowDays: number,
 *   recent: { sessionCount: number, minutes: number, arriveCount?: number },
 *   prior: { sessionCount: number, minutes: number, arriveCount?: number }
 * }} windows
 * @param {(key: string) => string} tFn
 */
export function formatPracticeVolumeCompareReply(windows, tFn) {
  const lookup = typeof tFn === 'function' ? tFn : () => '';
  const recentCount = Number(windows?.recent?.sessionCount) || 0;
  const priorCount = Number(windows?.prior?.sessionCount) || 0;
  if (recentCount + priorCount <= 0) {
    return lookup('CONFIDE_PRACTICE_FACTS_COMPARE_INSUFFICIENT');
  }
  const days = Number(windows?.windowDays) || PRACTICE_COMPARE_WINDOW_DAYS;
  return fill(lookup('CONFIDE_PRACTICE_FACTS_COMPARE'), {
    days,
    recentCount,
    recentMinutes: Number(windows?.recent?.minutes) || 0,
    priorCount,
    priorMinutes: Number(windows?.prior?.minutes) || 0
  });
}

/**
 * @param {{
 *   windowDays: number,
 *   hasArriveField: boolean,
 *   recent: { sessionCount: number, arriveCount: number },
 *   prior: { sessionCount: number, arriveCount: number }
 * }} windows
 * @param {(key: string) => string} tFn
 */
export function formatPracticeArriveCompareReply(windows, tFn) {
  const lookup = typeof tFn === 'function' ? tFn : () => '';
  if (!windows?.hasArriveField) {
    return lookup('CONFIDE_PRACTICE_FACTS_ARRIVE_INSUFFICIENT');
  }
  const recentCount = Number(windows?.recent?.sessionCount) || 0;
  const priorCount = Number(windows?.prior?.sessionCount) || 0;
  if (recentCount + priorCount <= 0) {
    return lookup('CONFIDE_PRACTICE_FACTS_ARRIVE_INSUFFICIENT');
  }
  const days = Number(windows?.windowDays) || PRACTICE_COMPARE_WINDOW_DAYS;
  return fill(lookup('CONFIDE_PRACTICE_FACTS_ARRIVE_COMPARE'), {
    days,
    recentArrive: Number(windows?.recent?.arriveCount) || 0,
    recentCount,
    priorArrive: Number(windows?.prior?.arriveCount) || 0,
    priorCount
  });
}

/**
 * @param {{ getPracticeDayEntries?: () => { date: string, totalMinutes: number | null }[] } | null | undefined} store
 * @param {Storage | null | undefined} storage
 * @param {(key: string) => string} tFn
 * @param {string} text
 * @param {{ reference?: Date }} [opts]
 * @returns {string}
 */
export function buildPracticeFactsReply(store, storage, tFn, text, opts = {}) {
  const kind = classifyPracticeFactsKind(text) || PRACTICE_FACTS_KIND.DURATION;
  const reference = opts.reference ?? new Date();
  if (kind === PRACTICE_FACTS_KIND.USUAL_TIME) {
    return formatPracticeUsualTimeReply(tallyPracticeHourBuckets(storage), tFn);
  }
  if (kind === PRACTICE_FACTS_KIND.SHOWING_UP) {
    const windows = summarizePracticeCompareWindows(store, storage, reference);
    return formatPracticeShowingUpReply(windows.recent, tFn);
  }
  if (kind === PRACTICE_FACTS_KIND.COMPARE_VOLUME) {
    return formatPracticeVolumeCompareReply(
      summarizePracticeCompareWindows(store, storage, reference),
      tFn
    );
  }
  if (kind === PRACTICE_FACTS_KIND.COMPARE_EASE) {
    return formatPracticeArriveCompareReply(
      summarizePracticeCompareWindows(store, storage, reference),
      tFn
    );
  }
  return formatPracticeDurationReply(summarizePracticeFacts(store, storage), tFn);
}
