/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isClientQaHarnessAllowed } from './clientQaHarnessGate.js';
import { isCompanionEntitled } from './companionEntitlement.js';

describe('clientQaHarnessGate', () => {
  it('allows harness only in dev or VITE_FT_QA_BOOT', () => {
    assert.equal(isClientQaHarnessAllowed({ viteDev: false, viteQaBoot: '0' }), false);
    assert.equal(isClientQaHarnessAllowed({ viteDev: true, viteQaBoot: '0' }), true);
    assert.equal(isClientQaHarnessAllowed({ viteDev: false, viteQaBoot: '1' }), true);
  });
});

describe('companionEntitlement · production QA params', () => {
  it('ignores ?companionEntitled=1 when QA harness is off', () => {
    const mem = { getItem() { return null; }, setItem() {}, removeItem() {} };
    assert.equal(
      isCompanionEntitled({
        storage: mem,
        search: '?companionEntitled=1',
        qaHarnessAllowed: false
      }),
      false
    );
  });
});
