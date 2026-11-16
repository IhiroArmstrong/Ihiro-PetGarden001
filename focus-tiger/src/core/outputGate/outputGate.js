/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T100 output gate, not wired into any screen.
 * Callers in product code still reach the local model directly. PR-3 moves
 * that call here. This module does not import UI.
 *
 * Draft rules. Not clinically reviewed. A blocked sentence is replaced.
 * The model is not asked to rewrite it.
 */

import { CONFIDE_CORPUS, confideLineText } from '../confide/confideCorpus.js';
import { formatConfideJapaneseNotYetOpenReply } from '../confide/confideJapaneseNotYetOpen.js';
import { formatConfideSafetyResourceGuidance } from '../confide/confideSafetyResources.js';
import { inspectModelOutput } from './outputGateRules.js';

export const OUTPUT_GATE_VERSION = '2026-11-16-pr2b';

export const COVERED_USER_LOCALES = Object.freeze(['en', 'zh', 'ja']);

/**
 * @param {string} [locale]
 * @returns {boolean}
 */
export function isCoveredUserLocale(locale) {
  return COVERED_USER_LOCALES.includes(String(locale || ''));
}

/**
 * T96 #1622 shipped uncovered-language copy as this function: the
 * not-yet-open notice plus the T92 helpline. Output that is not en/zh/ja
 * uses that same sentence. It is not a second Japanese-only product path.
 * @param {string} [locale]
 * @returns {string}
 */
export function formatT96UncoveredLanguageReply(locale = 'en') {
  return formatConfideJapaneseNotYetOpenReply(locale);
}

/**
 * Visible companion generate paths from the PR-1 inventory.
 * `read-hybrid-classify` is not listed: it returns a tool draft, and the
 * defense is to accept only registered tool ids.
 */
export const OUTPUT_GATE_PATHS = Object.freeze([
  'confide-observe-l3',
  'confide-chat-l3',
  'confide-observe-retry',
  'reflection-companion'
]);

/** Neutral pool: fallback-* only. No mood-bucket lines. */
const NEUTRAL_POOL_IDS = Object.freeze([
  'fallback-01',
  'fallback-02',
  'fallback-03'
]);

const registered = new Set(OUTPUT_GATE_PATHS);

/**
 * @param {string} locale
 * @returns {string[]}
 */
export function uniqueNeutralLines(locale = 'en') {
  const lines = NEUTRAL_POOL_IDS.map((id) => {
    const row = CONFIDE_CORPUS.find((item) => item.id === id);
    return row ? confideLineText(row, locale).trim() : '';
  }).filter(Boolean);
  return [...new Set(lines)];
}

/**
 * @param {string} locale
 * @param {string} [previousText]
 * @returns {string}
 */
export function pickNeutralFallback(locale = 'en', previousText = '') {
  const lines = uniqueNeutralLines(locale);
  const previous = String(previousText || '').trim();
  const next = lines.find((line) => line.trim() !== previous);
  return next || lines[0] || '';
}

/**
 * Neutral pool lines that the gate itself would block. Empty means the pool is safe.
 * @param {string} [locale]
 * @returns {string[]}
 */
export function neutralPoolSelfHits(locale = 'en') {
  /** @type {string[]} */
  const hits = [];
  for (const id of NEUTRAL_POOL_IDS) {
    const row = CONFIDE_CORPUS.find((item) => item.id === id);
    const text = row ? confideLineText(row, locale) : '';
    const found = inspectModelOutput(text);
    if (found.category || found.uncovered) hits.push(id);
  }
  return hits;
}

/**
 * @param {string} pathId
 * @param {{
 *   generate?: () => Promise<string> | string,
 *   locale?: string,
 *   previousText?: string
 * }} [genArgs]
 * @returns {Promise<{
 *   text: string,
 *   gateVersion: string,
 *   verdict: 'pass' | 'neutral_fallback' | 'late_crisis' | 'uncovered_language' | 'unregistered' | 'generator_failed',
 *   category: string | null,
 *   triggersGenerationLock: boolean
 * }>}
 */
export async function guardedGenerate(pathId, genArgs = {}) {
  const locale = typeof genArgs.locale === 'string' ? genArgs.locale : 'en';
  const previousText = genArgs.previousText || '';
  const base = {
    gateVersion: OUTPUT_GATE_VERSION,
    category: null,
    triggersGenerationLock: false
  };
  if (!registered.has(pathId)) {
    return {
      ...base,
      text: pickNeutralFallback(locale, previousText),
      verdict: 'unregistered'
    };
  }
  let raw = '';
  try {
    if (typeof genArgs.generate !== 'function') {
      throw new Error('missing_generate');
    }
    raw = await genArgs.generate();
  } catch {
    return {
      ...base,
      text: pickNeutralFallback(locale, previousText),
      verdict: 'generator_failed'
    };
  }
  if (typeof raw !== 'string' || !raw.trim()) {
    return {
      ...base,
      text: pickNeutralFallback(locale, previousText),
      verdict: 'generator_failed'
    };
  }
  const found = inspectModelOutput(raw);
  if (found.category === 'G5' || found.category === 'G6') {
    return {
      ...base,
      text: formatConfideSafetyResourceGuidance(locale),
      verdict: 'late_crisis',
      category: found.category,
      triggersGenerationLock: true
    };
  }
  if (found.category) {
    return {
      ...base,
      text: pickNeutralFallback(locale, previousText),
      verdict: 'neutral_fallback',
      category: found.category
    };
  }
  if (found.uncovered) {
    return {
      ...base,
      text: isCoveredUserLocale(locale)
        ? pickNeutralFallback(locale, previousText)
        : formatT96UncoveredLanguageReply(locale),
      verdict: 'uncovered_language'
    };
  }
  return { ...base, text: raw, verdict: 'pass' };
}
