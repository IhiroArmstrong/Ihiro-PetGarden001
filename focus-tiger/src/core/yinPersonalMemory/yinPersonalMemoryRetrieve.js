/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personal Memory · L3 retrieve + inject gate (Slice 1d).
 * SSOT: docs/YIN_PERSONAL_MEMORY.md §7, §10.
 * Safety / corpus routes never call this — only layer-3 generate in main.
 */

import { canRememberYinPersonalMemory } from './yinPersonalMemoryConsent.js';
import { normalizeYinPersonalMemoryState } from './yinPersonalMemorySchema.js';

/** Max active summaries injected into Qwen prompt. */
export const YIN_MEMORY_L3_INJECT_MAX = 3;

const RULE_THEME_PATTERNS = Object.freeze({
  'relationship-no-advice':
    /\b(advice|fix(?:es|ing)?|solutions?|tell me what to do|suggest(?:ion)?s?|what should i)\b/i,
  'preference-quiet-short':
    /\b(quiet|short|gentle|simple|soft|brief|keep it|stay)\b/i,
  'pattern-monday-crowded': /\bmonday/i,
  'pattern-monday': /\bmonday/i
});

const CONFIDENCE_RANK = Object.freeze({ high: 2, medium: 1, low: 0 });

/**
 * @param {string} evidence
 * @returns {string | null}
 */
export function ruleIdFromYinMemoryEvidence(evidence) {
  const raw = typeof evidence === 'string' ? evidence : '';
  const match = raw.match(/rule:([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinMemoryEntry} entry
 * @param {string} userText
 * @returns {boolean}
 */
export function isYinMemoryThemeRelatedToUserText(entry, userText) {
  const text = typeof userText === 'string' ? userText.trim() : '';
  if (!text || !entry) return false;

  const ruleId = ruleIdFromYinMemoryEvidence(entry.evidence);
  if (ruleId && RULE_THEME_PATTERNS[ruleId]?.test(text)) return true;

  const summary = typeof entry.summary === 'string' ? entry.summary : '';
  const tokens = summary.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const lowered = text.toLowerCase();
  return tokens.some((token) => lowered.includes(token));
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinMemoryEntry} entry
 * @returns {boolean}
 */
export function canInjectYinMemoryConfidence(entry) {
  return entry?.confidence === 'medium' || entry?.confidence === 'high';
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinMemoryEntry} entry
 * @param {string} userText
 * @returns {boolean}
 */
export function shouldInjectYinMemoryEntry(entry, userText) {
  if (!entry || entry.status !== 'active') return false;
  if (!canInjectYinMemoryConfidence(entry)) return false;
  return isYinMemoryThemeRelatedToUserText(entry, userText);
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState | null | undefined} state
 * @param {string} userText
 * @param {{ max?: number }} [opts]
 * @returns {string[]}
 */
export function retrieveYinMemoriesForL3Generate(state, userText, opts = {}) {
  const base = normalizeYinPersonalMemoryState(state);
  if (!canRememberYinPersonalMemory(base)) return [];

  const text = typeof userText === 'string' ? userText.trim() : '';
  if (!text) return [];

  const max =
    Number.isFinite(opts.max) && opts.max > 0
      ? Math.min(Math.floor(opts.max), YIN_MEMORY_L3_INJECT_MAX)
      : YIN_MEMORY_L3_INJECT_MAX;

  const candidates = base.memories
    .filter((entry) => shouldInjectYinMemoryEntry(entry, text))
    .sort((a, b) => {
      const rankDiff =
        (CONFIDENCE_RANK[b.confidence] || 0) - (CONFIDENCE_RANK[a.confidence] || 0);
      if (rankDiff !== 0) return rankDiff;
      return String(b.lastSeenAt).localeCompare(String(a.lastSeenAt));
    });

  const summaries = [];
  for (const entry of candidates) {
    const summary = typeof entry.summary === 'string' ? entry.summary.trim() : '';
    if (!summary || summaries.includes(summary)) continue;
    summaries.push(summary);
    if (summaries.length >= max) break;
  }
  return summaries;
}
