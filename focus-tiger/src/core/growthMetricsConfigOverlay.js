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

/** Must stay in sync with `lotusPondMath.js` freeze exports. */
export const GROWTH_METRICS_FROZEN_LOTUS_FIRST_BLOOM_MINUTES = 25;
export const GROWTH_METRICS_FROZEN_LOTUS_EARLY_STEP_MINUTES = 25;
export const GROWTH_METRICS_FROZEN_LOTUS_EARLY_BLOOM_LAST = 5;
export const GROWTH_METRICS_FROZEN_LOTUS_LATER_STEP_MINUTES = 45;
export const GROWTH_METRICS_FROZEN_LOTUS_RING_CAPACITY = 12;

const DAILY_SCORE_CAP_MIN = 60;
const DAILY_SCORE_CAP_MAX = 480;

const LOTUS_FIRST_BLOOM_MIN = 1;
const LOTUS_FIRST_BLOOM_MAX = 180;
const LOTUS_STEP_MIN = 1;
const LOTUS_STEP_MAX = 180;
const LOTUS_EARLY_BLOOM_LAST_MIN = 1;
const LOTUS_RING_CAPACITY_MIN = 1;
const LOTUS_RING_CAPACITY_MAX = 24;

/** @typedef {{ schemaVersion: 1, dailyScoreCapMinutes: number, lotusFirstBloomMinutes: number, lotusEarlyStepMinutes: number, lotusEarlyBloomLast: number, lotusLaterStepMinutes: number, lotusRingCapacity: number }} GrowthMetricsConfigOverlay */

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
 * @param {unknown} value
 * @returns {number | null}
 */
