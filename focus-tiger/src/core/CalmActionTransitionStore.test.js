/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CALM_ACTION_TRANSITION_EN,
  CALM_ACTION_TRANSITION_JA,
  findCalmActionTransitionEntry,
  getCalmActionTransitionPool
} from '../content/calm-action-wisdom/index.js';
import { CalmActionTransitionStore } from './CalmActionTransitionStore.js';

test('Transition pool has 10 stable ids in en and ja', () => {
  assert.equal(CALM_ACTION_TRANSITION_EN.length, 10);
  assert.equal(CALM_ACTION_TRANSITION_JA.length, 10);
  const enIds = CALM_ACTION_TRANSITION_EN.map((e) => e.id);
  const jaIds = new Set(CALM_ACTION_TRANSITION_JA.map((e) => e.id));
  for (const id of enIds) {
    assert.match(id, /^CAW-T\d{2}$/);
    assert.equal(jaIds.has(id), true);
    assert.ok(findCalmActionTransitionEntry(id, 'en')?.text);
    assert.ok(findCalmActionTransitionEntry(id, 'ja')?.text);
  }
});

test('getCalmActionTransitionPool falls back to en for unknown locale', () => {
  assert.equal(getCalmActionTransitionPool('xx'), CALM_ACTION_TRANSITION_EN);
});

test('CalmActionTransitionStore excludes previous id on consecutive picks', () => {
  const store = new CalmActionTransitionStore();
  const seen = new Set();
  let prev = null;
  for (let i = 0; i < 20; i += 1) {
    const entry = store.resolveQuote('en');
    assert.ok(entry?.id);
    if (prev) {
      assert.notEqual(entry.id, prev);
    }
    seen.add(entry.id);
    prev = entry.id;
  }
  assert.ok(seen.size >= 2);
});

test('findCalmActionTransitionEntry returns null for unknown id', () => {
  assert.equal(findCalmActionTransitionEntry('CAW-T99', 'en'), null);
});
