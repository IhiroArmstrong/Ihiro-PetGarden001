/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · solar-term lookup (春分/夏至/秋分/冬至).
 * Pre-filled ≥10 years from 2026. Missing year → no trigger (no guess).
 *
 * @see docs/task-briefs/task-seasonal-theme-engine-v1.md §4.1 / §5.5
 */

/** @typedef {'chunfen' | 'xiazhi' | 'qiufen' | 'dongzhi'} SolarTermId */

/**
 * ISO calendar dates (YYYY-MM-DD) by term × year.
 * Sources: civil solar-term calendars (approx; ±0–1 day vs precise ephemeris OK for v1 window).
 * @type {Readonly<Record<SolarTermId, Readonly<Record<number, string>>>>}
 */
export const SOLAR_TERM_DATES_BY_YEAR = Object.freeze({
  chunfen: Object.freeze({
    2026: '2026-03-20',
    2027: '2027-03-21',
    2028: '2028-03-20',
    2029: '2029-03-20',
    2030: '2030-03-20',
    2031: '2031-03-21',
    2032: '2032-03-20',
    2033: '2033-03-20',
    2034: '2034-03-20',
    2035: '2035-03-21',
    2036: '2036-03-20'
  }),
  xiazhi: Object.freeze({
    2026: '2026-06-21',
    2027: '2027-06-21',
    2028: '2028-06-21',
    2029: '2029-06-21',
    2030: '2030-06-21',
    2031: '2031-06-21',
    2032: '2032-06-21',
    2033: '2033-06-21',
    2034: '2034-06-21',
    2035: '2035-06-21',
    2036: '2036-06-21'
  }),
  qiufen: Object.freeze({
    2026: '2026-09-23',
    2027: '2027-09-23',
    2028: '2028-09-22',
    2029: '2029-09-23',
    2030: '2030-09-23',
    2031: '2031-09-23',
    2032: '2032-09-22',
    2033: '2033-09-23',
    2034: '2034-09-23',
    2035: '2035-09-23',
    2036: '2036-09-22'
  }),
  dongzhi: Object.freeze({
    2026: '2026-12-21',
    2027: '2027-12-22',
    2028: '2028-12-21',
    2029: '2029-12-21',
    2030: '2030-12-22',
    2031: '2031-12-22',
    2032: '2032-12-21',
    2033: '2033-12-21',
    2034: '2034-12-22',
    2035: '2035-12-22',
    2036: '2036-12-21'
  })
});

/**
 * @param {SolarTermId | string} termId
 * @param {number} year
 * @returns {string | null} ISO YYYY-MM-DD
 */
export function lookupSolarTermDate(termId, year) {
  const table = SOLAR_TERM_DATES_BY_YEAR[/** @type {SolarTermId} */ (termId)];
  if (!table) return null;
  const iso = table[year];
  return typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
}

/**
 * Farthest year present in any solar-term row.
 * @returns {number}
 */
export function solarTermLookupMaxYear() {
  let max = 0;
  for (const term of Object.keys(SOLAR_TERM_DATES_BY_YEAR)) {
    const years = Object.keys(SOLAR_TERM_DATES_BY_YEAR[/** @type {SolarTermId} */ (term)]).map(
      Number
    );
    for (const y of years) if (y > max) max = y;
  }
  return max;
}
