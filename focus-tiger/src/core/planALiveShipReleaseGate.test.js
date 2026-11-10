/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PLAN_A_LIVE_SHIP_RELEASE_FLAGS,
  practiceBackupCloudEnabled,
  isPracticeStudyMenuReleaseEnabled
} from './planALiveShipReleaseGate.js';

describe('planALiveShipReleaseGate', () => {
  it('lists the three first-ship flags', () => {
    assert.equal(PLAN_A_LIVE_SHIP_RELEASE_FLAGS.length, 3);
    const ids = PLAN_A_LIVE_SHIP_RELEASE_FLAGS.map((f) => f.id);
    assert.deepEqual(ids, [
      'qa-boot',
      'practice-study-menu',
      'cloud-practice-backup'
    ]);
  });

  it('cloud practice backup stays off in source', () => {
    assert.equal(practiceBackupCloudEnabled, false);
  });

  it('practice study menu off in production-shaped env', () => {
    assert.equal(
      isPracticeStudyMenuReleaseEnabled({
        productionBundle: true,
        viteQaBoot: '',
        vitePracticeStudyMenu: ''
      }),
      false
    );
  });
});
