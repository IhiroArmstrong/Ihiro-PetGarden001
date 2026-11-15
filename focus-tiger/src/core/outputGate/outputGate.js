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

export const OUTPUT_GATE_VERSION = '2026-11-15-pr2';

/** Product paths from the PR-1 inventory that can reach a completion. */
export const OUTPUT_GATE_PATHS = Object.freeze([
  'confide-observe-l3',
  'confide-chat-l3',
  'confide-observe-retry',
  'reflection-companion',
  'read-hybrid-classify'
]);

const NEUTRAL_POOL_IDS = Object.freeze([
  'fallback-02',
  'fallback-03',
  'anxious-02',
  'tired-01',
  'tired-03'
]);

const registered = new Set(OUTPUT_GATE_PATHS);

/**
 * @param {string} locale
 * @param {string} [previousText]
 * @returns {string}
 */
export function pickNeutralFallback(locale = 'en', previousText = '') {
  const lines = NEUTRAL_POOL_IDS.map((id) => {
    const row = CONFIDE_CORPUS.find((item) => item.id === id);
    return row ? confideLineText(row, locale) : '';
  }).filter(Boolean);
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
 *   lockFreeGeneration: boolean
 * }>}
 */
export async function guardedGenerate(pathId, genArgs = {}) {
  const locale = typeof genArgs.locale === 'string' ? genArgs.locale : 'en';
  const previousText = genArgs.previousText || '';
  const base = {
    gateVersion: OUTPUT_GATE_VERSION,
    category: null,
    lockFreeGeneration: false
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
      lockFreeGeneration: true
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
      text: formatConfideJapaneseNotYetOpenReply(locale),
      verdict: 'uncovered_language'
    };
  }
  return { ...base, text: raw, verdict: 'pass' };
}
