/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · crisis / self-harm keyword layer (rule-only).
 * Keep lists conservative: clear crisis phrases, not everyday sadness.
 * Expand only with human review — false positives divert to resource copy.
 */

/** @type {readonly string[]} */
export const SAFETY_PHRASES_EN = Object.freeze([
  'kill myself',
  'killing myself',
  'end my life',
  'ending my life',
  'want to die',
  'wanna die',
  'suicide',
  'self-harm',
  'self harm',
  'hurt myself',
  'ending it all'
]);

/** @type {readonly string[]} */
export const SAFETY_PHRASES_ZH = Object.freeze([
  '自杀',
  '自殺',
  '不想活',
  '结束生命',
  '結束生命',
  '了结自己',
  '了結自己',
  '自残',
  '自殘',
  '割腕',
  '活不下去'
]);

/** @type {readonly string[]} */
export const SAFETY_PHRASES_JA = Object.freeze([
  '自殺',
  '死にたい',
  '生きたくない',
  '自分を傷つけ',
  '消えたい'
]);

/**
 * @returns {readonly string[]}
 */
export function allSafetyPhrases() {
  return Object.freeze([
    ...SAFETY_PHRASES_EN,
    ...SAFETY_PHRASES_ZH,
    ...SAFETY_PHRASES_JA
  ]);
}

/**
 * @param {string} text
 * @param {readonly string[]} [phrases]
 * @returns {boolean}
 */
export function matchesSafetyRedirect(text, phrases = allSafetyPhrases()) {
  const raw = typeof text === 'string' ? text : '';
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return false;
  for (const phrase of phrases) {
    const p = String(phrase || '').trim();
    if (!p) continue;
    // CJK phrases: case-fold only the haystack; needle kept as authored.
    const needle = /[a-z]/i.test(p) ? p.toLowerCase() : p;
    const hay = /[a-z]/i.test(p) ? normalized : raw;
    if (hay.includes(needle)) return true;
  }
  return false;
}
