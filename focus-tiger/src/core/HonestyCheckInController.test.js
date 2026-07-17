import test from 'node:test';
import assert from 'node:assert/strict';

import {
  focusLevelForHonestyMinutes,
  HonestyCheckInController
} from './HonestyCheckInController.js';
import { DailyCompletionStore } from './DailyCompletionStore.js';
import { StateManager, STATES } from './StateManager.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

test('30+ honesty minutes map to full placeholder glow; 10 and 20 are lower', () => {
  assert.equal(focusLevelForHonestyMinutes(10), 0.4);
  assert.equal(focusLevelForHonestyMinutes(20), 0.7);
  assert.equal(focusLevelForHonestyMinutes(30), 1);
});

test('incomplete end keeps DORMANT without recording when day has zero completions', () => {
  const store = new DailyCompletionStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 16, 12)
  });
  const stateManager = new StateManager();
  const emotions = [];
  const ui = {
    handlers: {},
    hide() {},
    showPrompt() {}
  };

  const controller = new HonestyCheckInController({
    store,
    stateManager,
    emotionController: {
      playEmotion(key) {
        emotions.push(key);
      }
    },
    ui
  });

  stateManager.setState(STATES.FOCUSING);
  controller.onIncompleteSessionEnded();

  assert.equal(store.hasCompletedToday(), false);
  assert.equal(stateManager.state, STATES.DORMANT);
});

test('timed completion records minutes and leaves DORMANT', () => {
  const store = new DailyCompletionStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 16, 12)
  });
  const stateManager = new StateManager();
  stateManager.setState(STATES.DORMANT);

  const controller = new HonestyCheckInController({
    store,
    stateManager,
    emotionController: { playEmotion() {} },
    ui: { handlers: {}, hide() {}, showPrompt() {} }
  });

  controller.onTimedSessionCompleted(25);
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(store.getTodaySessions()[0].durationMinutes, 25);
  assert.equal(stateManager.state, STATES.IDLE);
});

test('honesty breathing keeps sleeping until dormantWake completes', () => {
  const store = new DailyCompletionStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 16, 12)
  });
  const stateManager = new StateManager();
  stateManager.setState(STATES.DORMANT);
  const emotionCalls = [];
  let guideStarted = 0;
  let glowCleared = 0;
  const ui = {
    handlers: {},
    startBreathGuide() {
      guideStarted += 1;
    },
    showThanks() {}
  };
  const controller = new HonestyCheckInController({
    store,
    stateManager,
    emotionController: {
      playEmotion(key, options = {}) {
        emotionCalls.push({ key, options });
      }
    },
    ui,
    clearFocusGlow: () => {
      glowCleared += 1;
    }
  });

  ui.handlers.onDurationSelect(20);
  assert.equal(guideStarted, 1);
  assert.deepEqual(emotionCalls, []);
  assert.equal(stateManager.state, STATES.DORMANT);

  ui.handlers.onBreathComplete();
  assert.equal(emotionCalls[0].key, 'dormantWake');
  assert.equal(stateManager.state, STATES.DORMANT);

  emotionCalls[0].options.onComplete();
  assert.equal(glowCleared, 1);
  assert.equal(stateManager.state, STATES.IDLE);
});
