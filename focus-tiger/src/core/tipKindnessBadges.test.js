/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTipBadgeTargetCount,
  computeFreePracticeBadgeTargetCount,
  mergeTipBadgeAwards,
  summarizePracticeDaysForBadges,
  TIP_KINDNESS_BADGE_CATALOG,
  TIP_KINDNESS_BADGE_MAX,
  TIP_KINDNESS_BADGE_MIN
} from './tipKindnessBadges.js';

describe('tipKindnessBadges', () => {
  it('catalog has nine distinct ids', () => {
    assert.equal(TIP_KINDNESS_BADGE_CATALOG.length, TIP_KINDNESS_BADGE_MAX);
    assert.equal(TIP_KINDNESS_BADGE_MAX, 9);
    const ids = new Set(TIP_KINDNESS_BADGE_CATALOG.map((b) => b.id));
    assert.equal(ids.size, 9);
  });

  it('no practice → minimum 3 badges (paid)', () => {
    assert.equal(computeTipBadgeTargetCount({}), TIP_KINDNESS_BADGE_MIN);
    assert.equal(
      computeTipBadgeTargetCount({ practiceDayCount: 0, lifetimeMinutes: 0 }),
      3
    );
  });

  it('free: no practice → 0; first practice → 1', () => {
    assert.equal(computeFreePracticeBadgeTargetCount({}), 0);
    assert.equal(
      computeFreePracticeBadgeTargetCount({
        practiceDayCount: 1,
        lifetimeMinutes: 5
      }),
      1
    );
  });

  it('scales with days + hours toward 9', () => {
    assert.equal(
      computeTipBadgeTargetCount({ practiceDayCount: 3, lifetimeMinutes: 0 }),
      4
    );
    assert.equal(
      computeTipBadgeTargetCount({ practiceDayCount: 1, lifetimeMinutes: 120 }),
      4
    );
    assert.equal(
      computeTipBadgeTargetCount({ practiceDayCount: 20, lifetimeMinutes: 600 }),
      9
    );
  });

  it('summarize counts lit days and known minutes', () => {
    const s = summarizePracticeDaysForBadges([
      { date: '2026-08-01', totalMinutes: null },
      { date: '2026-08-02', totalMinutes: 25 },
      { date: '2026-08-03', totalMinutes: 0 }
    ]);
    assert.equal(s.practiceDayCount, 2);
    assert.equal(s.lifetimeMinutes, 25);
  });

  it('re-tip at same level adds zero badges', () => {
    const first = mergeTipBadgeAwards([], 3);
    assert.equal(first.badgeIds.length, 3);
    assert.equal(first.newlyAddedIds.length, 3);
    const again = mergeTipBadgeAwards(first.badgeIds, 3);
    assert.deepEqual(again.badgeIds, first.badgeIds);
    assert.deepEqual(again.newlyAddedIds, []);
  });

  it('higher level only grows the prefix set', () => {
    const low = mergeTipBadgeAwards([], 3);
    const high = mergeTipBadgeAwards(low.badgeIds, 5);
    assert.equal(high.badgeIds.length, 5);
    assert.equal(high.newlyAddedIds.length, 2);
    assert.ok(high.badgeIds.slice(0, 3).every((id, i) => id === low.badgeIds[i]));
  });
});
