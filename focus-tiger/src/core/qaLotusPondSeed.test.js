/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LOTUS_POND_STORAGE_KEY } from './LotusPondStore.js';
import {
  applyQaLotusPondSeedFromSearch,
  parseQaLotusBlooms
} from './qaLotusPondSeed.js';

function createStorage(seed) {
  const values = new Map(seed ? Object.entries(seed) : []);
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
    removeItem: (k) => values.delete(k),
    _values: values
  };
}

describe('qaLotusPondSeed', () => {
  it('parseQaLotusBlooms ignores missing / invalid and clamps', () => {
    assert.equal(parseQaLotusBlooms(''), null);
    assert.equal(parseQaLotusBlooms('?product=1'), null);
    assert.equal(parseQaLotusBlooms('?qaLotusBlooms=nope'), null);
    assert.equal(parseQaLotusBlooms('?qaLotusBlooms=-1'), null);
    assert.equal(parseQaLotusBlooms('?qaLotusBlooms=0'), 0);
    assert.equal(parseQaLotusBlooms('?qaLotusBlooms=11'), 11);
    assert.equal(parseQaLotusBlooms('?qaLotusBlooms=11.9'), 11);
    assert.equal(parseQaLotusBlooms('?qaLotusBlooms=99'), 12);
  });

  it('writes lifetime minutes so N blooms show and N+1 can birth', () => {
    const storage = createStorage();
    const result = applyQaLotusPondSeedFromSearch({
      search: '?product=1&sessionMinutes=1&qaLotusBlooms=11',
      storage
    });
    assert.equal(result.applied, true);
    assert.equal(result.seededBlooms, 11);
    assert.equal(result.lifetimeMinutes, 439);
    const parsed = JSON.parse(storage.getItem(LOTUS_POND_STORAGE_KEY));
    assert.equal(parsed.lifetimeMinutes, 439);
  });

  it('no-ops without the qa flag', () => {
    const storage = createStorage();
    const result = applyQaLotusPondSeedFromSearch({
      search: '?product=1',
      storage
    });
    assert.equal(result.applied, false);
    assert.equal(storage.getItem(LOTUS_POND_STORAGE_KEY), null);
  });
});
