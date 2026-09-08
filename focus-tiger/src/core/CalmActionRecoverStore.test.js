/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CALM_ACTION_RECOVER_EN,
  CALM_ACTION_RECOVER_JA,
  findCalmActionRecoverEntry,
  getCalmActionRecoverPool
} from '../content/calm-action-wisdom/index.js';
import { CalmActionRecoverStore } from './CalmActionRecoverStore.js';

test('Recover pool has 14 stable ids in en and ja', () => {
  assert.equal(CALM_ACTION_RECOVER_EN.length, 14);
  assert.equal(CALM_ACTION_RECOVER_JA.length, 14);
  const enIds = CALM_ACTION_RECOVER_EN.map((e) => e.id);
  const jaIds = new Set(CALM_ACTION_RECOVER_JA.map((e) => e.id));
  for (const id of enIds) {
    assert.match(id, /^CAW-R\d{2}$/);
    assert.equal(jaIds.has(id), true);
    assert.ok(findCalmActionRecoverEntry(id, 'en')?.text);
    assert.ok(findCalmActionRecoverEntry(id, 'ja')?.text);
  }
});

test('getCalmActionRecoverPool falls back to en for unknown locale', () => {
  assert.equal(getCalmActionRecoverPool('xx'), CALM_ACTION_RECOVER_EN);
});

test('CalmActionRecoverStore locks one id per focus session', () => {
  const store = new CalmActionRecoverStore();
  const first = store.resolveQuote('en');
  const second = store.resolveQuote('en');
  assert.ok(first?.id);
  assert.equal(second?.id, first.id);

  store.resetSession();
  const nextSession = store.resolveQuote('en');
  assert.ok(nextSession?.id);
});

test('findCalmActionRecoverEntry returns null for unknown id', () => {
  assert.equal(findCalmActionRecoverEntry('CAW-R99', 'en'), null);
});
