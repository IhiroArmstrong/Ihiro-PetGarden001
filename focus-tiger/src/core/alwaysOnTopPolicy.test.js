/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_ALWAYS_ON_TOP_PREFS,
  normalizeAlwaysOnTopPrefs
} from '../../desktop/alwaysOnTop/alwaysOnTopPolicy.js';

describe('alwaysOnTopPolicy (src import)', () => {
  it('defaults off', () => {
    assert.equal(DEFAULT_ALWAYS_ON_TOP_PREFS.enabled, false);
    assert.equal(normalizeAlwaysOnTopPrefs({ enabled: true }).enabled, true);
  });
});
