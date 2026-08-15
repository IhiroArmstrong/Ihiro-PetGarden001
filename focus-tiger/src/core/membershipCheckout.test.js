import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENTITLEMENT_CACHE_STORAGE_KEY,
  getEntitlementState,
  isEntitled,
  readEntitlementCache
} from './entitlement/entitlementGate.js';
import {
  confirmMembershipReturnQuery,
  markMembershipFromPayment,
  MEMBERSHIP_PLAN_ID,
  MEMBERSHIP_PRICE_DISPLAY
} from './membershipCheckout.js';
import {
  MEMBERSHIP_DEVICE_CREDENTIAL_KEY,
  readMembershipDeviceCredential
} from './membershipDeviceCredential.js';

const here = dirname(fileURLToPath(import.meta.url));

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

describe('membershipCheckout', () => {
  it('markMembershipFromPayment patches entitlement subscription cache', () => {
    const storage = memoryStorage();
    const ends = '2026-09-10T00:00:00.000Z';
    markMembershipFromPayment(storage, {
      periodEndsAt: ends,
      planId: MEMBERSHIP_PLAN_ID,
      now: () => new Date('2026-08-10T00:00:00.000Z')
    });
    const cache = readEntitlementCache(storage);
    assert.equal(cache.subscription.active, true);
    assert.equal(cache.subscription.periodEndsAt, ends);
    assert.equal(cache.subscription.planId, MEMBERSHIP_PLAN_ID);
    assert.equal(cache.subscription.via, 'payment');
    assert.ok(cache.subscription.lastVerifiedAt);
    assert.equal(
      getEntitlementState({
        storage,
        now: () => new Date('2026-08-15T00:00:00.000Z')
      }).source,
      'subscription'
    );
    assert.equal(
      isEntitled('ritual.morning.access', {
        storage,
        now: () => new Date('2026-08-15T00:00:00.000Z')
      }),
      true
    );
    assert.ok(storage.getItem(ENTITLEMENT_CACHE_STORAGE_KEY));
  });

  it('confirmMembershipReturnQuery unlocks only after server confirms', async () => {
    const storage = memoryStorage();
    const failed = await confirmMembershipReturnQuery({
      storage,
      getSearch: () => '?membership_session=cs_test',
      replaceUrl: () => {},
      postJson: async () => ({ active: false, unlocked: false })
    });
    assert.equal(failed.unlocked, false);
    assert.equal(
      getEntitlementState({ storage }).subscription.entitled,
      false
    );

    const ok = await confirmMembershipReturnQuery({
      storage,
      getSearch: () => '?membership_session=cs_test',
      replaceUrl: () => {},
      postJson: async () => ({
        active: true,
        unlocked: true,
        periodEndsAt: '2026-09-10T00:00:00.000Z',
        planId: 'yin-membership',
        email: 'm@example.com',
        deviceToken: 'b'.repeat(40)
      }),
      now: () => new Date('2026-08-10T00:00:00.000Z')
    });
    assert.equal(ok.unlocked, true);
    assert.equal(ok.outcome, 'success');
    assert.equal(
      getEntitlementState({
        storage,
        now: () => new Date('2026-08-15T00:00:00.000Z')
      }).subscription.entitled,
      true
    );
    assert.deepEqual(readMembershipDeviceCredential(storage), {
      email: 'm@example.com',
      deviceToken: 'b'.repeat(40)
    });
    assert.ok(storage.getItem(MEMBERSHIP_DEVICE_CREDENTIAL_KEY));
  });

  it('confirmMembershipReturnQuery does not unlock from query without postJson', async () => {
    const storage = memoryStorage();
    const res = await confirmMembershipReturnQuery({
      storage,
      getSearch: () => '?membership_session=cs_test',
      replaceUrl: () => {}
    });
    assert.equal(res.outcome, 'failed');
    assert.equal(
      getEntitlementState({ storage }).subscription.entitled,
      false
    );
  });

  it('confirmMembershipReturnQuery treats cancel without unlocking', async () => {
    const storage = memoryStorage();
    const res = await confirmMembershipReturnQuery({
      storage,
      getSearch: () => '?membership=cancel',
      replaceUrl: () => {},
      postJson: async () => ({ active: true, periodEndsAt: '2099-01-01T00:00:00.000Z' })
    });
    assert.equal(res.outcome, 'cancel');
    assert.equal(res.unlocked, false);
    assert.equal(
      getEntitlementState({ storage }).subscription.entitled,
      false
    );
  });
});

describe('membership display price', () => {
  it('exports a dollar amount for Support / membership cards', () => {
    assert.equal(MEMBERSHIP_PRICE_DISPLAY, '6.99');
    const en = JSON.parse(
      readFileSync(join(here, '../locales/en.json'), 'utf8')
    );
    assert.match(en.MEMBERSHIP_PRICE, /\$\{price\}/);
    assert.match(en.SUPPORT_MEMBERSHIP_PRICE, /\$\{price\}/);
  });
});

describe('membership ↔ tip zero-coupling (static)', () => {
  it('membershipCheckout must not import tip-jar or Sanctuary lifetime gate', () => {
    const src = readFileSync(join(here, 'membershipCheckout.js'), 'utf8');
    assert.equal(
      /from\s+['"].*tipJarGate/.test(src) ||
        /from\s+['"].*tipGate/.test(src) ||
        /require\(['"].*tipJar/.test(src),
      false,
      'membershipCheckout.js must not import tip-jar gate modules'
    );
    assert.equal(
      /from\s+['"].*sanctuaryEntitlementGate/.test(src),
      false,
      'membershipCheckout.js must not import sanctuaryEntitlementGate'
    );
  });
});
