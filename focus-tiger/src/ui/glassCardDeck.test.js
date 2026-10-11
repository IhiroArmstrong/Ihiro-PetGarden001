/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { glassCardIdsToClose } from './glassCardDeck.js';

test('a third glass card closes the older open card and keeps the newer one', () => {
  const { keepIds, closeIds } = glassCardIdsToClose({
    order: ['help-center', 'moments', 'quote'],
    openIds: ['help-center', 'moments'],
    exceptId: 'quote'
  });
  assert.deepEqual(keepIds, ['moments']);
  assert.deepEqual(closeIds, ['help-center']);
});

test('one open card stays when another opens', () => {
  const { keepIds, closeIds } = glassCardIdsToClose({
    order: ['help-center', 'moments'],
    openIds: ['help-center'],
    exceptId: 'moments'
  });
  assert.deepEqual(keepIds, ['help-center']);
  assert.deepEqual(closeIds, []);
});

test('opening nothing keeps no cards', () => {
  const { closeIds } = glassCardIdsToClose({
    order: ['help-center', 'moments'],
    openIds: ['help-center', 'moments'],
    exceptId: null
  });
  assert.deepEqual(closeIds, ['help-center', 'moments']);
});
