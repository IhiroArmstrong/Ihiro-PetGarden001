/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES,
  GROWTH_METRICS_SCHEMA_VERSION,
  getDailyScoreCapMinutes,
  getGrowthMetricsConfigOverlay,
  isGrowthMetricsCloudConfirmed,
  resetGrowthMetricsConfigOverlayForTests
} from './growthMetricsConfigOverlay.js';
import {
  getGrowthMetricsStatus,
  isGrowthMetricsFetchEnabled,
  prefetchGrowthMetricsConfig,
  resetGrowthMetricsConfigSyncForTests
} from './growthMetricsConfigSync.js';

afterEach(() => {
  resetGrowthMetricsConfigSyncForTests();
  resetGrowthMetricsConfigOverlayForTests();
});

const freezePayload = {
  schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
  dailyScoreCapMinutes: GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES,
  lotusFirstBloomMinutes: 25,
  lotusEarlyStepMinutes: 25,
  lotusEarlyBloomLast: 5,
  lotusLaterStepMinutes: 45,
  lotusRingCapacity: 12
};

test('isGrowthMetricsFetchEnabled respects query flag and cloud base', () => {
  assert.equal(isGrowthMetricsFetchEnabled({ search: '?growthMetrics=0', cloudBaseUrl: 'https://x' }), false);
  assert.equal(isGrowthMetricsFetchEnabled({ search: '?growthMetrics=1', cloudBaseUrl: '' }), false);
  assert.equal(isGrowthMetricsFetchEnabled({ search: '', cloudBaseUrl: 'https://x' }), true);
});

test('prefetchGrowthMetricsConfig confirms freeze-identical without retaining overlay', async () => {
  const applied = await prefetchGrowthMetricsConfig({
    search: '',
    cloudBaseUrl: 'https://example.test',
    postJson: async () => freezePayload
  });
  assert.equal(applied.growthMetrics, true);
  assert.equal(isGrowthMetricsCloudConfirmed(), true);
  assert.equal(getGrowthMetricsConfigOverlay(), null);
  assert.equal(getDailyScoreCapMinutes(), GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES);
});

test('prefetchGrowthMetricsConfig retains overlay when cap differs from freeze', async () => {
  const applied = await prefetchGrowthMetricsConfig({
    search: '',
    cloudBaseUrl: 'https://example.test',
    postJson: async () => ({ schemaVersion: 1, dailyScoreCapMinutes: 240 })
  });
  assert.equal(applied.growthMetrics, true);
  assert.equal(getDailyScoreCapMinutes(), 240);
  assert.deepEqual(getGrowthMetricsStatus(), {
    growthMetrics: true,
    dailyScoreCapMinutes: 240,
    lotusFirstBloomMinutes: 25,
    lotusEarlyStepMinutes: 25,
    lotusEarlyBloomLast: 5,
    lotusLaterStepMinutes: 45,
    lotusRingCapacity: 12
  });
});

test('prefetchGrowthMetricsConfig fails silently on timeout', async () => {
  const applied = await prefetchGrowthMetricsConfig({
    search: '',
    cloudBaseUrl: 'https://example.test',
    timeoutMs: 5,
    postJson: () => new Promise(() => {})
  });
  assert.equal(applied.growthMetrics, false);
  assert.equal(isGrowthMetricsCloudConfirmed(), false);
});
