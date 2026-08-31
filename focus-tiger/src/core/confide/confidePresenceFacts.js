/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Presence Signals · Confide factual replies (Slice 4 minimal).
 * Reads presence-signals ledger only; descriptive, never diagnostic.
 * **Does not read freeText** — only emotionTag tallies via summarizePresenceEmotionTags.
 * Any future L3 freeText injection must use listPresenceFreeTextForL3 (consent-gated).
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  PRESENCE_SIGNALS_DEFAULT_WINDOW_DAYS,
  PRESENCE_SIGNALS_MIN_TREND_COUNT,
  summarizePresenceSignalsForWindow
} from '../presenceSignalsGate.js';

export const PRESENCE_FACTS_KIND = Object.freeze({
  TREND: 'trend',
  COMPARE: 'compare'
});

const TREND_QUESTION_RES = [
  /\bwhat\s+has\s+my\s+mood\s+looked\s+like\b/i,
  /\b(has|have)\s+my\s+mood\s+(improved|changed|gotten\s+better)\b/i,
  /\bhow\s+(has|have)\s+my\s+(mood|emotions?)\s+been\b/i,
  /\bhow\s+(am|are)\s+i\s+feeling\s+lately\b/i,
  /\b(emotion|mood)\s+(these|the)\s+(past\s+)?two\s+weeks\b/i,
  /\b(past|last)\s+two\s+weeks\b.*\b(mood|emotion|feeling|calm|stress)/i,
  /情绪.*(改善|变好|变化)/,
  /这两周.*情绪/,
  /最近.*(两周)?.*(情绪|心情).*怎么样/,
  /心情.*(这两周|最近)/,
  /过去两周.*(情绪|心情|状态)/,
  /最近两周我的情绪看起来怎样/
];

const COMPARE_STEADY_RES = [
  /\bhave\s+i\s+been\s+more\s+steady\s+lately\b/i,
  /\bam\s+i\s+(more\s+)?steady\s+lately\b/i,
  /我是不是最近比较稳定|最近比较稳定|是不是更稳定/
];

/**
 * Locale keys for closed-tag labels (Arrival + ritual overlap).
 * @type {Record<string, string>}
 */
export const PRESENCE_TAG_LABEL_KEYS = Object.freeze({
  calm: 'ARRIVAL_NOTICE_CALM',
  okay: 'ARRIVAL_NOTICE_OKAY',
  busyMind: 'ARRIVAL_NOTICE_BUSY',
  stressed: 'ARRIVAL_NOTICE_STRESSED',
  lowEnergy: 'ARRIVAL_NOTICE_LOW',
  notSure: 'ARRIVAL_NOTICE_UNSURE',
  anxious: 'ritual.emotional_reset.chip.anxious',
  frustrated: 'ritual.emotional_reset.chip.frustrated',
  tired: 'ritual.emotional_reset.chip.tired',
  busy: 'ritual.morning.chip.busy',
  heavy: 'ritual.morning.chip.heavy',
  focus: 'ritual.morning.chip.focus',
  patience: 'ritual.morning.chip.patience',
  creativity: 'ritual.morning.chip.creativity',
  kindness: 'ritual.morning.chip.kindness'
});

/**
 * @param {string} text
 * @returns {(typeof PRESENCE_FACTS_KIND)[keyof typeof PRESENCE_FACTS_KIND] | null}
 */
export function classifyPresenceFactsKind(text) {
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return null;
  if (COMPARE_STEADY_RES.some((re) => re.test(raw))) return PRESENCE_FACTS_KIND.COMPARE;
  if (TREND_QUESTION_RES.some((re) => re.test(raw))) return PRESENCE_FACTS_KIND.TREND;
  return null;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isPresenceTrendQuestion(text) {
  return classifyPresenceFactsKind(text) != null;
}

/**
 * @param {string | null | undefined} route
 * @param {string} text
 * @returns {boolean}
 */
export function shouldAnswerWithPresenceFacts(route, text) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  return isPresenceTrendQuestion(text);
}

