import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HonestyBridgeCtaController,
  shouldOfferHonestyBridge
} from './HonestyBridgeCtaController.js';
import { HonestyBridgeStore } from './HonestyBridgeStore.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

test('shouldOfferHonestyBridge only when not yet shown today', () => {
  assert.equal(shouldOfferHonestyBridge({ hasShownToday: false }), true);
  assert.equal(shouldOfferHonestyBridge({ hasShownToday: true }), false);
  assert.equal(
    shouldOfferHonestyBridge({ hasShownToday: false, busy: true }),
    false
  );
});

test('bridge appears once after thanks delay; No declines without accept', () => {
  const store = new HonestyBridgeStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 19, 12)
  });
  const timers = [];
  let shown = 0;
  let hidden = 0;
  let accepted = 0;
  let declined = 0;
  const ui = {
    handlers: {},
    show() {
      shown += 1;
    },
    hide() {
      hidden += 1;
    }
  };

  const controller = new HonestyBridgeCtaController({
    store,
    ui,
    onAccept: () => {
      accepted += 1;
    },
    onDecline: () => {
      declined += 1;
    },
    thanksMs: 100,
    schedule: (ms, fn) => {
      const id = timers.length + 1;
      timers.push({ id, ms, fn, cancelled: false });
      return id;
    },
    cancelSchedule: (id) => {
      const entry = timers.find((t) => t.id === id);
      if (entry) entry.cancelled = true;
    }
  });

  controller.onHonestyCheckInComplete();
  assert.equal(shown, 0);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 100);

  timers[0].fn();
  assert.equal(shown, 1);
  assert.equal(store.hasShownToday(), true);

  ui.handlers.onNo();
  assert.equal(declined, 1);
  assert.equal(accepted, 0);
  assert.equal(hidden >= 1, true);

  // 同日第二次补登完成：不再安排
  timers.length = 0;
  controller.onHonestyCheckInComplete();
  assert.equal(timers.length, 0);
  assert.equal(shown, 1);
});

test('Yes accepts Arrival hook; cancelPending skips reveal even if timer fires', () => {
  const store = new HonestyBridgeStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 19, 12)
  });
  const timers = [];
  let shown = 0;
  let accepted = 0;
  const ui = {
    handlers: {},
    show() {
      shown += 1;
    },
    hide() {}
  };

  const controller = new HonestyBridgeCtaController({
    store,
    ui,
    onAccept: () => {
      accepted += 1;
    },
    thanksMs: 50,
    schedule: (ms, fn) => {
      const id = timers.length + 1;
      timers.push({ id, ms, fn, cancelled: false });
      return id;
    },
    cancelSchedule: (id) => {
      const entry = timers.find((t) => t.id === id);
      if (entry) entry.cancelled = true;
    }
  });

  controller.onHonestyCheckInComplete();
  controller.cancelPending();
  assert.equal(timers[0].cancelled, true);
  timers[0].fn();
  assert.equal(shown, 0);
  assert.equal(store.hasShownToday(), false);

  // 完整 Yes 路径
  controller.onHonestyCheckInComplete();
  timers[1].fn();
  assert.equal(shown, 1);
  ui.handlers.onYes();
  assert.equal(accepted, 1);
});
