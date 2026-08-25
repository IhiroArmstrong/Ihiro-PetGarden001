/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { applyYinMemoryConsent } from './yinPersonalMemoryConsent.js';
import { emptyYinPersonalMemoryState } from './yinPersonalMemorySchema.js';
import { rememberFromConfideTurn } from './yinPersonalMemoryRemember.js';
import {
  forgetYinPersonalMemory,
  listActiveYinMemories,
  yinMemoryKindLabelKey,
  yinMemoryWhyCopyKey
} from './yinPersonalMemoryForget.js';

function grantedState() {
  return applyYinMemoryConsent(emptyYinPersonalMemoryState(), true, '2026-08-25T10:00:00.000Z');
}

test('listActiveYinMemories returns only active entries newest first', () => {
  let state = grantedState();
  const first = rememberFromConfideTurn(state, {
    userText: 'I prefer quiet, short reflections.',
    route: 'fallback',
    replySource: 'generate',
    turnOrdinal: 0,
    nowIso: '2026-08-20T12:00:00.000Z'
  }).state;
  const second = rememberFromConfideTurn(first, {
    userText: 'Mondays feel crowded.',
    route: 'fallback',
    replySource: 'generate',
    turnOrdinal: 1,
    nowIso: '2026-08-25T12:00:00.000Z'
  }).state;
  const active = listActiveYinMemories(second);
  assert.equal(active.length, 2);
  assert.equal(active[0].kind, 'pattern');
  assert.equal(active[1].kind, 'preference');
});

test('forgetYinPersonalMemory true-deletes by id', () => {
  let state = grantedState();
  const { state: withMemory } = rememberFromConfideTurn(state, {
    userText: 'I prefer quiet, short reflections.',
    route: 'fallback',
    replySource: 'generate',
    turnOrdinal: 0,
    nowIso: '2026-08-25T12:00:00.000Z'
  });
  const id = withMemory.memories[0].id;
  const { state: after, forgotten } = forgetYinPersonalMemory(withMemory, id);
  assert.equal(forgotten, true);
  assert.equal(after.memories.length, 0);
  assert.equal(listActiveYinMemories(after).length, 0);
});

test('forgetYinPersonalMemory ignores unknown id', () => {
  const state = grantedState();
  const { forgotten } = forgetYinPersonalMemory(state, 'missing');
  assert.equal(forgotten, false);
});

test('yinMemoryWhyCopyKey maps confide evidence to locale key', () => {
  const entry = {
    id: 'x',
    kind: 'preference',
    summary: 'You prefer quiet, short reflections.',
    evidence: 'confide:turn:2',
    confidence: 'low',
    firstSeenAt: '2026-08-25T12:00:00.000Z',
    lastSeenAt: '2026-08-25T12:00:00.000Z',
    status: 'active',
    sourceRoute: 'confide_fallback'
  };
  assert.deepEqual(yinMemoryWhyCopyKey(entry), {
    key: 'YIN_MEMORY_WHY_CONFIDE',
    date: '2026-08-25'
  });
});

test('yinMemoryKindLabelKey covers four kinds', () => {
  assert.equal(yinMemoryKindLabelKey('preference'), 'YIN_MEMORY_KIND_PREFERENCE');
  assert.equal(yinMemoryKindLabelKey('pattern'), 'YIN_MEMORY_KIND_PATTERN');
  assert.equal(yinMemoryKindLabelKey('moment'), 'YIN_MEMORY_KIND_MOMENT');
  assert.equal(yinMemoryKindLabelKey('relationship'), 'YIN_MEMORY_KIND_RELATIONSHIP');
});
