import test from 'node:test';
import assert from 'node:assert/strict';

import { HonestyCheckInController } from './HonestyCheckInController.js';
import { DailyCompletionStore } from './DailyCompletionStore.js';
import { FocusSessionEndStore } from './FocusSessionEndStore.js';
import { DormantCloakSleepStore } from './DormantCloakSleepStore.js';
import { MoodController } from './MoodController.js';
import { StateManager, STATES } from './StateManager.js';
import { EMOTION_KEYS } from './EmotionController.js';
import { DORMANT_IDLE_MS } from '../utils/Constants.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

function createUi(overrides = {}) {
  return {
    handlers: {},
    phase: 'hidden',
    hide() {
      this.phase = 'hidden';
    },
    hideIdleEntry() {},
    showIdleEntry() {},
    showPrompt() {
      this.phase = 'prompt';
    },
    showDurationChoices() {
      this.phase = 'duration';
    },
    startBreathGuide() {},
    showThanks() {},
    ...overrides
  };
}

function createHonestyHarness({
  now = () => new Date(2026, 6, 21, 14),
  lastEndedAt = null,
  dormantIdleMs = DORMANT_IDLE_MS
} = {}) {
  const storage = createStorage();
  const store = new DailyCompletionStore({ storage, now });
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  if (lastEndedAt != null) {
    focusSessionEndStore.recordSessionEnded(lastEndedAt);
  }
  const stateManager = new StateManager();
  const ui = createUi();
  const controller = new HonestyCheckInController({
    store,
    focusSessionEndStore,
    stateManager,
    emotionController: { playEmotion() {} },
    ui,
    now,
    dormantIdleMs
  });
  return { controller, stateManager, focusSessionEndStore, store, ui, now };
}

test('syncDormantState: no focus history stays IDLE on app ready', () => {
  const { controller, stateManager } = createHonestyHarness();
  controller.onAppReady();
  assert.equal(stateManager.state, STATES.IDLE);
});

test('syncDormantState: enters DORMANT after idle window elapsed', () => {
  const ended = Date.parse('2026-07-21T10:00:00');
  const now = () => new Date(Date.parse('2026-07-21T12:00:01'));
  const { controller, stateManager } = createHonestyHarness({
    now,
    lastEndedAt: ended
  });
  controller.syncDormantState();
  assert.equal(stateManager.state, STATES.DORMANT);
});

test('syncDormantState: recent session end stays IDLE', () => {
  const ended = Date.parse('2026-07-21T11:30:00');
  const now = () => new Date(Date.parse('2026-07-21T12:00:00'));
  const { controller, stateManager } = createHonestyHarness({
    now,
    lastEndedAt: ended
  });
  controller.syncDormantState();
  assert.equal(stateManager.state, STATES.IDLE);
});

test('first DORMANT entry plays cloakSleep then sleeping; same-day re-entry skips cloak', () => {
  const calls = [];
  let currentKey = null;
  const emotionController = {
    playEmotion(key, options = {}) {
      calls.push({ key, options });
      currentKey = key;
      if (key === EMOTION_KEYS.CLOAK_SLEEP && typeof options.onComplete === 'function') {
        options.onComplete('cloakSleep');
      }
      return true;
    },
    getCurrentEmotionKey() {
      return currentKey;
    },
    idleOrchestrator: null
  };
  const stateManager = new StateManager();
  const cloakStore = new DormantCloakSleepStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 21, 15)
  });
  const mood = new MoodController(stateManager, emotionController, {
    dormantCloakSleepStore: cloakStore
  });
  mood.handleStateChange(stateManager.state);

  stateManager.setState(STATES.DORMANT);
  assert.deepEqual(
    calls.map((c) => c.key),
    [EMOTION_KEYS.IDLE, EMOTION_KEYS.CLOAK_SLEEP, EMOTION_KEYS.SLEEPING]
  );
  assert.equal(cloakStore.hasPlayedCloakSleepToday(), true);

  const countBefore = calls.length;
  stateManager.setState(STATES.IDLE);
  stateManager.setState(STATES.DORMANT);
  assert.equal(calls.at(-1)?.key, EMOTION_KEYS.SLEEPING);
  assert.equal(calls.filter((c) => c.key === EMOTION_KEYS.CLOAK_SLEEP).length, 1);
  assert.ok(calls.length > countBefore);
});
