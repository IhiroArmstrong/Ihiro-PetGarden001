/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES,
  GROWTH_METRICS_SCHEMA_VERSION,
  getGrowthMetricsConfigOverlay,
  growthMetricsConfigOverlayMatchesLocalFreeze,
  isGrowthMetricsCloudConfirmed,
  parseGrowthMetricsConfigOverlay,
  resetGrowthMetricsConfigOverlayForTests,
  setGrowthMetricsConfigOverlay,
  getDailyScoreCapMinutes,
  markGrowthMetricsCloudOk
} from './growthMetricsConfigOverlay.js';

afterEach(() => {
  resetGrowthMetricsConfigOverlayForTests();
});

test('parseGrowthMetricsConfigOverlay accepts schema 1 and rejects schema 2', () => {
  assert.deepEqual(parseGrowthMetricsConfigOverlay({ schemaVersion: 1, dailyScoreCapMinutes: 240 }), {
    schemaVersion: 1,
    dailyScoreCapMinutes: 240,
    lotusFirstBloomMinutes: 25,
    lotusEarlyStepMinutes: 25,
    lotusEarlyBloomLast: 5,
    lotusLaterStepMinutes: 45,
    lotusRingCapacity: 12
  });
  assert.equal(parseGrowthMetricsConfigOverlay({ schemaVersion: 2, dailyScoreCapMinutes: 240 }), null);
  assert.equal(parseGrowthMetricsConfigOverlay({ schemaVersion: 1, dailyScoreCapMinutes: 59 }), null);
  assert.equal(
    parseGrowthMetricsConfigOverlay({
      schemaVersion: 1,
      dailyScoreCapMinutes: 180,
      lotusFirstBloomMinutes: 20
    }),
    null
  );
});

test('getDailyScoreCapMinutes uses overlay when set', () => {
  assert.equal(getDailyScoreCapMinutes(), GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES);
  setGrowthMetricsConfigOverlay({
    schemaVersion: 1,
    dailyScoreCapMinutes: 240,
    lotusFirstBloomMinutes: 25,
    lotusEarlyStepMinutes: 25,
    lotusEarlyBloomLast: 5,
    lotusLaterStepMinutes: 45,
    lotusRingCapacity: 12
  });
  assert.equal(getDailyScoreCapMinutes(), 240);
});

test('freeze match marks cloud ok without retaining duplicate overlay', () => {
  const parsed = parseGrowthMetricsConfigOverlay({
    schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
    dailyScoreCapMinutes: GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES
  });
  assert.ok(parsed);
  assert.equal(growthMetricsConfigOverlayMatchesLocalFreeze(parsed), true);
  markGrowthMetricsCloudOk();
  assert.equal(isGrowthMetricsCloudConfirmed(), true);
  assert.equal(getGrowthMetricsConfigOverlay(), null);
});
