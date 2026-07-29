/**
 * SCENARIO_TESTS 场景 A–D · 控制器级冒烟（确定性步骤）
 *
 * 技术选型：项目尚无 Playwright/Cypress；本文件用现有 `node --test` 串联
 * Store / Controller 纯逻辑，覆盖主链路契约。浏览器 DOM / 序列观感仍靠人工。
 *
 * 对应剧本：`docs/SCENARIO_TESTS.md` 场景 A–D（见各 test 标题注释）。
 * 跑法：`npm test` 或 `npm run test:smoke`
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ARRIVAL_STEPS,
  advanceArrivalStep,
  createArrivalPracticeState,
  selectArrivalChoose,
  selectArrivalNotice
} from './ArrivalPractice.js';
import { DailyCompletionStore } from './DailyCompletionStore.js';
import { FocusSessionEndStore } from './FocusSessionEndStore.js';
import {
  COMPANION_MODE_ACROSS_TOOLS,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  FocusSession,
  canBeginFocusOnCompanionModeSelect,
  resolveCompanionHintClick,
  shouldSuppressAwayReminders
} from './FocusSession.js';
import { HonestyBridgeCtaController } from './HonestyBridgeCtaController.js';
import { HonestyBridgeStore } from './HonestyBridgeStore.js';
import { HonestyCheckInController } from './HonestyCheckInController.js';
import { MoodController } from './MoodController.js';
import {
  MANUAL_END_PAUSE_MS,
  SessionEndFlow
} from './SessionEndFlow.js';
import { formatIntentionEcho } from './SessionIntentionStore.js';
import { triggerSessionCompletionFeedback } from './session-completion-feedback.js';
import { StateManager, STATES } from './StateManager.js';
import { MindfulReminderController } from './MindfulReminderController.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
}

function createHonestyUi(overrides = {}) {
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

function createQuotaStub({ allow = true } = {}) {
  return {
    tryConsume() {
      return allow;
    }
  };
}

// ─── 场景 A：Kelly 第一个早晨（主链路契约）─────────────────────────────

test('smoke A1: zero completions → Idle + Honesty entry button; after record → still idle', () => {
  // SCENARIO_TESTS A1 / A11 — 开场 Idle（不上 Sleeping）
  let idleEntryShown = 0;
  const storage = createStorage();
  const now = () => new Date(2026, 6, 20, 8);
  const store = new DailyCompletionStore({
    storage,
    now
  });
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  const stateManager = new StateManager();
  const ui = createHonestyUi({
    showIdleEntry() {
      idleEntryShown += 1;
    }
  });
  const controller = new HonestyCheckInController({
    store,
    focusSessionEndStore,
    stateManager,
    emotionController: { playEmotion() {} },
    ui,
    now
  });

  assert.equal(store.hasCompletedToday(), false);
  controller.onAppReady();
  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(ui.phase, 'hidden');
  assert.equal(idleEntryShown, 1);

  store.recordCompletion(1);
  controller.syncDormantState();
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(stateManager.state, STATES.IDLE);
});

/**
 * A1 延伸：陈旧结束戳 ≥2h 时冷启动仍 Idle（开场即睡回归锚）。
 * live syncDormantState 仍可进 DORMANT（场景 D）。
 */
