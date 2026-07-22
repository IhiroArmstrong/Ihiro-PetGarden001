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

test('shouldOfferHonestyBridge only blocked when busy', () => {
  assert.equal(shouldOfferHonestyBridge({}), true);
  assert.equal(shouldOfferHonestyBridge({ busy: false }), true);
  assert.equal(shouldOfferHonestyBridge({ busy: true }), false);
});

test('bridge appears immediately after check-in; same day can offer again', () => {
  const store = new HonestyBridgeStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 19, 12)
  });
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
    }
  });

  controller.onHonestyCheckInComplete();
  assert.equal(shown, 1);
  assert.equal(controller.isVisible(), true);

  ui.handlers.onNo();
  assert.equal(declined, 1);
  assert.equal(accepted, 0);
  assert.equal(hidden >= 1, true);

  // 同日第二次补登：仍应出现
  controller.onHonestyCheckInComplete();
  assert.equal(shown, 2);
});

test('bridge onShown fires after reveal so Idle entries can hide', () => {
  let shownHooks = 0;
  const ui = {
    handlers: {},
    show() {},
    hide() {}
  };
  const controller = new HonestyBridgeCtaController({
    store: new HonestyBridgeStore({
      storage: createStorage(),
      now: () => new Date(2026, 6, 22, 12)
    }),
    ui,
    onAccept: () => {},
    onShown: () => {
      shownHooks += 1;
      assert.equal(controller.isVisible(), true);
    }
  });

  controller.onHonestyCheckInComplete();
  assert.equal(shownHooks, 1);
  assert.equal(controller.isVisible(), true);
});

test('Yes accepts Arrival hook; hide/cancelPending prevents stale reveal', () => {
  const store = new HonestyBridgeStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 19, 12)
  });
  let shown = 0;
  let accepted = 0;
  /** @type {string[]} */
  const tracked = [];
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
    trackEvent: (event) => tracked.push(event),
    onAccept: () => {
      accepted += 1;
    }
  });

  controller.onHonestyCheckInComplete();
  assert.equal(shown, 1);
  assert.deepEqual(tracked, ['dormant_bridge_shown']);
  ui.handlers.onYes();
  assert.equal(accepted, 1);
  assert.deepEqual(tracked, [
    'dormant_bridge_shown',
    'dormant_bridge_accepted'
  ]);

  controller.onHonestyCheckInComplete();
  controller.hide();
  assert.equal(controller.isVisible(), false);
});

test('No declines bridge and tracks dormant_bridge_declined', () => {
  const store = new HonestyBridgeStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 19, 12)
  });
  let declined = 0;
  /** @type {string[]} */
  const tracked = [];
  const ui = {
    handlers: {},
    show() {},
    hide() {}
  };

  const controller = new HonestyBridgeCtaController({
    store,
    ui,
    trackEvent: (event) => tracked.push(event),
    onAccept: () => {},
    onDecline: () => {
      declined += 1;
    }
  });

  controller.onHonestyCheckInComplete();
  ui.handlers.onNo();
  assert.equal(declined, 1);
  assert.deepEqual(tracked, [
    'dormant_bridge_shown',
    'dormant_bridge_declined'
  ]);
});
