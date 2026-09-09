/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CALM_ACTION_REFLECT_EN,
  findCalmActionReflectEntry,
  getCalmActionReflectPool
} from '../content/calm-action-wisdom/index.js';
import { CalmActionReflectStore } from './CalmActionReflectStore.js';

test('Calm Action Reflect pool has 20 ids with en + ja text', () => {
  assert.equal(CALM_ACTION_REFLECT_EN.length, 20);
  for (const { id } of CALM_ACTION_REFLECT_EN) {
    assert.ok(findCalmActionReflectEntry(id, 'en')?.text);
    assert.ok(findCalmActionReflectEntry(id, 'ja')?.text);
  }
});

test('getCalmActionReflectPool falls back to en for unknown locale', () => {
  assert.equal(getCalmActionReflectPool('xx'), CALM_ACTION_REFLECT_EN);
});

test('CalmActionReflectStore locks one id per calendar day', () => {
  const store = new CalmActionReflectStore();
  const first = store.resolveQuote('en');
  assert.ok(first?.id);
  const second = store.resolveQuote('en');
  assert.equal(second?.id, first?.id);
});

test('findCalmActionReflectEntry returns null for unknown id', () => {
  assert.equal(findCalmActionReflectEntry('CAW-L99', 'en'), null);
});
