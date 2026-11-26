/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T102 · tray “sat today” presentation. No streak, no grey decay.
 */

import { getLocalDateKey } from '../utils/localDate.js';

/** Must match `DESKTOP_DISPLAY_NAME` in desktop/trayPolicy.js. */
const FALLBACK_PRODUCT_NAME = 'Samatia';

export const TRAY_TODAY_SAT_CHANGED_EVENT = 'ft-daily-completion-changed';

/**
 * @param {unknown} minutes
 * @returns {number}
 */
export function normalizeTodaySatMinutes(minutes) {
  const n = Math.floor(Number(minutes));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

/**
 * @param {object} [input]
 * @param {boolean} [input.enabled]
 * @param {unknown} [input.minutes]
 * @param {unknown} [input.dateKey]
 * @returns {{ enabled: boolean, minutes: number, dateKey: string }}
 */
export function normalizeTrayTodaySatSnapshot(input = {}) {
  return {
    enabled: input.enabled !== false,
    minutes: normalizeTodaySatMinutes(input.minutes),
    dateKey: typeof input.dateKey === 'string' ? input.dateKey : ''
  };
}

/**
 * @param {object} input
 * @param {boolean} [input.enabled]
 * @param {number} [input.minutes]
 * @param {string} [input.dateKey]
 * @param {string} [input.todayKey]
 * @param {string} [input.locale]
 * @param {string} [input.productName]
 * @param {() => Date} [input.now]
 */
export function presentTrayTodaySat(input = {}) {
  const snapshot = normalizeTrayTodaySatSnapshot(input);
  const todayKey =
    typeof input.todayKey === 'string' && input.todayKey
      ? input.todayKey
      : getLocalDateKey(input.now ? input.now() : new Date());
  const productName =
    typeof input.productName === 'string' && input.productName
      ? input.productName
      : FALLBACK_PRODUCT_NAME;
  const locale = String(input.locale || '');

  if (!snapshot.enabled) {
    return { title: '', tooltip: productName, menuLabel: null };
  }
  if (!snapshot.dateKey || snapshot.dateKey !== todayKey || snapshot.minutes <= 0) {
    return {
      title: '',
      tooltip: trayTodaySatEmptyTooltip(locale, productName),
      menuLabel: null
    };
  }
  return {
    title: `${snapshot.minutes}m`,
    tooltip: trayTodaySatSatTooltip(locale, snapshot.minutes),
    menuLabel: trayTodaySatMenuLabel(locale, snapshot.minutes)
  };
}

/**
 * @param {string} locale
 * @param {string} productName
 */
function trayTodaySatEmptyTooltip(locale, productName) {
  const tag = locale.toLowerCase();
  if (tag.startsWith('zh')) return '今天还没有记下坐下。';
  if (tag.startsWith('ja')) return '今日の静坐はまだ記されていません。';
  return `No sit counted today. ${productName}`.trim();
}

/**
 * @param {string} locale
 * @param {number} minutes
 */
function trayTodaySatSatTooltip(locale, minutes) {
  const tag = locale.toLowerCase();
  if (tag.startsWith('zh')) return `今天已坐 ${minutes} 分钟。`;
  if (tag.startsWith('ja')) return `今日 ${minutes} 分、静坐しました。`;
  return `${minutes} minutes sat today.`;
}

/**
 * @param {string} locale
 * @param {number} minutes
 */
function trayTodaySatMenuLabel(locale, minutes) {
  const tag = locale.toLowerCase();
  if (tag.startsWith('zh')) return `今日已坐 · ${minutes} 分钟`;
  if (tag.startsWith('ja')) return `今日の静坐 · ${minutes}分`;
  return `Sat today · ${minutes} min`;
}