test('smoke A1b: cold open with stale ≥2h end → Idle (no DORMANT / cloak)', () => {
  const ended = Date.parse('2026-07-20T08:00:00');
  const now = () => new Date(Date.parse('2026-07-20T11:00:00'));
  const storage = createStorage();
  const store = new DailyCompletionStore({ storage, now });
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  focusSessionEndStore.recordSessionEnded(ended);
  const stateManager = new StateManager();
  const emotionCalls = [];
  const emotionController = {
    playEmotion(key, options = {}) {
      emotionCalls.push({ key, options });
      if (key === 'cloakSleep' && typeof options.onComplete === 'function') {
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
    store,
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui: createHonestyUi(),
    now
  });

  controller.onAppReady();
  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(
    emotionCalls.some((c) => c.key === 'cloakSleep' || c.key === 'sleeping'),
    false,
    '冷启动不得披毯/睡着'
  );
});

test('smoke A3–A4: Arrival Notice→Choose Deep Work → Here & Now can begin; gate blocks when not ready', () => {
  // SCENARIO_TESTS A3c–A4 + 门闩失败（回流 Rise 未再 Arrival）
  let state = createArrivalPracticeState();
  state = advanceArrivalStep(state); // notice
  assert.equal(state.step, ARRIVAL_STEPS.NOTICE);
  state = selectArrivalNotice(state, 'okay');
  state = advanceArrivalStep(state); // breath
  state = advanceArrivalStep(state); // choose
  assert.equal(state.step, ARRIVAL_STEPS.CHOOSE);
  state = selectArrivalChoose(state, {
    text: '💻 Deep Work',
    source: 'icon'
  });
  assert.equal(state.step, ARRIVAL_STEPS.READY);
  assert.match(state.chooseText, /Deep Work/);

  assert.equal(
    canBeginFocusOnCompanionModeSelect({
      mode: COMPANION_MODE_STAY,
      arrivalGateReady: true
    }),
    true
  );
  assert.equal(
    canBeginFocusOnCompanionModeSelect({
      mode: COMPANION_MODE_STAY,
      arrivalGateReady: false
    }),
    false,
    '回归锁：Arrival 未就绪不得 begin'
  );
  assert.equal(
    canBeginFocusOnCompanionModeSelect({
      mode: COMPANION_MODE_STEP_AWAY,
      arrivalGateReady: true
    }),
    true
  );
});

test('smoke A7–A8: first timed → celebrating; after celebrate stamp → sessionComplete; Honesty alone does not block dance', () => {
  // SCENARIO_TESTS A7 / A8 / L；Honesty 补登不占庆祝戳
  const store = new DailyCompletionStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 20, 9)
  });

  store.recordCompletion(20);
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(store.hasCelebratedToday(), false);

  let celebrations = 0;
  const emotions = [];
  const first = triggerSessionCompletionFeedback({
    hasCelebratedToday: store.hasCelebratedToday(),
    emotionController: {
      playEmotion(key) {
        emotions.push(key);
      }
    },
    startCelebrating: () => {
      celebrations += 1;
      store.markCelebratedToday();
    },
    onComplete: () => {}
  });
  assert.equal(first, 'celebrating');
  assert.equal(celebrations, 1);
  assert.equal(store.hasCelebratedToday(), true);

  store.recordCompletion(1);
  const second = triggerSessionCompletionFeedback({
    hasCelebratedToday: store.hasCelebratedToday(),
    emotionController: {
      playEmotion(key) {
        emotions.push(key);
      }
    },
    startCelebrating: () => {
      celebrations += 1;
    },
    onComplete: () => {}
  });
  assert.equal(second, 'sessionComplete');
  assert.equal(celebrations, 1);
  assert.ok(emotions.includes('sessionComplete'));
});

test('smoke A4 + FocusSession: Here & Now reaches target on wall clock', () => {
  let now = 0;
  const session = new FocusSession(1);
  session.start({ now: () => now, companionMode: COMPANION_MODE_STAY });
  now = 60_000;
  assert.equal(session.hasReachedTarget(), true);
  session.stop();
});

// ─── 场景 B：Recover / Re-focus ─────────────────────────────────────────

