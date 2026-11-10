/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isPracticeStudyMenuReleaseEnabled } from './practiceStudyReleaseGate.js';

describe('practiceStudyReleaseGate', () => {
  it('off in production-shaped env without QA flags', () => {
    assert.equal(
      isPracticeStudyMenuReleaseEnabled({
        productionBundle: true,
        viteQaBoot: '',
        vitePracticeStudyMenu: ''
      }),
      false
    );
  });

  it('on outside production bundles (dev / unit tests)', () => {
    assert.equal(
      isPracticeStudyMenuReleaseEnabled({
        productionBundle: false,
        viteQaBoot: '',
        vitePracticeStudyMenu: ''
      }),
      true
    );
  });

  it('on in production bundle when QA boot or explicit menu flag', () => {
    assert.equal(
      isPracticeStudyMenuReleaseEnabled({
        productionBundle: true,
        viteQaBoot: '1',
        vitePracticeStudyMenu: ''
      }),
      true
    );
    assert.equal(
      isPracticeStudyMenuReleaseEnabled({
        productionBundle: true,
        viteQaBoot: '',
        vitePracticeStudyMenu: '1'
      }),
      true
    );
  });
});
