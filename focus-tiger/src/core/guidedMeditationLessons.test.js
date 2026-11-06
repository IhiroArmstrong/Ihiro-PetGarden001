/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  GUIDED_MEDITATION_LESSONS,
  GUIDED_MEDITATION_SOURCE_ID,
  GUIDED_MEDITATION_MEDIA_HOST,
  accumulatePlayedSeconds,
  findGuidedMeditationLesson,
  isGuidedMeditationMediaConfigured,
  resolveGuidedMeditationCredit
} from './guidedMeditationLessons.js';

describe('guidedMeditationLessons', () => {
  it('lists the English short intro and long sit, not a clip of the long film', () => {
    assert.equal(GUIDED_MEDITATION_SOURCE_ID, 'guided-meditation');
    assert.match(GUIDED_MEDITATION_MEDIA_HOST, /^https:\/\//);
    assert.equal(isGuidedMeditationMediaConfigured(), true);
    assert.deepEqual(
      GUIDED_MEDITATION_LESSONS.map((row) => row.id),
      ['concepts-habits-intro', 'what-is-zen-ancient-wisdom']
    );
    const short = findGuidedMeditationLesson('concepts-habits-intro');
    assert.equal(short?.kind, 'short');
    assert.equal(short?.durationSec, 281);
    assert.equal(short?.deliveryBytes, 28523034);
    assert.match(short?.deliverySha256 || '', /^[a-f0-9]{64}$/);
    assert.equal(short?.locales[0], 'en');
    const long = findGuidedMeditationLesson('what-is-zen-ancient-wisdom');
    assert.equal(long?.kind, 'long');
    assert.equal(long?.durationSec, 1303);
    assert.match(short?.videoUrl || '', new RegExp(`^${GUIDED_MEDITATION_MEDIA_HOST}/`));
    assert.match(short?.audioUrl || '', /\.m4a$/);
    assert.match(short?.audioSha256 || '', /^[a-f0-9]{64}$/);
    assert.equal(short?.audioBytes, 2343753);
    assert.equal(long?.deliveryBytes, 136179423);
    assert.match(long?.audioSha256 || '', /^[a-f0-9]{64}$/);
    assert.equal(long?.audioBytes, 10753157);
  });

  it('does not fetch whole files in the web player and omits crossorigin', () => {
    const ui = readFileSync(
      new URL('../ui/GuidedMeditationUI.js', import.meta.url),
      'utf8'
    );
    assert.equal(ui.includes('fetchVerifiedGuidedMeditationVideo'), false);
    assert.match(ui, /resolveGuidedMeditationPlaybackMode/);
    assert.match(ui, /playSrc\(rendition\.url\)/);
    assert.equal(/crossorigin/i.test(ui), false);
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

  it('counts consecutive play deltas and ignores seek jumps', () => {
    let acc = { playedSec: 0, lastTime: null };
    for (let t = 0; t <= 253; t += 1) {
      acc = accumulatePlayedSeconds(acc, t, { paused: false, seeking: false });
    }
    assert.equal(acc.playedSec, 253);
    assert.deepEqual(
      resolveGuidedMeditationCredit({
        kind: 'short',
        durationSec: 281,
        nominalMinutes: 5,
        playedSec: acc.playedSec
      }),
      { durationMinutes: 5 }
    );

    const afterScrub = accumulatePlayedSeconds(acc, 280, {
      paused: false,
      seeking: false
    });
    assert.equal(afterScrub.playedSec, 253);
    assert.equal(
      resolveGuidedMeditationCredit({
        kind: 'short',
        durationSec: 281,
        nominalMinutes: 5,
        playedSec: afterScrub.playedSec
      })?.durationMinutes,
      5
    );

    let seekOnly = { playedSec: 0, lastTime: null };
    seekOnly = accumulatePlayedSeconds(seekOnly, 0, { paused: false });
    seekOnly = accumulatePlayedSeconds(seekOnly, 260, { paused: false });
    assert.equal(seekOnly.playedSec, 0);
    assert.equal(
      resolveGuidedMeditationCredit({
        kind: 'short',
        durationSec: 281,
        nominalMinutes: 5,
        playedSec: seekOnly.playedSec
      }),
      null
    );
  });

  it('does not accumulate while paused (covers audio-only and tab background pause)', () => {
    let acc = { playedSec: 0, lastTime: null };
    for (let t = 0; t <= 10; t += 1) {
      acc = accumulatePlayedSeconds(acc, t, { paused: false, seeking: false });
    }
    assert.equal(acc.playedSec, 10);
    acc = accumulatePlayedSeconds(acc, 10, { paused: true, seeking: false });
    assert.equal(acc.playedSec, 10);
    for (let t = 11; t <= 15; t += 1) {
      acc = accumulatePlayedSeconds(acc, t, {
        paused: t < 13,
        seeking: false
      });
    }
    assert.equal(acc.playedSec, 13);
  });
});