test('smoke B: Here & Now allows refocus; Offline/Flow suppress away reminders', () => {
  // SCENARIO_TESTS B4（确定性：模式门闩；真实 60s 切页仍人工）
  assert.equal(shouldSuppressAwayReminders(COMPANION_MODE_STAY), false);
  assert.equal(shouldSuppressAwayReminders(COMPANION_MODE_STEP_AWAY), true);
  assert.equal(shouldSuppressAwayReminders(COMPANION_MODE_ACROSS_TOOLS), true);

  const emotions = [];
  const toast = { show: () => true };

  const stay = new MindfulReminderController({
    emotionController: {
      getCurrentEmotionKey: () => 'idle',
      playEmotion(key, opts) {
        emotions.push({ key, opts });
      }
    },
    toast,
    quotaManager: createQuotaStub(),
    getCopy: (key) => key
  });
  stay.startSession({ suppressAwayReminders: false });
  stay.handleAttentionReturn({ durationMs: 90_000, displayEligible: true });
  assert.equal(emotions.length, 1);
  assert.equal(emotions[0].key, 'mindfulAcknowledge');
  assert.equal(emotions[0].opts.subtype, 'refocus');

  emotions.length = 0;
  const offline = new MindfulReminderController({
    emotionController: {
      getCurrentEmotionKey: () => 'idle',
      playEmotion(key, opts) {
        emotions.push({ key, opts });
      }
    },
    toast,
    quotaManager: createQuotaStub(),
    getCopy: (key) => key
  });
  offline.startSession({ suppressAwayReminders: true });
  offline.handleAttentionReturn({ durationMs: 90_000, displayEligible: true });
  assert.equal(emotions.length, 0);
});

// ─── 场景 C：中途 Rise ─────────────────────────────────────────────────

test('smoke C: Rise incomplete → no completion record; Reflection after MANUAL_END_PAUSE; intention echo', () => {
  // SCENARIO_TESTS C1–C4
  const storage = createStorage();
  const now = () => new Date(2026, 6, 20, 10);
  const store = new DailyCompletionStore({ storage, now });
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  const stateManager = new StateManager();
  const honesty = new HonestyCheckInController({
    store,
    focusSessionEndStore,
    stateManager,
    emotionController: { playEmotion() {} },
    ui: createHonestyUi(),
    now
  });
  stateManager.setState(STATES.FOCUSING);
  honesty.onIncompleteSessionEnded();
  assert.equal(store.hasCompletedToday(), false);
  assert.equal(stateManager.state, STATES.IDLE);

  const intention = '💻 Deep Work';
  assert.equal(
    formatIntentionEcho('Chosen direction: {text}', intention),
    'Chosen direction: 💻 Deep Work'
  );

  const timers = [];
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  globalThis.window = globalThis.window || globalThis;
  globalThis.setTimeout = (fn, ms) => {
    timers.push({ fn, ms });
    return timers.length;
  };
  globalThis.clearTimeout = () => {};
  globalThis.window.setTimeout = globalThis.setTimeout;
  globalThis.window.clearTimeout = globalThis.clearTimeout;

  try {
    let opened = null;
    const flow = new SessionEndFlow({
      reflectionMoment: {
        open(payload) {
          opened = payload;
        },
        onDone: null
      }
    });
    flow.onSessionEnded({
      completed: false,
      intention,
      intentionSource: 'icon'
    });
    assert.equal(timers.length, 1);
    assert.equal(timers[0].ms, MANUAL_END_PAUSE_MS);
    timers[0].fn();
    assert.deepEqual(opened, {
      intention,
      intentionSource: 'icon'
    });
  } finally {
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
    if (globalThis.window) {
      globalThis.window.setTimeout = realSetTimeout;
      globalThis.window.clearTimeout = realClearTimeout;
    }
  }
});

test('smoke I: How shall we sit? gate not ready → toggle panel (Honesty must not block hint)', () => {
  const action = resolveCompanionHintClick({
    idleVisible: true,
    postSessionOverlay: false
  });
  assert.equal(action, 'toggle');
  assert.notEqual(action, 'ignore');
});

test('smoke J回流: Rise 后门闩未就绪 → hint 仍须展开三选一（非静默）', () => {
  assert.equal(
    resolveCompanionHintClick({
      idleVisible: true,
      postSessionOverlay: false
    }),
    'toggle'
  );
});

// ─── 场景 D：Honesty + 桥接 CTA ────────────────────────────────────────

