/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CONFIDE_OPEN_BLOCKED_ENTITLEMENT_TOAST_TESTID } from './confideOpenBlockedFeedback.js';
import { showConfideOpenBlockedToast } from './confideOpenBlockedToast.js';

describe('confideOpenBlockedToast', () => {
  it('sets entitlement test id when confide mount is off from contemplative support', () => {
    const element = { dataset: {} };
    let shown = '';
    showConfideOpenBlockedToast({
      toast: {
        element,
        show: (text) => {
          shown = text;
        }
      },
      locale: 'en',
      blockedVariant: 'entitlement'
    });
    assert.equal(
      element.dataset.testid,
      CONFIDE_OPEN_BLOCKED_ENTITLEMENT_TOAST_TESTID
    );
    assert.doesNotMatch(shown, /crisis helpline/i);
  });
});