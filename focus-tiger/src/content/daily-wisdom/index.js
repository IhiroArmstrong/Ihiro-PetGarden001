/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Daily wisdom content loader — locale pools for Yin’s short daily line.
 * Free companion content (not Sanctuary). Separate from Quiet Line / DAILY_ZEN_QUOTE.
 *
 * Entries: `{ id, text, attribution? }` — attribution optional (classical lines).
 */

import { DAILY_WISDOM_EN } from './daily-wisdom.en.js';
import { DAILY_WISDOM_JA } from './daily-wisdom.ja.js';

/** @typedef {{ id: string, text: string, attribution?: string }} DailyWisdomEntry */

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
 * @returns {DailyWisdomEntry | null}
 */
export function findDailyWisdomEntry(id, locale = 'en') {
  const key = String(id || '');
  if (!key) return null;
  const preferred = getDailyWisdomPool(locale).find((e) => e.id === key);
  if (preferred) return preferred;
  return POOLS.en.find((e) => e.id === key) ?? null;
}

/**
 * @param {string} id
 * @param {string} [locale]
 * @returns {string}
 */
export function findDailyWisdomText(id, locale = 'en') {
  return findDailyWisdomEntry(id, locale)?.text ?? '';
}

/**
 * @param {string} id
 * @param {string} [locale]
 * @returns {string}
 */
export function findDailyWisdomAttribution(id, locale = 'en') {
  const attr = findDailyWisdomEntry(id, locale)?.attribution;
  return typeof attr === 'string' ? attr : '';
}

export { DAILY_WISDOM_EN, DAILY_WISDOM_JA };
