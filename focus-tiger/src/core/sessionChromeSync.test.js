import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isHonestyPhaseBusy,
  isHonestyUiBusy,
  createSessionChromeSync
} from './sessionChromeSync.js';
import { SessionUiGate } from './SessionUiGate.js';
import { STATES } from './StateManager.js';

describe('isHonestyPhaseBusy', () => {
  it('duration / breath / thanks → busy', () => {
    assert.equal(isHonestyPhaseBusy('duration'), true);
    assert.equal(isHonestyPhaseBusy('breath'), true);
    assert.equal(isHonestyPhaseBusy('thanks'), true);
  });

  it('prompt / hidden / null → not busy（微仪式入口用）', () => {
    assert.equal(isHonestyPhaseBusy('prompt'), false);
    assert.equal(isHonestyPhaseBusy('hidden'), false);
    assert.equal(isHonestyPhaseBusy(null), false);
    assert.equal(isHonestyPhaseBusy(undefined), false);
  });
});

describe('isHonestyUiBusy', () => {
  it('非 hidden 即忙（壳层 suppress 单一入口）', () => {
    assert.equal(isHonestyUiBusy('prompt'), true);
    assert.equal(isHonestyUiBusy('duration'), true);
    assert.equal(isHonestyUiBusy('hidden'), false);
    assert.equal(isHonestyUiBusy(null), false);
  });
});

