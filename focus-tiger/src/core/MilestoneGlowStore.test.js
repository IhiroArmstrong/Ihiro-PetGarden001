import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MilestoneGlowStore,
  projectedStreakIncludingToday,
  resolveMilestoneGlowNodeId
} from './MilestoneGlowStore.js';
import { countRecentPracticeStreak } from './PracticeDaysStore.js';

describe('resolveMilestoneGlowNodeId', () => {
  it('offers streak-7 once when streak crosses 7', () => {
    assert.equal(resolveMilestoneGlowNodeId(6, []), null);
    assert.equal(resolveMilestoneGlowNodeId(7, []), 'streak-7');
    assert.equal(resolveMilestoneGlowNodeId(7, ['streak-7']), null);
    assert.equal(resolveMilestoneGlowNodeId(21, ['streak-7']), 'streak-21');
  });
});

describe('projectedStreakIncludingToday', () => {
  it('counts today even before markToday persists', () => {
    const streak = projectedStreakIncludingToday(
      ['2026-07-25', '2026-07-26', '2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30'],
      '2026-07-31',
      countRecentPracticeStreak
    );
    assert.equal(streak, 7);
  });
});

describe('MilestoneGlowStore', () => {
  it('claimOffer marks once and never re-offers', () => {
    const mem = new Map();
    const storage = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => {
        mem.set(k, String(v));
      }
    };
    const store = new MilestoneGlowStore({ storage });
    assert.equal(store.claimOffer(7), 'streak-7');
    assert.equal(store.claimOffer(7), null);
    assert.equal(store.peekOffer(7), null);
    assert.ok(store.getPlayedIds().has('streak-7'));
  });
});
