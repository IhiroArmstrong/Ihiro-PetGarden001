/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_WINDOW_LAYOUT_PREFS,
  isCompanionBounds,
  normalizeWindowLayoutPrefs,
  planWindowLayout
} from '../../desktop/windowLayout/windowLayoutPolicy.js';

describe('windowLayoutPolicy (src import)', () => {
  it('does not persist fullscreen as a startup layout', () => {
    assert.equal(DEFAULT_WINDOW_LAYOUT_PREFS.lastLayout, 'regular');
    assert.equal(normalizeWindowLayoutPrefs({ lastLayout: 'fullscreen' }).lastLayout, 'regular');
    assert.equal(isCompanionBounds({ width: 420, height: 720 }), true);
    const plan = planWindowLayout({
      action: 'fullscreen',
      isFullScreen: false,
      currentBounds: { width: 420, height: 720 }
    });
    assert.equal(plan.persist.lastLayout, 'companion');
  });
});
