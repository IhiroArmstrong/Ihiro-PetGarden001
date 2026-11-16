/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { guardedGenerate, OUTPUT_GATE_PATHS } from './outputGate.js';
import {
  chooseGeneratePathId,
  isGatedText,
  shouldRetryObserveAfterGate
} from './wireGenerate.js';

test('path ids match the visible generate inventory', () => {
  assert.equal(
    chooseGeneratePathId({ isReflectionCompanion: true }),
    'reflection-companion'
  );
  assert.equal(chooseGeneratePathId({ observeWing: false }), 'confide-chat-l3');
  assert.equal(chooseGeneratePathId({ observeWing: true, attempt: 0 }), 'confide-observe-l3');
  assert.equal(
    chooseGeneratePathId({ observeWing: true, attempt: 1 }),
    'confide-observe-retry'
  );
});

test('observe retry only after a passing cliché, never after a rule hit', () => {
  assert.equal(
    shouldRetryObserveAfterGate({
      observeWing: true,
      verdict: 'pass',
      clicheFlagged: true
    }),
    true
  );
  assert.equal(
    shouldRetryObserveAfterGate({
      observeWing: true,
      verdict: 'neutral_fallback',
      clicheFlagged: true
    }),
    false
  );
  assert.equal(
    shouldRetryObserveAfterGate({
      observeWing: true,
      verdict: 'late_crisis',
      clicheFlagged: false
    }),
    false
  );
});

test('S4: every registered path swaps a G1 stub for a fallback', async () => {
  assert.equal(OUTPUT_GATE_PATHS.length, 4);
  for (const pathId of OUTPUT_GATE_PATHS) {
    const gated = await guardedGenerate(pathId, {
      locale: 'en',
      generate: () => 'you may have depression'
    });
    assert.equal(isGatedText(gated), true, pathId);
    assert.notEqual(gated.text, 'you may have depression');
    assert.equal(gated.verdict, 'neutral_fallback');
  }
});

test('display helper rejects a bare string', () => {
  assert.equal(isGatedText('Sit a while. Tea is still warm.'), false);
  assert.equal(isGatedText({ text: 'ok' }), false);
});
