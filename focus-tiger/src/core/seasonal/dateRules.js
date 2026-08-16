/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · DateRule → anchor ISO day.
 * @see docs/task-briefs/task-seasonal-theme-engine-v1.md §4–§5
 */

import { lookupSolarTermDate } from './solarTermLookup.js';

/**
 * @typedef {{ type: 'fixed'; month: number; day: number }} FixedRule
 * @typedef {{ type: 'nth-weekday'; month: number; weekday: number; n: number }} NthWeekdayRule
 * @typedef {{ type: 'solar-term'; termId: string }} SolarTermRule
 * @typedef {{ type: 'lookup-table'; datesByYear: Record<number, string> }} LookupTableRule
 * @typedef {FixedRule | NthWeekdayRule | SolarTermRule | LookupTableRule} DateRule
 */

/**
 * Calendar Y-M-D parts in an IANA timezone.
 * @param {Date} instant
 * @param {string} timeZone
 * @returns {{ year: number, month: number, day: number }}
 */
export function calendarPartsInTimeZone(instant, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = fmt.formatToParts(instant);
  const get = (type) => {
    const p = parts.find((x) => x.type === type);
    return p ? Number(p.value) : NaN;
  };
  return { year: get('year'), month: get('month'), day: get('day') };
}

/**
 * @param {number} year
 * @param {number} month 1–12
 * @param {number} day
 * @returns {string}
 */
export function toIsoDate(year, month, day) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * @param {string} iso YYYY-MM-DD
 * @returns {{ year: number, month: number, day: number } | null}
 */
export function parseIsoDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d };
}

/**
 * @param {number} year
 * @returns {boolean}
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * nth weekday of month (n ≥ 1). weekday: 0=Sun … 6=Sat.
 * @param {number} year
 * @param {number} month 1–12
 * @param {number} weekday
 * @param {number} n
 * @returns {string | null} ISO date
 */
export function nthWeekdayOfMonth(year, month, weekday, n) {
  if (n < 1 || weekday < 0 || weekday > 6 || month < 1 || month > 12) return null;
  // Use UTC noon as a stable civil date carrier (no TZ shift for Y-M-D math).
  const first = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
  const firstWd = first.getUTCDay();
  let day = 1 + ((weekday - firstWd + 7) % 7) + (n - 1) * 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) return null;
  return toIsoDate(year, month, day);
}

/**
 * @param {DateRule} rule
 * @param {number} year
 * @returns {string | null} ISO YYYY-MM-DD
 */
export function resolveAnchorIsoForYear(rule, year) {
  if (!rule || typeof rule !== 'object' || !rule.type) return null;
  if (rule.type === 'fixed') {
    const { month, day } = rule;
    if (month === 2 && day === 29 && !isLeapYear(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return toIsoDate(year, month, day);
  }
  if (rule.type === 'nth-weekday') {
    return nthWeekdayOfMonth(year, rule.month, rule.weekday, rule.n);
  }
  if (rule.type === 'solar-term') {
    return lookupSolarTermDate(rule.termId, year);
  }
  if (rule.type === 'lookup-table') {
    const iso = rule.datesByYear?.[year];
    return typeof iso === 'string' && parseIsoDate(iso) ? iso : null;
  }
  return null;
}

/**
 * Add signed calendar days to an ISO date (civil arithmetic).
 * @param {string} iso
 * @param {number} deltaDays
 * @returns {string | null}
 */
export function addDaysIso(iso, deltaDays) {
  const p = parseIsoDate(iso);
  if (!p) return null;
  const utc = new Date(Date.UTC(p.year, p.month - 1, p.day, 12, 0, 0));
  utc.setUTCDate(utc.getUTCDate() + deltaDays);
  return toIsoDate(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

/**
 * Inclusive window check on ISO calendar days.
 * @param {string} todayIso
 * @param {string} startIso
 * @param {string} endIso
 * @returns {boolean}
 */
export function isIsoInInclusiveRange(todayIso, startIso, endIso) {
  return todayIso >= startIso && todayIso <= endIso;
}
