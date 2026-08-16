/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Japanese copy guards · shared by i18n smoke + `npm run i18n:sync`.
 *
 * Policy:
 * - Key parity: every en key must exist in ja (and vice versa for ready packs).
 * - No English placeholders: ja value must not equal en (except proper-noun allowlist).
 * - Japanese script: ja value must include Hiragana, Katakana, or Kanji — NOT
 *   “must include kana only”, which false-positives on 到着 / 回復 / 言語 etc.
 *
 * Does not catch every mixed EN+JA sentence; that needs human review.
 */

/** Keys that may stay identical to English (brand / film titles). */
export const JA_MAY_MATCH_EN = Object.freeze(
  new Set(['APP_TITLE', 'ZEN_CINEMA_FILM_TITLE'])
);

/** Hiragana | Katakana | CJK Unified Ideographs (covers kanji-only labels). */
export const JA_HAS_JAPANESE_SCRIPT =
  /[\u3040-\u309F\u30A0-\u30FF\u3400-\u9FFF]/;

/**
 * @param {string} key
 * @returns {boolean}
 */
export function isJaProperNounAllowlisted(key) {
  if (JA_MAY_MATCH_EN.has(key)) return true;
  if (String(key).startsWith('AMBIENT_TRACK_')) return true;
  // Legal / brand colophon stays English in every locale (indie About tone).
  if (String(key).startsWith('HINT_APP_PURPOSE_COLOPHON_')) return true;
  return false;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function hasJapaneseScript(value) {
  return JA_HAS_JAPANESE_SCRIPT.test(String(value ?? ''));
}

/**
 * @param {Record<string, string>} en
 * @param {Record<string, string>} ja
 * @returns {string[]} keys present in en but missing in ja
 */
export function listMissingJaKeys(en, ja) {
  return Object.keys(en)
    .filter((key) => !Object.prototype.hasOwnProperty.call(ja, key))
    .sort();
}

/**
 * @param {Record<string, string>} en
 * @param {Record<string, string>} ja
 * @returns {string[]} keys present in ja but not in en
 */
export function listExtraJaKeys(en, ja) {
  return Object.keys(ja)
    .filter((key) => !Object.prototype.hasOwnProperty.call(en, key))
    .sort();
}

/**
 * ja value equals en (English placeholder), excluding proper-noun allowlist.
 * @param {Record<string, string>} en
 * @param {Record<string, string>} ja
 * @returns {string[]}
 */
export function listJaEqualToEn(en, ja) {
  return Object.keys(en)
    .filter((key) => {
      if (isJaProperNounAllowlisted(key)) return false;
      const e = en[key];
      const j = ja[key];
      return typeof e === 'string' && e.length > 0 && e === j;
    })
    .sort();
}

/**
 * ja value has no Japanese script (pure Latin / digits / punctuation).
 * @param {Record<string, string>} ja
 * @returns {string[]}
 */
export function listJaMissingJapaneseScript(ja) {
  return Object.keys(ja)
    .filter((key) => {
      if (isJaProperNounAllowlisted(key)) return false;
      const j = ja[key];
      if (typeof j !== 'string' || j.trim().length === 0) return false;
      return !hasJapaneseScript(j);
    })
    .sort();
}
