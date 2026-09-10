/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Optional cloud growth-metrics overlay (remote params).
 * Unknown schemaVersion / malformed payload → keep local freeze tables.
 */

export const GROWTH_METRICS_SCHEMA_VERSION = 1;

/** Must stay in sync with `scoreDailyCap.js` `DAILY_SCORE_CAP_MINUTES`. */
export const GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES = 180;

const DAILY_SCORE_CAP_MIN = 60;
const DAILY_SCORE_CAP_MAX = 480;

/** @typedef {{ schemaVersion: 1, dailyScoreCapMinutes: number }} GrowthMetricsConfigOverlay */

/** @type {GrowthMetricsConfigOverlay | null} */
let configOverlay = null;
let cloudOk = false;

/**
 * @param {unknown} value
 * @returns {number | null}
 */
export function normalizeDailyScoreCapMinutes(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const floored = Math.floor(n);
  if (floored < DAILY_SCORE_CAP_MIN) return null;
  if (floored > DAILY_SCORE_CAP_MAX) return null;
  return floored;
}

/**
 * @param {unknown} payload
 * @returns {GrowthMetricsConfigOverlay | null}
 */
export function parseGrowthMetricsConfigOverlay(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  const o = /** @type {Record<string, unknown>} */ (payload);
  if (o.schemaVersion !== GROWTH_METRICS_SCHEMA_VERSION) return null;
  const dailyScoreCapMinutes = normalizeDailyScoreCapMinutes(
    o.dailyScoreCapMinutes
  );
  if (dailyScoreCapMinutes == null) return null;
  return {
    schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
    dailyScoreCapMinutes
  };
}

/**
 * @param {GrowthMetricsConfigOverlay} parsed
 * @returns {boolean}
 */
export function growthMetricsConfigOverlayMatchesLocalFreeze(parsed) {
  return (
    parsed.dailyScoreCapMinutes === GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES
  );
}

/** @returns {number} */
export function getDailyScoreCapMinutes() {
  return (
    configOverlay?.dailyScoreCapMinutes ??
    GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES
  );
}

/** @param {GrowthMetricsConfigOverlay | null} next */
export function setGrowthMetricsConfigOverlay(next) {
  configOverlay = next;
}

export function markGrowthMetricsCloudOk() {
  cloudOk = true;
}

/** @returns {boolean} */
export function isGrowthMetricsCloudConfirmed() {
  return cloudOk || Boolean(configOverlay);
}

/** @returns {GrowthMetricsConfigOverlay | null} */
export function getGrowthMetricsConfigOverlay() {
  return configOverlay;
}

export function resetGrowthMetricsConfigOverlayForTests() {
  configOverlay = null;
  cloudOk = false;
}
