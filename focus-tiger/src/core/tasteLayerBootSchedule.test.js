/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TASTE_BOOT_PREFETCH_DELAY_MS,
  TASTE_BOOT_PREFETCH_RETRY_MS,
  nextBootNetworkDelayMs
} from './tasteLayerBootSchedule.js';

describe('tasteLayerBootSchedule', () => {
  it('waits out the first breath, then yields to an open dissolve', () => {
    assert.equal(
      nextBootNetworkDelayMs({ overlayBusy: false, firstWaitDone: false }),
      TASTE_BOOT_PREFETCH_DELAY_MS
    );
    assert.equal(
      nextBootNetworkDelayMs({ overlayBusy: true, firstWaitDone: true }),
      TASTE_BOOT_PREFETCH_RETRY_MS
    );
    assert.equal(
      nextBootNetworkDelayMs({ overlayBusy: false, firstWaitDone: true }),
      0
    );
  });
});
