import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENTITLEMENT_CACHE_STORAGE_KEY,
  writeEntitlementCache
} from './entitlement/entitlementState.js';
import {
  SANCTUARY_STORAGE_KEY,
  markSanctuaryFromPayment,
  clearSanctuaryEntitlement
} from './sanctuaryEntitlementGate.js';
import {
  ENSO_DIAMETER_FRAC,
  ENSO_MIN_CSS_PX,
  ENSO_OPACITY_FOCUSING,
  ENSO_OPACITY_HOVER,
  ENSO_OPACITY_IDLE,
  SANCTUARY_ENSO_MARK_SRC,
  layoutSanctuaryEnsoMark,
  sanctuaryEnsoOpacity,
  shouldShowSanctuaryEnsoMark
} from './sanctuaryEnsoMark.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

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

describe('sanctuaryEnsoMark', () => {
  it('official asset path exists on disk', () => {
    assert.match(SANCTUARY_ENSO_MARK_SRC, /sanctuary-enso-mark\.png$/);
    const abs = join(root, 'public', SANCTUARY_ENSO_MARK_SRC.replace(/^\//, ''));
    const buf = readFileSync(abs);
    assert.ok(buf.length > 1000);
  });

  it('shows for Sanctuary lifetime and hides for free / tip-only storage', () => {
    const storage = memoryStorage();
    assert.equal(shouldShowSanctuaryEnsoMark({ storage }), false);

    // Tip-shaped key must not unlock Enso (zero tip coupling).
    storage.setItem(
      'focus-tiger.tip-jar.v1',
      JSON.stringify({ tipped: true, tipCount: 3, badgeIds: ['a'] })
    );
    assert.equal(shouldShowSanctuaryEnsoMark({ storage }), false);

    markSanctuaryFromPayment(storage, {
      now: () => new Date('2026-08-12T00:00:00.000Z')
    });
    assert.equal(shouldShowSanctuaryEnsoMark({ storage }), true);

    clearSanctuaryEntitlement(storage);
    assert.equal(shouldShowSanctuaryEnsoMark({ storage }), false);
  });

  it('shows for active subscription cache without Sanctuary lifetime', () => {
    const storage = memoryStorage();
    writeEntitlementCache(storage, {
      lifetime: { active: false },
      subscription: {
        active: true,
        periodEndsAt: '2099-01-01T00:00:00.000Z',
        lastVerifiedAt: '2026-08-12T00:00:00.000Z'
      }
    });
    assert.ok(storage.getItem(ENTITLEMENT_CACHE_STORAGE_KEY));
    assert.equal(shouldShowSanctuaryEnsoMark({ storage }), true);
    assert.equal(storage.getItem(SANCTUARY_STORAGE_KEY), null);
  });

  it('layout uses ~25% cushion diameter and floors at 44px', () => {
    const wide = layoutSanctuaryEnsoMark({
      left: 100,
      top: 50,
      width: 1056,
      height: 864
    });
    assert.ok(wide);
    const expected = (553 / 1056) * 1056 * ENSO_DIAMETER_FRAC;
    assert.ok(Math.abs(wide.size - expected) < 0.5);
    assert.ok(wide.size / ((553 / 1056) * 1056) >= 0.22);
    assert.ok(wide.size / ((553 / 1056) * 1056) <= 0.28);

    const narrow = layoutSanctuaryEnsoMark({
      left: 0,
      top: 0,
      width: 120,
      height: 200
    });
    assert.ok(narrow);
    assert.equal(narrow.size, ENSO_MIN_CSS_PX);
  });

  it('layout returns null for invalid rects', () => {
    assert.equal(layoutSanctuaryEnsoMark(null), null);
    assert.equal(layoutSanctuaryEnsoMark({ left: 0, top: 0, width: 0, height: 10 }), null);
  });

  it('opacity idle / focusing / hover contract', () => {
    assert.equal(sanctuaryEnsoOpacity(false, false), ENSO_OPACITY_IDLE);
    assert.equal(sanctuaryEnsoOpacity(true, false), ENSO_OPACITY_FOCUSING);
    assert.equal(sanctuaryEnsoOpacity(false, true), ENSO_OPACITY_HOVER);
    // Focusing wins over hover brighten
    assert.equal(sanctuaryEnsoOpacity(true, true), ENSO_OPACITY_FOCUSING);
  });

  it('chrome module pins official src and swallows click (no shop)', () => {
    const chromeSrc = readFileSync(
      join(here, '../ui/SanctuaryEnsoMarkChrome.js'),
      'utf8'
    );
    assert.match(chromeSrc, /SANCTUARY_ENSO_MARK_SRC/);
    assert.match(chromeSrc, /preventDefault/);
    assert.match(chromeSrc, /z-index:\s*4/);
    assert.doesNotMatch(
      chromeSrc,
      /openSanctuary|openSupport|startCheckout|SupportYinModal/i
    );
  });
});
