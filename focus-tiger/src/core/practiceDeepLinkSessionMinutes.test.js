/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  armPracticeDeepLinkFocusMinutes,
  peekPracticeDeepLinkFocusMinutes,
  takePracticeDeepLinkFocusMinutes
} from './practiceDeepLinkSessionMinutes.js';

describe('practiceDeepLinkSessionMinutes', () => {
  it('arms, peeks, and consumes once', () => {
    takePracticeDeepLinkFocusMinutes();
    armPracticeDeepLinkFocusMinutes(5);
    assert.equal(peekPracticeDeepLinkFocusMinutes(), 5);
    assert.equal(takePracticeDeepLinkFocusMinutes(), 5);
    assert.equal(takePracticeDeepLinkFocusMinutes(), null);
  });
});
