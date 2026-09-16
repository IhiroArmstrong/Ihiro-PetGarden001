/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  reconcileEntitlementCacheAfterRestore,
  reconcileEntitlementAfterPracticeRestore
} from './practiceBackupEntitlementReconcile.js';
import {
  ENTITLEMENT_CACHE_STORAGE_KEY,
  readEntitlementCache
} from '../entitlement/entitlementState.js';
import { SANCTUARY_STORAGE_KEY } from '../sanctuaryEntitlementGate.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

describe('reconcileEntitlementCacheAfterRestore', () => {
  it('seeds lifetime cache from sanctuary unlock without exporting cache', () => {
    const storage = memoryStorage({
      [SANCTUARY_STORAGE_KEY]: JSON.stringify({
        unlocked: true,
        unlockedVia: 'payment',
        unlockedAt: '2026-08-01T00:00:00.000Z',
        itemId: 'yin-sanctuary-lifetime',
        badgeIds: ['silver-gold-rim']
      })
    });
    const result = reconcileEntitlementCacheAfterRestore(storage);
    assert.equal(result.seeded, true);
    const cache = readEntitlementCache(storage);
    assert.equal(cache.lifetime.active, true);
    assert.equal(cache.lifetime.itemId, 'yin-sanctuary-lifetime');
    assert.equal(cache.lifetime.via, 'payment');
  });

  it('does not write cache when sanctuary is not unlocked', () => {
    const storage = memoryStorage({
      [SANCTUARY_STORAGE_KEY]: JSON.stringify({
        unlocked: false,
        unlockedVia: null,
        unlockedAt: null,
        itemId: 'yin-sanctuary-lifetime',
        badgeIds: ['silver-gold-rim']
      })
    });
    const result = reconcileEntitlementCacheAfterRestore(storage);
    assert.equal(result.seeded, false);
    assert.equal(storage.getItem(ENTITLEMENT_CACHE_STORAGE_KEY), null);
  });
});

describe('reconcileEntitlementAfterPracticeRestore', () => {
  it('returns noop refresh when provider is absent', async () => {
    const storage = memoryStorage();
    const result = await reconcileEntitlementAfterPracticeRestore(storage, {
      provider: null
    });
    assert.equal(result.refresh, 'noop');
  });
});
