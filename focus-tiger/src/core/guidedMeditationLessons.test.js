/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  GUIDED_MEDITATION_LESSONS,
  GUIDED_MEDITATION_SOURCE_ID,
  findGuidedMeditationLesson,
  resolveGuidedMeditationCredit
} from './guidedMeditationLessons.js';

describe('guidedMeditationLessons', () => {
  it('lists the English short intro and long sit, not a clip of the long film', () => {
    assert.equal(GUIDED_MEDITATION_SOURCE_ID, 'guided-meditation');
    assert.deepEqual(
      GUIDED_MEDITATION_LESSONS.map((row) => row.id),
      ['concepts-habits-intro', 'what-is-zen-ancient-wisdom']
    );
    const short = findGuidedMeditationLesson('concepts-habits-intro');
    assert.equal(short?.kind, 'short');
    assert.equal(short?.durationSec, 281);
    assert.equal(short?.locales[0], 'en');
    const long = findGuidedMeditationLesson('what-is-zen-ancient-wisdom');
    assert.equal(long?.kind, 'long');
    assert.equal(long?.durationSec, 1303);
  });

  it('credits a short lesson at 90% for nominal minutes', () => {
    assert.equal(
      resolveGuidedMeditationCredit({
        kind: 'short',
        durationSec: 281,
        nominalMinutes: 5,
        playedSec: 252
      }),
      null
    );
    assert.deepEqual(
      resolveGuidedMeditationCredit({
        kind: 'short',
        durationSec: 281,
        nominalMinutes: 5,
        playedSec: 253
      }),
      { durationMinutes: 5 }
    );
  });

  it('credits a long lesson after three played minutes using floor minutes', () => {
    assert.equal(
      resolveGuidedMeditationCredit({
        kind: 'long',
        durationSec: 1303,
        playedSec: 179
      }),
      null
    );
    assert.deepEqual(
      resolveGuidedMeditationCredit({
        kind: 'long',
        durationSec: 1303,
        playedSec: 185
      }),
      { durationMinutes: 3 }
    );
    assert.deepEqual(
      resolveGuidedMeditationCredit({
        kind: 'long',
        durationSec: 1303,
        playedSec: 1303
      }),
      { durationMinutes: 21 }
    );
  });
});
