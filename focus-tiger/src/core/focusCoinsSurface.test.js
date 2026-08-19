/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { FOCUS_COIN_CATALOG } from './focusCoinsLedger.js';
import {
  FOCUS_COIN_SKU_NAME_KEYS,
  formatFocusCoinGapMessage,
  listFocusCoinRedeemGaps,
  listFocusCoinSurfaceRows
} from './focusCoinsSurface.js';

const LOOKUP = {
  YIN_COIN_GAP_BALANCE: 'Need {n} more Yin Coins.',
  YIN_COIN_GAP_MINUTES: 'Need {n} more lifetime minutes.',
  YIN_COIN_GAP_PRACTICE_DAYS: 'Need {n} more practice days.',
  YIN_COIN_GAP_INCENSE: 'Need incense, or {n} more practice days.',
  YIN_COIN_GAP_LOTUS: 'Need a first lotus bloom.',
  YIN_COIN_GAP_HONESTY: 'Need one Honesty wake.',
  YIN_COIN_GAP_RECOVER: 'Need one active Recover.'
};

test('L3 surface lists every catalog SKU (8), never a subset', () => {
  assert.equal(FOCUS_COIN_CATALOG.length, 8);
  const rows = listFocusCoinSurfaceRows({ balance: 0 });
  assert.equal(rows.length, 8);
  assert.deepEqual(
    rows.map((row) => row.id),
    FOCUS_COIN_CATALOG.map((sku) => sku.id)
  );
  for (const sku of FOCUS_COIN_CATALOG) {
    assert.equal(typeof FOCUS_COIN_SKU_NAME_KEYS[sku.id], 'string');
  }
});

test('wood beads with enough coins is redeemable with no extra gate', () => {
  const rows = listFocusCoinSurfaceRows({ balance: 36 });
  const beads = rows.find((row) => row.id === 'yin-accent.wood-beads');
  assert.equal(beads?.canRedeem, true);
  assert.deepEqual(beads?.gaps, []);
});

test('shortfall copy names the coin gap instead of a vague cannot-redeem', () => {
  const rows = listFocusCoinSurfaceRows({ balance: 10 });
  const beads = rows.find((row) => row.id === 'yin-accent.wood-beads');
  assert.equal(beads?.canRedeem, false);
  assert.equal(beads?.reason, 'insufficient-balance');
  assert.equal(
    formatFocusCoinGapMessage(beads?.gaps ?? [], (key) => LOOKUP[key]),
    'Need 26 more Yin Coins.'
  );
});

test('Sumeru shows both coin and lifetime-minute gaps when both are short', () => {
  const sku = FOCUS_COIN_CATALOG.find((s) => s.id === 'bundle.sumeru-seat');
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

test('lotus dew names the bloom gate even when coins are enough', () => {
  const sku = FOCUS_COIN_CATALOG.find((s) => s.id === 'space.lotus-dew');
  const gaps = listFocusCoinRedeemGaps(sku, {
    balance: 48,
    hasLotusBloom: false
  });
  assert.deepEqual(gaps, [{ kind: 'lotus-bloom' }]);
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
