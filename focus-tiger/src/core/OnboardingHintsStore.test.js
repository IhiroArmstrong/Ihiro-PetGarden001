import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HINT_IDS,
  normalizeHintsSeen,
  createHintsSeenStore,
  resolveHintForScene,
  resolveAutoHintIds,
  resolveRemedyHintIds,
  resolvePrimaryRemedyHintId,
  resolveRemedyCatalogHintIds,
  selectExclusiveAutoHintIds,
  appendIdleChromeHintIds
} from './OnboardingHintsStore.js';

test('normalizeHintsSeen only keeps known hintIds', () => {
  const n = normalizeHintsSeen({
    'sit-button': true,
    junk: true,
    notice: false
  });
  assert.equal(n['sit-button'], true);
  assert.equal(n.junk, undefined);
  assert.equal(n.notice, undefined);
});

test('markSeen is first-write-only and ids do not interfere', () => {
  /** @type {Record<string, true>} */
  let saved = {};
  const store = createHintsSeenStore(
    () => saved,
    (v) => {
      saved = v;
    }
  );
  assert.equal(store.isSeen('sit-button'), false);
  assert.equal(store.markSeen('sit-button'), true);
  assert.equal(store.markSeen('sit-button'), false);
  assert.equal(store.isSeen('sit-button'), true);
  assert.equal(store.isSeen('notice'), false);
  store.markSeen('notice');
  assert.equal(store.isSeen('notice'), true);
  assert.equal(store.isSeen('sit-button'), true);
});

test('clear resets all seen flags', () => {
  /** @type {Record<string, true>} */
  let saved = { 'sit-button': true, notice: true };
  const store = createHintsSeenStore(
    () => saved,
    (v) => {
      saved = v;
    }
  );
  store.clear();
  assert.deepEqual(store.getAll(), {});
  for (const id of HINT_IDS) {
    assert.equal(store.isSeen(id), false);
  }
});

test('resolveHintForScene picks the most specific surface', () => {
  assert.equal(resolveHintForScene({ reflectionOpen: true }), 'reflection');
  assert.equal(resolveHintForScene({ isFocusing: true }), 'rise-button');
  assert.equal(
    resolveHintForScene({ ambientPanelOpen: true }),
    'ambient-soundscape'
  );
  assert.equal(
    resolveHintForScene({ arrivalOpen: true, arrivalPhase: 'breath' }),
    'breathing'
  );
  assert.equal(
    resolveHintForScene({ companionExpanded: true }),
    'companion-mode'
  );
  assert.equal(
    resolveHintForScene({ honestyBridgeVisible: true }),
    'honesty-bridge'
  );
  assert.equal(resolveHintForScene({ honestyVisible: true }), 'honesty-optional');
  assert.equal(resolveHintForScene({ isDormant: true }), 'dormant-open');
  assert.equal(
    resolveHintForScene({ hasEverCompletedSession: true }),
    'idle-after-session'
  );
  assert.equal(resolveHintForScene({}), 'sit-button');
});

test('appendIdleChromeHintIds adds heatmap / reminder / micro-ritual / ambient-gated', () => {
  /** @type {string[]} */
  const ids = ['sit-button'];
  appendIdleChromeHintIds(ids, {
    weeklyHeatmapVisible: true,
    microRitualEntryVisible: true
  });
  assert.deepEqual(ids, [
    'sit-button',
    'weekly-heatmap',
    'in-app-reminder',
    'micro-ritual',
    'ambient-gated'
  ]);
});

test('appendIdleChromeHintIds adds honesty idle entry + quick-start balls', () => {
  /** @type {string[]} */
  const ids = ['sit-button'];
  appendIdleChromeHintIds(ids, {
    honestyIdleEntryVisible: true,
    quickStartVisible: true
  });
  assert.deepEqual(ids, [
    'sit-button',
    'honesty-optional',
    'quick-start',
    'ambient-gated'
  ]);
});

