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
  "don't want to live",
  'dont want to live',
  'do not want to live',
  "don't wanna live",
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
  '活不下去',
  '想伤害自己',
  '想傷害自己'
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
 * Fold curly / fullwidth apostrophes so "don’t want to live" still hits.
 * @param {string} text
 * @returns {string}
 */
export function foldConfideSafetyText(text) {
  return String(text || '').replace(/[\u2018\u2019\u02BC\uFF07]/g, "'");
}

/**
 * Collocations where a crisis word is the *subject matter*, not the speaker's
 * state. Only the span itself is excused — a crisis phrase anywhere else in the
 * same sentence still routes. ("I read about suicide prevention and I want to
 * die" is still a crisis.)
 * @type {readonly RegExp[]}
 */
export const SAFETY_TOPIC_COLLOCATION_RES = Object.freeze([
  /suicide\s+(?:prevention|awareness|hotline|helpline|research|rates?|statistics)/gi,
  /(?:prevention|awareness|hotline|helpline)\s+(?:for|of|about)\s+suicide/gi,
  /self[\s-]?harm\s+(?:awareness|prevention|research)/gi,
  /自[杀殺](?:預防|预防|防止|干预|干預|相談|热线|熱線)/g
]);

/**
 * Negation that must sit *immediately* before the phrase. "I don't want to hurt
 * myself" is excused; "I don't know if I want to die" is not, because the
 * negation is not adjacent.
 */
const NEGATION_IMMEDIATELY_BEFORE_RE =
  /(?:^|[^a-z])(?:don'?t|do not|didn'?t|did not|won'?t|will not|wouldn'?t|would not|never)\s+(?:want\s+to\s+|wanna\s+)?$/i;

/** @param {string} value @returns {boolean} */
function isLatinPhrase(value) {
  return /[a-z]/i.test(value);
}

/**
 * Blank out topic spans, preserving length so offsets stay comparable.
 * @param {string} value
 * @returns {string}
 */
function maskSafetyTopicSpans(value) {
  let out = value;
  for (const re of SAFETY_TOPIC_COLLOCATION_RES) {
    out = out.replace(new RegExp(re.source, re.flags), (m) => ' '.repeat(m.length));
  }
  return out;
}

/**
 * @param {string} hay
 * @param {number} start
 * @param {number} end
 * @returns {boolean}
 */
function sitsOnWordBoundary(hay, start, end) {
  const before = start > 0 ? hay[start - 1] : '';
  const after = end < hay.length ? hay[end] : '';
  return !/[a-z0-9']/i.test(before) && !/[a-z0-9']/i.test(after);
}

/**
 * @param {string} text
 * @param {readonly string[]} [phrases]
 * @returns {boolean}
 */
export function matchesSafetyRedirect(text, phrases = allSafetyPhrases()) {
  const raw = foldConfideSafetyText(typeof text === 'string' ? text : '');
  if (!raw.trim()) return false;
  const masked = maskSafetyTopicSpans(raw);
  const lowered = masked.toLowerCase();

  for (const phrase of phrases) {
    const p = foldConfideSafetyText(String(phrase || '')).trim();
    if (!p) continue;
    // CJK phrases: case-fold only the haystack; needle kept as authored.
    const latin = isLatinPhrase(p);
    const needle = latin ? p.toLowerCase() : p;
    const hay = latin ? lowered : masked;

    for (let at = hay.indexOf(needle); at !== -1; at = hay.indexOf(needle, at + 1)) {
      if (!latin) return true;
      // Word boundary keeps "self harm" out of "self harmony".
      if (!sitsOnWordBoundary(hay, at, at + needle.length)) continue;
      // Negation is checked against the text before the match, so a phrase that
      // carries its own negation ("don't want to live") still routes.
      if (NEGATION_IMMEDIATELY_BEFORE_RE.test(hay.slice(0, at))) continue;
      return true;
    }
  }
  return false;
}
