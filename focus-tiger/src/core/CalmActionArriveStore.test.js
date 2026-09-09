/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CALM_ACTION_ARRIVE_EN,
  findCalmActionArriveEntry,
  getCalmActionArrivePool
} from '../content/calm-action-wisdom/index.js';
import { CalmActionArriveStore } from './CalmActionArriveStore.js';

test('Calm Action Arrive pool has 14 ids with en + ja text', () => {
  assert.equal(CALM_ACTION_ARRIVE_EN.length, 14);
  for (const { id } of CALM_ACTION_ARRIVE_EN) {
    assert.ok(findCalmActionArriveEntry(id, 'en')?.text);
    assert.ok(findCalmActionArriveEntry(id, 'ja')?.text);
  }
});

test('getCalmActionArrivePool falls back to en for unknown locale', () => {
  assert.equal(getCalmActionArrivePool('xx'), CALM_ACTION_ARRIVE_EN);
});

test('CalmActionArriveStore shows once per armed flow and locks id per day', () => {
  const store = new CalmActionArriveStore();
  assert.equal(store.resolveQuote('en'), null);

  store.arm();
  const first = store.resolveQuote('en');
  assert.ok(first?.id);
  store.markShown();
  assert.equal(store.resolveQuote('en'), null);

  store.arm();
  const second = store.resolveQuote('en');
  assert.equal(second?.id, first?.id);
});

test('findCalmActionArriveEntry returns null for unknown id', () => {
  assert.equal(findCalmActionArriveEntry('CAW-A99', 'en'), null);
});
