/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hasSeenIdleYinTapHint,
  markIdleYinTapHintSeen,
  shouldShowIdleYinTapHint
} from './idleYinTapHintGate.js';

describe('shouldShowIdleYinTapHint', () => {
  it('shows once on Idle when the tap hit is armed and flower is gone', () => {
    assert.equal(
      shouldShowIdleYinTapHint({
        seen: false,
        sessionState: 'IDLE',
        overlayBusy: false,
        flowerWelcomeVisible: false,
        armed: true
      }),
      true
    );
  });

  it('does not show after the first tap was recorded', () => {
    assert.equal(
      shouldShowIdleYinTapHint({
        seen: true,
        sessionState: 'IDLE',
        armed: true
      }),
      false
    );
  });

  it('waits for flower welcome and overlays', () => {
    assert.equal(
      shouldShowIdleYinTapHint({
        seen: false,
        sessionState: 'IDLE',
        flowerWelcomeVisible: true,
        armed: true
      }),
      false
    );
    assert.equal(
      shouldShowIdleYinTapHint({
        seen: false,
        sessionState: 'IDLE',
        overlayBusy: true,
        armed: true
      }),
      false
    );
  });
});

describe('idle yin tap hint storage', () => {
  it('round-trips seen on a Map-like Storage', () => {
    const mem = new Map();
    const storage = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => {
        mem.set(k, String(v));
      }
    };
    assert.equal(hasSeenIdleYinTapHint(storage), false);
    markIdleYinTapHintSeen(storage);
    assert.equal(hasSeenIdleYinTapHint(storage), true);
  });
});
