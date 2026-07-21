import test from 'node:test';
import assert from 'node:assert/strict';

import {
  focusLevelForHonestyMinutes,
  HonestyCheckInController
} from './HonestyCheckInController.js';
import { DailyCompletionStore } from './DailyCompletionStore.js';
import { FocusSessionEndStore } from './FocusSessionEndStore.js';
import { StateManager, STATES } from './StateManager.js';

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

function createControllerDeps({
  storage = createStorage(),
  now = () => new Date(2026, 6, 16, 12),
  stateManager = new StateManager(),
  emotionController = { playEmotion() {} },
  ui = createUi(),
  extra = {}
} = {}) {
  const store = new DailyCompletionStore({ storage, now });
  const focusSessionEndStore = new FocusSessionEndStore({ storage, now });
  const controller = new HonestyCheckInController({
    store,
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui,
    ...extra
  });
  return { controller, store, focusSessionEndStore, stateManager, ui };
}

test('30+ honesty minutes map to full placeholder glow; 10 and 20 are lower', () => {
  assert.equal(focusLevelForHonestyMinutes(10), 0.4);
  assert.equal(focusLevelForHonestyMinutes(20), 0.7);
  assert.equal(focusLevelForHonestyMinutes(30), 1);
});

test('incomplete end returns to IDLE without recording when day has zero completions', () => {
  const { controller, store, stateManager } = createControllerDeps();
  stateManager.setState(STATES.FOCUSING);
  controller.onIncompleteSessionEnded();

  assert.equal(store.hasCompletedToday(), false);
  assert.equal(stateManager.state, STATES.IDLE);
});

test('timed completion records minutes and leaves DORMANT', () => {
  const { controller, store, stateManager } = createControllerDeps();
  stateManager.setState(STATES.DORMANT);

  controller.onTimedSessionCompleted(25);
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(store.getTodaySessions()[0].durationMinutes, 25);
  assert.equal(stateManager.state, STATES.IDLE);
});

test('openDurationChoices shows duration UI without Sit with Yin', () => {
  let durationShown = 0;
  const { controller, stateManager } = createControllerDeps({
    ui: createUi({
      showDurationChoices() {
        durationShown += 1;
        this.phase = 'duration';
      }
    })
  });
  stateManager.setState(STATES.IDLE);

  controller.openDurationChoices({ force: true });

  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(durationShown, 1);
});

test('zero-completion honesty from Idle skips dormantWake', () => {
  let idleEntryShown = 0;
  const emotionCalls = [];
  const { controller, stateManager, ui } = createControllerDeps({
    ui: createUi({
      showIdleEntry() {
        idleEntryShown += 1;
      }
    }),
    emotionController: {
      playEmotion(key) {
        emotionCalls.push(key);
      }
    }
  });
  stateManager.setState(STATES.IDLE);

  controller.onAppReady();
  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(ui.phase, 'hidden');
  assert.equal(idleEntryShown, 1);

  controller.openDurationChoices();
  ui.handlers.onDurationSelect(20);
  assert.equal(emotionCalls.includes('dormantWake'), false);
  assert.equal(stateManager.state, STATES.IDLE);
});

test('honesty duration select sits up and holds pose; breath end leaves DORMANT', () => {
  const emotionCalls = [];
  let guideStarted = 0;
  let glowCleared = 0;
  const { controller, store, stateManager, ui } = createControllerDeps({
    ui: createUi({
      startBreathGuide() {
        guideStarted += 1;
      }
    }),
    emotionController: {
      playEmotion(key, options = {}) {
        emotionCalls.push({ key, options });
      }
    },
    extra: {
      clearFocusGlow: () => {
        glowCleared += 1;
      }
    }
  });
  stateManager.setState(STATES.DORMANT);

  ui.handlers.onDurationSelect(20);
  assert.equal(guideStarted, 1);
  assert.equal(emotionCalls[0].key, 'dormantWake');
  assert.equal(emotionCalls[0].options.holdPose, true);
  assert.equal(stateManager.state, STATES.DORMANT);
  assert.equal(typeof emotionCalls[0].options.onComplete, 'undefined');

  ui.handlers.onBreathComplete();
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(glowCleared, 1);
  assert.equal(stateManager.state, STATES.IDLE);
  assert.equal(
    emotionCalls.filter((c) => c.key === 'dormantWake').length,
    1
  );
  assert.equal(emotionCalls.filter((c) => c.key === 'idle').length, 0);
});