/**
 * @param {Record<string, number>} counts
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatPresenceTagBreakdown(counts, tFn) {
  const lookup = typeof tFn === 'function' ? tFn : () => '';
  const parts = Object.entries(counts || {})
    .filter(([, n]) => Number(n) > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, n]) => {
      const labelKey = PRESENCE_TAG_LABEL_KEYS[tag];
      const label = labelKey ? lookup(labelKey) : tag;
      return `${label} ${n}`;
    });
  return parts.join(', ');
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
 * @param {{
 *   windowDays: number,
 *   totalTagged: number,
 *   counts: Record<string, number>
 * }} summary
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatPresenceTrendReply(summary, tFn) {
  const lookup = typeof tFn === 'function' ? tFn : () => '';
  const windowDays =
    Number(summary?.windowDays) || PRESENCE_SIGNALS_DEFAULT_WINDOW_DAYS;
  const total = Number(summary?.totalTagged) || 0;

  if (total <= 0) {
    return lookup('CONFIDE_PRESENCE_FACTS_NONE');
  }
  if (total < PRESENCE_SIGNALS_MIN_TREND_COUNT) {
    return lookup('CONFIDE_PRESENCE_FACTS_INSUFFICIENT');
  }

  const breakdown = formatPresenceTagBreakdown(summary.counts || {}, lookup);
  return fill(lookup('CONFIDE_PRESENCE_FACTS_SUMMARY'), {
    days: windowDays,
    total,
    breakdown
  });
}

/**
 * @param {Storage | null | undefined} storage
 * @param {(key: string) => string} tFn
 * @param {{ windowDays?: number, reference?: Date }} [opts]
 * @returns {string}
 */
export function buildPresenceTrendReply(storage, tFn, opts = {}) {
  const summary = summarizePresenceSignalsForWindow(storage, opts);
  return formatPresenceTrendReply(summary, tFn);
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ windowDays?: number, reference?: Date }} [opts]
 */
export function summarizePresenceCompareWindows(storage, opts = {}) {
  const reference = opts.reference ?? new Date();
  const windowDays =
    Number(opts.windowDays) || PRESENCE_SIGNALS_DEFAULT_WINDOW_DAYS;
  const recent = summarizePresenceSignalsForWindow(storage, {
    windowDays,
    reference
  });
  const priorRef = new Date(reference);
  priorRef.setHours(12, 0, 0, 0);
  priorRef.setDate(priorRef.getDate() - windowDays);
  const prior = summarizePresenceSignalsForWindow(storage, {
    windowDays,
    reference: priorRef
  });
  return { windowDays, recent, prior };
}

/**
 * @param {{
 *   windowDays: number,
 *   recent: { totalTagged: number, counts: Record<string, number> },
 *   prior: { totalTagged: number, counts: Record<string, number> }
 * }} windows
 * @param {(key: string) => string} tFn
 */
export function formatPresenceCompareReply(windows, tFn) {
  const lookup = typeof tFn === 'function' ? tFn : () => '';
  const recentTotal = Number(windows?.recent?.totalTagged) || 0;
  const priorTotal = Number(windows?.prior?.totalTagged) || 0;
  if (recentTotal + priorTotal < PRESENCE_SIGNALS_MIN_TREND_COUNT) {
    return lookup('CONFIDE_PRESENCE_FACTS_COMPARE_INSUFFICIENT');
  }
  const days = Number(windows?.windowDays) || PRESENCE_SIGNALS_DEFAULT_WINDOW_DAYS;
  const recentBreakdown =
    formatPresenceTagBreakdown(windows?.recent?.counts || {}, lookup) ||
    lookup('CONFIDE_PRESENCE_FACTS_COMPARE_NONE');
  const priorBreakdown =
    formatPresenceTagBreakdown(windows?.prior?.counts || {}, lookup) ||
    lookup('CONFIDE_PRESENCE_FACTS_COMPARE_NONE');
  return fill(lookup('CONFIDE_PRESENCE_FACTS_COMPARE'), {
    days,
    recentBreakdown,
    recentTotal,
    priorBreakdown,
    priorTotal
  });
}

/**
 * @param {Storage | null | undefined} storage
 * @param {(key: string) => string} tFn
 * @param {string} text
 * @param {{ windowDays?: number, reference?: Date }} [opts]
 * @returns {string}
 */
export function buildPresenceFactsReply(storage, tFn, text, opts = {}) {
  const kind = classifyPresenceFactsKind(text) || PRESENCE_FACTS_KIND.TREND;
  if (kind === PRESENCE_FACTS_KIND.COMPARE) {
    return formatPresenceCompareReply(
      summarizePresenceCompareWindows(storage, opts),
      tFn
    );
  }
  return buildPresenceTrendReply(storage, tFn, opts);
}
