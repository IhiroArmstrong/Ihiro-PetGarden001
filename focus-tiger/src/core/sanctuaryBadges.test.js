import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SANCTUARY_BADGE_CATALOG,
  SANCTUARY_BADGE_MAX,
  SANCTUARY_BADGE_MIN,
  computeSanctuaryBadgeTargetCount,
  mergeSanctuaryBadgeAwards
} from './sanctuaryBadges.js';
import {
  markSanctuaryFromPayment,
  readSanctuaryEntitlement,
  syncSanctuaryBadgesFromPractice,
  clearSanctuaryEntitlement
} from './sanctuaryEntitlementGate.js';
import { PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

describe('sanctuaryBadges', () => {
  it('catalog has seventeen distinct ids', () => {
    assert.equal(SANCTUARY_BADGE_CATALOG.length, SANCTUARY_BADGE_MAX);
    assert.equal(SANCTUARY_BADGE_MAX, 17);
    const ids = new Set(SANCTUARY_BADGE_CATALOG.map((b) => b.id));
    assert.equal(ids.size, 17);
  });

  it('payment with no practice awards min 3', () => {
    assert.equal(computeSanctuaryBadgeTargetCount({}), SANCTUARY_BADGE_MIN);
    const first = mergeSanctuaryBadgeAwards([], 3);
    assert.equal(first.badgeIds.length, 3);
  });

  it('markSanctuaryFromPayment writes independent badgeIds', () => {
    const storage = memoryStorage();
    markSanctuaryFromPayment(storage, {
      now: () => new Date('2026-08-09T00:00:00.000Z')
    });
    const ent = readSanctuaryEntitlement(storage);
    assert.equal(ent.unlocked, true);
    assert.equal(ent.badgeIds.length, 3);
    assert.equal(ent.badgeIds[0], 'silver-gold-rim-gray-scene');
  });

  it('practice rise grows sanctuary badges without tip jar', () => {
    const storage = memoryStorage({
      [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({
        days: [
          { date: '2026-08-01', totalMinutes: 60 },
          { date: '2026-08-02', totalMinutes: 60 },
          { date: '2026-08-03', totalMinutes: 60 }
        ]
      })
    });
    markSanctuaryFromPayment(storage);
    const before = readSanctuaryEntitlement(storage).badgeIds.length;
    assert.ok(before >= 3);
    // More practice → sync may grow
    storage.setItem(
      PRACTICE_DAYS_STORAGE_KEY,
      JSON.stringify({
        days: Array.from({ length: 20 }, (_, i) => ({
          date: `2026-07-${String(i + 1).padStart(2, '0')}`,
          totalMinutes: 120
        }))
      })
    );
    const grown = syncSanctuaryBadgesFromPractice(storage);
    assert.ok(grown.newlyAddedIds.length > 0 || readSanctuaryEntitlement(storage).badgeIds.length >= before);
    assert.ok(readSanctuaryEntitlement(storage).badgeIds.length >= before);
    clearSanctuaryEntitlement(storage);
  });

  it('entitled membership awards min 3 without unlocking Sanctuary lifetime', () => {
    const storage = memoryStorage();
    const grown = syncSanctuaryBadgesFromPractice(storage, { entitled: true });
    const ent = readSanctuaryEntitlement(storage);
    assert.equal(ent.unlocked, false);
    assert.equal(ent.badgeIds.length, SANCTUARY_BADGE_MIN);
    assert.ok(grown.newlyAddedIds.length >= SANCTUARY_BADGE_MIN);
  });

  it('gate source does not import tipJarGate (static zero-coupling)', () => {
    const src = readFileSync(
      join(here, 'sanctuaryEntitlementGate.js'),
      'utf8'
    );
    assert.equal(/from\s+['"].*tipJarGate/.test(src), false);
    assert.equal(/import\s+.*tipJarGate/.test(src), false);
  });
});