test('smoke D: honesty 20min → dormantWake + bridge Yes→Arrival / No→idle; same-day again', () => {
  // SCENARIO_TESTS D3–D5 / N
  const day = () => new Date(2026, 6, 21, 9);
  const storage = createStorage();
  const store = new DailyCompletionStore({
    storage,
    now: day
  });
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now: day });
  const stateManager = new StateManager();
  stateManager.setState(STATES.DORMANT);
  const emotionCalls = [];
  let arrivalStarts = 0;
  let idleFalls = 0;

  const honestyUi = createHonestyUi({
    startBreathGuide() {}
  });
  const bridgeUi = {
    handlers: {},
    show() {},
    hide() {}
  };
  const bridge = new HonestyBridgeCtaController({
    store: new HonestyBridgeStore({ storage: createStorage(), now: day }),
    ui: bridgeUi,
    onAccept: () => {
      arrivalStarts += 1;
    },
    onDecline: () => {
      idleFalls += 1;
    }
  });
  const honesty = new HonestyCheckInController({
    store,
    focusSessionEndStore,
    stateManager,
    emotionController: {
      playEmotion(key, options = {}) {
        emotionCalls.push({ key, options });
      }
    },
    ui: honestyUi,
    now: day,
    onCheckInComplete: () => {
      bridge.onHonestyCheckInComplete();
    }
  });

  honestyUi.handlers.onDurationSelect(20);
  assert.equal(emotionCalls[0].key, 'dormantWake');
  assert.equal(emotionCalls[0].options.holdPose, true);

  honestyUi.handlers.onBreathComplete();
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(bridge.isVisible(), true);

  bridgeUi.handlers.onYes();
  assert.equal(arrivalStarts, 1);

  bridge.onHonestyCheckInComplete();
  bridgeUi.handlers.onNo();
  assert.equal(idleFalls, 1);
  assert.equal(arrivalStarts, 1);
});

/**
 * 场景 D 主链路（用户步骤）：距上次专注 ≥2h → 惰性 DORMANT（cloakSleep）
 * → Honesty 选 20 → dormantWake → 呼吸结束离 DORMANT → 桥接 Yes。
 * 不手工 setState(DORMANT)；与 dormantIdle 串联契约互补。
 */
test('smoke D sleep→wake: 2h idle → cloakSleep → Honesty wake → bridge Yes', () => {
  const ended = Date.parse('2026-07-21T07:00:00');
  const day = () => new Date(Date.parse('2026-07-21T09:00:01'));
  const storage = createStorage();
  const store = new DailyCompletionStore({ storage, now: day });
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now: day });
  focusSessionEndStore.recordSessionEnded(ended);

  const emotionCalls = [];
  let currentKey = null;
  const emotionController = {
    playEmotion(key, options = {}) {
      emotionCalls.push({ key, options });
      currentKey = key;
      if (key === 'cloakSleep' && typeof options.onComplete === 'function') {
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

  let arrivalStarts = 0;
  const honestyUi = createHonestyUi({ startBreathGuide() {} });
  const bridgeUi = { handlers: {}, show() {}, hide() {} };
  const bridge = new HonestyBridgeCtaController({
    store: new HonestyBridgeStore({ storage: createStorage(), now: day }),
    ui: bridgeUi,
    onAccept: () => {
      arrivalStarts += 1;
    },
    onDecline: () => {}
  });
  const honesty = new HonestyCheckInController({
    store,
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui: honestyUi,
    now: day,
    onCheckInComplete: () => {
      bridge.onHonestyCheckInComplete();
    }
  });

  // 步骤 1–2：满 2h → 进睡（披毯）
  honesty.syncDormantState();
  assert.equal(stateManager.state, STATES.DORMANT);
  assert.equal(
    emotionCalls.some((c) => c.key === 'cloakSleep'),
    true,
    '须先播 cloakSleep 进睡'
  );
  assert.equal(emotionCalls.at(-1)?.key, 'sleeping');

  // 步骤 3–4：Honesty 选 20 → dormantWake + 呼吸
  honesty.openDurationChoices();
  honestyUi.handlers.onDurationSelect(20);
  const wake = emotionCalls.find((c) => c.key === 'dormantWake');
  assert.ok(wake, '须从真实 DORMANT 播 dormantWake');
  assert.equal(wake.options.holdPose, true);

  // 步骤 5：呼吸结束 → 离 DORMANT + 桥接
  honestyUi.handlers.onBreathComplete();
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(bridge.isVisible(), true);

  bridgeUi.handlers.onYes();
  assert.equal(arrivalStarts, 1);
});
