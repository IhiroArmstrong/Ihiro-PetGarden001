/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  glassCardIdsToClose,
  glassCardInlineZIndex,
  GLASS_CARD_KEEP_STYLESHEET_Z
} from './glassCardDeck.js';

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

test('Support modal keeps stylesheet z-index so the dim layer cannot eat Subscribe', () => {
  assert.equal(GLASS_CARD_KEEP_STYLESHEET_Z.has('yin-support-modal'), true);
  assert.equal(glassCardInlineZIndex('yin-support-modal', { isFront: true }), null);
  assert.equal(glassCardInlineZIndex('yin-support-modal', { isFront: false }), null);
  const front = glassCardInlineZIndex('help-center', { isFront: true });
  const back = glassCardInlineZIndex('help-center', { isFront: false });
  assert.equal(front, '19');
  assert.equal(back, '18');
  assert.ok(Number(front) < 25, 'deck stack stays below Support dim (25)');
});
