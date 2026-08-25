/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  emptyYinPersonalMemoryState,
  normalizeYinMemoryEntry,
  normalizeYinPersonalMemoryState
} from './yinPersonalMemorySchema.js';

test('empty state has no consent and no memories', () => {
  const state = emptyYinPersonalMemoryState();
  assert.equal(state.consent, null);
  assert.equal(state.consentedAt, null);
  assert.deepEqual(state.memories, []);
});

test('normalize drops invalid memory rows', () => {
  const state = normalizeYinPersonalMemoryState({
    schemaVersion: 1,
    consent: 'granted',
    consentedAt: '2026-08-25T00:00:00.000Z',
    memories: [
      {
        id: 'm1',
        kind: 'preference',
        summary: 'You prefer quiet reflections.',
        evidence: 'confide:turn-1',
        confidence: 'low',
        firstSeenAt: '2026-08-25T00:00:00.000Z',
        lastSeenAt: '2026-08-25T00:00:00.000Z',
        status: 'active',
        sourceRoute: 'confide_fallback'
      },
      { id: 'bad', kind: 'diagnosis' }
    ]
  });
  assert.equal(state.consent, 'granted');
  assert.equal(state.memories.length, 1);
  assert.equal(state.memories[0].kind, 'preference');
});

test('normalizeYinMemoryEntry rejects crisis-shaped kind', () => {
  assert.equal(
    normalizeYinMemoryEntry({
      id: 'x',
      kind: 'crisis',
      summary: 'nope',
      evidence: 'e',
      confidence: 'high',
      firstSeenAt: 't',
      lastSeenAt: 't',
      status: 'active',
      sourceRoute: 'safety_redirect'
    }),
    null
  );
});
