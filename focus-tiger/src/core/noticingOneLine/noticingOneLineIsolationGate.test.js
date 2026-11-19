/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { isNoticingOneLineIsolationPassed } from './noticingOneLineIsolationGate.js';

test('isolation extra-label gate follows committed lab summary JSON', () => {
  assert.equal(typeof isNoticingOneLineIsolationPassed(), 'boolean');
  assert.equal(isNoticingOneLineIsolationPassed(), false);
});
