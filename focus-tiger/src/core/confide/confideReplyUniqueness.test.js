/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONSECUTIVE_GENERATE_FALLBACK_WARN_AT,
  firstConsecutiveDuplicateIndex,
  lastRepeatableYinReplyText,
  nextGenerateFailStreak,
  priorRepeatableYinRepliesFromHistory
} from './confideReplyUniqueness.js';

test('firstConsecutiveDuplicateIndex catches any jacket, not just echo of turn 1', () => {
  const tea = 'Sit a while. Tea is still warm.';
  assert.equal(firstConsecutiveDuplicateIndex(['Heard.', 'Clouds drift.']), -1);
  assert.equal(firstConsecutiveDuplicateIndex([tea, tea, tea]), 1);
  assert.equal(
    firstConsecutiveDuplicateIndex(['Yes.', 'I am curious about food.', tea, tea]),
    3
  );
});

test('priorRepeatableYinRepliesFromHistory includes corpus fallback jackets', () => {
  const history = [
    { role: 'user', text: 'hi' },
    { role: 'yin', text: 'Sit a while. Tea is still warm.', source: 'corpus' },
    { role: 'user', text: 'again' },
    { role: 'yin', text: 'Heard. Yin nods quietly.', source: 'corpus' }
  ];
  assert.deepEqual(priorRepeatableYinRepliesFromHistory(history), [
    'Sit a while. Tea is still warm.',
    'Heard. Yin nods quietly.'
  ]);
  assert.equal(
    lastRepeatableYinReplyText(history),
    'Heard. Yin nods quietly.'
  );
});

test('safety / tool sources do not count as repeatable jackets', () => {
  assert.deepEqual(
    priorRepeatableYinRepliesFromHistory([
      { role: 'yin', text: 'crisis', source: 'corpus' },
      { role: 'yin', text: 'Heard. If this feels too heavy', source: 'safety' }
    ]),
    ['crisis']
  );
});

test('generate-fail streak warns at 2 consecutive failures', () => {
  assert.equal(CONSECUTIVE_GENERATE_FALLBACK_WARN_AT, 2);
  assert.equal(nextGenerateFailStreak(0, false), 1);
  assert.equal(nextGenerateFailStreak(1, false), 2);
  assert.equal(nextGenerateFailStreak(4, true), 0);
});
