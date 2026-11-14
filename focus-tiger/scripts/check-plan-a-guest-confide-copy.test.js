/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assessPlanAGuestConfideLine,
  hasPlanASafePhrase
} from './plan-a-guest-confide-copy-policy.js';
import {
  scanMergedGuestLocaleCopy,
  runPlanAGuestConfideCopyCheck
} from './check-plan-a-guest-confide-copy.js';

describe('plan-a guest confide copy policy', () => {
  it('rejects help-center unlock promise without closed-to-guests caveat', () => {
    const verdict = assessPlanAGuestConfideLine(
      'HELP_CENTER_INTRO',
      'After you unlock it, open Focus Tiger on Mac or Windows to talk with Yin locally.'
    );
    assert.equal(verdict.ok, false);
  });

  it('allows Support checkout keys to describe purchasable on-device Confide', () => {
    const verdict = assessPlanAGuestConfideLine(
      'SUPPORT_WEB_LOCAL_AI_NOTE',
      'After you unlock it, open Focus Tiger on Mac or Windows to talk with Yin locally.'
    );
    assert.equal(verdict.ok, true);
  });

  it('accepts explicit not-open-to-guests caveat', () => {
    assert.equal(
      assessPlanAGuestConfideLine(
        'HELP_CENTER_INTRO',
        'Confide is not open to guests in this release.'
      ).ok,
      true
    );
    assert.equal(hasPlanASafePhrase('倾诉尚未对客人开放'), true);
  });

  it('merged runtime copy passes Plan A guest scan', () => {
    const hits = scanMergedGuestLocaleCopy();
    assert.deepEqual(hits, []);
  });
});

describe('plan-a guest confide copy check runner', () => {
  it('runPlanAGuestConfideCopyCheck is green on develop slices', () => {
    assert.equal(runPlanAGuestConfideCopyCheck(), true);
  });
});
