import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HINT_IDS,
  normalizeHintsSeen,
  createHintsSeenStore,
  resolveHintForScene,
  resolveAutoHintIds
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
  assert.equal(resolveHintForScene({ honestyVisible: true }), 'honesty-optional');
  assert.equal(resolveHintForScene({ isDormant: true }), 'dormant-open');
  assert.equal(
    resolveHintForScene({ hasEverCompletedSession: true }),
    'idle-after-session'
  );
  assert.equal(resolveHintForScene({}), 'sit-button');
});

test('resolveAutoHintIds includes help-affordance on idle chrome including DORMANT', () => {
  assert.deepEqual(resolveAutoHintIds({ isDormant: true }), [
    'dormant-open',
    'help-affordance'
  ]);
  assert.deepEqual(resolveAutoHintIds({ honestyVisible: true }), [
    'honesty-optional',
    'help-affordance'
  ]);
  assert.deepEqual(resolveAutoHintIds({}), [
    'sit-button',
    'how-shall-we-sit',
    'help-affordance'
  ]);
  assert.deepEqual(resolveAutoHintIds({ isFocusing: true }), [
    'rise-button',
    'ambient-soundscape'
  ]);
  assert.deepEqual(resolveAutoHintIds({ reflectionOpen: true }), ['reflection']);
  assert.deepEqual(
    resolveAutoHintIds({ arrivalOpen: true, arrivalPhase: 'choose' }),
    ['choose']
  );
});
