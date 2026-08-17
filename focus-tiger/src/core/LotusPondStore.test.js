/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PRACTICE_DAYS_MAX_ENTRIES } from './PracticeDaysStore.js';
import {
  LOTUS_POND_STORAGE_KEY,
  LotusPondStore
} from './LotusPondStore.js';

function createStorage(seed) {
  const values = new Map(seed ? Object.entries(seed) : []);
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
    removeItem: (k) => values.delete(k),
    _values: values
  };
}

describe('LotusPondStore', () => {
  it('uses an independent key (not the 90-day practice-days window)', () => {
    assert.equal(LOTUS_POND_STORAGE_KEY, 'focus-tiger.lotus-pond.v1');
    assert.notEqual(LOTUS_POND_STORAGE_KEY, 'focus-tiger.practice-days.v1');
    assert.equal(PRACTICE_DAYS_MAX_ENTRIES, 90);
  });

  it('only-adds minutes and reports newly earned bloom indices', () => {
    const store = new LotusPondStore({ storage: createStorage() });
    const first = store.addMinutes(25);
    assert.equal(first.previousMinutes, 0);
    assert.equal(first.nextMinutes, 25);
    assert.deepEqual(first.newBloomIndices, [0]);
    const none = store.addMinutes(0);
    assert.equal(none.nextMinutes, 25);
    assert.deepEqual(none.newBloomIndices, []);
    const neg = store.addMinutes(-10);
    assert.equal(neg.nextMinutes, 25);
    store.addMinutes(15);
    assert.equal(store.getLifetimeMinutes(), 40);
    assert.equal(store.getVisibleBloomCount(), 1);
  });

  it('keeps accruing past the visual cap without a 13th flower', () => {
    const store = new LotusPondStore({ storage: createStorage() });
    store.replaceLifetimeMinutes(440);
    assert.equal(store.getVisibleBloomCount(), 12);
    const extra = store.addMinutes(80);
    assert.equal(extra.nextMinutes, 520);
    assert.equal(extra.nextBloomCount, 12);
    assert.deepEqual(extra.newBloomIndices, []);
  });

  it('reads a QA-written payload on construct', () => {
    const storage = createStorage({
      [LOTUS_POND_STORAGE_KEY]: JSON.stringify({ lifetimeMinutes: 439 })
    });
    const store = new LotusPondStore({ storage });
    assert.equal(store.getLifetimeMinutes(), 439);
    assert.equal(store.getVisibleBloomCount(), 11);
  });
});
