/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  POINTER_INTERACTION_CONFIG,
  PointerInteraction
} from './PointerInteraction.js';

test('still cursor timer triggers curiousTilt on smiling baseline', () => {
  const scheduled = [];
  const cleared = [];
  const previousSetTimeout = globalThis.setTimeout;
  const previousClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = (callback, delay) => {
    const id = scheduled.length + 1;
    scheduled.push({ callback, delay, id });
    return id;
  };
  globalThis.clearTimeout = (id) => {
    cleared.push(id);
  };

  const played = [];
  const interaction = new PointerInteraction({
    canvas: {},
    camera: {},
    poseManager: { getVisiblePoseKey: () => null },
    emotionController: {
      getCurrentEmotionKey: () => 'smiling',
      playEmotion(key, options) {
        played.push({ key, options });
      }
    }
  });

  try {
    const now = performance.now();
    interaction._isNear = true;
    interaction._lastCuriousAt =
      now - POINTER_INTERACTION_CONFIG.curiousCooldownMs;
    interaction._stillAnchor = {
      x: 100,
      y: 120,
      since: now - POINTER_INTERACTION_CONFIG.stillDurationMs
    };

    interaction._scheduleStillCheck(now);

    assert.equal(scheduled[0].delay, 0);
    scheduled[0].callback();
    assert.equal(played.length, 1);
    assert.equal(played[0].key, 'curiousTilt');
    assert.ok(
      played[0].options.stillMs >=
        POINTER_INTERACTION_CONFIG.stillDurationMs
    );
  } finally {
    interaction._clearStillTimer();
    globalThis.setTimeout = previousSetTimeout;
    globalThis.clearTimeout = previousClearTimeout;
  }
});

test('curiousTilt is blocked on idle (idle has built-in blink rhythm)', () => {
  const scheduled = [];
  const previousSetTimeout = globalThis.setTimeout;
  const previousClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = (callback, delay) => {
    const id = scheduled.length + 1;
    scheduled.push({ callback, delay, id });
    return id;
  };
  globalThis.clearTimeout = () => {};

  const played = [];
  const interaction = new PointerInteraction({
    canvas: {},
    camera: {},
    poseManager: { getVisiblePoseKey: () => null },
    emotionController: {
      getCurrentEmotionKey: () => 'idle',
      playEmotion(key, options) {
        played.push({ key, options });
      }
    }
  });

  try {
    const now = performance.now();
    interaction._isNear = true;
    interaction._lastCuriousAt =
      now - POINTER_INTERACTION_CONFIG.curiousCooldownMs;
    interaction._stillAnchor = {
      x: 100,
      y: 120,
      since: now - POINTER_INTERACTION_CONFIG.stillDurationMs
    };

    interaction._scheduleStillCheck(now);
    scheduled[0].callback();
    assert.equal(played.length, 0);
  } finally {
    interaction._clearStillTimer();
    globalThis.setTimeout = previousSetTimeout;
    globalThis.clearTimeout = previousClearTimeout;
  }
});

test('curiousTilt is blocked while a non-idle emotion is playing', () => {
  const scheduled = [];
  const previousSetTimeout = globalThis.setTimeout;
  const previousClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = (callback, delay) => {
    const id = scheduled.length + 1;
    scheduled.push({ callback, delay, id });
    return id;
  };
  globalThis.clearTimeout = () => {};

  const played = [];
  const interaction = new PointerInteraction({
    canvas: {},
    camera: {},
    poseManager: { getVisiblePoseKey: () => null },
    emotionController: {
      getCurrentEmotionKey: () => 'waveHello',
      playEmotion(key, options) {
        played.push({ key, options });
      }
    }
  });

  try {
    const now = performance.now();
    interaction._isNear = true;
    interaction._lastCuriousAt =
      now - POINTER_INTERACTION_CONFIG.curiousCooldownMs;
    interaction._stillAnchor = {
      x: 100,
      y: 120,
      since: now - POINTER_INTERACTION_CONFIG.stillDurationMs
    };

    interaction._scheduleStillCheck(now);
    scheduled[0].callback();
    assert.equal(played.length, 0);
  } finally {
    interaction._clearStillTimer();
    globalThis.setTimeout = previousSetTimeout;
    globalThis.clearTimeout = previousClearTimeout;
  }
});

test('entering near zone does not auto-play nodGreeting on idle', () => {
  const previousSetTimeout = globalThis.setTimeout;
  const previousClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = () => 1;
  globalThis.clearTimeout = () => {};

  const played = [];
  const interaction = new PointerInteraction({
    canvas: {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 400,
        height: 400
      })
    },
    camera: {},
    poseManager: { getVisiblePoseKey: () => null },
    emotionController: {
      getCurrentEmotionKey: () => 'idle',
      playEmotion(key, options) {
        played.push({ key, options });
      }
    }
  });

  try {
    interaction.updateTigerScreenRect = () => {
      interaction._tigerRect = {
        left: 50,
        top: 50,
        right: 250,
        bottom: 250,
        cx: 150,
        cy: 150,
        w: 200,
        h: 200
      };
      return interaction._tigerRect;
    };

    interaction._onPointerMove({ clientX: 150, clientY: 150 });
    assert.equal(interaction._isNear, true);
    assert.equal(
      played.filter((p) => p.key === 'nodGreeting').length,
      0
    );
    assert.equal(played.length, 0);
  } finally {
    interaction._clearStillTimer();
    globalThis.setTimeout = previousSetTimeout;
    globalThis.clearTimeout = previousClearTimeout;
  }
});