describe('createSessionChromeSync', () => {
  function harness() {
    const sessionUiGate = new SessionUiGate();
    let bridgeVisible = false;
    let arrivalOpen = false;
    let reflectionOpen = false;
    let microOpen = false;
    let honestyPhase = 'hidden';
    let honestyEntryHidden = true;
    let microEntryVisible = false;
    let bridgeActive = null;
    let overlayOnPicker = null;
    let optionEnabled = null;
    let arrivalReadyOnPicker = null;
    let arrivalActiveOnPicker = null;
    let reminderSynced = 0;
    let narrowIdle = null;
    let narrowSuppressed = null;
    let narrowKeepQs = null;
    let wideIdle = null;
    let wideSuppressed = null;

    const honestyCheckInUI = {
      get phase() {
        return honestyPhase;
      },
      hideIdleEntry() {
        honestyEntryHidden = true;
      }
    };
    const honestyCheckIn = {
      syncIdleEntry() {
        honestyEntryHidden = false;
      }
    };
    const companionModePicker = {
      setHonestyBridgeActive(v) {
        bridgeActive = v;
      },
      setPostSessionOverlayActive(v) {
        overlayOnPicker = v;
      },
      setOptionSelectEnabled(v) {
        optionEnabled = v;
      },
      setArrivalReady(v) {
        arrivalReadyOnPicker = v;
      },
      setArrivalActive(v) {
        arrivalActiveOnPicker = v;
      }
    };
    const narrowIdleShell = {
      setIdle(v) {
        narrowIdle = v;
      },
      setSuppressed(v, opts = {}) {
        narrowSuppressed = v;
        narrowKeepQs = Boolean(opts.keepQuickStart);
      }
    };
    const wideIdleMoreMenu = {
      setIdle(v) {
        wideIdle = v;
      },
      setSuppressed(v) {
        wideSuppressed = v;
      }
    };
    const stateManager = { state: STATES.IDLE };
    const sync = createSessionChromeSync({
      getHonestyBridge: () => ({
        isVisible: () => bridgeVisible
      }),
      getArrivalPractice: () => ({
        isOpen: () => arrivalOpen
      }),
      getReflectionMoment: () => ({
        isOpen: () => reflectionOpen
      }),
      getMicroRitualUI: () => ({
        isOpen: () => microOpen,
        hideIdleEntry() {
          microEntryVisible = false;
        },
        showIdleEntry() {
          microEntryVisible = true;
        }
      }),
      honestyCheckInUI,
      honestyCheckIn,
      companionModePicker,
      narrowIdleShell,
      wideIdleMoreMenu,
      stateManager,
      sessionUiGate,
      syncInAppReminderBanner: () => {
        reminderSynced += 1;
      }
    });

    return {
      sync,
      sessionUiGate,
      stateManager,
      set: {
        bridgeVisible: (v) => {
          bridgeVisible = v;
        },
        arrivalOpen: (v) => {
          arrivalOpen = v;
        },
        reflectionOpen: (v) => {
          reflectionOpen = v;
        },
        microOpen: (v) => {
          microOpen = v;
        },
        honestyPhase: (v) => {
          honestyPhase = v;
        }
      },
      get: {
        honestyEntryHidden: () => honestyEntryHidden,
        microEntryVisible: () => microEntryVisible,
        bridgeActive: () => bridgeActive,
        overlayOnPicker: () => overlayOnPicker,
        optionEnabled: () => optionEnabled,
        arrivalReadyOnPicker: () => arrivalReadyOnPicker,
        arrivalActiveOnPicker: () => arrivalActiveOnPicker,
        reminderSynced: () => reminderSynced,
        narrowIdle: () => narrowIdle,
        narrowSuppressed: () => narrowSuppressed,
        narrowKeepQs: () => narrowKeepQs,
        wideIdle: () => wideIdle,
        wideSuppressed: () => wideSuppressed
      }
    };
  }

  it('Idle 且无叠层 → 显示 Honesty / 微仪式入口', () => {
    const h = harness();
    h.sync.syncHonestyIdleEntry();
    assert.equal(h.get.honestyEntryHidden(), false);
    assert.equal(h.get.microEntryVisible(), true);
    assert.equal(h.get.bridgeActive(), false);
    assert.equal(h.get.wideSuppressed(), false);
  });

  it('Honesty duration → 隐藏微仪式入口（isHonestyPhaseBusy 单一入口）', () => {
    const h = harness();
    h.set.honestyPhase('duration');
    h.sync.syncHonestyIdleEntry();
    assert.equal(h.get.microEntryVisible(), false);
    assert.equal(h.get.wideSuppressed(), true);
  });

  it('Arrival 开 → 隐藏 Honesty 入口', () => {
    const h = harness();
    h.set.arrivalOpen(true);
    h.sync.syncHonestyIdleEntry();
    assert.equal(h.get.honestyEntryHidden(), true);
    assert.equal(h.get.microEntryVisible(), false);
  });

  it('resyncSessionChrome：Reflection 叠层 → Gate + Companion + 窄宽壳对齐', () => {
    const h = harness();
    h.set.reflectionOpen(true);
    h.sync.resyncSessionChrome();
    assert.equal(h.sessionUiGate.postSessionOverlayActive, true);
    assert.equal(h.get.overlayOnPicker(), true);
    assert.equal(h.get.optionEnabled(), false);
    assert.equal(h.get.reminderSynced(), 1);
    assert.equal(h.get.narrowIdle(), true);
    assert.equal(h.get.narrowSuppressed(), true);
    assert.equal(h.get.narrowKeepQs(), false);
    assert.equal(h.get.wideIdle(), true);
    assert.equal(h.get.wideSuppressed(), true);
  });

  it('resyncSessionChrome：Arrival 开 → keepQuickStart，桥接 alone 不压窄屏', () => {
    const h = harness();
    h.set.arrivalOpen(true);
    h.sync.resyncSessionChrome();
    assert.equal(h.get.arrivalActiveOnPicker(), true);
    assert.equal(h.get.narrowSuppressed(), true);
    assert.equal(h.get.narrowKeepQs(), true);

    const h2 = harness();
    h2.set.bridgeVisible(true);
    h2.sync.resyncSessionChrome();
    assert.equal(h2.get.narrowSuppressed(), false);
    assert.equal(h2.get.wideSuppressed(), true);
  });

  it('syncArrivalGateReady 同步 Gate 与 Companion', () => {
    const h = harness();
    h.sync.syncArrivalGateReady(true);
    assert.equal(h.sessionUiGate.arrivalGateReady, true);
    assert.equal(h.get.arrivalReadyOnPicker(), true);
  });

  it('resyncSessionChrome：idleChrome.applyShellProjection 优先于分壳调用', () => {
    const sessionUiGate = new SessionUiGate();
    let applied = null;
    const idleChrome = {
      applyShellProjection(p) {
        applied = p;
      },
      wide: {
        setSuppressed() {}
      }
    };
    const sync = createSessionChromeSync({
      getHonestyBridge: () => ({ isVisible: () => false }),
      getArrivalPractice: () => ({ isOpen: () => true }),
      getReflectionMoment: () => ({ isOpen: () => false }),
      getMicroRitualUI: () => ({
        isOpen: () => false,
        hideIdleEntry() {},
        showIdleEntry() {}
      }),
      honestyCheckInUI: { phase: 'hidden', hideIdleEntry() {} },
      honestyCheckIn: { syncIdleEntry() {} },
      companionModePicker: {
        setHonestyBridgeActive() {},
        setPostSessionOverlayActive() {},
        setOptionSelectEnabled() {},
        setArrivalReady() {},
        setArrivalActive() {}
      },
      idleChrome,
      stateManager: { state: STATES.IDLE },
      sessionUiGate,
      syncInAppReminderBanner() {}
    });
    sync.resyncSessionChrome();
    assert.ok(applied);
    assert.equal(applied.narrow.keepQuickStart, true);
    assert.equal(applied.narrow.suppressed, true);
    assert.equal(applied.wide.suppressed, true);
  });
});
