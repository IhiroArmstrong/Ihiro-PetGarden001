import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SANCTUARY_STORAGE_KEY,
  clearSanctuaryEntitlement,
  isSanctuaryUnlocked,
  markSanctuaryFromPayment,
  markSanctuaryPreview,
  normalizeSanctuaryEntitlement,
  readSanctuaryEntitlement
} from './sanctuaryEntitlementGate.js';

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

describe('sanctuaryEntitlementGate', () => {
  it('normalize defaults locked', () => {
    assert.equal(normalizeSanctuaryEntitlement(null).unlocked, false);
  });

  it('payment and preview mark unlock independently of tip', () => {
    const storage = memoryStorage();
    assert.equal(isSanctuaryUnlocked({ storage }), false);
    markSanctuaryFromPayment(storage, {
      now: () => new Date('2026-08-07T00:00:00.000Z')
    });
    assert.equal(isSanctuaryUnlocked({ storage }), true);
    assert.equal(readSanctuaryEntitlement(storage).unlockedVia, 'payment');
    assert.ok(storage.getItem(SANCTUARY_STORAGE_KEY));
    clearSanctuaryEntitlement(storage);
    markSanctuaryPreview(storage);
    assert.equal(readSanctuaryEntitlement(storage).unlockedVia, 'preview');
  });
});

describe('sanctuary ↔ tip zero-coupling (static)', () => {
  it('sanctuaryEntitlementGate must not import tip-jar modules', () => {
    const src = readFileSync(
      join(here, 'sanctuaryEntitlementGate.js'),
      'utf8'
    );
    assert.equal(
      /from\s+['"].*tipJarGate/.test(src) ||
        /from\s+['"].*tipGate/.test(src) ||
        /require\(['"].*tipJar/.test(src),
      false,
      'sanctuaryEntitlementGate.js must not import tip-jar gate modules'
    );
  });

  it('if tipJarGate exists, it must not import sanctuary', () => {
    let tipSrc = '';
    try {
      tipSrc = readFileSync(join(here, 'tipJarGate.js'), 'utf8');
    } catch {
      // tip-jar lives on feature/yin-tip-jar; absent here is OK for scaffold.
      return;
    }
    for (const forbidden of [
      'sanctuaryEntitlement',
      'sanctuary-entitlement',
      'isSanctuaryUnlocked',
      'unlockedVia'
    ]) {
      assert.equal(
        tipSrc.includes(forbidden),
        false,
        `tipJarGate.js must not contain "${forbidden}"`
      );
    }
  });
});
