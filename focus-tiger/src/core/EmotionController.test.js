import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DORMANT_WAKE_CROSS_FADE_MS,
  EmotionController
} from './EmotionController.js';

test('dormantWake cross-fades from sleeping into halo breathing reward', () => {
  const plays = [];
  const stops = [];
  const spritePlayer = {
    play(name, options = {}) {
      plays.push({ name, options });
      return true;
    },
    stop(options) {
      stops.push(options);
    }
  };
  const controller = new EmotionController({
    poseManager: { setPose() {}, setCanvasHidden() {} },
    dynamicMotion: { setBreathingEnabled() {} },
    incenseGreeting: {},
    spritePlayer
  });
  let completed = 0;
  const previousWindow = globalThis.window;
  globalThis.window = {
    setTimeout(callback) {
      callback();
      return 1;
    }
  };

  try {
    controller.playEmotion('dormantWake', {
      onComplete: () => {
        completed += 1;
      }
    });

    assert.deepEqual(stops, [{ clear: false }]);
    assert.equal(plays[0].name, 'dormantWake');
    assert.equal(
      plays[0].options.crossFadeMs,
      DORMANT_WAKE_CROSS_FADE_MS
    );

    plays[0].options.onComplete();

    assert.equal(plays[1].name, 'haloBreathingIntro');
    assert.equal(
      plays[1].options.crossFadeMs,
      DORMANT_WAKE_CROSS_FADE_MS
    );
    assert.equal(completed, 0);

    plays[1].options.onComplete();

    assert.equal(plays[2].name, 'haloBreathingLoop');
    assert.equal(completed, 1);
    assert.equal(controller.getCurrentEmotionKey(), 'haloBreathing');
  } finally {
    globalThis.window = previousWindow;
  }
});

test('nodGreeting plays once and returns to idle breathing', () => {
  const plays = [];
  const spritePlayer = {
    play(name, options = {}) {
      plays.push({ name, options });
      return true;
    },
    stop() {}
  };
  const controller = new EmotionController({
    poseManager: { setPose() {}, setCanvasHidden() {} },
    dynamicMotion: { setBreathingEnabled() {} },
    incenseGreeting: {},
    spritePlayer
  });
  let completed = 0;

  controller.playEmotion('nodGreeting', {
    onComplete: () => {
      completed += 1;
    }
  });

  assert.equal(plays[0].name, 'nodGreeting');
  plays[0].options.onComplete();
  assert.equal(plays[1].name, 'idleBreathing');
  assert.equal(completed, 1);
  assert.equal(controller.getCurrentEmotionKey(), 'idle');
});
