/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { LOTUS_POND_STORAGE_KEY } from './LotusPondStore.js';
import { PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';
import { resolveMustardSeedSeal } from './mustardSeedSeal.js';
import { planSanctuaryBadgeAward } from './sanctuaryBadges.js';
import { planTipBadgeAward, TIP_KINDNESS_BADGE_MAX } from './tipKindnessBadges.js';

function memoryStorage(seed = {}) {
  /** @type {Record<string, string>} */
  const map = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
    },
    setItem(key, value) {
      map[key] = String(value);
    },
    removeItem(key) {
      delete map[key];
    }
  };
}

/** Lotus lifetime >> 90-day practice-days sum (Batch 2 regression). */
function seedLongHorizonMismatch(storage) {
  storage.setItem(
    PRACTICE_DAYS_STORAGE_KEY,
    JSON.stringify({
      days: [{ date: '2026-08-01', totalMinutes: 10 }]
    })
  );
  storage.setItem(
    LOTUS_POND_STORAGE_KEY,
    JSON.stringify({ lifetimeMinutes: 3600 })
  );
}

describe('practiceAggregate Batch 2 consumers', () => {
  it('tip badges use lotus lifetime, not 90-day minutes sum', () => {
    const storage = memoryStorage();
    seedLongHorizonMismatch(storage);
    const award = planTipBadgeAward(storage, [], { mode: 'paid' });
    assert.equal(award.summary.practiceDayCount, 1);
    assert.equal(award.summary.lifetimeMinutes, 3600);
    assert.equal(award.targetCount, TIP_KINDNESS_BADGE_MAX);
  });

  it('sanctuary badges use lotus lifetime, not 90-day minutes sum', () => {
    const storage = memoryStorage();
    seedLongHorizonMismatch(storage);
    const award = planSanctuaryBadgeAward(storage, []);
    assert.equal(award.summary.lifetimeMinutes, 3600);
    assert.ok(award.targetCount >= 10);
  });

  it('mustard seed unlocks from aggregate score when lotus carries lifetime', () => {
    const storage = memoryStorage();
    seedLongHorizonMismatch(storage);
    const resolved = resolveMustardSeedSeal(storage);
    assert.equal(resolved.summary.lifetimeMinutes, 3600);
    assert.ok(resolved.score >= 21);
    assert.equal(resolved.unlocked, true);
  });
});
