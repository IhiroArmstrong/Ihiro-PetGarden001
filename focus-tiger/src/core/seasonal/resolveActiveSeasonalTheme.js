/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · resolve currently active theme (if any).
 * No per-holiday if-branches — config driven only.
 */

import { isEntitled } from '../entitlement/entitlementGate.js';
import {
  addDaysIso,
  calendarPartsInTimeZone,
  isIsoInInclusiveRange,
  resolveAnchorIsoForYear,
  toIsoDate
} from './dateRules.js';
import { SEASONAL_CALENDAR } from './seasonalCalendar.js';
import {
  SEASONAL_THEME_USER_ENABLED,
  isSeasonKillSwitched,
  isSeasonalThemeGateOpen,
  seasonalDevHarnessId
} from './seasonalThemeVisibilityGate.js';

/**
 * @typedef {import('./seasonalCalendar.js').SeasonConfig} SeasonConfig
 * @typedef {import('./seasonalCalendar.js').SeasonAssets} SeasonAssets
 * @typedef {{
 *   seasonId: string,
 *   anchorDateIso: string,
 *   windowStartIso: string,
 *   windowEndIso: string,
 *   assets: SeasonAssets
 * }} ActiveSeasonalTheme
 */

/**
 * @param {string | null | undefined} region
 * @param {SeasonConfig} season
 * @returns {boolean}
 */
export function seasonMatchesRegion(season, region) {
  const regions = season.regions;
  if (!regions || regions.length === 0) return true;
  if (!region) return false;
  const r = String(region).toUpperCase();
  return regions.some((x) => String(x).toUpperCase() === r);
}

/**
 * @param {SeasonConfig} season
 * @param {Date} now
 * @returns {{ anchorDateIso: string, windowStartIso: string, windowEndIso: string, todayIso: string } | null}
 */
export function computeSeasonWindow(season, now) {
  const parts = calendarPartsInTimeZone(now, season.timezone);
  if (!parts.year || !parts.month || !parts.day) return null;
  const todayIso = toIsoDate(parts.year, parts.month, parts.day);
  const anchorDateIso = resolveAnchorIsoForYear(season.dateRule, parts.year);
  if (!anchorDateIso) return null;
  const windowStartIso = addDaysIso(anchorDateIso, -Math.abs(season.windowDaysBefore || 0));
  const windowEndIso = addDaysIso(anchorDateIso, Math.abs(season.windowDaysAfter || 0));
  if (!windowStartIso || !windowEndIso) return null;
  return { anchorDateIso, windowStartIso, windowEndIso, todayIso };
}

/**
 * @param {SeasonConfig} season
 * @param {Date} now
 * @returns {boolean}
 */
export function isSeasonInWindow(season, now) {
  const w = computeSeasonWindow(season, now);
  if (!w) return false;
  return isIsoInInclusiveRange(w.todayIso, w.windowStartIso, w.windowEndIso);
}

/**
 * Pick the single winning season among candidates (priority desc, then table order).
 * @param {SeasonConfig[]} candidates
 * @returns {SeasonConfig | null}
 */
export function pickHighestPrioritySeason(candidates) {
  if (!candidates.length) return null;
  let best = candidates[0];
  let bestIndex = 0;
  for (let i = 1; i < candidates.length; i++) {
    const c = candidates[i];
    if (c.priority > best.priority) {
      best = c;
      bestIndex = i;
    } else if (c.priority === best.priority && i < bestIndex) {
      best = c;
      bestIndex = i;
    }
  }
  // Stable: among equal priority, earliest in SEASONAL_CALENDAR order wins.
  const tied = candidates.filter((c) => c.priority === best.priority);
  if (tied.length === 1) return best;
  for (const s of SEASONAL_CALENDAR) {
    if (tied.some((t) => t.id === s.id)) return s;
  }
  return best;
}

/**
 * Resolve active theme for entitled users when product gates allow.
 *
 * @param {object} [opts]
 * @param {Date} [opts.now]
 * @param {string | null} [opts.region]
 * @param {Storage | null} [opts.storage]
 * @param {boolean} [opts.mountEnabled]
 * @param {string} [opts.search] location.search for ?seasonal= harness
 * @param {(key: string, opts?: object) => boolean} [opts.entitled]
 * @returns {ActiveSeasonalTheme | null}
 */
export function resolveActiveSeasonalTheme({
  now = new Date(),
  region = null,
  storage = null,
  mountEnabled = SEASONAL_THEME_USER_ENABLED,
  search = '',
  entitled = isEntitled,
  /** When true (tests / harness), skip subscriberOnly entitlement check. */
  skipEntitlement = false
} = {}) {
  const harnessId = seasonalDevHarnessId(search);

  /** @type {SeasonConfig[]} */
  const candidates = [];
  for (const season of SEASONAL_CALENDAR) {
    if (harnessId) {
      // Dev harness: force one id; bypass mount + contentReady (≠ user ship).
      if (season.id !== harnessId) continue;
      if (isSeasonKillSwitched(season.id)) continue;
    } else if (!isSeasonalThemeGateOpen(season.id, { mountEnabled })) {
      continue;
    }
    if (!seasonMatchesRegion(season, region)) continue;
    if (!isSeasonInWindow(season, now)) continue;
    if (season.subscriberOnly && !skipEntitlement) {
      const ok = entitled('theme.seasonal.access', { storage });
      if (!ok) continue;
    }
    candidates.push(season);
  }

  const winner = pickHighestPrioritySeason(candidates);
  if (!winner) return null;
  const w = computeSeasonWindow(winner, now);
  if (!w) return null;
  return {
    seasonId: winner.id,
    anchorDateIso: w.anchorDateIso,
    windowStartIso: w.windowStartIso,
    windowEndIso: w.windowEndIso,
    assets: winner.assets || {}
  };
}
