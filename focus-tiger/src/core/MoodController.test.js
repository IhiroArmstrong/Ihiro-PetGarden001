/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { MoodController } from './MoodController.js';
import { StateManager, STATES } from './StateManager.js';
import { EMOTION_KEYS } from './EmotionController.js';

function createHarness() {
  const calls = [];
  let currentKey = null;
  const emotionController = {
    playEmotion(key, options = {}) {
      calls.push({ key, options });
      currentKey = key;
      return true;
    },
    getCurrentEmotionKey() {
      return currentKey;
    },
    idleOrchestrator: null
  };
  const stateManager = new StateManager();
  let celebrateDone = 0;
  const mood = new MoodController(stateManager, emotionController, {
    onCelebrateComplete: () => {
      celebrateDone += 1;
    }
  });
  return {
    calls,
    stateManager,
    mood,
    emotionController,
    getCelebrateDone: () => celebrateDone
  };
}

test('DORMANT transition plays cloakSleep entry', () => {
  const { calls, stateManager } = createHarness();
  stateManager.setState(STATES.DORMANT);
  assert.equal(calls.at(-1)?.key, EMOTION_KEYS.CLOAK_SLEEP);
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

test('IDLE does not overwrite riseStretchCasual Rise transition', () => {
  const { calls, stateManager, emotionController } = createHarness();
  stateManager.setState(STATES.FOCUSING);
  emotionController.playEmotion(EMOTION_KEYS.RISE_STRETCH_CASUAL);
  const before = calls.length;
  stateManager.setState(STATES.IDLE);
  assert.equal(calls.length, before);
  assert.equal(calls.at(-1)?.key, EMOTION_KEYS.RISE_STRETCH_CASUAL);
});

test('IDLE does not overwrite teaDrinking Rise interrupt hold', () => {
  const { calls, stateManager, emotionController } = createHarness();
  stateManager.setState(STATES.FOCUSING);
  emotionController.playEmotion(EMOTION_KEYS.TEA_DRINKING);
  const before = calls.length;
  stateManager.setState(STATES.IDLE);
  assert.equal(calls.length, before);
  assert.equal(calls.at(-1)?.key, EMOTION_KEYS.TEA_DRINKING);
});

test('IDLE does not overwrite bookReading Rise interrupt hold', () => {
  const { calls, stateManager, emotionController } = createHarness();
  stateManager.setState(STATES.FOCUSING);
  emotionController.playEmotion(EMOTION_KEYS.BOOK_READING);
  const before = calls.length;
  stateManager.setState(STATES.IDLE);
  assert.equal(calls.length, before);
  assert.equal(calls.at(-1)?.key, EMOTION_KEYS.BOOK_READING);
});

test('IDLE does not overwrite blinkBreathe debug transition', () => {
  const { calls, stateManager, emotionController } = createHarness();
  stateManager.setState(STATES.FOCUSING);
  emotionController.playEmotion(EMOTION_KEYS.BLINK_BREATHE);
  const before = calls.length;
  stateManager.setState(STATES.IDLE);
  assert.equal(calls.length, before);
  assert.equal(calls.at(-1)?.key, EMOTION_KEYS.BLINK_BREATHE);
});
