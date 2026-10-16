/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Local-only daily counter for the Confide help-resources entry (CR-46 · P3).
 * Never stores user free text.
 */

export const CONFIDE_HELP_ENTRY_DAILY_KIND = 'confide_help_entry_daily';
export const CONFIDE_HELP_ENTRY_STORAGE_KEY = 'focus-tiger.confide-help-entry-daily.v1';

/**
 * @param {Date} date
 * @returns {string}
 */
export function confideHelpEntryDayBucket(date) {
  const d = date instanceof Date ? date : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * @param {{
 *   at?: string,
 *   count?: number,
 *   locale?: string
 * }} row
 * @returns {object}
 */
export function buildConfideHelpEntryDailyRecord({
  at = '',
  count = 0,
  locale = 'en'
} = {}) {
  return {
    kind: CONFIDE_HELP_ENTRY_DAILY_KIND,
    at: String(at || '').trim(),
    count: Math.max(0, Math.floor(Number(count) || 0)),
    locale: String(locale || 'en').trim() || 'en'
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ at: string, count: number } | null}
 */
export function readConfideHelpEntryDaily(storage) {
  if (!storage) return null;
  try {
    const parsed = JSON.parse(storage.getItem(CONFIDE_HELP_ENTRY_STORAGE_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    const at = String(parsed.at || '').trim();
    const count = Math.max(0, Math.floor(Number(parsed.count) || 0));
    if (!at) return null;
    return { at, count };
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} locale
 * @param {() => Date} [now]
 * @returns {object}
 */
export function recordConfideHelpEntryOpen(storage, locale, now = () => new Date()) {
  const bucket = confideHelpEntryDayBucket(now());
  const prior = readConfideHelpEntryDaily(storage);
  const count = prior && prior.at === bucket ? prior.count + 1 : 1;
  const record = buildConfideHelpEntryDailyRecord({
    at: bucket,
    count,
    locale
  });
  if (storage) {
    try {
      storage.setItem(CONFIDE_HELP_ENTRY_STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* must not break the entry toggle */
    }
  }
  return record;
}
