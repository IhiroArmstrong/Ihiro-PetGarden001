/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { wideSecondaryDockCss } from './wideSecondaryDockCss.js';

describe('wideSecondaryDockCss', () => {
  it('emits T41 breakpoints and right-rail geometry', () => {
    const css = wideSecondaryDockCss('#help-center');
    assert.match(css, /@media \(min-width: 480px\) and \(max-width: 899px\)/);
    assert.match(css, /@media \(min-width: 900px\)/);
    assert.match(css, /right: max\(16px/);
    assert.match(css, /max-height: min\(42vh/);
    assert.match(css, /#help-center/);
    assert.doesNotMatch(css, /\.is-visible/);
  });

  it('adds slide transforms for Confide-style cards', () => {
    const css = wideSecondaryDockCss('.growth-journey-detail', { slide: true });
    assert.match(css, /\.growth-journey-detail\.is-visible/);
    assert.match(css, /translate\(12px, -50%\)/);
  });
});

describe('T42 surfaces use the shared dock CSS', () => {
  const here = dirname(fileURLToPath(import.meta.url));

  it('Help Center and Journey import the helper', () => {
    const help = readFileSync(join(here, '../ui/HelpCenterUI.js'), 'utf8');
    const journey = readFileSync(join(here, '../ui/GrowthJourneyDetailUI.js'), 'utf8');
    assert.match(help, /wideSecondaryDockCss\('#help-center'\)/);
    assert.match(journey, /wideSecondaryDockCss\('\.growth-journey-detail'/);
  });
});
