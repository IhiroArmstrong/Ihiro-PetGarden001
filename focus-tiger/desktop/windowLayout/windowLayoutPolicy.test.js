/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COMPANION_WIDTH,
  DEFAULT_REGULAR_BOUNDS,
  companionBoundsForWorkArea,
  isCompanionBounds,
  normalizeWindowLayoutPrefs,
  planWindowLayout
} from './windowLayoutPolicy.js';

describe('windowLayoutPolicy', () => {
  it('defaults to a regular window, not fullscreen', () => {
    assert.equal(normalizeWindowLayoutPrefs(null).lastLayout, 'regular');
    assert.equal(normalizeWindowLayoutPrefs({ lastLayout: 'fullscreen' }).lastLayout, 'regular');
    assert.equal(normalizeWindowLayoutPrefs({ lastLayout: 'companion' }).lastLayout, 'companion');
  });

  it('places a companion window in the work-area bottom-right', () => {
    const bounds = companionBoundsForWorkArea({ x: 0, y: 0, width: 1440, height: 900 });
    assert.equal(bounds.width, COMPANION_WIDTH);
    assert.equal(bounds.height, 720);
    assert.equal(bounds.x, 1440 - COMPANION_WIDTH - 24);
    assert.equal(bounds.y, 900 - 720 - 24);
    assert.equal(isCompanionBounds(bounds), true);
    assert.equal(isCompanionBounds({ width: 1100, height: 760 }), false);
  });

  it('clamps companion bounds to a small work area', () => {
    const bounds = companionBoundsForWorkArea({ x: 10, y: 20, width: 400, height: 500 });
    assert.equal(bounds.width, 400);
    assert.equal(bounds.height, 500);
    assert.equal(bounds.x, 10);
    assert.equal(bounds.y, 20);
  });

  it('plans companion from a regular window and remembers the old size', () => {
    const plan = planWindowLayout({
      action: 'companion',
      isFullScreen: false,
      currentBounds: { x: 40, y: 50, width: 1100, height: 760 },
      workArea: { x: 0, y: 0, width: 1440, height: 900 }
    });
    assert.equal(plan.layout, 'companion');
    assert.equal(plan.setFullScreen, false);
    assert.equal(plan.waitForLeaveFullScreen, false);
    assert.equal(plan.setBounds?.width, COMPANION_WIDTH);
    assert.deepEqual(plan.persist.normalBounds, {
      x: 40,
      y: 50,
      width: 1100,
      height: 760
    });
  });

  it('toggles companion back to the remembered regular size', () => {
    const plan = planWindowLayout({
      action: 'companion',
      isFullScreen: false,
      currentBounds: { x: 900, y: 100, width: 420, height: 720 },
      prefs: { lastLayout: 'companion', normalBounds: { ...DEFAULT_REGULAR_BOUNDS, x: 12, y: 8 } }
    });
    assert.equal(plan.layout, 'regular');
    assert.equal(plan.persist.lastLayout, 'regular');
    assert.deepEqual(plan.setBounds, { width: 1100, height: 760, x: 12, y: 8 });
  });

  it('leaves fullscreen before applying companion', () => {
    const plan = planWindowLayout({
      action: 'companion',
      isFullScreen: true,
      currentBounds: { width: 1440, height: 900 },
      workArea: { x: 0, y: 0, width: 1440, height: 900 }
    });
    assert.equal(plan.layout, 'companion');
    assert.equal(plan.waitForLeaveFullScreen, true);
    assert.equal(plan.setFullScreen, false);
    assert.equal(plan.persist.lastLayout, 'companion');
  });

  it('toggles system fullscreen without drawing window buttons', () => {
    const enter = planWindowLayout({
      action: 'fullscreen',
      isFullScreen: false,
      currentBounds: { width: 1100, height: 760 }
    });
    assert.equal(enter.layout, 'fullscreen');
    assert.equal(enter.setFullScreen, true);
    assert.equal(enter.setBounds, null);
    const leave = planWindowLayout({
      action: 'fullscreen',
      isFullScreen: true,
      currentBounds: { width: 1440, height: 900 }
    });
    assert.equal(leave.setFullScreen, false);
    assert.notEqual(leave.layout, 'fullscreen');
  });
});
