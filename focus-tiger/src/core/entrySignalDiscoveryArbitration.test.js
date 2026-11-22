/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  pickDiscoveryPulseWinner,
  resolveVisibleDiscoveryPulseIds,
  isDiscoveryPulseEligible
} from './entrySignalDiscoveryArbitration.js';
import { createHintsSeenStore } from './OnboardingHintsStore.js';
import { createDiscoveryIdlePassTracker } from './entrySignalDiscoveryIdlePass.js';

test('pickDiscoveryPulseWinner prefers how-shall-we-sit over ambient', () => {
  const store = createHintsSeenStore(() => ({}), () => {});
  const winner = pickDiscoveryPulseWinner(
    ['ambient-soundscape', 'how-shall-we-sit', 'weekly-heatmap'],
    store
  );
  assert.equal(winner, 'how-shall-we-sit');
  assert.deepEqual(
    resolveVisibleDiscoveryPulseIds(
      ['ambient-soundscape', 'how-shall-we-sit'],
      store
    ),
    ['how-shall-we-sit']
  );
});

test('resting hint yields next in arbitration order', () => {
  const store = createHintsSeenStore(
    () => ({ 'how-shall-we-sit': 'resting' }),
    () => {}
  );
  assert.equal(isDiscoveryPulseEligible(store, 'how-shall-we-sit'), false);
  const winner = pickDiscoveryPulseWinner(
    ['how-shall-we-sit', 'ambient-soundscape'],
    store
  );
  assert.equal(winner, 'ambient-soundscape');
});

test('idle pass tracker marks resting after third visit', () => {
  const writes = [];
  const tracker = createDiscoveryIdlePassTracker(
    () => ({}),
    (v) => writes.push(v)
  );
  assert.equal(tracker.noteIdleVisit('how-shall-we-sit', 1), 1);
  assert.equal(tracker.noteIdleVisit('how-shall-we-sit', 1), 1);
  assert.equal(tracker.noteIdleVisit('how-shall-we-sit', 2), 2);
  assert.equal(tracker.noteIdleVisit('how-shall-we-sit', 3), 3);
  assert.equal(tracker.shouldMarkResting(3), true);
  assert.equal(tracker.noteIdleVisit('ambient-soundscape', 4), 1);
});