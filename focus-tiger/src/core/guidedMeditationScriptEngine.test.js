/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { GUIDED_MEDITATION_SCRIPT_LESSONS } from './guidedMeditationScriptCatalog.js';
import {
  createGuidedMeditationScriptEngine,
  estimateSpeakMs
} from './guidedMeditationScriptEngine.js';
import { resolveGuidedMeditationCredit } from './guidedMeditationLessons.js';

function miniLesson() {
  return {
    id: 'mini',
    delivery: 'script',
    steps: [
      { id: 'a', pauseSec: 2, sentences: ['Hello there friend.', 'Second line.'] },
      { id: 'b', pauseSec: 0, sentences: ['Done.'] }
    ]
  };
}

function makeClock() {
  let t = 0;
  const timers = [];
  let seq = 0;
  return {
    now: () => t,
    advance(ms) {
      t += ms;
      const due = timers
        .filter((row) => !row.cleared && row.at <= t)
        .sort((a, b) => a.at - b.at || a.id - b.id);
      for (const row of due) {
        row.cleared = true;
        row.fn();
      }
    },
    setTimeoutFn(fn, ms) {
      const id = ++seq;
      timers.push({ id, fn, at: t + ms, cleared: false });
      return id;
    },
    clearTimeoutFn(id) {
      const row = timers.find((item) => item.id === id);
      if (row) row.cleared = true;
    }
  };
}

describe('guidedMeditationScriptEngine', () => {
  it('lists three English script lessons', () => {
    assert.deepEqual(
      GUIDED_MEDITATION_SCRIPT_LESSONS.map((row) => row.id),
      [
        'breath-anchor-beginner',
        'body-scan-relaxation',
        'thoughts-letting-go'
      ]
    );
    const body = GUIDED_MEDITATION_SCRIPT_LESSONS[1];
    assert.ok(
      body.steps[0].sentences.some((s) => s.includes('lower your gaze'))
    );
    const thoughts = GUIDED_MEDITATION_SCRIPT_LESSONS[2];
    assert.equal(
      thoughts.steps[3].sentences.join(' ').includes('gentle rep of training'),
      false
    );
  });

  it('walks speak → silence → next step and credits completed sessions', () => {
    const clock = makeClock();
    const spoken = [];
    let last = null;
    const engine = createGuidedMeditationScriptEngine({
      lesson: miniLesson(),
      now: clock.now,
      setTimeoutFn: clock.setTimeoutFn,
      clearTimeoutFn: clock.clearTimeoutFn,
      timeoutPadMs: 50,
      speak(text, { onFinished }) {
        spoken.push(text);
        clock.setTimeoutFn(onFinished, 10);
        return true;
      },
      stopSpeak() {},
      onState: (snap) => {
        last = snap;
      }
    });
    engine.start();
    assert.equal(last.phase, 'speaking');
    assert.equal(spoken[0], 'Hello there friend.');
    clock.advance(10);
    assert.equal(spoken[1], 'Second line.');
    clock.advance(10);
    assert.equal(last.phase, 'silence');
    clock.advance(2000);
    assert.equal(last.phase, 'speaking');
    clock.advance(10);
    assert.equal(last.phase, 'done');
    assert.ok(last.effectiveSec >= 2);
    assert.deepEqual(
      resolveGuidedMeditationCredit({
        delivery: 'script',
        completed: true,
        playedSec: last.effectiveSec
      }),
      { durationMinutes: Math.max(1, Math.round(last.effectiveSec / 60) || 1) }
    );
  });

  it('pauses silence without counting frozen time', () => {
    const clock = makeClock();
    let last = null;
    const engine = createGuidedMeditationScriptEngine({
      lesson: {
        id: 'p',
        steps: [{ id: 's', pauseSec: 5, sentences: ['Hi.'] }]
      },
      voiceEnabled: false,
      now: clock.now,
      setTimeoutFn: clock.setTimeoutFn,
      clearTimeoutFn: clock.clearTimeoutFn,
      onState: (snap) => {
        last = snap;
      }
    });
    engine.start();
    clock.advance(0);
    assert.equal(last.phase, 'silence');
    const before = last.effectiveSec;
    engine.pause();
    clock.advance(4000);
    engine.resume();
    clock.advance(5000);
    assert.equal(last.phase, 'done');
    assert.ok(last.effectiveSec - before < 5.2);
  });

  it('forces the next sentence when TTS onFinished never arrives', () => {
    const clock = makeClock();
    let last = null;
    const engine = createGuidedMeditationScriptEngine({
      lesson: miniLesson(),
      now: clock.now,
      setTimeoutFn: clock.setTimeoutFn,
      clearTimeoutFn: clock.clearTimeoutFn,
      timeoutPadMs: 20,
      speak() {
        return true;
      },
      stopSpeak() {},
      onState: (snap) => {
        last = snap;
      }
    });
    engine.start();
    clock.advance(estimateSpeakMs('Hello there friend.') + 20);
    assert.equal(last.timedOutSpeak, true);
    assert.equal(last.sentence, 'Second line.');
  });

  it('credits script practice at 60s or on complete, not below 60 when aborted', () => {
    assert.equal(
      resolveGuidedMeditationCredit({
        delivery: 'script',
        completed: false,
        playedSec: 59
      }),
      null
    );
    assert.deepEqual(
      resolveGuidedMeditationCredit({
        delivery: 'script',
        completed: false,
        playedSec: 60
      }),
      { durationMinutes: 1 }
    );
    assert.deepEqual(
      resolveGuidedMeditationCredit({
        delivery: 'script',
        completed: true,
        playedSec: 20
      }),
      { durationMinutes: 1 }
    );
  });
});