function normalizeLotusFirstBloomMinutes(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const floored = Math.floor(n);
  if (floored < LOTUS_FIRST_BLOOM_MIN) return null;
  if (floored > LOTUS_FIRST_BLOOM_MAX) return null;
  return floored;
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function normalizeLotusStepMinutes(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const floored = Math.floor(n);
  if (floored < LOTUS_STEP_MIN) return null;
  if (floored > LOTUS_STEP_MAX) return null;
  return floored;
}

/**
 * @param {unknown} value
 * @param {number} ringCapacity
 * @returns {number | null}
 */
function normalizeLotusEarlyBloomLast(value, ringCapacity) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const floored = Math.floor(n);
  if (floored < LOTUS_EARLY_BLOOM_LAST_MIN) return null;
  if (floored > ringCapacity) return null;
  return floored;
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function normalizeLotusRingCapacity(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const floored = Math.floor(n);
  if (floored < LOTUS_RING_CAPACITY_MIN) return null;
  if (floored > LOTUS_RING_CAPACITY_MAX) return null;
  return floored;
}

/**
 * @param {Record<string, unknown>} o
 * @returns {Pick<GrowthMetricsConfigOverlay, 'lotusFirstBloomMinutes' | 'lotusEarlyStepMinutes' | 'lotusEarlyBloomLast' | 'lotusLaterStepMinutes' | 'lotusRingCapacity'> | null}
 */
function parseLotusStairFields(o) {
  const lotusKeys = [
    'lotusFirstBloomMinutes',
    'lotusEarlyStepMinutes',
    'lotusEarlyBloomLast',
    'lotusLaterStepMinutes',
    'lotusRingCapacity'
  ];
  const hasAny = lotusKeys.some((key) => o[key] !== undefined);
  if (!hasAny) return null;

  const lotusRingCapacity = normalizeLotusRingCapacity(o.lotusRingCapacity);
  if (lotusRingCapacity == null) return null;
  const lotusFirstBloomMinutes = normalizeLotusFirstBloomMinutes(
    o.lotusFirstBloomMinutes
  );
  const lotusEarlyStepMinutes = normalizeLotusStepMinutes(
    o.lotusEarlyStepMinutes
  );
  const lotusEarlyBloomLast = normalizeLotusEarlyBloomLast(
    o.lotusEarlyBloomLast,
    lotusRingCapacity
  );
  const lotusLaterStepMinutes = normalizeLotusStepMinutes(
    o.lotusLaterStepMinutes
  );
  if (
    lotusFirstBloomMinutes == null ||
    lotusEarlyStepMinutes == null ||
    lotusEarlyBloomLast == null ||
    lotusLaterStepMinutes == null
  ) {
    return null;
  }
  return {
    lotusFirstBloomMinutes,
    lotusEarlyStepMinutes,
    lotusEarlyBloomLast,
    lotusLaterStepMinutes,
    lotusRingCapacity
  };
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
  const lotusKeys = [
    'lotusFirstBloomMinutes',
    'lotusEarlyStepMinutes',
    'lotusEarlyBloomLast',
    'lotusLaterStepMinutes',
    'lotusRingCapacity'
  ];
  const hasAnyLotus = lotusKeys.some((key) => o[key] !== undefined);
  const lotus = parseLotusStairFields(o);
  if (hasAnyLotus && !lotus) return null;
  return {
    schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
    dailyScoreCapMinutes,
    lotusFirstBloomMinutes:
      lotus?.lotusFirstBloomMinutes ??
      GROWTH_METRICS_FROZEN_LOTUS_FIRST_BLOOM_MINUTES,
    lotusEarlyStepMinutes:
      lotus?.lotusEarlyStepMinutes ??
      GROWTH_METRICS_FROZEN_LOTUS_EARLY_STEP_MINUTES,
    lotusEarlyBloomLast:
      lotus?.lotusEarlyBloomLast ??
      GROWTH_METRICS_FROZEN_LOTUS_EARLY_BLOOM_LAST,
    lotusLaterStepMinutes:
      lotus?.lotusLaterStepMinutes ??
      GROWTH_METRICS_FROZEN_LOTUS_LATER_STEP_MINUTES,
    lotusRingCapacity:
      lotus?.lotusRingCapacity ?? GROWTH_METRICS_FROZEN_LOTUS_RING_CAPACITY
  };
}

/**
 * @param {GrowthMetricsConfigOverlay} parsed
 * @returns {boolean}
 */
export function growthMetricsConfigOverlayMatchesLocalFreeze(parsed) {
  return (
    parsed.dailyScoreCapMinutes === GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES &&
    parsed.lotusFirstBloomMinutes ===
      GROWTH_METRICS_FROZEN_LOTUS_FIRST_BLOOM_MINUTES &&
    parsed.lotusEarlyStepMinutes ===
      GROWTH_METRICS_FROZEN_LOTUS_EARLY_STEP_MINUTES &&
    parsed.lotusEarlyBloomLast ===
      GROWTH_METRICS_FROZEN_LOTUS_EARLY_BLOOM_LAST &&
    parsed.lotusLaterStepMinutes ===
      GROWTH_METRICS_FROZEN_LOTUS_LATER_STEP_MINUTES &&
    parsed.lotusRingCapacity === GROWTH_METRICS_FROZEN_LOTUS_RING_CAPACITY
  );
}

/** @returns {number} */
export function getDailyScoreCapMinutes() {
  return (
    configOverlay?.dailyScoreCapMinutes ??
    GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES
  );
}

/** @returns {number} */
export function getLotusFirstBloomMinutes() {
  return (
    configOverlay?.lotusFirstBloomMinutes ??
    GROWTH_METRICS_FROZEN_LOTUS_FIRST_BLOOM_MINUTES
  );
}

/** @returns {number} */
export function getLotusEarlyStepMinutes() {
  return (
    configOverlay?.lotusEarlyStepMinutes ??
    GROWTH_METRICS_FROZEN_LOTUS_EARLY_STEP_MINUTES
  );
}

/** @returns {number} */
export function getLotusEarlyBloomLast() {
  return (
    configOverlay?.lotusEarlyBloomLast ??
    GROWTH_METRICS_FROZEN_LOTUS_EARLY_BLOOM_LAST
  );
}

/** @returns {number} */
export function getLotusLaterStepMinutes() {
  return (
    configOverlay?.lotusLaterStepMinutes ??
    GROWTH_METRICS_FROZEN_LOTUS_LATER_STEP_MINUTES
  );
}

/** @returns {number} */
export function getLotusRingCapacity() {
  return (
    configOverlay?.lotusRingCapacity ?? GROWTH_METRICS_FROZEN_LOTUS_RING_CAPACITY
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
