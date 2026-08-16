/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { HonestyBridgeStore } from './HonestyBridgeStore.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

test('HonestyBridgeStore is false until marked; resets next local day', () => {
  const storage = createStorage();
  let day = new Date(2026, 6, 19, 12);
  const store = new HonestyBridgeStore({
    storage,
    now: () => day
  });

  assert.equal(store.hasShownToday(), false);
  store.markShown();
  assert.equal(store.hasShownToday(), true);
  store.markShown();
  assert.equal(store.hasShownToday(), true);

  day = new Date(2026, 6, 20, 9);
  assert.equal(store.hasShownToday(), false);
});
