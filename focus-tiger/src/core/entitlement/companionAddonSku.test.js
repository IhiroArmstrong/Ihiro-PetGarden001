/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lifetime AI companion add-on SKU must stay outside isEntitled.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  FEATURE_CATALOG,
  applyEntitlementPatch,
  isEntitled,
  isKnownFeatureKey
} from './entitlementGate.js';
import { SANCTUARY_LIFETIME_ITEM_ID } from '../sanctuaryEntitlementGate.js';
import {
  COMPANION_ADDON_LIFETIME_ITEM_ID,
  COMPANION_ADDON_LIFETIME_PRICE_USD,
  COMPANION_ADDON_LIFETIME_SKU,
  companionAddonIsCatalogIsolated,
  isCompanionAddonLifetimeSku,
  mayOfferCompanionLifetimeAddon
} from './companionAddonSku.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('companion.addon.lifetime SKU isolation', () => {
  it('keeps a stable SKU id separate from Sanctuary Lifetime', () => {
    assert.equal(COMPANION_ADDON_LIFETIME_SKU, 'companion.addon.lifetime');
    assert.equal(COMPANION_ADDON_LIFETIME_ITEM_ID, COMPANION_ADDON_LIFETIME_SKU);
    assert.equal(COMPANION_ADDON_LIFETIME_PRICE_USD, 29.99);
    assert.notEqual(COMPANION_ADDON_LIFETIME_SKU, SANCTUARY_LIFETIME_ITEM_ID);
    assert.equal(isCompanionAddonLifetimeSku(COMPANION_ADDON_LIFETIME_SKU), true);
    assert.equal(isCompanionAddonLifetimeSku(SANCTUARY_LIFETIME_ITEM_ID), false);
  });

  it('is not a FEATURE_CATALOG / isEntitled key', () => {
    assert.equal(companionAddonIsCatalogIsolated(FEATURE_CATALOG), true);
    assert.equal(isKnownFeatureKey(COMPANION_ADDON_LIFETIME_SKU), false);
    assert.equal(
      COMPANION_ADDON_LIFETIME_SKU in FEATURE_CATALOG,
      false,
      'adding this SKU to FEATURE_CATALOG would let lifetime ∪ subscription grant companion'
    );
  });

  it('Lifetime still unlocks B-track via isEntitled without the add-on', () => {
    const storage = memoryStorage();
    applyEntitlementPatch(
      {
        lifetime: {
          active: true,
          unlockedAt: '2026-08-20T00:00:00.000Z',
          itemId: SANCTUARY_LIFETIME_ITEM_ID,
          via: 'mock'
        }
      },
      { storage, notify: false, markVerified: false }
    );
    assert.equal(isEntitled('ambient.deep.play', { storage }), true);
    assert.equal(isEntitled('ritual.morning.access', { storage }), true);
    assert.equal(
      isEntitled(COMPANION_ADDON_LIFETIME_SKU, { storage }),
      false,
      'isEntitled must not grant the add-on SKU'
    );
  });

  it('offers the add-on only to Lifetime holders', () => {
    assert.equal(mayOfferCompanionLifetimeAddon({ lifetimeActive: true }), true);
    assert.equal(mayOfferCompanionLifetimeAddon({ lifetimeActive: false }), false);
    assert.equal(mayOfferCompanionLifetimeAddon({}), false);
  });
});
