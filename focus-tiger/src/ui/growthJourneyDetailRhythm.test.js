/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const src = readFileSync(
  new URL('./GrowthJourneyDetailUI.js', import.meta.url),
  'utf8'
);

test('journey rhythm keeps returned and paused in separate marks', () => {
  assert.match(src, /growth-journey-detail__mark/);
  assert.match(src, /growth-journey-detail__mark \+ \.growth-journey-detail__mark::before/);
  assert.doesNotMatch(src, /this\.rhythmEl\.append\(dot, returned\)/);
});

test('lotus row sits between the next step and lifetime, never wraps', () => {
  assert.match(
    src,
    /this\.nextEl,\s*this\.lotusRow,\s*this\.lifetimeEl/s
  );
  assert.match(src, /id = 'growth-journey-lotus-row'/);
  assert.match(src, /flex-wrap: nowrap/);
});
