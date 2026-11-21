/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

describe('Where you are restore copy wiring', () => {
  const src = readFileSync(
    fileURLToPath(new URL('./GrowthJourneyDetailUI.js', import.meta.url)),
    'utf8'
  );

  it('shows sitting-minutes track hint and 7-day empty copy', () => {
    assert.match(src, /GROWTH_JOURNEY_TRACK_HINT/);
    assert.match(src, /sitBreathEmptyLocaleKey/);
    assert.match(src, /growth-journey-detail-track-hint/);
  });
});
