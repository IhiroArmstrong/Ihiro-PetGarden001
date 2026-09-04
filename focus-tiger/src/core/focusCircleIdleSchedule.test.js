/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldScheduleFocusCirclePeekForSessionState,
  syncFocusCircleIdleObserverPeek
} from './focusCircleIdleSchedule.js';
import { stopFocusCircleIdleObserverPeek } from './focusCirclePresence.js';

describe('focusCircleIdleSchedule', () => {
  it('only schedules on IDLE', () => {
    assert.equal(shouldScheduleFocusCirclePeekForSessionState('IDLE'), true);
    assert.equal(shouldScheduleFocusCirclePeekForSessionState('FOCUSING'), false);
  });

  it('stops observer when leaving IDLE', () => {
    stopFocusCircleIdleObserverPeek();
    const started = syncFocusCircleIdleObserverPeek('IDLE', {
      storage: null,
      delayMs: 999_999
    });
    assert.equal(started, true);
    const stopped = syncFocusCircleIdleObserverPeek('FOCUSING', { storage: null });
    assert.equal(stopped, false);
    stopFocusCircleIdleObserverPeek();
  });
});