test('same-day re-entry skips sleep wake; still records and fires bridge hook', () => {
  const storage = createStorage();
  const now = () => new Date(2026, 6, 16, 12);
  const store = new DailyCompletionStore({ storage, now });
  store.recordCompletion(10);
  const emotionCalls = [];
  let completeCalls = 0;
  let idleEntryShown = 0;
  const { controller, stateManager, ui } = createControllerDeps({
    storage,
    now,
    ui: createUi({
      showIdleEntry() {
        idleEntryShown += 1;
      }
    }),
    emotionController: {
      playEmotion(key) {
        emotionCalls.push(key);
      }
    },
    extra: {
      onCheckInComplete: () => {
        completeCalls += 1;
      }
    }
  });
  stateManager.setState(STATES.IDLE);

  controller.syncIdleEntry();
  assert.equal(idleEntryShown, 1);

  controller.openDurationChoices();
  assert.equal(stateManager.state, STATES.IDLE);

  ui.handlers.onDurationSelect(20);
  assert.equal(emotionCalls.includes('dormantWake'), false);

  ui.handlers.onBreathComplete();
  assert.equal(completeCalls, 1);
  assert.equal(store.hasCompletedToday(), true);
});

test('honesty breath complete invokes onCheckInComplete for bridge hook', () => {
  let completeCalls = 0;
  const { controller, stateManager, ui } = createControllerDeps({
    extra: {
      onCheckInComplete: () => {
        completeCalls += 1;
      }
    }
  });
  stateManager.setState(STATES.DORMANT);

  ui.handlers.onDurationSelect(10);
  ui.handlers.onBreathComplete();
  assert.equal(completeCalls, 1);
  assert.equal(stateManager.state, STATES.IDLE);
});

test('breath complete without pending minutes aborts: no record, toast, reopen duration', () => {
  const warns = [];
  const orig = console.warn;
  console.warn = (...args) => {
    warns.push(args.map(String).join(' '));
  };

  let notifyCalls = 0;
  let completeCalls = 0;
  let durationShown = 0;
  let hideCalls = 0;
  const { controller, store, stateManager, ui } = createControllerDeps({
    ui: createUi({
      hide() {
        hideCalls += 1;
        this.phase = 'hidden';
      },
      showDurationChoices() {
        durationShown += 1;
        this.phase = 'duration';
      }
    }),
    extra: {
      notifyUser: () => {
        notifyCalls += 1;
      },
      onCheckInComplete: () => {
        completeCalls += 1;
      }
    }
  });

  try {
    stateManager.setState(STATES.IDLE);
    ui.handlers.onDurationSelect(20);
    assert.equal(controller._pendingMinutes, 20);

    // 模拟 force 重开 / 竞态清掉 pending 后呼吸仍回调
    controller._pendingMinutes = null;
    ui.handlers.onBreathComplete();

    assert.equal(store.hasCompletedToday(), false);
    assert.equal(completeCalls, 0);
    assert.equal(notifyCalls, 1);
    assert.equal(durationShown >= 1, true);
    assert.equal(ui.phase, 'duration');
    assert.equal(controller._busy, false);
    assert.match(warns.join('\n'), /without pending minutes/);
    assert.equal(hideCalls >= 1, true);
  } finally {
    console.warn = orig;
  }
});

test('openDurationChoices force cancels in-flight breath before reopening', () => {
  let hideCalls = 0;
  let durationShown = 0;
  const { controller, stateManager, ui } = createControllerDeps({
    ui: createUi({
      hide() {
        hideCalls += 1;
        this.phase = 'hidden';
      },
      showDurationChoices() {
        durationShown += 1;
        this.phase = 'duration';
      }
    })
  });
  stateManager.setState(STATES.IDLE);
  ui.handlers.onDurationSelect(10);
  assert.equal(controller._busy, true);
  assert.equal(controller._pendingMinutes, 10);

  controller.openDurationChoices({ force: true });
  assert.equal(controller._busy, false);
  assert.equal(controller._pendingMinutes, null);
  assert.equal(hideCalls >= 1, true);
  assert.equal(durationShown >= 1, true);
  assert.equal(ui.phase, 'duration');
});
