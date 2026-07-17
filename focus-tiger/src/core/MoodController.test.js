import test from 'node:test';
import assert from 'node:assert/strict';
import { MoodController } from './MoodController.js';
import { StateManager, STATES } from './StateManager.js';
import { EMOTION_KEYS } from './EmotionController.js';

function createHarness() {
  const calls = [];
  const emotionController = {
    playEmotion(key, options = {}) {
      calls.push({ key, options });
      return true;
    }
  };
  const stateManager = new StateManager();
  let celebrateDone = 0;
  const mood = new MoodController(stateManager, emotionController, {
    onCelebrateComplete: () => {
      celebrateDone += 1;
    }
  });
  return { calls, stateManager, mood, getCelebrateDone: () => celebrateDone };
}

test('DORMANT maps to sleeping emotion', () => {
  const { calls, stateManager } = createHarness();
  stateManager.setState(STATES.DORMANT);
  assert.equal(calls.at(-1)?.key, EMOTION_KEYS.SLEEPING);
});

test('CELEBRATE maps to celebrating and forwards onComplete', () => {
  const { calls, stateManager, getCelebrateDone } = createHarness();
  stateManager.setState(STATES.CELEBRATE);
  const last = calls.at(-1);
  assert.equal(last?.key, EMOTION_KEYS.CELEBRATING);
  assert.equal(typeof last?.options?.onComplete, 'function');
  last.options.onComplete();
  assert.equal(getCelebrateDone(), 1);
});
