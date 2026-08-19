/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FOCUS_COIN_CATALOG,
  listShopFocusCoinSkus
} from './focusCoinsLedger.js';
import {
  FOCUS_COIN_SKU_NAME_KEYS,
  formatFocusCoinGapMessage,
  listFocusCoinRedeemGaps,
  listFocusCoinSurfaceRows
} from './focusCoinsSurface.js';

const LOOKUP = {
  YIN_COIN_GAP_BALANCE: 'Need {n} more Focus Coins.',
  YIN_COIN_GAP_MINUTES: 'Need {n} more lifetime minutes.',
  YIN_COIN_GAP_PRACTICE_DAYS: 'Need {n} more practice days.',
  YIN_COIN_GAP_INCENSE: 'Need incense, or {n} more practice days.',
  YIN_COIN_GAP_LOTUS: 'Need a first lotus bloom.',
  YIN_COIN_GAP_HONESTY: 'Need one Honesty wake.',
  YIN_COIN_GAP_RECOVER: 'Need one active Recover.'
};

const SHOP_IDS = [
  'title.sits-with-yin',
  'title.returned-gently',
  'title.long-sitter',
  'badge.rare.quiet-pebble',
  'collection.porcelain.qing-vase',
  'collection.bronze.ritual-vessel',
  'gesture.wave-hello'
];

test('L3 surface lists shop SKUs only — never retired overlays', () => {
  const shop = listShopFocusCoinSkus();
  assert.equal(shop.length, 7);
  const rows = listFocusCoinSurfaceRows({ balance: 0 });
  assert.equal(rows.length, 7);
  assert.deepEqual(
    rows.map((row) => row.id),
    SHOP_IDS
  );
  assert.equal(
    rows.some((row) => row.id === 'space.lotus-dew'),
    false
  );
  for (const sku of shop) {
    assert.equal(typeof FOCUS_COIN_SKU_NAME_KEYS[sku.id], 'string');
  }
  assert.ok(FOCUS_COIN_CATALOG.some((sku) => sku.retiredOverlay === true));
});

test('quiet pebble with enough coins is redeemable with no extra gate', () => {
  const rows = listFocusCoinSurfaceRows({ balance: 72 });
  const pebble = rows.find((row) => row.id === 'badge.rare.quiet-pebble');
  assert.equal(pebble?.canRedeem, true);
  assert.deepEqual(pebble?.gaps, []);
});

test('shortfall copy names the coin gap instead of a vague cannot-redeem', () => {
  const rows = listFocusCoinSurfaceRows({ balance: 10 });
  const pebble = rows.find((row) => row.id === 'badge.rare.quiet-pebble');
  assert.equal(pebble?.canRedeem, false);
  assert.equal(pebble?.reason, 'insufficient-balance');
  assert.equal(
    formatFocusCoinGapMessage(pebble?.gaps ?? [], (key) => LOOKUP[key]),
    'Need 62 more Focus Coins.'
  );
});

test('久坐的人 shows both coin and lifetime-minute gaps when both are short', () => {
  const sku = listShopFocusCoinSkus().find((s) => s.id === 'title.long-sitter');
  const gaps = listFocusCoinRedeemGaps(sku, {
    balance: 40,
    lifetimeMinutes: 120
  });
  assert.deepEqual(gaps, [
    { kind: 'balance', need: 320 },
    { kind: 'minutes', need: 480 }
  ]);
  const msg = formatFocusCoinGapMessage(gaps, (key) => LOOKUP[key]);
  assert.match(msg, /320/);
  assert.match(msg, /480/);
});

test('porcelain stills redeem without garden gates', () => {
  const sku = listShopFocusCoinSkus().find(
    (s) => s.id === 'collection.porcelain.qing-vase'
  );
  const gaps = listFocusCoinRedeemGaps(sku, {
    balance: 40,
    hasLotusBloom: false
  });
  assert.deepEqual(gaps, []);
});

test('owned SKU has no gaps and Wear is offered on titles', () => {
  const rows = listFocusCoinSurfaceRows({
    balance: 0,
    ownedIds: ['title.sits-with-yin'],
    equippedTitle: 'title.sits-with-yin'
  });
  const title = rows.find((row) => row.id === 'title.sits-with-yin');
  assert.equal(title?.owned, true);
  assert.equal(title?.canRedeem, false);
  assert.equal(title?.reason, 'already-owned');
  assert.deepEqual(title?.gaps, []);
  assert.equal(title?.showWear, true);
  assert.equal(title?.wearingTitleId, 'title.sits-with-yin');
});
