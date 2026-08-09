/**
 * Entitlement gate foundation · unit contracts.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  FEATURE_CATALOG,
  applyEntitlementPatch,
  claimFeatureOwned,
  createMockEntitlementProvider,
  getEntitlementState,
  getFeatureAccess,
  isEntitled,
  meetsRequiredTier,
  onEntitlementChange,
  refreshEntitlement,
  resolveLifetimeActive,
  resolveSubscriptionEntitled,
  setEntitlementProvider,
  writeEntitlementMockConfig
} from './entitlementGate.js';
import {
  ENTITLEMENT_GRACE_MS,
  clearEntitlementCache,
  readEntitlementCache
} from './entitlementState.js';
import { clearOwnershipState, hasOwned } from './entitlementOwnership.js';
import {
  SANCTUARY_STORAGE_KEY,
  markSanctuaryFromPayment,
  clearSanctuaryEntitlement
} from '../sanctuaryEntitlementGate.js';

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

describe('entitlementRegistry', () => {
  it('catalog marks ritual access ongoing and history persistent', () => {
    assert.equal(FEATURE_CATALOG['ritual.morning.access'].type, 'ongoing');
    assert.equal(FEATURE_CATALOG['ritual.morning.access'].requiredTier, 'subscription');
    assert.equal(FEATURE_CATALOG['ritual.morning.history'].type, 'persistent');
    assert.equal(FEATURE_CATALOG['journey.log'].requiredTier, 'free');
    assert.equal(FEATURE_CATALOG['content.daily-wisdom'].requiredTier, 'free');
    assert.equal(FEATURE_CATALOG['content.daily-wisdom'].type, 'ongoing');
  });
});

describe('entitlementGate lifetime ∪ subscription', () => {
  it('free features always entitled', () => {
    const storage = memoryStorage();
    assert.equal(isEntitled('journey.log', { storage }), true);
    assert.equal(isEntitled('milestone.glow.played', { storage }), true);
    assert.equal(isEntitled('content.daily-wisdom', { storage }), true);
  });

  it('unknown featureKey is denied', () => {
    const storage = memoryStorage();
    assert.equal(isEntitled('not.a.real.key', { storage }), false);
  });

  it('lifetime from cache unlocks subscription-tier ongoing', () => {
    const storage = memoryStorage();
    applyEntitlementPatch(
      {
        lifetime: {
          active: true,
          unlockedAt: '2026-08-01T00:00:00.000Z',
          itemId: 'mock-lifetime',
          via: 'mock'
        }
      },
      { storage, notify: false, markVerified: false }
    );
    assert.equal(resolveLifetimeActive({ storage }), true);
    assert.equal(
      isEntitled('ritual.morning.access', { storage }),
      true,
      'lifetime covers subscription tier'
    );
    assert.equal(getEntitlementState({ storage }).source, 'lifetime');
  });

  it('subscription covers lifetime-tier via global mutual union', () => {
    const storage = memoryStorage();
    const now = () => new Date('2026-08-10T12:00:00.000Z');
    applyEntitlementPatch(
      {
        subscription: {
          active: true,
          periodEndsAt: '2026-09-01T00:00:00.000Z',
          planId: 'mock',
          via: 'mock'
        }
      },
      { storage, now, notify: false }
    );
    const state = getEntitlementState({ storage, now });
    assert.equal(state.lifetimeActive, false);
    assert.equal(state.subscription.entitled, true);
    assert.equal(
      meetsRequiredTier('lifetime', state),
      true,
      'subscription must cover lifetime-tier (互相覆盖)'
    );
    assert.equal(meetsRequiredTier('subscription', state), true);
    assert.equal(meetsRequiredTier('free', state), true);
  });

  it('reads sanctuary unlock as lifetime signal without writing sanctuary', () => {
    const storage = memoryStorage();
    clearEntitlementCache(storage);
    assert.equal(resolveLifetimeActive({ storage }), false);
    markSanctuaryFromPayment(storage, {
      now: () => new Date('2026-08-07T00:00:00.000Z')
    });
    assert.equal(resolveLifetimeActive({ storage }), true);
    assert.equal(isEntitled('ambient.deep.play', { storage }), true);
    assert.equal(
      readEntitlementCache(storage).lifetime.active,
      false,
      'sanctuary is read-only signal; cache lifetime stays false'
    );
    assert.ok(storage.getItem(SANCTUARY_STORAGE_KEY));
    clearSanctuaryEntitlement(storage);
  });

  it('active subscription unlocks ongoing within periodEndsAt', () => {
    const storage = memoryStorage();
    const now = () => new Date('2026-08-10T12:00:00.000Z');
    applyEntitlementPatch(
      {
        subscription: {
          active: true,
          periodEndsAt: '2026-09-01T00:00:00.000Z',
          planId: 'mock',
          via: 'mock'
        }
      },
      { storage, now, notify: false }
    );
    assert.equal(
      isEntitled('ritual.emotional-reset.access', { storage, now }),
      true
    );
    assert.equal(getEntitlementState({ storage, now }).source, 'subscription');
  });
});

describe('entitlementGate grace periods', () => {
  it('post-expiry grace keeps subscription entitled for 7 days', () => {
    const storage = memoryStorage();
    applyEntitlementPatch(
      {
        subscription: {
          active: false,
          periodEndsAt: '2026-08-01T00:00:00.000Z',
          lastVerifiedAt: '2026-08-01T00:00:00.000Z',
          planId: 'mock',
          via: 'mock'
        }
      },
      { storage, notify: false, markVerified: false }
    );
    const inGrace = new Date(
      Date.parse('2026-08-01T00:00:00.000Z') + ENTITLEMENT_GRACE_MS - 1000
    );
    const pastGrace = new Date(
      Date.parse('2026-08-01T00:00:00.000Z') + ENTITLEMENT_GRACE_MS + 1000
    );
    const a = resolveSubscriptionEntitled(
      readEntitlementCache(storage),
      inGrace
    );
    assert.equal(a.entitled, true);
    assert.equal(a.grace.postExpiry, true);
    assert.equal(
      isEntitled('ritual.work-transition.access', {
        storage,
        now: () => inGrace
      }),
      true
    );
    const b = resolveSubscriptionEntitled(
      readEntitlementCache(storage),
      pastGrace
    );
    assert.equal(b.entitled, false);
    assert.equal(
      isEntitled('ritual.work-transition.access', {
        storage,
        now: () => pastGrace
      }),
      false
    );
  });

  it('offline grace trusts last known active within lastVerifiedAt + 7d', () => {
    const storage = memoryStorage();
    applyEntitlementPatch(
      {
        subscription: {
          active: true,
          periodEndsAt: null,
          lastVerifiedAt: '2026-08-05T00:00:00.000Z',
          planId: 'mock',
          via: 'mock'
        }
      },
      { storage, notify: false, markVerified: false }
    );
    const inGrace = new Date('2026-08-10T00:00:00.000Z');
    const pastGrace = new Date('2026-08-13T00:00:00.000Z');
    const a = resolveSubscriptionEntitled(
      readEntitlementCache(storage),
      inGrace
    );
    assert.equal(a.entitled, true);
    assert.equal(a.grace.offline, true);
    const b = resolveSubscriptionEntitled(
      readEntitlementCache(storage),
      pastGrace
    );
    assert.equal(b.entitled, false);
  });
});

describe('entitlementGate persistent ownership', () => {
  it('owned history stays accessible after subscription expires', () => {
    const storage = memoryStorage();
    clearOwnershipState(storage);
    const entitledNow = () => new Date('2026-08-01T00:00:00.000Z');
    applyEntitlementPatch(
      {
        subscription: {
          active: true,
          periodEndsAt: '2026-08-02T00:00:00.000Z',
          planId: 'mock',
          via: 'mock'
        }
      },
      { storage, now: entitledNow, notify: false }
    );
    assert.equal(
      isEntitled('ritual.morning.history', { storage, now: entitledNow }),
      true
    );
    assert.equal(claimFeatureOwned('ritual.morning.history', { storage }), true);
    assert.equal(hasOwned(storage, 'ritual.morning.history'), true);

    const expired = () =>
      new Date(
        Date.parse('2026-08-02T00:00:00.000Z') + ENTITLEMENT_GRACE_MS + 60_000
      );
    assert.equal(
      isEntitled('ritual.morning.access', { storage, now: expired }),
      false
    );
    assert.equal(
      isEntitled('ritual.morning.history', { storage, now: expired }),
      false,
      'isEntitled ignores ownership by design'
    );
    const access = getFeatureAccess('ritual.morning.history', {
      storage,
      now: expired
    });
    assert.equal(access.allowed, true);
    assert.equal(access.via, 'owned');
  });
});

describe('entitlementGate subscribe + mock provider', () => {
  it('onEntitlementChange notifies and unsubscribe stops', () => {
    const storage = memoryStorage();
    /** @type {unknown[]} */
    const heard = [];
    const unsub = onEntitlementChange((s) => heard.push(s.source));
    applyEntitlementPatch(
      {
        lifetime: {
          active: true,
          unlockedAt: '2026-08-10T00:00:00.000Z',
          itemId: 'x',
          via: 'mock'
        }
      },
      { storage }
    );
    assert.equal(heard.length >= 1, true);
    unsub();
    const before = heard.length;
    applyEntitlementPatch(
      {
        lifetime: {
          active: false,
          unlockedAt: null,
          itemId: null,
          via: null
        }
      },
      { storage }
    );
    assert.equal(heard.length, before);
  });

  it('mock provider refresh writes cache; failFetch returns grace', async () => {
    const storage = memoryStorage();
    writeEntitlementMockConfig(storage, {
      scenario: 'subscription',
      periodEndsAt: '2026-09-01T00:00:00.000Z',
      failFetch: false
    });
    setEntitlementProvider(
      createMockEntitlementProvider({
        storage,
        search: '',
        now: () => new Date('2026-08-10T00:00:00.000Z')
      })
    );
    const ok = await refreshEntitlement({
      storage,
      now: () => new Date('2026-08-10T00:00:00.000Z')
    });
    assert.equal(ok, 'ok');
    assert.equal(
      isEntitled('ritual.morning.access', {
        storage,
        now: () => new Date('2026-08-10T00:00:00.000Z')
      }),
      true
    );

    writeEntitlementMockConfig(storage, { failFetch: true });
    setEntitlementProvider(
      createMockEntitlementProvider({
        storage,
        search: '',
        now: () => new Date('2026-08-10T00:00:00.000Z')
      })
    );
    const grace = await refreshEntitlement({
      storage,
      now: () => new Date('2026-08-12T00:00:00.000Z')
    });
    assert.equal(grace, 'grace');
    assert.equal(
      isEntitled('ritual.morning.access', {
        storage,
        now: () => new Date('2026-08-12T00:00:00.000Z')
      }),
      true,
      'prior cache still entitles during offline grace'
    );
    setEntitlementProvider(null);
  });
});

describe('entitlement ↔ tip zero-coupling (static)', () => {
  it('entitlement modules must not import tip-jar', () => {
    const files = [
      'entitlementGate.js',
      'entitlementState.js',
      'entitlementOwnership.js',
      'entitlementRegistry.js',
      'entitlementProvider.js',
      'mockEntitlementProvider.js',
      'index.js'
    ];
    for (const name of files) {
      const src = readFileSync(join(here, name), 'utf8');
      assert.equal(
        /from\s+['"].*tipJarGate/.test(src) ||
          /from\s+['"].*tipGate/.test(src) ||
          /require\(['"].*tipJar/.test(src),
        false,
        `${name} must not import tip-jar gate modules`
      );
    }
  });
});
