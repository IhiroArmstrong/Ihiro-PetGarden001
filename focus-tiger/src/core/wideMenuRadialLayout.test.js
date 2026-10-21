/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WIDE_HOME_CTA_BOTTOM_PX, WIDE_HOME_SIT_PX } from '../ui/homeChromeClearance.js';
import {
  WIDE_MENU_RADIAL_GROUP_KEYS,
  WIDE_MENU_RADIAL_ICON_PX,
  WIDE_MENU_RADIAL_MIN_INNER_HEIGHT_PX,
  estimateWideMoreBtnAnchor,
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

  it('does not degenerate when a large sprite-stage AABB overlaps icons', () => {
    const anchor = { x: 640, y: 640 };
    const spots = layoutWideMenuRadialIcons(anchor.x, anchor.y);
    const first = wideMenuRadialIconBBox(spots[0]);
    const stage = {
      left: first.left - 4,
      top: first.top - 4,
      right: first.right + 4,
      bottom: first.bottom + 4,
      width: 800,
      height: 500
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
    assert.equal(shouldDegenerateWideMenuRadial(win, anchor), false);
  });

  it('degenerates when a fan icon top edge clips the 12px safe inset', () => {
    assert.equal(
      shouldDegenerateWideMenuRadial(
        { innerHeight: 720, document: {} },
        { x: 400, y: 40 }
      ),
      true
    );
  });

  it('keeps fan icons clear of the Sit home ball on common wide sizes', () => {
    const sitR = WIDE_HOME_SIT_PX / 2;
    const iconR = WIDE_MENU_RADIAL_ICON_PX / 2;
    for (const [innerWidth, innerHeight] of [
      [1280, 800],
      [1440, 900],
      [1280, 720]
    ]) {
      const more = estimateWideMoreBtnAnchor(innerWidth, innerHeight);
      const sit = {
        cx: innerWidth / 2,
        cy: innerHeight - WIDE_HOME_CTA_BOTTOM_PX - sitR
      };
      for (const spot of layoutWideMenuRadialIcons(more.x, more.y)) {
        const dx = spot.cx - sit.cx;
        const dy = spot.cy - sit.cy;
        assert.ok(
          Math.hypot(dx, dy) > sitR + iconR,
          `${innerWidth}x${innerHeight} icon ${spot.groupKey} overlaps Sit`
        );
      }
    }
  });
});
