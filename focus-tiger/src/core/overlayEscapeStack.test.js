/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  dispatchOverlayEscape,
  peekOverlayEscapeStackIds,
  pushOverlayEscapeLayer,
  resetOverlayEscapeStackForTests
} from './overlayEscapeStack.js';

describe('overlayEscapeStack', () => {
  beforeEach(() => {
    resetOverlayEscapeStackForTests();
  });

  it('dismisses only the top layer', () => {
    const closed = [];
    const popReflection = pushOverlayEscapeLayer({
      id: 'reflection',
      dismiss: () => {
        closed.push('reflection');
        popReflection();
      }
    });
    const popMenu = pushOverlayEscapeLayer({
      id: 'menu',
      dismiss: () => {
        closed.push('menu');
        popMenu();
      }
    });

    const event = { key: 'Escape', preventDefault() {}, stopImmediatePropagation() {} };
    assert.equal(dispatchOverlayEscape(event), true);
    assert.deepEqual(closed, ['menu']);
    assert.deepEqual(peekOverlayEscapeStackIds(), ['reflection']);

    assert.equal(dispatchOverlayEscape(event), true);
    assert.deepEqual(closed, ['menu', 'reflection']);
  });

  it('ignores non-Escape keys', () => {
    let hit = false;
    pushOverlayEscapeLayer({ id: 'x', dismiss: () => { hit = true; } });
    assert.equal(
      dispatchOverlayEscape({ key: 'Enter', preventDefault() {}, stopImmediatePropagation() {} }),
      false
    );
    assert.equal(hit, false);
  });
});
