/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { applyYinMemoryConsent } from './yinPersonalMemoryConsent.js';
import { emptyYinPersonalMemoryState } from './yinPersonalMemorySchema.js';
import { applyYinMemoryRemember } from './yinPersonalMemoryRemember.js';
import {
  isYinMemoryThemeRelatedToUserText,
  retrieveYinMemoriesForL3Generate,
  shouldInjectYinMemoryEntry,
  YIN_MEMORY_L3_INJECT_MAX
} from './yinPersonalMemoryRetrieve.js';

const granted = () =>
  applyYinMemoryConsent(emptyYinPersonalMemoryState(), true, '2026-08-25T00:00:00.000Z');

const mondayCandidate = {
  ruleId: 'pattern-monday-crowded',
  kind: 'pattern',
  summary: 'Mondays have often felt crowded for you.',
  evidence: 'confide:turn:0',
  sourceRoute: 'confide_fallback'
};

test('low confidence never injects even when theme matches', () => {
  let state = granted();
  state = applyYinMemoryRemember(state, {
    ...mondayCandidate,
    ruleId: mondayCandidate.ruleId,
    evidence: `rule:${mondayCandidate.ruleId};${mondayCandidate.evidence}`
  });
  const entry = state.memories[0];
  assert.equal(entry.confidence, 'low');
  assert.equal(shouldInjectYinMemoryEntry(entry, 'Monday feels crowded again'), false);
  assert.deepEqual(
    retrieveYinMemoriesForL3Generate(state, 'Monday feels crowded again'),
    []
  );
});

test('medium/high inject only when user theme matches', () => {
  let state = granted();
  state = applyYinMemoryRemember(state, {
    ...mondayCandidate,
    ruleId: mondayCandidate.ruleId,
    evidence: `rule:${mondayCandidate.ruleId};${mondayCandidate.evidence}`
  });
  state = applyYinMemoryRemember(state, {
    ...mondayCandidate,
    ruleId: mondayCandidate.ruleId,
    evidence: `rule:${mondayCandidate.ruleId};confide:turn:1`
  });
  const entry = state.memories[0];
  assert.equal(entry.confidence, 'medium');

  assert.equal(isYinMemoryThemeRelatedToUserText(entry, 'Monday feels crowded again'), true);
  assert.deepEqual(retrieveYinMemoriesForL3Generate(state, 'Monday feels crowded again'), [
    mondayCandidate.summary
  ]);
  assert.deepEqual(
    retrieveYinMemoriesForL3Generate(state, 'the weather is mild today'),
    []
  );
});

test('retrieve skips consent denied', () => {
  const denied = applyYinMemoryConsent(emptyYinPersonalMemoryState(), false);
  assert.deepEqual(retrieveYinMemoriesForL3Generate(denied, 'Monday again'), []);
});

test('retrieve caps at YIN_MEMORY_L3_INJECT_MAX', () => {
  const now = '2026-08-25T12:00:00.000Z';
  const base = granted();
  const state = {
    ...base,
    memories: [
      {
        id: 'mem-a',
        kind: 'pattern',
        summary: 'Monday note A.',
        evidence: 'rule:pattern-monday;test:0',
        confidence: 'high',
        firstSeenAt: now,
        lastSeenAt: now,
        status: 'active',
        sourceRoute: 'confide_fallback'
      },
      {
        id: 'mem-b',
        kind: 'pattern',
        summary: 'Monday note B.',
        evidence: 'rule:pattern-monday-crowded;test:1',
        confidence: 'high',
        firstSeenAt: now,
        lastSeenAt: now,
        status: 'active',
        sourceRoute: 'confide_fallback'
      },
      {
        id: 'mem-c',
        kind: 'pattern',
        summary: 'Monday note C.',
        evidence: 'rule:pattern-monday;test:2',
        confidence: 'medium',
        firstSeenAt: now,
        lastSeenAt: now,
        status: 'active',
        sourceRoute: 'confide_fallback'
      },
      {
        id: 'mem-d',
        kind: 'pattern',
        summary: 'Monday note D.',
        evidence: 'rule:pattern-monday-crowded;test:3',
        confidence: 'medium',
        firstSeenAt: now,
        lastSeenAt: now,
        status: 'active',
        sourceRoute: 'confide_fallback'
      }
    ]
  };
  const picked = retrieveYinMemoriesForL3Generate(state, 'Monday again');
  assert.equal(picked.length, YIN_MEMORY_L3_INJECT_MAX);
});
