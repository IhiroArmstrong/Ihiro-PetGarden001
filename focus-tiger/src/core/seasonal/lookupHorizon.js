/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lookup horizon guards — solar-term + Easter tables must stay ≥10y ahead.
 */

import { seasonalLookupTablesMaxYear } from './seasonalCalendar.js';
import { solarTermLookupMaxYear } from './solarTermLookup.js';

/** Required years of runway beyond the current calendar year. */
export const LOOKUP_HORIZON_YEARS = 10;

/** Warn / fail band when remaining runway drops below this. */
export const LOOKUP_WARN_REMAINING_YEARS = 3;

/**
 * @param {Date} [now]
 * @returns {{
 *   currentYear: number,
 *   requiredMinYear: number,
 *   solarTermMaxYear: number,
 *   lookupTableMaxYear: number,
 *   ok: boolean,
 *   warnLowRunway: boolean
 * }}
 */
export function assessLookupHorizon(now = new Date()) {
  const currentYear = now.getUTCFullYear();
  const requiredMinYear = currentYear + LOOKUP_HORIZON_YEARS;
  const solarTermMaxYear = solarTermLookupMaxYear();
  const lookupTableMaxYear = seasonalLookupTablesMaxYear();
  const farthest = Math.min(solarTermMaxYear, lookupTableMaxYear);
  const remaining = farthest - currentYear;
  return {
    currentYear,
    requiredMinYear,
    solarTermMaxYear,
    lookupTableMaxYear,
    ok: solarTermMaxYear >= requiredMinYear && lookupTableMaxYear >= requiredMinYear,
    warnLowRunway: remaining < LOOKUP_WARN_REMAINING_YEARS
  };
}
