/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * ISO week label `YYYY-Www` in the device local calendar.
 *
 * @param {Date} date
 */
export function formatIsoWeekLocal(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Local Monday 00:00:00.000 through Sunday 23:59:59.999 for an ISO week key.
 *
 * @param {string} weekKey `YYYY-Www`
 * @param {Date} [anchor] any date within the target week (local)
 * @returns {{ startMs: number, endMs: number }}
 */
export function localWeekBoundsFromKey(weekKey, anchor = new Date()) {
  const match = /^(\d{4})-W(\d{2})$/.exec(String(weekKey || ''));
  if (!match) {
    const wk = formatIsoWeekLocal(anchor);
    return localWeekBoundsFromKey(wk, anchor);
  }
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const mondayWeek1 = new Date(year, 0, 4 - (jan4Day - 1));
  const monday = new Date(mondayWeek1);
  monday.setDate(monday.getDate() + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  const end = new Date(monday);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { startMs: monday.getTime(), endMs: end.getTime() };
}

/**
 * @param {number} ms
 * @param {{ startMs: number, endMs: number }} bounds
 */
export function isTimestampInLocalWeek(ms, bounds) {
  const t = Number(ms);
  return Number.isFinite(t) && t >= bounds.startMs && t <= bounds.endMs;
}

/** Local time-of-day slot for practice **start** (device clock only). */
export const PRACTICE_TIME_SLOT = Object.freeze({
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  LATE_NIGHT: 'lateNight'
});

/**
 * @param {Date} date
 * @returns {typeof PRACTICE_TIME_SLOT[keyof typeof PRACTICE_TIME_SLOT]}
 */
export function practiceTimeSlotForLocalDate(date) {
  const h = date.getHours();
  if (h >= 5 && h <= 11) return PRACTICE_TIME_SLOT.MORNING;
  if (h >= 12 && h <= 16) return PRACTICE_TIME_SLOT.AFTERNOON;
  if (h >= 17 && h <= 21) return PRACTICE_TIME_SLOT.EVENING;
  return PRACTICE_TIME_SLOT.LATE_NIGHT;
}

/**
 * Whole weeks between consent day (local date) and week end (inclusive min 0).
 *
 * @param {string | null | undefined} consentedAtIso
 * @param {Date} weekEndDate local Sunday of target week
 */
export function tenureWeeksSinceConsent(consentedAtIso, weekEndDate) {
  if (!consentedAtIso || typeof consentedAtIso !== 'string') return 0;
  const consented = new Date(consentedAtIso);
  if (Number.isNaN(consented.getTime())) return 0;
  const startLocal = new Date(
    consented.getFullYear(),
    consented.getMonth(),
    consented.getDate()
  );
  const endLocal = new Date(
    weekEndDate.getFullYear(),
    weekEndDate.getMonth(),
    weekEndDate.getDate()
  );
  const diffDays = Math.floor((endLocal.getTime() - startLocal.getTime()) / 86_400_000);
  if (diffDays < 0) return 0;
  const weeks = Math.floor(diffDays / 7) + 1;
  return weeks > 260 ? 260 : weeks;
}
