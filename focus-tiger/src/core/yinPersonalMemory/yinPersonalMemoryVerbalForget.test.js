/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { applyYinMemoryConsent } from './yinPersonalMemoryConsent.js';
import { emptyYinPersonalMemoryState } from './yinPersonalMemorySchema.js';
import { applyYinMemoryRemember } from './yinPersonalMemoryRemember.js';
import {
  formatVerbalForgetReply,
  isBulkVerbalForgetIntent,
  isVerbalForgetIntent,
  resolveVerbalForgetTarget,
  shouldHandleVerbalForget
} from './yinPersonalMemoryVerbalForget.js';

const granted = () =>
  applyYinMemoryConsent(emptyYinPersonalMemoryState(), true, '2026-08-25T00:00:00.000Z');

const mondayCandidate = {
  ruleId: 'pattern-monday-crowded',
  kind: 'pattern',
  summary: 'Mondays have often felt crowded for you.',
  evidence: 'rule:pattern-monday-crowded;confide:turn:0',
  sourceRoute: 'confide_fallback'
};

const quietCandidate = {
  ruleId: 'preference-quiet-short',
  kind: 'preference',
  summary: 'You prefer quiet, short reflections.',
  evidence: 'rule:preference-quiet-short;confide:turn:1',
  sourceRoute: 'confide_fallback'
};

function withTwoMemories() {
  let state = granted();
  state = applyYinMemoryRemember(state, mondayCandidate);
  state = applyYinMemoryRemember(state, quietCandidate);
  state = applyYinMemoryRemember(state, {
    ...mondayCandidate,
    evidence: 'rule:pattern-monday-crowded;confide:turn:2'
  });
  return state;
}

test('isVerbalForgetIntent matches EN and ZH directive phrases', () => {
  assert.equal(isVerbalForgetIntent('Please forget what I said about Monday'), true);
  assert.equal(isVerbalForgetIntent('别再记周一的事了'), true);
  assert.equal(isVerbalForgetIntent('the weather is mild today'), false);
});

test('isBulkVerbalForgetIntent rejects wipe-all phrasing', () => {
  assert.equal(isBulkVerbalForgetIntent('forget everything you remember'), true);
  assert.equal(isBulkVerbalForgetIntent('忘掉你记得的一切'), true);
  assert.equal(isBulkVerbalForgetIntent('Please forget what I said about Monday'), false);
});

test('shouldHandleVerbalForget requires fallback, bridge, and consent', () => {
  const state = withTwoMemories();
  assert.equal(
    shouldHandleVerbalForget({
      route: CONFIDE_ROUTE.FALLBACK,
      state,
      text: '别再记周一的事了',
      hasBridge: true
    }),
    true
  );
  assert.equal(
    shouldHandleVerbalForget({
      route: CONFIDE_ROUTE.SAD,
      state,
      text: '别再记这个',
      hasBridge: true
    }),
    false
  );
  assert.equal(
    shouldHandleVerbalForget({
      route: CONFIDE_ROUTE.FALLBACK,
      state: applyYinMemoryConsent(emptyYinPersonalMemoryState(), false),
      text: '别再记这个',
      hasBridge: true
    }),
    false
  );
});

test('resolveVerbalForgetTarget deletes one theme-matched memory', () => {
  const state = withTwoMemories();
  const result = resolveVerbalForgetTarget(state, 'Please forget what I said about Monday');
  assert.equal(result?.outcome, 'forgotten');
  assert.ok(result?.memoryId);
  assert.match(result?.summary || '', /Monday/i);
});

test('resolveVerbalForgetTarget returns no_match without overlap', () => {
  const state = withTwoMemories();
  assert.deepEqual(resolveVerbalForgetTarget(state, '别再记天气的事'), {
    outcome: 'no_match'
  });
});

test('resolveVerbalForgetTarget returns ambiguous on tied top scores', () => {
  const now = '2026-08-25T12:00:00.000Z';
  const state = {
    ...granted(),
    memories: [
      {
        id: 'memory-a',
        kind: 'pattern',
        summary: 'Monday mornings feel crowded.',
        evidence: 'rule:pattern-monday-crowded;confide:turn:0',
        confidence: 'medium',
        firstSeenAt: now,
        lastSeenAt: now,
        status: 'active',
        sourceRoute: 'confide_fallback'
      },
      {
        id: 'memory-b',
        kind: 'pattern',
        summary: 'Mondays are often busy for you.',
        evidence: 'rule:pattern-monday;confide:turn:1',
        confidence: 'medium',
        firstSeenAt: now,
        lastSeenAt: now,
        status: 'active',
        sourceRoute: 'confide_fallback'
      }
    ]
  };
  assert.equal(resolveVerbalForgetTarget(state, 'forget about Monday')?.outcome, 'ambiguous');
});

test('formatVerbalForgetReply uses locale keys', () => {
  const t = (key) => key;
  assert.equal(formatVerbalForgetReply('no_match', '', t), 'YIN_MEMORY_VERBAL_FORGET_NO_MATCH');
  assert.match(
    formatVerbalForgetReply('forgotten', 'Monday note', t),
    /YIN_MEMORY_VERBAL_FORGET_OK/
  );
});
