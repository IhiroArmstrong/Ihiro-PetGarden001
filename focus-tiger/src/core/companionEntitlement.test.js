/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPANION_ENTITLEMENT_STORAGE_KEY,
  FOCUS_TIGER_PRO_PLAN_ID,
  isCompanionEntitled,
  isCompanionEntitledHarness,
  isProSubscriptionActive,
  writeCompanionEntitlementCache
} from './companionEntitlement.js';
import { markCompanionAddonFromPayment } from './companionAddonCheckout.js';
import { applyEntitlementPatch } from './entitlement/entitlementGate.js';
import { ENTITLEMENT_CACHE_STORAGE_KEY } from './entitlement/entitlementState.js';

function memStorage() {
  /** @type {Record<string, string>} */
  const map = {};
  return /** @type {Storage} */ ({
    getItem(k) {
      return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null;
    },
    setItem(k, v) {
      map[k] = String(v);
    },
    removeItem(k) {
      delete map[k];
    },
    clear() {
      for (const k of Object.keys(map)) delete map[k];
    },
    key() {
      return null;
    },
    get length() {
      return Object.keys(map).length;
    }
  });
}

describe('companionEntitlement', () => {
  test('harness ?companionEntitled=1 grants access', () => {
    assert.equal(isCompanionEntitledHarness('?product=1&companionEntitled=1'), true);
    assert.equal(
      isCompanionEntitled({ storage: memStorage(), search: '?companionEntitled=1' }),
      true
    );
  });

  test('Pro subscription plan unlocks companion', () => {
    const storage = memStorage();
    const ends = new Date(Date.now() + 86400000).toISOString();
    applyEntitlementPatch(
      {
        subscription: {
          active: true,
          periodEndsAt: ends,
          planId: FOCUS_TIGER_PRO_PLAN_ID,
          via: 'payment'
        }
      },
      { storage, markVerified: true }
    );
    assert.equal(isProSubscriptionActive({ storage }), true);
    assert.equal(isCompanionEntitled({ storage }), true);
    assert.ok(storage.getItem(ENTITLEMENT_CACHE_STORAGE_KEY));
  });

  test('Lifetime add-on cache unlocks companion without FEATURE_CATALOG', () => {
    const storage = memStorage();
    markCompanionAddonFromPayment(storage);
    assert.equal(isCompanionEntitled({ storage }), true);
    assert.ok(storage.getItem(COMPANION_ENTITLEMENT_STORAGE_KEY));
  });

  test('Base membership alone does not unlock companion', () => {
    const storage = memStorage();
    const ends = new Date(Date.now() + 86400000).toISOString();
    applyEntitlementPatch(
      {
        subscription: {
          active: true,
          periodEndsAt: ends,
          planId: 'yin-membership',
          via: 'payment'
        }
      },
      { storage, markVerified: true }
    );
    assert.equal(isCompanionEntitled({ storage }), false);
  });

  test('writeCompanionEntitlementCache round-trip', () => {
    const storage = memStorage();
    writeCompanionEntitlementCache(storage, {
      active: true,
      itemId: 'companion.addon.lifetime',
      via: 'payment'
    });
    assert.equal(isCompanionEntitled({ storage }), true);
  });
});
