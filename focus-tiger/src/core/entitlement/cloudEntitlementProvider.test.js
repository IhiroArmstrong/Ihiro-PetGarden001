/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCloudEntitlementProvider,
  createMembershipPortalSession
} from './cloudEntitlementProvider.js';
import {
  MEMBERSHIP_DEVICE_CREDENTIAL_KEY,
  writeMembershipDeviceCredential
} from '../membershipDeviceCredential.js';
import {
  applyEntitlementPatch,
  getEntitlementState,
  refreshEntitlement,
  setEntitlementProvider
} from './entitlementGate.js';

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

describe('cloudEntitlementProvider', () => {
  it('fetchEntitlement maps active subscription patch', async () => {
    const storage = memoryStorage();
    writeMembershipDeviceCredential(storage, {
      email: 'm@example.com',
      deviceToken: 'a'.repeat(32)
    });
    const provider = createCloudEntitlementProvider({
      storage,
      getApiBaseUrl: () => 'http://127.0.0.1:8787',
      postJson: async () => ({
        active: true,
        unlocked: true,
        periodEndsAt: '2026-09-10T00:00:00.000Z',
        planId: 'yin-membership',
        subscription: {
          active: true,
          periodEndsAt: '2026-09-10T00:00:00.000Z',
          planId: 'yin-membership',
          via: 'payment'
        }
      })
    });
    const patch = await provider.fetchEntitlement();
    assert.equal(patch?.subscription?.active, true);
    assert.equal(patch?.subscription?.periodEndsAt, '2026-09-10T00:00:00.000Z');
  });

  it('missing credential throws → refreshEntitlement keeps cache as grace', async () => {
    const storage = memoryStorage();
    applyEntitlementPatch(
      {
        subscription: {
          active: true,
          periodEndsAt: '2026-09-10T00:00:00.000Z',
          planId: 'yin-membership',
          via: 'payment'
        }
      },
      {
        storage,
        now: () => new Date('2026-08-10T00:00:00.000Z'),
        markVerified: true
      }
    );
    assert.equal(
      getEntitlementState({
        storage,
        now: () => new Date('2026-08-15T00:00:00.000Z')
      }).subscription.entitled,
      true
    );

    const provider = createCloudEntitlementProvider({
      storage,
      getApiBaseUrl: () => 'http://127.0.0.1:8787',
      postJson: async () => {
        throw new Error('should_not_call');
      }
    });
    setEntitlementProvider(provider);
    try {
      const result = await refreshEntitlement({
        storage,
        now: () => new Date('2026-08-15T00:00:00.000Z'),
        provider
      });
      assert.equal(result, 'grace');
      assert.equal(
        getEntitlementState({
          storage,
          now: () => new Date('2026-08-15T00:00:00.000Z')
        }).subscription.entitled,
        true
      );
    } finally {
      setEntitlementProvider(null);
    }
  });

  it('createMembershipPortalSession requires credential', async () => {
    const storage = memoryStorage();
    await assert.rejects(
      () => createMembershipPortalSession({ storage, postJson: async () => ({}) }),
      /membership_device_credential_missing/
    );
    assert.equal(storage.getItem(MEMBERSHIP_DEVICE_CREDENTIAL_KEY), null);
  });
});
