import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DORMANT_WAKE_CROSS_FADE_MS,
  EmotionController,
  LEAVE_DORMANT_WAKE_CROSS_FADE_MS,
  MILESTONE_GLOW_HOLD_MS
} from './EmotionController.js';

test('dormantWake cross-fades from sleeping into idle (no halo gold for now)', () => {
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
  const bursts = [];
  const controller = new EmotionController({
    poseManager: { setPose() {}, setCanvasHidden() {} },
    dynamicMotion: { setBreathingEnabled() {} },
    incenseGreeting: {},
    transitionFX: {
      playCelebrateBurst() {
        bursts.push(1);
      }
    },
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
    assert.equal(bursts.length, 0);

    plays[0].options.onComplete();

    assert.equal(plays[1].name, 'idleBreathing');
    assert.equal(completed, 1);
    assert.equal(controller.getCurrentEmotionKey(), 'idle');
  } finally {
    globalThis.window = previousWindow;
  }
});

test('milestoneGlow holds its last frame for a fixed duration then returns to idle', () => {
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
  const previousSetTimeout = globalThis.setTimeout;
  const previousClearTimeout = globalThis.clearTimeout;
  let holdCallback = null;
  let delay = null;
  let completed = 0;
  globalThis.setTimeout = (callback, timeout) => {
    holdCallback = callback;
    delay = timeout;
    return 1;
  };
  globalThis.clearTimeout = () => {};

  try {
    controller.playEmotion('milestoneGlow', {
      onComplete: () => {
        completed += 1;
      }
    });

    assert.equal(plays[0].name, 'milestoneGlow');
    assert.equal(plays[0].options.loopMode, 'none');
    assert.equal(plays[0].options.holdLastFrame, true);
    assert.equal(controller.shouldSuppressRuntimeGlow(), true);

    plays[0].options.onComplete();

    assert.equal(plays.length, 1);
    assert.equal(completed, 0);
    assert.equal(delay, MILESTONE_GLOW_HOLD_MS);

    holdCallback();

    assert.equal(plays[1].name, 'idleBreathing');
    assert.equal(completed, 1);
    assert.equal(controller.getCurrentEmotionKey(), 'idle');
    assert.equal(controller.shouldSuppressRuntimeGlow(), false);
  } finally {
    globalThis.setTimeout = previousSetTimeout;
    globalThis.clearTimeout = previousClearTimeout;
  }
});

test('sessionComplete and celebrating suppress runtime glow until idle resumes', () => {
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

  controller.playEmotion('sessionComplete');
  assert.equal(controller.shouldSuppressRuntimeGlow(), true);
  plays[0].options.onComplete();
  assert.equal(controller.shouldSuppressRuntimeGlow(), false);

  controller.playEmotion('celebrating', { random: () => 0 });
  assert.equal(plays.at(-1).name, 'celebrateDance');
  assert.equal(controller.shouldSuppressRuntimeGlow(), true);
  plays.at(-1).options.onComplete();
  assert.equal(controller.shouldSuppressRuntimeGlow(), false);

  controller.playEmotion('celebrating', { random: () => 0.9 });
  assert.equal(plays.at(-1).name, 'celebrateDanceV2');
});

test('intentionSet plays intentionNod (16:9) then returns to idle', () => {
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

  controller.playEmotion('intentionSet', {
    onComplete: () => {
      completed += 1;
    }
  });

  assert.equal(plays[0].name, 'intentionNod');
  assert.equal(plays[0].options.returnCrossFadeMs, 180);
  plays[0].options.onComplete();
  assert.equal(plays[1].name, 'idleBreathing');
  assert.equal(plays[1].options.crossFadeMs, 180);
  assert.equal(completed, 1);
  assert.equal(controller.getCurrentEmotionKey(), 'idle');
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

test('curiousTilt plays blinkSmile once and returns to idle breathing', () => {
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

  controller.playEmotion('curiousTilt', {
    onComplete: () => {
      completed += 1;
    }
  });

  assert.equal(plays[0].name, 'blinkSmile');
  assert.equal(plays[0].options.loopMode, 'none');
  plays[0].options.onComplete();
  assert.equal(plays[1].name, 'idleBreathing');
  assert.equal(completed, 1);
  assert.equal(controller.getCurrentEmotionKey(), 'idle');
});

test('mindfulAcknowledge reuses nodBow for refocus and returns to idle', () => {
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

  controller.playEmotion('mindfulAcknowledge', { subtype: 'refocus' });

  assert.equal(plays[0].name, 'nodBow');
  assert.equal(plays[0].options.subtype, 'refocus');
  assert.equal(plays[0].options.loopMode, 'none');
  plays[0].options.onComplete();
  assert.equal(plays[1].name, 'idleBreathing');
  assert.equal(controller.getCurrentEmotionKey(), 'idle');
});

test('stretchReminder plays once and returns to idle breathing', () => {
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

  controller.playEmotion('stretchReminder');

  assert.equal(plays[0].name, 'stretchReminder');
  assert.equal(plays[0].options.loopMode, 'none');
  plays[0].options.onComplete();
  assert.equal(plays[1].name, 'idleBreathing');
  assert.equal(controller.getCurrentEmotionKey(), 'idle');
});


test('holdPose keeps last frame and does not auto-return to idle', () => {
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
    holdPose: true,
    onComplete: () => {
      completed += 1;
    }
  });
  assert.equal(plays[0].name, 'nodGreeting');
  assert.equal(plays[0].options.holdLastFrame, true);
  plays[0].options.onComplete();
  assert.equal(completed, 1);
  assert.equal(plays.length, 1);
  assert.equal(controller.getCurrentEmotionKey(), 'nodGreeting');
});

test('leaving dormantWake injects a longer cross-fade into the next emotion', () => {
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

  controller.playEmotion('dormantWake', { holdPose: true });
  assert.equal(controller.getCurrentEmotionKey(), 'dormantWake');

  controller.playEmotion('smiling');
  assert.equal(plays.at(-1).name, 'blinkSmile');
  assert.equal(
    plays.at(-1).options.crossFadeMs,
    LEAVE_DORMANT_WAKE_CROSS_FADE_MS
  );

  controller.playEmotion('dormantWake', { holdPose: true });
  controller.playEmotion('idle', { restart: true });
  const idlePlay = plays.filter((p) => p.name === 'idleBreathing').at(-1);
  assert.ok(idlePlay);
  assert.equal(idlePlay.options.crossFadeMs, LEAVE_DORMANT_WAKE_CROSS_FADE_MS);
});

test('blinkBreathe plays pingpong loop for Rise transition', () => {
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

  controller.playEmotion('blinkBreathe');
  assert.equal(plays[0].name, 'blinkBreathe');
  assert.equal(plays[0].options.loop, true);
  assert.equal(plays[0].options.loopMode, 'pingpong');
  assert.equal(controller.getCurrentEmotionKey(), 'blinkBreathe');
});

test('blinkBreathe maxCycles finishes back to idle', () => {
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
    spritePlayer,
    idleOrchestrator: {
      start() {},
      isActive() {
        return false;
      },
      stop() {}
    }
  });

  controller.playEmotion('blinkBreathe', { maxCycles: 1 });
  assert.equal(plays[0].options.maxCycles, 1);
  assert.equal(typeof plays[0].options.onComplete, 'function');
  plays[0].options.onComplete();
  assert.equal(controller.getCurrentEmotionKey(), 'idle');
});
