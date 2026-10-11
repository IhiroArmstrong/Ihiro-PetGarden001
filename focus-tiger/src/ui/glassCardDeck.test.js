/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  glassCardIdsToClose,
  glassCardInlineZIndex,
  GLASS_CARD_KEEP_STYLESHEET_Z
} from './glassCardDeck.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SUPPORT_SRC = readFileSync(join(HERE, 'SupportYinModalUI.js'), 'utf8');

/** Same ids the e2e hit-contract watches. Dim-eat-click must fail these. */
const SUPPORT_MONEY_CTA_TEST_IDS = [
  'yin-support-pro-cta',
  'yin-support-membership-cta',
  'yin-support-sanctuary-cta',
  'yin-support-tea-cta',
  'yin-support-companion-addon-cta',
  'yin-support-close'
];

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

test('Support CSS keeps the pay modal above its dim, and the dim above the glass deck', () => {
  const backdrop = SUPPORT_SRC.match(
    /\.yin-support-backdrop \{[\s\S]*?z-index:\s*(\d+)/
  );
  const modal = SUPPORT_SRC.match(
    /\.yin-support-modal \{[\s\S]*?z-index:\s*(\d+)/
  );
  assert.ok(backdrop, 'Support dim z-index is in the stylesheet');
  assert.ok(modal, 'Support modal z-index is in the stylesheet');
  const dimZ = Number(backdrop[1]);
  const modalZ = Number(modal[1]);
  assert.equal(dimZ, 25);
  assert.equal(modalZ, 26);
  assert.ok(modalZ > dimZ, 'pay card must sit above its own dim');
  const deckFront = Number(
    glassCardInlineZIndex('help-center', { isFront: true })
  );
  assert.ok(deckFront < dimZ, 'forcing a glass card to 19 must stay under the dim');
});

test('Support money CTAs stay declared so a deck rewrite cannot drop them silently', () => {
  for (const id of SUPPORT_MONEY_CTA_TEST_IDS) {
    assert.match(
      SUPPORT_SRC,
      new RegExp(`['"]${id}['"]`),
      `${id} must remain a Support control`
    );
  }
});
