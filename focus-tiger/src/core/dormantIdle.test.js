import test from 'node:test';
import assert from 'node:assert/strict';

import { HonestyCheckInController } from './HonestyCheckInController.js';
import { DailyCompletionStore } from './DailyCompletionStore.js';
import { FocusSessionEndStore } from './FocusSessionEndStore.js';
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

function createMoodHarness() {
  const calls = [];
  let currentKey = null;
  const emotionController = {
    playEmotion(key, options = {}) {
      calls.push({ key, options });
      currentKey = key;
      if (
        key === EMOTION_KEYS.CLOAK_SLEEP &&
        typeof options.onComplete === 'function'
      ) {
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
  const mood = new MoodController(stateManager, emotionController);
  mood.handleStateChange(stateManager.state);
  return { calls, stateManager, mood, emotionController };
}

test('syncDormantState: no focus history stays IDLE on app ready', () => {
  const { controller, stateManager } = createHonestyHarness();
  controller.onAppReady();
  assert.equal(stateManager.state, STATES.IDLE);
});

/**
 * 回归锚「开场即睡」：陈旧 focus-session-end ≥2h 时，冷启动仍须 Idle，
 * 不得 IDLE→DORMANT 重播 cloakSleep（用户要第一幕有精神的坐禅，不是披毯入睡）。
 */
test('onAppReady: stale ≥2h end timestamp stays IDLE (no cloak cold open)', () => {
  const ended = Date.parse('2026-07-21T10:00:00');
  const now = () => new Date(Date.parse('2026-07-21T13:00:00'));
  const emotionCalls = [];
  const storage = createStorage();
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  focusSessionEndStore.recordSessionEnded(ended);
  const stateManager = new StateManager();
  const emotionController = {
    playEmotion(key, options = {}) {
      emotionCalls.push({ key, options });
      if (
        key === EMOTION_KEYS.CLOAK_SLEEP &&
        typeof options.onComplete === 'function'
      ) {
        options.onComplete('cloakSleep');
      }
      return true;
    },
    getCurrentEmotionKey() {
      return emotionCalls.at(-1)?.key ?? null;
    },
    idleOrchestrator: null
  };
  const mood = new MoodController(stateManager, emotionController);
  mood.handleStateChange(stateManager.state);

  const controller = new HonestyCheckInController({
    store: new DailyCompletionStore({ storage, now }),
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui: createUi(),
    now
  });

  controller.onAppReady();
  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(
    emotionCalls.some((c) => c.key === EMOTION_KEYS.CLOAK_SLEEP),
    false,
    '冷启动不得播 cloakSleep'
  );
  assert.equal(
    emotionCalls.some((c) => c.key === EMOTION_KEYS.SLEEPING),
    false,
    '冷启动不得进 sleeping'
  );
});

test('forceDormant: enters DORMANT without ≥2h stamp (late-night wellness)', () => {
  const now = () => new Date(Date.parse('2026-07-21T13:00:00'));
  const emotionCalls = [];
  const storage = createStorage();
  const stateManager = new StateManager();
  const emotionController = {
    playEmotion(key, options = {}) {
      emotionCalls.push({ key, options });
      if (
        key === EMOTION_KEYS.CLOAK_SLEEP &&
        typeof options.onComplete === 'function'
      ) {
        options.onComplete('cloakSleep');
      }
      return true;
    },
    getCurrentEmotionKey() {
      return emotionCalls.at(-1)?.key ?? null;
    },
    idleOrchestrator: null
  };
  new MoodController(stateManager, emotionController);
  const controller = new HonestyCheckInController({
    store: new DailyCompletionStore({ storage, now }),
    focusSessionEndStore: new FocusSessionEndStore({ storage, now }),
    stateManager,
    emotionController,
    ui: createUi(),
    now
  });
  controller.syncDormantState({ allowEnterDormant: true, forceDormant: true });
  assert.equal(stateManager.state, STATES.DORMANT);
  assert.ok(
    emotionCalls.some((c) => c.key === EMOTION_KEYS.CLOAK_SLEEP),
    'forceDormant 须播 cloakSleep'
  );
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

test('live sync after cold open: stale ≥2h may still enter DORMANT with cloak', () => {
  const ended = Date.parse('2026-07-21T10:00:00');
  const now = () => new Date(Date.parse('2026-07-21T13:00:00'));
  const emotionCalls = [];
  const storage = createStorage();
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  focusSessionEndStore.recordSessionEnded(ended);
  const stateManager = new StateManager();
  const emotionController = {
    playEmotion(key, options = {}) {
      emotionCalls.push({ key, options });
      if (
        key === EMOTION_KEYS.CLOAK_SLEEP &&
        typeof options.onComplete === 'function'
      ) {
        options.onComplete('cloakSleep');
      }
      return true;
    },
    getCurrentEmotionKey() {
      return emotionCalls.at(-1)?.key ?? null;
    },
    idleOrchestrator: null
  };
  const mood = new MoodController(stateManager, emotionController);
  mood.handleStateChange(stateManager.state);

  const controller = new HonestyCheckInController({
    store: new DailyCompletionStore({ storage, now }),
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui: createUi(),
    now
  });

  controller.onAppReady();
  assert.equal(stateManager.state, STATES.IDLE);

  // 回前台 / 显式 live sync：仍可进睡（保留 2h 惰性契约）
  controller.syncDormantState();
  assert.equal(stateManager.state, STATES.DORMANT);
  assert.equal(
    emotionCalls.some((c) => c.key === EMOTION_KEYS.CLOAK_SLEEP),
    true
  );
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

test('non-DORMANT to DORMANT transition plays cloakSleep then sleeping', () => {
  const { calls, stateManager } = createMoodHarness();
  stateManager.setState(STATES.DORMANT);
  assert.deepEqual(
    calls.map((c) => c.key),
    [EMOTION_KEYS.IDLE, EMOTION_KEYS.CLOAK_SLEEP, EMOTION_KEYS.SLEEPING]
  );
});

test('each wake then re-enter DORMANT replays cloakSleep transition', () => {
  const { calls, stateManager } = createMoodHarness();
  stateManager.setState(STATES.DORMANT);
  stateManager.setState(STATES.IDLE);
  stateManager.setState(STATES.DORMANT);
  assert.equal(
    calls.filter((c) => c.key === EMOTION_KEYS.CLOAK_SLEEP).length,
    2
  );
});

test('cross midnight while still DORMANT does not replay cloakSleep', () => {
  const calls = [];
  let currentKey = null;
  const emotionController = {
    playEmotion(key, options = {}) {
      calls.push({ key, options });
      currentKey = key;
      if (
        key === EMOTION_KEYS.CLOAK_SLEEP &&
        typeof options.onComplete === 'function'
      ) {
        options.onComplete('cloakSleep');
      }
      return true;
    },
    getCurrentEmotionKey() {
      return currentKey;
    },
    idleOrchestrator: null
  };

  const storage = createStorage();
  const ended = Date.parse('2026-07-20T10:00:00');
  let nowMs = Date.parse('2026-07-20T22:00:00');
  const now = () => new Date(nowMs);
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  focusSessionEndStore.recordSessionEnded(ended);
  const stateManager = new StateManager();
  const mood = new MoodController(stateManager, emotionController);
  mood.handleStateChange(stateManager.state);

  const controller = new HonestyCheckInController({
    store: new DailyCompletionStore({ storage, now }),
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui: createUi(),
    now
  });

  controller.syncDormantState();
  assert.equal(stateManager.state, STATES.DORMANT);
  assert.equal(
    calls.filter((c) => c.key === EMOTION_KEYS.CLOAK_SLEEP).length,
    1
  );

  const countAfterFirst = calls.length;
  nowMs = Date.parse('2026-07-21T08:00:00');
  controller.syncDormantState();
  assert.equal(stateManager.state, STATES.DORMANT);
  assert.equal(calls.length, countAfterFirst);
  assert.equal(
    calls.filter((c) => c.key === EMOTION_KEYS.CLOAK_SLEEP).length,
    1
  );
});

/**
 * 串联契约：2h 惰性进睡（cloakSleep）→ Honesty 选时长（dormantWake）→ 呼吸结束离 DORMANT。
 * 补足「睡下」与「唤醒」原先分测、未串一条链的缺口。
 */
test('chain: 2h idle → cloakSleep → Honesty dormantWake → leave DORMANT', () => {
  const emotionCalls = [];
  let currentKey = null;
  const emotionController = {
    playEmotion(key, options = {}) {
      emotionCalls.push({ key, options });
      currentKey = key;
      if (
        key === EMOTION_KEYS.CLOAK_SLEEP &&
        typeof options.onComplete === 'function'
      ) {
        options.onComplete('cloakSleep');
      }
      return true;
    },
    getCurrentEmotionKey() {
      return currentKey;
    },
    idleOrchestrator: null
  };

  const storage = createStorage();
  const ended = Date.parse('2026-07-21T10:00:00');
  const now = () => new Date(Date.parse('2026-07-21T12:00:01'));
  const store = new DailyCompletionStore({ storage, now });
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  focusSessionEndStore.recordSessionEnded(ended);
  const stateManager = new StateManager();
  const mood = new MoodController(stateManager, emotionController);
  mood.handleStateChange(stateManager.state);

  let breathStarted = 0;
  const ui = createUi({
    startBreathGuide() {
      breathStarted += 1;
      this.phase = 'breath';
    }
  });
  const controller = new HonestyCheckInController({
    store,
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui,
    now
  });

  // 1) 惰性进睡
  controller.syncDormantState();
  assert.equal(stateManager.state, STATES.DORMANT);
  assert.equal(
    emotionCalls.filter((c) => c.key === EMOTION_KEYS.CLOAK_SLEEP).length,
    1
  );
  assert.equal(emotionCalls.at(-1)?.key, EMOTION_KEYS.SLEEPING);

  // 2) Honesty 选时长 → 睡醒（不经手动 setState）
  controller.openDurationChoices();
  ui.handlers.onDurationSelect(20);
  assert.equal(breathStarted, 1);
  const wake = emotionCalls.find((c) => c.key === EMOTION_KEYS.DORMANT_WAKE);
  assert.ok(wake);
  assert.equal(wake.options.holdPose, true);
  assert.equal(stateManager.state, STATES.DORMANT);

  // 3) 呼吸结束 → 记账离 DORMANT（Honesty 不刷新 focus-session-end）
  const lastEndedBefore = focusSessionEndStore.getLastEndedAt();
  ui.handlers.onBreathComplete();
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(store.getTodaySessions()[0].durationMinutes, 20);
  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(focusSessionEndStore.getLastEndedAt(), lastEndedBefore);
});
