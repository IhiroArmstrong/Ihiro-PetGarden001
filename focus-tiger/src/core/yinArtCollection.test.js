/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { FOCUS_COIN_CURIO_SHOP_IDS } from './focusCoinsLedger.js';
import { requestYinArtPurchase, YIN_ART_WORKS } from './yinArtCollection.js';

test('art collection is five purchased works, not the curio shop', () => {
  assert.equal(YIN_ART_WORKS.length, 5);
  assert.equal(FOCUS_COIN_CURIO_SHOP_IDS.length, 8);
  const shopThumbs = new Set([
    '/ui/collection-objects/silver-gilt-openwork-lotus-censer.png',
    '/ui/collection-objects/celadon-beast-foot-pan.png',
    '/ui/collection-objects/silver-gilt-beast-box.png',
    '/ui/collection-objects/bronze-gilt-hunting-stem-bowl.png',
    '/ui/collection-objects/celadon-cong-vessel.png',
    '/ui/collection-objects/celadon-garlic-mouth-vase.png',
    '/ui/collection-objects/ge-crackle-tripod-ding.png',
    '/ui/collection-objects/blue-white-taotie-ding.png'
  ]);
  for (const work of YIN_ART_WORKS) {
    assert.equal(shopThumbs.has(work.src), false);
    assert.match(work.priceLabel, /^\$\d\.\d{2}$/);
  }
});

test('asking to buy does not mark the work owned', () => {
  const result = requestYinArtPurchase('jun-glaze-saddled-horse');
  assert.deepEqual(result, {
    ok: false,
    reason: 'payment-not-open',
    owned: false
  });
  assert.equal(requestYinArtPurchase('missing').reason, 'unknown');
});
