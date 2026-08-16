/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · user-visible dual gate (Confide pattern).
 *
 * Gates (independent):
 * 1. Product mount flag `SEASONAL_THEME_USER_ENABLED` — stays false until intentional launch
 * 2. Per-season `contentReady` (human review ok)
 * 3. Optional kill switch per seasonId
 * 4. Calendar window + entitlement are applied by resolveActiveSeasonalTheme
 *
 * @see confide/confideUserVisibilityGate.js
 * @see docs/task-briefs/task-seasonal-theme-engine-v1.md §6
 */

import { getSeason } from './seasonalCalendar.js';
import { isChristmasCorpusOk } from './christmasCorpus.js';

/**
 * Flip to true only when seasonal themes are intentionally user-launched
 * (content ready + product decision). Phase 3: Christmas corpus ok → mount on.
 */
export const SEASONAL_THEME_USER_ENABLED = true;

/** @type {ReadonlySet<string>} */
const KILL_SWITCHED = new Set();

/**
 * @param {string} seasonId
 * @returns {boolean}
 */
export function isSeasonKillSwitched(seasonId) {
  return KILL_SWITCHED.has(String(seasonId || ''));
}

/**
 * Test/harness helper — not used by product UI in Phase 2.
 * @param {string} seasonId
 * @param {boolean} killed
 */
export function __setSeasonKillSwitchForTests(seasonId, killed) {
  const id = String(seasonId || '');
  if (!id) return;
  if (killed) KILL_SWITCHED.add(id);
  else KILL_SWITCHED.delete(id);
}

/**
 * Content + product mount + kill (does NOT include calendar or entitlement).
 * @param {string} seasonId
 * @param {object} [opts]
 * @param {boolean} [opts.mountEnabled]
 * @param {((id: string) => boolean) | null} [opts.killSwitched]
 * @returns {boolean}
 */
export function isSeasonalThemeGateOpen(
  seasonId,
  {
    mountEnabled = SEASONAL_THEME_USER_ENABLED,
    killSwitched = isSeasonKillSwitched
  } = {}
) {
  if (mountEnabled !== true) return false;
  if (killSwitched(seasonId)) return false;
  const season = getSeason(seasonId);
  if (!season || season.contentReady !== true) return false;
  if (
    season.assets?.copyPoolId === 'christmas' &&
    isChristmasCorpusOk() !== true
  ) {
    return false;
  }
  return true;
}

/**
 * QA harness query (?seasonal=christmas). Does NOT imply user-visible ship.
 * @param {string} [search]
 * @returns {string | null} season id or null
 */
export function seasonalDevHarnessId(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const id = new URLSearchParams(q).get('seasonal');
    return id && getSeason(id) ? id : null;
  } catch {
    return null;
  }
}
