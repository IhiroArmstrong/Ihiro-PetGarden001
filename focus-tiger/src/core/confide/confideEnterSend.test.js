/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldSubmitConfideOnEnter } from './confideEnterSend.js';

describe('Confide Enter send', () => {
  it('submits on Enter and keeps Shift+Enter / IME composing', () => {
    assert.equal(shouldSubmitConfideOnEnter({ key: 'Enter' }), true);
    assert.equal(shouldSubmitConfideOnEnter({ key: 'Enter', shiftKey: true }), false);
    assert.equal(
      shouldSubmitConfideOnEnter({ key: 'Enter', isComposing: true }),
      false
    );
    assert.equal(shouldSubmitConfideOnEnter({ key: 'Enter', keyCode: 229 }), false);
    assert.equal(shouldSubmitConfideOnEnter({ key: 'Escape' }), false);
  });
});
