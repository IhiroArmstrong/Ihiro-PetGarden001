/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Visible Confide uniqueness: lock the *property* of consecutive identical
 * replies (any jacket), not one echo string.
 */

/** Generate-fail streak at/above this is an automatic signal (console only). */
export const CONSECUTIVE_GENERATE_FALLBACK_WARN_AT = 2;

/**
 * @param {unknown} text
 * @returns {string}
 */
export function normalizeVisibleConfideReply(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?。！？]+$/u, '')
    .toLowerCase();
}

/**
 * Corpus retrieve + generate may re-jacket; crisis / tools may legally repeat.
 * @param {unknown} source
 * @returns {boolean}
 */
export function isRepeatableConfideSource(source) {
  return source === 'generate' || source === 'corpus';
}

/**
 * @param {unknown} history
 * @returns {string[]}
 */
export function priorRepeatableYinRepliesFromHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((row) => row?.role === 'yin' && isRepeatableConfideSource(row?.source))
    .map((row) => String(row?.text || '').trim())
    .filter(Boolean);
}

/**
 * @param {unknown} history
 * @returns {string}
 */
export function lastRepeatableYinReplyText(history = []) {
  const prior = priorRepeatableYinRepliesFromHistory(history);
  return prior.length ? prior[prior.length - 1] : '';
}

/**
 * First index i≥1 where texts[i] matches texts[i-1] after normalize.
 * @param {unknown} texts
 * @returns {number} index or -1
 */
export function firstConsecutiveDuplicateIndex(texts = []) {
  if (!Array.isArray(texts)) return -1;
  for (let i = 1; i < texts.length; i += 1) {
    const a = normalizeVisibleConfideReply(texts[i - 1]);
    const b = normalizeVisibleConfideReply(texts[i]);
    if (a && b && a === b) return i;
  }
  return -1;
}

/**
 * @param {number} prev
 * @param {boolean} generateOk
 * @returns {number}
 */
export function nextGenerateFailStreak(prev, generateOk) {
  if (generateOk) return 0;
  const n = Number(prev);
  return (Number.isFinite(n) && n > 0 ? n : 0) + 1;
}
