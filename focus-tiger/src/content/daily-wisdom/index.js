/**
 * Daily wisdom content loader — locale pools for Yin’s short daily line.
 * Free companion content (not Sanctuary). Separate from Quiet Line / DAILY_ZEN_QUOTE.
 */

import { DAILY_WISDOM_EN } from './daily-wisdom.en.js';
import { DAILY_WISDOM_JA } from './daily-wisdom.ja.js';

/** @typedef {{ id: string, text: string }} DailyWisdomEntry */

/** @type {Readonly<Record<string, readonly DailyWisdomEntry[]>>} */
const POOLS = Object.freeze({
  en: DAILY_WISDOM_EN,
  ja: DAILY_WISDOM_JA
});

/**
 * @param {string} [locale]
 * @returns {readonly DailyWisdomEntry[]}
 */
export function getDailyWisdomPool(locale = 'en') {
  if (locale === 'ja') return POOLS.ja;
  return POOLS.en;
}

/**
 * @param {string} id
 * @param {string} [locale]
 * @returns {string}
 */
export function findDailyWisdomText(id, locale = 'en') {
  const key = String(id || '');
  if (!key) return '';
  const preferred = getDailyWisdomPool(locale).find((e) => e.id === key);
  if (preferred?.text) return preferred.text;
  const fallback = POOLS.en.find((e) => e.id === key);
  return fallback?.text ?? '';
}

export { DAILY_WISDOM_EN, DAILY_WISDOM_JA };
