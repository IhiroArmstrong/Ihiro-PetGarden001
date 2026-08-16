/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * HINTS_WIRING cluster A (Dock / Sit) — contract locks after 2026-08-03 format exercise.
 * Authority: HINTS_WIRING.md §4.1 · OnboardingHintsStore.resolveAutoHintIds.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HINT_WIRING_BATCH_CLUSTER,
  listHintIdsForWiringCluster
} from '../../scripts/hints-doc-check.js';
import {
  DRAWER_PARKED_HINT_IDS,
  WIDE_MORE_PARKED_HINT_IDS,
  resolveAutoHintIds,
  selectExclusiveAutoHintIds
} from './OnboardingHintsStore.js';
import {
  HINT_TRIGGER_MODES,
  ONBOARDING_HINT_REGISTRY
} from './onboardingHintRegistry.js';

const CLUSTER_A = Object.freeze([
  'honesty-optional',
  'how-shall-we-sit',
  'idle-after-session',
  'quick-start',
  'sit-button'
]);

test('HINTS_WIRING cluster A id set matches batch map', () => {
  assert.deepEqual(listHintIdsForWiringCluster('A'), [...CLUSTER_A]);
  for (const id of CLUSTER_A) {
    assert.equal(HINT_WIRING_BATCH_CLUSTER[id], 'A');
    assert.ok(
      ONBOARDING_HINT_REGISTRY.some((e) => e.id === id),
      `registry missing ${id}`
    );
  }
});

test('cluster A triggerMode matches registry (sit/honesty auto; others click)', () => {
  assert.equal(HINT_TRIGGER_MODES['sit-button'], 'auto');
  assert.equal(HINT_TRIGGER_MODES['honesty-optional'], 'auto');
  assert.equal(HINT_TRIGGER_MODES['how-shall-we-sit'], 'click');
  assert.equal(HINT_TRIGGER_MODES['quick-start'], 'click');
  assert.equal(HINT_TRIGGER_MODES['idle-after-session'], 'click');
});

test('cold Idle resolveAutoHintIds includes sit + how; exclusive auto prefers sit', () => {
  const ids = resolveAutoHintIds({});
  assert.ok(ids.includes('sit-button'));
  assert.ok(ids.includes('how-shall-we-sit'));
  assert.ok(ids.includes('help-affordance')); // click · detailed（簇 E），常与 Sit 同屏候选
  const autoOnly = ids.filter((id) => HINT_TRIGGER_MODES[id] === 'auto');
  assert.ok(autoOnly.includes('sit-button'));
  assert.ok(!autoOnly.includes('help-affordance')); // help 是 click，不进 auto 互斥池
  assert.deepEqual(selectExclusiveAutoHintIds(autoOnly, { maxConcurrent: 1 }), [
    'sit-button'
  ]);
});

test('post-session Idle uses idle-after-session (not sit-button)', () => {
  const ids = resolveAutoHintIds({ hasEverCompletedSession: true });
  assert.ok(ids.includes('idle-after-session'));
  assert.ok(!ids.includes('sit-button'));
});

test('honesty panel Idle surface is honesty-optional', () => {
  const ids = resolveAutoHintIds({ honestyVisible: true });
  assert.ok(ids.includes('honesty-optional'));
  assert.ok(!ids.includes('sit-button'));
});

test('quick-start appears when quickStartVisible on cold Idle', () => {
  const ids = resolveAutoHintIds({ quickStartVisible: true });
  assert.ok(ids.includes('quick-start'));
  assert.ok(ids.includes('sit-button'));
});

test('microRitualOpen suppresses cluster A Sit tips', () => {
  const ids = resolveAutoHintIds({ microRitualOpen: true });
  assert.deepEqual(ids, []);
});

test('narrowPark drops how-shall-we-sit but keeps sit-button', () => {
  assert.ok(DRAWER_PARKED_HINT_IDS.includes('how-shall-we-sit'));
  const ids = resolveAutoHintIds({ narrowPark: true });
  assert.ok(ids.includes('sit-button'));
  assert.ok(!ids.includes('how-shall-we-sit'));
});

test('wide-more park list includes how-shall-we-sit and honesty-optional', () => {
  assert.ok(WIDE_MORE_PARKED_HINT_IDS.includes('how-shall-we-sit'));
  assert.ok(WIDE_MORE_PARKED_HINT_IDS.includes('honesty-optional'));
});
