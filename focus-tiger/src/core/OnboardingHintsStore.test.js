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
  appendIdleChromeHintIds,
  filterHintsForNarrowDrawer,
  isDrawerParkedHintId
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

test('appendIdleChromeHintIds adds heatmap / reminder / micro-ritual / quick-start / ambient-gated', () => {
  /** @type {string[]} */
  const ids = ['sit-button'];
  appendIdleChromeHintIds(ids, {
    weeklyHeatmapVisible: true,
    microRitualEntryVisible: true,
    quickStartVisible: true
  });
  assert.deepEqual(ids, [
    'sit-button',
    'weekly-heatmap',
    'in-app-reminder',
    'micro-ritual',
    'quick-start',
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
    'ambient-gated',
    'focus-hud-ring',
    'focus-hud-progress',
    'focus-hud-streak'
  ]);
  assert.deepEqual(
    resolveRemedyHintIds({
      weeklyHeatmapVisible: true,
      microRitualEntryVisible: true,
      quickStartVisible: true
    }),
    [
      'sit-button',
      'how-shall-we-sit',
      'weekly-heatmap',
      'in-app-reminder',
      'micro-ritual',
      'quick-start',
      'ambient-gated',
      'focus-hud-ring',
      'focus-hud-progress',
      'focus-hud-streak'
    ]
  );
  assert.deepEqual(resolveRemedyHintIds({ isFocusing: true }), [
    'rise-button',
    'ambient-soundscape',
    'focus-hud-ring',
    'focus-hud-progress',
    'focus-hud-streak'
  ]);
  assert.deepEqual(resolveRemedyHintIds({ companionExpanded: true }), [
    'companion-mode',
    'companion-stay',
    'companion-away',
    'companion-across-tools',
    'focus-hud-ring',
    'focus-hud-progress',
    'focus-hud-streak'
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
      'ambient-gated',
      'focus-hud-ring',
      'focus-hud-progress',
      'focus-hud-streak'
    ]
  );
  assert.ok(!resolveRemedyHintIds({}).includes('help-affordance'));
});

test('resolvePrimaryRemedyHintId is one contextual tip (fig9)', () => {
  assert.equal(resolvePrimaryRemedyHintId({}), 'sit-button');
  assert.equal(
    resolvePrimaryRemedyHintId({ narrowSheetOpen: true }),
    'sit-button'
  );
  assert.equal(
    resolvePrimaryRemedyHintId({ companionExpanded: true }),
    'companion-mode'
  );
  assert.equal(
    resolvePrimaryRemedyHintId({
      arrivalOpen: true,
      arrivalPhase: 'breath'
    }),
    'breathing'
  );
  assert.equal(
    resolvePrimaryRemedyHintId({ honestyBridgeVisible: true }),
    'honesty-bridge'
  );
  assert.equal(resolvePrimaryRemedyHintId({ isFocusing: true }), 'rise-button');
});

test('resolveRemedyCatalogHintIds excludes primary', () => {
  const catalog = resolveRemedyCatalogHintIds({ companionExpanded: true });
  assert.ok(!catalog.includes('companion-mode'));
  assert.ok(catalog.includes('companion-stay'));
  assert.ok(catalog.length >= 3);
  const idleCatalog = resolveRemedyCatalogHintIds({});
  assert.ok(!idleCatalog.includes('sit-button'));
  assert.ok(idleCatalog.includes('how-shall-we-sit'));
});

test('resolveRemedyCatalogHintIds splits Idle / Arrival / Focusing', () => {
  const catalog = resolveRemedyCatalogHintIds({});
  assert.ok(!catalog.includes('sit-button'));
  assert.ok(catalog.length >= 1);
  assert.deepEqual(
    resolveRemedyCatalogHintIds({ isFocusing: true }),
    resolveRemedyHintIds({ isFocusing: true }).filter((id) => id !== 'rise-button')
  );
});

test('narrow park catalog folds drawer tips into one-shot narrow-drawer-menu', () => {
  const folded = resolveRemedyCatalogHintIds({
    narrowPark: true,
    narrowDrawerOpen: false,
    weeklyHeatmapVisible: true,
    microRitualEntryVisible: true
  });
  assert.deepEqual(folded, ['narrow-drawer-menu']);
  assert.ok(!folded.some(isDrawerParkedHintId));

  const openDrawer = resolveRemedyCatalogHintIds({
    narrowPark: true,
    narrowDrawerOpen: true,
    weeklyHeatmapVisible: true,
    microRitualEntryVisible: true
  });
  assert.ok(!openDrawer.includes('narrow-drawer-menu'));
  assert.ok(openDrawer.includes('weekly-heatmap'));
});

test('filterHintsForNarrowDrawer strips parked tips when drawer closed', () => {
  assert.deepEqual(
    filterHintsForNarrowDrawer(
      ['sit-button', 'weekly-heatmap', 'how-shall-we-sit', 'help-affordance'],
      { narrowPark: true, narrowDrawerOpen: false }
    ),
    ['sit-button', 'help-affordance']
  );
  assert.ok(
    !resolveAutoHintIds({
      narrowPark: true,
      narrowDrawerOpen: false,
      weeklyHeatmapVisible: true
    }).includes('weekly-heatmap')
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
    'ambient-soundscape',
    'focus-hud-ring',
    'focus-hud-progress',
    'focus-hud-streak'
  ]);
  assert.deepEqual(resolveAutoHintIds({ reflectionOpen: true }), ['reflection']);
  assert.deepEqual(
    resolveAutoHintIds({ arrivalOpen: true, arrivalPhase: 'notice' }),
    ['notice']
  );
  assert.deepEqual(
    resolveAutoHintIds({ arrivalOpen: true, arrivalPhase: 'breath' }),
    ['breathing']
  );
  assert.deepEqual(
    resolveAutoHintIds({ arrivalOpen: true, arrivalPhase: 'choose' }),
    ['choose']
  );
  assert.equal(
    resolveHintForScene({ arrivalOpen: true, arrivalPhase: 'notice' }),
    'notice'
  );
  assert.deepEqual(
    resolveAutoHintIds({
      honestyBridgeVisible: true,
      weeklyHeatmapVisible: true
    }),
    []
  );
  assert.equal(
    resolveHintForScene({ honestyBridgeVisible: true }),
    'honesty-bridge'
  );
});

test('micro-ritual open suppresses sit-targeting auto hints', () => {
  assert.deepEqual(
    resolveAutoHintIds({
      microRitualOpen: true,
      hasEverCompletedSession: true
    }),
    []
  );
  assert.ok(
    !resolveAutoHintIds({
      microRitualOpen: true,
      hasEverCompletedSession: false
    }).includes('sit-button')
  );
  assert.ok(
    !resolveAutoHintIds({
      microRitualOpen: true,
      hasEverCompletedSession: true
    }).includes('idle-after-session')
  );
});
