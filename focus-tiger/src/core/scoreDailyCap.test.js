/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_SCORE_CAP_MINUTES,
  capDailyMinutesForScore,
  resolvePersonaScoreEligibleMinutes,
  resolveScoreEligibleIncrement
} from './scoreDailyCap.js';
import {
  resetGrowthMetricsConfigOverlayForTests,
  setGrowthMetricsConfigOverlay
} from './growthMetricsConfigOverlay.js';

describe('scoreDailyCap', () => {
  it('caps a single day at 180 minutes for score', () => {
    assert.equal(capDailyMinutesForScore(600), DAILY_SCORE_CAP_MINUTES);
    assert.equal(capDailyMinutesForScore(60), 60);
  });

  it('resolveScoreEligibleIncrement respects remaining daily headroom', () => {
    assert.deepEqual(resolveScoreEligibleIncrement(0, 200), {
      eligibleAdd: 180,
      overflow: 20
    });
    assert.deepEqual(resolveScoreEligibleIncrement(170, 20), {
      eligibleAdd: 10,
      overflow: 10
    });
    assert.deepEqual(resolveScoreEligibleIncrement(180, 5), {
      eligibleAdd: 0,
      overflow: 5
    });
  });

  it('resolvePersonaScoreEligibleMinutes models binge vs spread fixtures', () => {
    assert.equal(
      resolvePersonaScoreEligibleMinutes({
        practiceDayCount: 1,
        lifetimeMinutes: 600
      }),
      180
    );
    assert.equal(
      resolvePersonaScoreEligibleMinutes({
        practiceDayCount: 30,
        lifetimeMinutes: 5000
      }),
      5000
    );
    assert.equal(
      resolvePersonaScoreEligibleMinutes({
        practiceDayCount: 1,
        lifetimeMinutes: 1440
      }),
      180
    );
  });

  it('capDailyMinutesForScore respects remote overlay when applied', () => {
    setGrowthMetricsConfigOverlay({ schemaVersion: 1, dailyScoreCapMinutes: 240 });
    assert.equal(capDailyMinutesForScore(600), 240);
    resetGrowthMetricsConfigOverlayForTests();
    assert.equal(capDailyMinutesForScore(600), DAILY_SCORE_CAP_MINUTES);
  });
});
