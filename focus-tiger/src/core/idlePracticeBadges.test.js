/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeEntitlementCache } from './entitlement/entitlementState.js';
import {
  markSanctuaryFromPayment,
  readSanctuaryEntitlement
} from './sanctuaryEntitlementGate.js';
import { markTipFromCheckoutReturn, TIP_JAR_STORAGE_KEY } from './tipJarGate.js';
import { SANCTUARY_BADGE_MIN } from './sanctuaryBadges.js';
import {
  isPrestigiousBadgeEntitled,
  syncAndReadIdleBadgePack
} from './idlePracticeBadges.js';

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

function seedActiveSubscription(storage) {
  writeEntitlementCache(storage, {
    lifetime: { active: false },
    subscription: {
      active: true,
      periodEndsAt: '2099-01-01T00:00:00.000Z',
      lastVerifiedAt: '2026-08-15T00:00:00.000Z'
    }
  });
}

describe('idlePracticeBadges', () => {
  it('membership subscription awards 3 prestige badges without Sanctuary lifetime', () => {
    const storage = memoryStorage();
    assert.equal(isPrestigiousBadgeEntitled({ storage }), false);
    seedActiveSubscription(storage);
    assert.equal(isPrestigiousBadgeEntitled({ storage }), true);

    const pack = syncAndReadIdleBadgePack(storage);
    assert.equal(pack.kind, 'sanctuary');
    assert.equal(pack.ids.length, SANCTUARY_BADGE_MIN);
    const ent = readSanctuaryEntitlement(storage);
    assert.equal(ent.unlocked, false);
    assert.equal(ent.badgeIds.length, SANCTUARY_BADGE_MIN);
  });

  it('free / no practice yields zero idle badges', () => {
    const storage = memoryStorage();
    const pack = syncAndReadIdleBadgePack(storage);
    assert.equal(pack.kind, 'practice');
    assert.equal(pack.ids.length, 0);
  });

  it('tip-only does not count as prestigious and still awards tea badges', () => {
    const storage = memoryStorage();
    markTipFromCheckoutReturn(storage, {
      now: () => new Date('2026-08-15T00:00:00.000Z')
    });
    assert.equal(isPrestigiousBadgeEntitled({ storage }), false);
    const pack = syncAndReadIdleBadgePack(storage);
    assert.equal(pack.kind, 'tip');
    assert.ok(pack.ids.length >= 3);
    assert.equal(readSanctuaryEntitlement(storage).unlocked, false);
    assert.ok(storage.getItem(TIP_JAR_STORAGE_KEY));
  });

  it('Sanctuary lifetime still awards prestige badges and unlocks the SKU', () => {
    const storage = memoryStorage();
    markSanctuaryFromPayment(storage, {
      now: () => new Date('2026-08-15T00:00:00.000Z')
    });
    const pack = syncAndReadIdleBadgePack(storage);
    assert.equal(pack.kind, 'sanctuary');
    assert.equal(pack.ids.length, SANCTUARY_BADGE_MIN);
    assert.equal(readSanctuaryEntitlement(storage).unlocked, true);
  });

  it('does not import payment gates into each other (static)', () => {
    const helper = readFileSync(join(here, 'idlePracticeBadges.js'), 'utf8');
    assert.match(helper, /sanctuaryEntitlementGate/);
    assert.match(helper, /tipJarGate/);
    const sanctuary = readFileSync(
      join(here, 'sanctuaryEntitlementGate.js'),
      'utf8'
    );
    assert.equal(/from\s+['"].*tipJarGate/.test(sanctuary), false);
    assert.equal(/from\s+['"].*entitlementGate/.test(sanctuary), false);
    const tip = readFileSync(join(here, 'tipJarGate.js'), 'utf8');
    assert.equal(/from\s+['"].*sanctuaryEntitlementGate/.test(tip), false);
  });
});
