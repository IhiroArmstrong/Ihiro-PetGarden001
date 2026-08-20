/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unified late-night rest window (local clock).
 * Aligned with wellness cold-start: hour ≥ 23 or hour < 6.
 */

/** Inclusive start hour (local). */
export const LATE_NIGHT_HOUR = 23;

/** Exclusive end hour = wellness morning start (local). */
export const LATE_NIGHT_END_HOUR = 6;

/**
 * @param {Date} [date]
 * @returns {boolean}
 */
export function isLateNightHour(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  const hour = date.getHours();
  return hour >= LATE_NIGHT_HOUR || hour < LATE_NIGHT_END_HOUR;
}
