/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { handleSitClickWhenIdleChrome } from './sitClickWhenIdleChrome.js';

describe('handleSitClickWhenIdleChrome', () => {
  it('starts arrival when Sit idle action is start-arrival', () => {
    const calls = [];
    const began = handleSitClickWhenIdleChrome({
      completionPending: false,
      arrivalOpen: false,
      isFocusing: false,
      microRitualOpen: false,
      resolveSitClickWhenIdle: () => 'start-arrival',
      cancelPending: () => calls.push('cancel'),
      hideHonesty: () => calls.push('hide'),
      startArrival: () => calls.push('arrival'),
      beginFocusWithSelectedMode: () => calls.push('focus')
    });
    assert.equal(began, false);
    assert.deepEqual(calls, ['cancel', 'hide', 'arrival']);
  });

  it('ignores while arrival is already open', () => {
    let arrived = 0;
    const began = handleSitClickWhenIdleChrome({
      completionPending: false,
      arrivalOpen: true,
      isFocusing: false,
      microRitualOpen: false,
      resolveSitClickWhenIdle: () => 'start-arrival',
      cancelPending: () => {},
      hideHonesty: () => {},
      startArrival: () => {
        arrived += 1;
      },
      beginFocusWithSelectedMode: () => {}
    });
    assert.equal(began, false);
    assert.equal(arrived, 0);
  });
});
