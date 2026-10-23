/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  CONFIDE_NARROW_MAX_PX,
  CONFIDE_WIDE_RAIL_MIN_PX,
  confideDockLeavesMidlineClear,
  confideDockPlacement
} from './confideDockPlacement.js';

describe('confideDockPlacement', () => {
  it('keeps narrow phones centered', () => {
    assert.equal(confideDockPlacement(375), 'center');
    assert.equal(confideDockPlacement(CONFIDE_NARROW_MAX_PX), 'center');
    assert.equal(confideDockLeavesMidlineClear('center'), false);
  });

  it('docks medium wide to the bottom strip', () => {
    assert.equal(confideDockPlacement(480), 'bottom');
    assert.equal(confideDockPlacement(700), 'bottom');
    assert.equal(confideDockPlacement(CONFIDE_WIDE_RAIL_MIN_PX - 1), 'bottom');
    assert.equal(confideDockLeavesMidlineClear('bottom'), true);
  });

  it('docks desktop wide to the right rail', () => {
    assert.equal(confideDockPlacement(CONFIDE_WIDE_RAIL_MIN_PX), 'right');
    assert.equal(confideDockPlacement(1280), 'right');
    assert.equal(confideDockLeavesMidlineClear('right'), true);
  });
});

describe('ConfideToYinUI dock CSS', () => {
  it('ships matching media queries so the card is not centered on wide', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const shared = readFileSync(join(here, 'wideSecondaryDockCss.js'), 'utf8');
    const confide = readFileSync(join(here, '../ui/ConfideToYinUI.js'), 'utf8');
    assert.match(shared, /@media \(min-width: \$\{minWide\}px\) and \(max-width: \$\{maxStrip\}px\)/);
    assert.match(shared, /right: max\(16px/);
    assert.match(shared, /max-height: min\(42vh/);
    assert.match(confide, /wideSecondaryDockCss\('\.confide-to-yin'/);
  });
});
