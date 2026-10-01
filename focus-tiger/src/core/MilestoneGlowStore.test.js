/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MilestoneGlowStore,
  MILESTONE_GLOW_STORAGE_KEY,
  normalizeMilestoneGlowState,
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

describe('normalizeMilestoneGlowState', () => {
  it('reads legacy played[] without placeholder fields', () => {
    const state = normalizeMilestoneGlowState({
      played: ['streak-7', 'streak-21']
    });
    assert.deepEqual(state, {
      records: [{ id: 'streak-7' }, { id: 'streak-21' }]
    });
  });

  it('keeps optional placeholder fields on records', () => {
    const state = normalizeMilestoneGlowState({
      records: [
        {
          id: 'streak-7',
          origin: 'sit-timed',
          journey_id: '2026-09-20T08:00:00.000Z',
          rarity_basis: { score: 21, streakDays: 7 }
        }
      ]
    });
    assert.deepEqual(state.records[0], {
      id: 'streak-7',
      origin: 'sit-timed',
      journey_id: '2026-09-20T08:00:00.000Z',
      rarity_basis: { score: 21, streakDays: 7 }
    });
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
    assert.deepEqual(store.getRecords(), [
      {
        id: 'streak-7',
        rarity_basis: 'consecutive-practice-days-7',
        origin: 'consecutive-practice-days',
        journey_id: 'streak-7'
      }
    ]);
  });

  it('persists scheme D provenance for streak-21 and streak-100', () => {
    const store = new MilestoneGlowStore({ storage: null });
    assert.equal(store.claimOffer(7), 'streak-7');
    assert.equal(store.claimOffer(21), 'streak-21');
    assert.deepEqual(store.getRecords()[1], {
      id: 'streak-21',
      rarity_basis: 'consecutive-practice-days-21',
      origin: 'consecutive-practice-days',
      journey_id: 'streak-21'
    });
    assert.equal(store.claimOffer(100), 'streak-100');
    assert.deepEqual(store.getRecords().at(-1), {
      id: 'streak-100',
      rarity_basis: 'consecutive-practice-days-100',
      origin: 'consecutive-practice-days',
      journey_id: 'streak-100'
    });
  });

  it('explicit meta overrides catalog provenance when provided', () => {
    const mem = new Map();
    const storage = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => {
        mem.set(k, String(v));
      }
    };
    const store = new MilestoneGlowStore({ storage });
    assert.equal(
      store.claimOffer(7, { journey_id: 'custom-journey-alias' }),
      'streak-7'
    );
    const persisted = JSON.parse(mem.get(MILESTONE_GLOW_STORAGE_KEY));
    assert.deepEqual(persisted.records, [
      {
        id: 'streak-7',
        rarity_basis: 'consecutive-practice-days-7',
        origin: 'consecutive-practice-days',
        journey_id: 'custom-journey-alias'
      }
    ]);
  });

  it('loads legacy played[] without backfilling placeholders', () => {
    const mem = new Map([
      [
        MILESTONE_GLOW_STORAGE_KEY,
        JSON.stringify({ played: ['streak-7'] })
      ]
    ]);
    const storage = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => {
        mem.set(k, String(v));
      }
    };
    const store = new MilestoneGlowStore({ storage });
    assert.deepEqual(store.getRecords(), [{ id: 'streak-7' }]);
    assert.equal(store.peekOffer(7), null);
  });
});
