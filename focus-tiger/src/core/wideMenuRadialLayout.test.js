/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  WIDE_MENU_RADIAL_GROUP_KEYS,
  WIDE_MENU_RADIAL_MIN_INNER_HEIGHT_PX,
  isWideMenuViewport,
  layoutWideMenuRadialIcons,
  shouldDegenerateWideMenuRadial,
  wideMenuRadialIconBBox
} from './wideMenuRadialLayout.js';

describe('wideMenuRadialLayout', () => {
  it('prefers innerWidth over matchMedia for wide breakpoint', () => {
    assert.equal(isWideMenuViewport(375, true), false);
    assert.equal(isWideMenuViewport(480, false), true);
  });

  it('lays out five groups on the radial index', () => {
    const spots = layoutWideMenuRadialIcons(400, 600);
    assert.equal(spots.length, WIDE_MENU_RADIAL_GROUP_KEYS.length);
    assert.deepEqual(
      spots.map((s) => s.groupKey),
      [...WIDE_MENU_RADIAL_GROUP_KEYS]
    );
    assert.ok(spots.every((s) => s.cy < 600));
  });

  it('degenerates when viewport is shorter than the measured floor', () => {
    assert.ok(
      shouldDegenerateWideMenuRadial(
        { innerHeight: WIDE_MENU_RADIAL_MIN_INNER_HEIGHT_PX - 1, document: {} },
        { x: 400, y: 600 }
      )
    );
  });

  it('degenerates when fan icons intersect sprite-stage', () => {
    const anchor = { x: 640, y: 640 };
    const spots = layoutWideMenuRadialIcons(anchor.x, anchor.y);
    const first = wideMenuRadialIconBBox(spots[0]);
    const stage = {
      left: first.left - 4,
      top: first.top - 4,
      right: first.right + 4,
      bottom: first.bottom + 4,
      width: 100,
      height: 100
    };
    const win = {
      innerHeight: 720,
      document: {
        getElementById: (id) =>
          id === 'sprite-stage'
            ? { getBoundingClientRect: () => stage }
            : null
      }
    };
    assert.equal(shouldDegenerateWideMenuRadial(win, anchor), true);
  });
});
