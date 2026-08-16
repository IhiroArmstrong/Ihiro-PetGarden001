/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · clock helpers (mockDate QA + region sniff).
 */

/**
 * @param {string} [search] location.search
 * @returns {string | null} YYYY-MM-DD
 */
export function parseMockDateIso(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const v = new URLSearchParams(q).get('mockDate');
    if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    return v;
  } catch {
    return null;
  }
}

/**
 * Build an instant that lands on `iso` in common US Eastern afternoon (stable for tests).
 * @param {string} iso YYYY-MM-DD
 * @returns {Date | null}
 */
export function dateFromMockIso(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  // 17:00Z ≈ midday/afternoon in America/New_York (EST/EDT)
  const d = new Date(`${iso}T17:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {string} [search]
 * @param {Date} [fallback]
 * @returns {Date}
 */
export function resolveSeasonalNow(search = '', fallback = new Date()) {
  const iso = parseMockDateIso(search);
  if (!iso) return fallback;
  return dateFromMockIso(iso) || fallback;
}

/**
 * @param {string} [language] navigator.language
 * @returns {string | null} region subtag uppercased
 */
export function sniffRegionFromLanguage(language = '') {
  const raw = String(language || '');
  const m = raw.match(/[-_]([A-Za-z]{2})$/);
  return m ? m[1].toUpperCase() : null;
}
