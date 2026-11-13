/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listSecondaryChromeEntries } from './idleChromeOrchestration.js';
import { isHomeSanctuaryNavEnabled } from './homeSanctuaryNavEnabled.js';

describe('home sanctuary nav disabled (PO 2026-11-13)', () => {
  it('keeps the feature flag off', () => {
    assert.equal(isHomeSanctuaryNavEnabled(), false);
  });

  it('omits Navigate sanctuary from wide and narrow menus', () => {
    for (const surface of /** @type {const} */ (['wide-more', 'narrow-drawer'])) {
      const rows = listSecondaryChromeEntries(surface, {
        reminderAvailable: false,
        newsletterSubmitted: true
      });
      assert.equal(
        rows.some((r) => r.proxy === 'sanctuary-nav'),
        false,
        surface
      );
    }
  });
});
