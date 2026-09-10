/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Non-blocking growth-metrics config fetch. Failure / timeout / unknown schema → local tables.
 * Never gates Sit / Rise.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import {
  GROWTH_METRICS_SCHEMA_VERSION,
  getDailyScoreCapMinutes,
  growthMetricsConfigOverlayMatchesLocalFreeze,
  isGrowthMetricsCloudConfirmed,
  markGrowthMetricsCloudOk,
  parseGrowthMetricsConfigOverlay,
  setGrowthMetricsConfigOverlay
} from './growthMetricsConfigOverlay.js';

export const GROWTH_METRICS_FETCH_TIMEOUT_MS = 2500;
export const GROWTH_METRICS_QUERY_PARAM = 'growthMetrics';
export const GROWTH_METRICS_WAIT_APPLY_MS = 20000;

/**
 * @param {string} [search]
 * @returns {'1' | '0' | null}
 */
export function readGrowthMetricsQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(GROWTH_METRICS_QUERY_PARAM);
    if (value === '1' || value === 'true') return '1';
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {{ search?: string, cloudBaseUrl?: string }} [opts]
 * @returns {boolean}
 */
export function isGrowthMetricsFetchEnabled({
  search = '',
  cloudBaseUrl = getCloudApiBaseUrl()
} = {}) {
  const query = readGrowthMetricsQueryFlag(search);
  if (query === '0') return false;
  if (query === '1') return Boolean(cloudBaseUrl);
  return Boolean(cloudBaseUrl);
}

/**
 * @param {Promise<unknown>} promise
 * @param {number} ms
 * @returns {Promise<unknown>}
 */
function withTimeout(promise, ms) {
  let timer = 0;
  const timeout = new Promise((_, reject) => {
    timer = /** @type {any} */ (
      setTimeout(() => reject(new Error('growth_metrics_timeout')), ms)
    );
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/** @type {import('./growthMetricsConfigOverlay.js').GrowthMetricsConfigOverlay | null} */
let pendingConfig = null;
/** @type {ReturnType<typeof setTimeout> | 0} */
let flushTimer = 0;

/**
 * @param {() => boolean} canApply
 */
function schedulePendingFlush(canApply) {
  if (flushTimer) return;
  flushTimer = /** @type {any} */ (
    setTimeout(() => {
      flushTimer = 0;
      flushPendingGrowthMetricsApply(canApply);
    }, 500)
  );
}

/**
 * @param {() => boolean} [canApply]
 * @returns {boolean}
 */
export function flushPendingGrowthMetricsApply(canApply = () => true) {
  if (!pendingConfig) return false;
  if (!canApply()) {
    schedulePendingFlush(canApply);
    return false;
  }
  setGrowthMetricsConfigOverlay(pendingConfig);
  markGrowthMetricsCloudOk();
  pendingConfig = null;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = 0;
  }
  return true;
}

export function resetGrowthMetricsConfigSyncForTests() {
  pendingConfig = null;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = 0;
  }
}

/**
 * @param {() => boolean} canApply
 * @param {number} waitMs
 */
async function waitUntilCanApply(canApply, waitMs) {
  const started = Date.now();
  while (!canApply()) {
    if (Date.now() - started >= waitMs) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

/**
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {typeof postCloudJson} [opts.postJson]
 * @param {number} [opts.timeoutMs]
 * @param {string} [opts.cloudBaseUrl]
 * @param {() => boolean} [opts.canApply]
 * @param {number} [opts.waitApplyMs]
 * @returns {Promise<{ growthMetrics: boolean }>}
 */
export async function prefetchGrowthMetricsConfig(opts = {}) {
  const search =
    opts.search ??
    (typeof location !== 'undefined' ? String(location.search || '') : '');
  const cloudBaseUrl = opts.cloudBaseUrl ?? getCloudApiBaseUrl();
  if (!isGrowthMetricsFetchEnabled({ search, cloudBaseUrl })) {
    return { growthMetrics: false };
  }

  const canApply = opts.canApply ?? (() => true);
  await waitUntilCanApply(canApply, opts.waitApplyMs ?? GROWTH_METRICS_WAIT_APPLY_MS);

  const postJson = opts.postJson ?? postCloudJson;
  const timeoutMs = opts.timeoutMs ?? GROWTH_METRICS_FETCH_TIMEOUT_MS;

  let growthMetrics = false;

  try {
    const payload = await withTimeout(
      postJson('/api/growth-metrics-config', {
        body: JSON.stringify({ clientSchema: GROWTH_METRICS_SCHEMA_VERSION })
      }),
      timeoutMs
    );
    const parsed = parseGrowthMetricsConfigOverlay(payload);
    if (parsed) {
      growthMetrics = true;
      if (growthMetricsConfigOverlayMatchesLocalFreeze(parsed)) {
        markGrowthMetricsCloudOk();
      } else if (canApply()) {
        setGrowthMetricsConfigOverlay(parsed);
        markGrowthMetricsCloudOk();
      } else {
        pendingConfig = parsed;
        schedulePendingFlush(canApply);
      }
    }
  } catch {
    // Silent — local freeze table remains authoritative offline.
  }

  return { growthMetrics };
}

/**
 * @returns {{ growthMetrics: boolean, dailyScoreCapMinutes: number }}
 */
export function getGrowthMetricsStatus() {
  return {
    growthMetrics: isGrowthMetricsCloudConfirmed(),
    dailyScoreCapMinutes: getDailyScoreCapMinutes()
  };
}
