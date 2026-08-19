/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isAttentionAway } from './attentionAwayGate.js';

describe('isAttentionAway', () => {
  it('treats blur or hidden as away in the browser', () => {
    assert.equal(
      isAttentionAway({
        windowFocused: false,
        documentVisible: true,
        hideReason: 'none'
      }),
      true
    );
    assert.equal(
      isAttentionAway({
        windowFocused: true,
        documentVisible: false,
        hideReason: 'none'
      }),
      true
    );
    assert.equal(
      isAttentionAway({
        windowFocused: true,
        documentVisible: true,
        hideReason: 'none'
      }),
      false
    );
  });

  it('does not treat hide-to-tray as away even when hidden', () => {
    assert.equal(
      isAttentionAway({
        windowFocused: false,
        documentVisible: false,
        hideReason: 'tray'
      }),
      false
    );
  });
});
