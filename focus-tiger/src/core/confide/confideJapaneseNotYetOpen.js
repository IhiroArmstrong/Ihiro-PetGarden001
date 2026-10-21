/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T36 · after safety / aggression, kana-bearing Confide input is not yet open.
 * Detector is the same Hiragana/Katakana rule as semantic-crisis skip.
 * Kanji-only Japanese is a known miss; Chinese is not hard-blocked.
 */

import { looksLikeJapaneseConfideText } from './confideSemanticCrisisLayer.js';
import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

export const CONFIDE_JA_NOT_YET_OPEN_ENV = 'FT_CONFIDE_JA_NOT_YET_OPEN';

export const CONFIDE_JA_NOT_YET_OPEN_LINE_ID = 'language-not-yet-open-01';

/** English lead. Never “cannot be used”. */
export const CONFIDE_JA_NOT_YET_OPEN_EN =
  'Listening is ready in English. Japanese Confide talking is not yet open.';

export const CONFIDE_JA_NOT_YET_OPEN_ZH =
  '倾听目前只开放英语。日语倾诉还没有开放。';

export const CONFIDE_JA_NOT_YET_OPEN_JA =
  '傾きの会話は、いま英語だけ開いています。日本語はまだ開いていません。';

/**
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {boolean}
 */
export function isConfideJapaneseNotYetOpenEnabled(env) {
  const raw = String(
    confideBrowserSafeEnv(env)[CONFIDE_JA_NOT_YET_OPEN_ENV] || 'on'
  )
    .trim()
    .toLowerCase();
  return raw !== 'off' && raw !== '0' && raw !== 'false';
}

/**
 * @param {string} text
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {boolean}
 */
export function shouldApplyJapaneseConfideNotYetOpen(text, env) {
  return (
    isConfideJapaneseNotYetOpenEnabled(env) && looksLikeJapaneseConfideText(text)
  );
}

/**
 * Combined notice: English lead + fixed Japanese companion line.
 * @returns {string}
 */
export function formatConfideJapaneseNotYetOpenReply() {
  return `${CONFIDE_JA_NOT_YET_OPEN_EN}\n${CONFIDE_JA_NOT_YET_OPEN_JA}`;
}

/**
 * Corpus-shaped line so retrieve helpers can show the notice without a pool.
 * @returns {{
 *   id: string,
 *   route: string,
 *   en: string,
 *   zh: string,
 *   ja: string
 * }}
 */
export function buildJapaneseConfideNotYetOpenLine() {
  const combined = formatConfideJapaneseNotYetOpenReply();
  return {
    id: CONFIDE_JA_NOT_YET_OPEN_LINE_ID,
    route: CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN,
    en: combined,
    zh: `${CONFIDE_JA_NOT_YET_OPEN_ZH}\n${CONFIDE_JA_NOT_YET_OPEN_JA}`,
    ja: combined
  };
}
