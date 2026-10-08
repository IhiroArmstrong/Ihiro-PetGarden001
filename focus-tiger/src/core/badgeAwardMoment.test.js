/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  pickNewestAwardedId,
  resolveBadgeAwardPresentation
} from './badgeAwardMoment.js';

const ready = {
  newlyAddedIds: ['silver-mono'],
  orderedIds: ['silver-mono'],
  growthCardOpening: false,
  documentVisible: true,
  windowFocused: true,
  stripVisible: true,
  landingMeasurable: true,
  reducedMotion: false
};

describe('badgeAwardMoment', () => {
  it('flies the single new badge when every gate is open', () => {
    assert.deepEqual(resolveBadgeAwardPresentation(ready), {
      kind: 'fly',
      badgeId: 'silver-mono'
    });
  });

  it('flies only the newest of several new badges (catalog order)', () => {
    assert.equal(
      pickNewestAwardedId(
        ['silver-gold-rim', 'silver-mono'],
        ['silver-mono', 'silver-gold-outline', 'silver-gold-rim']
      ),
      'silver-gold-rim'
    );
    assert.deepEqual(
      resolveBadgeAwardPresentation({
        ...ready,
        newlyAddedIds: ['silver-mono', 'silver-gold-rim'],
        orderedIds: ['silver-mono', 'silver-gold-outline', 'silver-gold-rim']
      }),
      { kind: 'fly', badgeId: 'silver-gold-rim' }
    );
  });

  it('stays silent when a growth card is opening', () => {
    assert.deepEqual(
      resolveBadgeAwardPresentation({ ...ready, growthCardOpening: true }),
      { kind: 'silent', badgeId: null }
    );
  });

  it('stays silent when the strip is hidden or the landing cannot be measured', () => {
    assert.equal(
      resolveBadgeAwardPresentation({ ...ready, stripVisible: false }).kind,
      'silent'
    );
    assert.equal(
      resolveBadgeAwardPresentation({ ...ready, landingMeasurable: false }).kind,
      'silent'
    );
  });

  it('stays silent when the window is in the background', () => {
    assert.equal(
      resolveBadgeAwardPresentation({ ...ready, documentVisible: false }).kind,
      'silent'
    );
    assert.equal(
      resolveBadgeAwardPresentation({ ...ready, windowFocused: false }).kind,
      'silent'
    );
  });

  it('fades in place when reduced motion is requested', () => {
    assert.deepEqual(
      resolveBadgeAwardPresentation({ ...ready, reducedMotion: true }),
      { kind: 'fade', badgeId: 'silver-mono' }
    );
  });

  it('stays silent when nothing new was awarded', () => {
    assert.deepEqual(
      resolveBadgeAwardPresentation({ ...ready, newlyAddedIds: [] }),
      { kind: 'silent', badgeId: null }
    );
  });
});
