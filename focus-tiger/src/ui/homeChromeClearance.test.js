/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BOTTOM_COPY_CLEARANCE_SURFACES,
  WIDE_COPY_BOTTOM_PX,
  homeClearanceBottomCss,
  homeClearanceTopCss,
  isNarrowHomeChromeViewport,
  narrowActionBarCopyClearanceTopPx,
  narrowHomeCopyClearanceBottomPx
} from './homeChromeClearance.js';

describe('homeChromeClearance', () => {
  it('narrow clearance sits above Sit ball band (~147px + gap)', () => {
    const px = narrowHomeCopyClearanceBottomPx();
    assert.ok(px >= 160, `expected ≥160, got ${px}`);
    assert.ok(px <= 180, `expected ≤180, got ${px}`);
  });

  it('narrow top clearance clears ActionBar (10+48+8)', () => {
    assert.equal(narrowActionBarCopyClearanceTopPx(), 66);
  });

  it('wide clearance sits above Sit ball band (≥135)', () => {
    assert.ok(
      WIDE_COPY_BOTTOM_PX >= 135,
      `expected ≥135, got ${WIDE_COPY_BOTTOM_PX}`
    );
  });

  it('homeClearanceBottomCss switches on matchMedia', () => {
    const narrowWin = {
      matchMedia: () => ({ matches: true })
    };
    const wideWin = {
      matchMedia: () => ({ matches: false })
    };
    assert.equal(isNarrowHomeChromeViewport(narrowWin), true);
    assert.equal(isNarrowHomeChromeViewport(wideWin), false);
    assert.match(homeClearanceBottomCss(narrowWin), /^max\(\d+px/);
    assert.equal(homeClearanceBottomCss(wideWin), `${WIDE_COPY_BOTTOM_PX}px`);
  });

  it('homeClearanceTopCss clears ActionBar on narrow only', () => {
    const narrowWin = { matchMedia: () => ({ matches: true }) };
    const wideWin = { matchMedia: () => ({ matches: false }) };
    assert.match(homeClearanceTopCss(narrowWin), /^max\(66px/);
    assert.match(homeClearanceTopCss(wideWin), /safe-area-inset-top/);
    assert.ok(!homeClearanceTopCss(wideWin).includes('48px'));
  });

  it('inventory lists toast as using shared clearance', () => {
    const toast = BOTTOM_COPY_CLEARANCE_SURFACES.find(
      (s) => s.id === 'mindful-acknowledge-toast-bottom'
    );
    assert.ok(toast);
    assert.equal(toast.usesSharedClearance, true);
    assert.ok(BOTTOM_COPY_CLEARANCE_SURFACES.length >= 4);
    assert.ok(
      BOTTOM_COPY_CLEARANCE_SURFACES.every((s) => s.usesSharedClearance === true)
    );
  });
});
