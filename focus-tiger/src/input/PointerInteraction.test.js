import test from 'node:test';
import assert from 'node:assert/strict';
import {
  POINTER_INTERACTION_CONFIG,
  PointerInteraction
} from './PointerInteraction.js';

test('still cursor timer triggers curiousTilt without another pointermove', () => {
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
      getCurrentEmotionKey: () => null,
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