test('resolveRemedyHintIds lists scene hints without help-affordance and expands companion panel', () => {
  assert.deepEqual(resolveRemedyHintIds({}), [
    'sit-button',
    'how-shall-we-sit',
    'ambient-gated'
  ]);
  assert.deepEqual(
    resolveRemedyHintIds({
      weeklyHeatmapVisible: true,
      microRitualEntryVisible: true
    }),
    [
      'sit-button',
      'how-shall-we-sit',
      'weekly-heatmap',
      'in-app-reminder',
      'micro-ritual',
      'ambient-gated'
    ]
  );
  assert.deepEqual(resolveRemedyHintIds({ isFocusing: true }), [
    'rise-button',
    'ambient-soundscape'
  ]);
  assert.deepEqual(resolveRemedyHintIds({ companionExpanded: true }), [
    'companion-mode',
    'companion-stay',
    'companion-away',
    'companion-across-tools'
  ]);
  assert.deepEqual(
    resolveRemedyHintIds({
      honestyBridgeVisible: true,
      weeklyHeatmapVisible: true,
      microRitualEntryVisible: false
    }),
    [
      'honesty-bridge',
      'sit-button',
      'how-shall-we-sit',
      'weekly-heatmap',
      'in-app-reminder',
      'ambient-gated'
    ]
  );
  assert.ok(!resolveRemedyHintIds({}).includes('help-affordance'));
});

test('resolvePrimaryRemedyHintId + catalog split Idle / Arrival / Focusing', () => {
  assert.equal(resolvePrimaryRemedyHintId({}), 'sit-button');
  assert.equal(
    resolvePrimaryRemedyHintId({ arrivalOpen: true, arrivalPhase: 'breath' }),
    'breathing'
  );
  assert.equal(resolvePrimaryRemedyHintId({ isFocusing: true }), 'rise-button');
  const catalog = resolveRemedyCatalogHintIds({});
  assert.ok(!catalog.includes('sit-button'));
  assert.ok(catalog.length >= 1);
  assert.deepEqual(
    resolveRemedyCatalogHintIds({ isFocusing: true }),
    resolveRemedyHintIds({ isFocusing: true }).filter((id) => id !== 'rise-button')
  );
});

test('selectExclusiveAutoHintIds keeps at most one auto hint by priority', () => {
  assert.deepEqual(
    selectExclusiveAutoHintIds(
      ['sit-button', 'how-shall-we-sit', 'help-affordance'],
      { maxConcurrent: 1 }
    ),
    ['help-affordance']
  );
  assert.deepEqual(
    selectExclusiveAutoHintIds(['rise-button', 'ambient-soundscape'], {
      maxConcurrent: 1
    }),
    ['rise-button']
  );
  assert.deepEqual(
    selectExclusiveAutoHintIds(['how-shall-we-sit', 'sit-button'], {
      maxConcurrent: 1
    }),
    ['sit-button']
  );
  assert.deepEqual(selectExclusiveAutoHintIds([], { maxConcurrent: 1 }), []);
  assert.deepEqual(
    selectExclusiveAutoHintIds(['sit-button', 'sit-button'], { maxConcurrent: 1 }),
    ['sit-button']
  );
});

test('resolveAutoHintIds includes help-affordance on idle chrome including DORMANT', () => {
  assert.deepEqual(resolveAutoHintIds({ isDormant: true }), [
    'dormant-open',
    'ambient-gated',
    'help-affordance'
  ]);
  assert.deepEqual(resolveAutoHintIds({ honestyVisible: true }), [
    'honesty-optional',
    'help-affordance'
  ]);
  assert.deepEqual(resolveAutoHintIds({}), [
    'sit-button',
    'how-shall-we-sit',
    'ambient-gated',
    'help-affordance'
  ]);
  assert.deepEqual(
    resolveAutoHintIds({
      weeklyHeatmapVisible: true,
      microRitualEntryVisible: true
    }),
    [
      'sit-button',
      'how-shall-we-sit',
      'weekly-heatmap',
      'in-app-reminder',
      'micro-ritual',
      'ambient-gated',
      'help-affordance'
    ]
  );
  assert.deepEqual(resolveAutoHintIds({ isFocusing: true }), [
    'rise-button',
    'ambient-soundscape'
  ]);
  assert.deepEqual(resolveAutoHintIds({ reflectionOpen: true }), ['reflection']);
  assert.deepEqual(
    resolveAutoHintIds({ arrivalOpen: true, arrivalPhase: 'choose' }),
    ['choose']
  );
  assert.deepEqual(
    resolveAutoHintIds({
      honestyBridgeVisible: true,
      weeklyHeatmapVisible: true
    }),
    [
      'honesty-bridge',
      'sit-button',
      'how-shall-we-sit',
      'weekly-heatmap',
      'in-app-reminder',
      'ambient-gated',
      'help-affordance'
    ]
  );
});
