/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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
  ENSO_CORNER_BOTTOM_NARROW_PX,
  ENSO_CORNER_BOTTOM_WIDE_PX,
  ENSO_CORNER_LEFT_NARROW_PX,
  ENSO_CORNER_LEFT_WIDE_PX,
  ENSO_CORNER_SIZE_NARROW_PX,
  ENSO_CORNER_SIZE_WIDE_PX,
  ENSO_NARROW_MQ_MAX_PX,
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

  it('layout pins bottom-left corner and lifts above 375 home balls', () => {
    const wide = layoutSanctuaryEnsoMark({ viewportWidth: 1280 });
    assert.deepEqual(wide, {
      left: ENSO_CORNER_LEFT_WIDE_PX,
      bottom: ENSO_CORNER_BOTTOM_WIDE_PX,
      size: ENSO_CORNER_SIZE_WIDE_PX
    });

    const narrow = layoutSanctuaryEnsoMark({ viewportWidth: 375 });
    assert.ok(narrow);
    assert.equal(narrow.left, ENSO_CORNER_LEFT_NARROW_PX);
    assert.equal(narrow.bottom, ENSO_CORNER_BOTTOM_NARROW_PX);
    assert.equal(narrow.size, ENSO_CORNER_SIZE_NARROW_PX);
    assert.ok(narrow.bottom >= 150);

    const edge = layoutSanctuaryEnsoMark({
      viewportWidth: ENSO_NARROW_MQ_MAX_PX
    });
    assert.equal(edge.size, ENSO_CORNER_SIZE_NARROW_PX);

    const justWide = layoutSanctuaryEnsoMark({
      viewportWidth: ENSO_NARROW_MQ_MAX_PX + 1
    });
    assert.equal(justWide.size, ENSO_CORNER_SIZE_WIDE_PX);

    const safeNarrow = layoutSanctuaryEnsoMark({
      viewportWidth: 375,
      safeAreaBottom: 80
    });
    assert.ok(safeNarrow.bottom > ENSO_CORNER_BOTTOM_NARROW_PX);
  });

  it('layout returns null for invalid viewports', () => {
    assert.equal(layoutSanctuaryEnsoMark(null), null);
    assert.equal(layoutSanctuaryEnsoMark({}), null);
    assert.equal(layoutSanctuaryEnsoMark({ viewportWidth: 0 }), null);
  });

  it('opacity idle / focusing / hover contract', () => {
    assert.equal(sanctuaryEnsoOpacity(false, false), ENSO_OPACITY_IDLE);
    assert.equal(sanctuaryEnsoOpacity(true, false), ENSO_OPACITY_FOCUSING);
    assert.equal(sanctuaryEnsoOpacity(false, true), ENSO_OPACITY_HOVER);
    // Focusing wins over hover brighten
    assert.equal(sanctuaryEnsoOpacity(true, true), ENSO_OPACITY_FOCUSING);
  });

  it('chrome module pins official src, corner CSS, and does not open shop', () => {
    const chromeSrc = readFileSync(
      join(here, '../ui/SanctuaryEnsoMarkChrome.js'),
      'utf8'
    );
    assert.match(chromeSrc, /SANCTUARY_ENSO_MARK_SRC/);
    assert.match(chromeSrc, /pointer-events:\s*none/);
    assert.match(chromeSrc, /z-index:\s*11/);
    assert.match(chromeSrc, /bottom:\s*max\(/);
    assert.match(chromeSrc, /max-width:\s*\$\{ENSO_NARROW_MQ_MAX_PX\}px/);
    assert.doesNotMatch(chromeSrc, /getDisplayRect/);
    assert.doesNotMatch(chromeSrc, /cushion/);
    assert.doesNotMatch(
      chromeSrc,
      /openSanctuary|openSupport|startCheckout|SupportYinModal/i
    );
  });
});
