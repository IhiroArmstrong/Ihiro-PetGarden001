/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readDebugLanternsQueryFlag,
  DEBUG_LANTERNS_GLOBAL_MOCK_COUNT,
  DEBUG_LANTERNS_CIRCLE_MOCK_COUNT
} from './presenceLanternDebug.js';

test('readDebugLanternsQueryFlag accepts dev preview toggles', () => {
  assert.equal(readDebugLanternsQueryFlag('?debugLanterns=1'), true);
  assert.equal(readDebugLanternsQueryFlag('debugLanterns=true'), true);
  assert.equal(readDebugLanternsQueryFlag('?debugLanterns=0'), false);
  assert.equal(readDebugLanternsQueryFlag('?product=1'), false);
});

test('debug mock counts stay stable for chrome preview', () => {
  assert.equal(DEBUG_LANTERNS_GLOBAL_MOCK_COUNT, 3);
  assert.equal(DEBUG_LANTERNS_CIRCLE_MOCK_COUNT, 2);
});
