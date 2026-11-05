/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { resolveGuidedMeditationMenuClick } from './guidedMeditationBusyYield.js';

describe('resolveGuidedMeditationMenuClick', () => {
  it('opens when Idle', () => {
    assert.equal(resolveGuidedMeditationMenuClick({}), 'open');
  });

  it('yields during Focusing, Honesty, or Breath', () => {
    assert.equal(
      resolveGuidedMeditationMenuClick({ focusing: true }),
      'busy'
    );
    assert.equal(
      resolveGuidedMeditationMenuClick({ honestyBusy: true }),
      'busy'
    );
    assert.equal(
      resolveGuidedMeditationMenuClick({ breathBusy: true }),
      'busy'
    );
  });
});
