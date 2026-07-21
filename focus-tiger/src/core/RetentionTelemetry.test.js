/**
 * 留存漏斗占位：首次打开 / 首次完成 / dayN / 桥接事件名稳定。
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RetentionFunnelStore,
  RETENTION_EVENTS,
  RETENTION_FUNNEL_STORAGE_KEY,
  calendarDaysBetween,
  trackRetentionEvent
} from './RetentionTelemetry.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
}

test('trackRetentionEvent logs with stable prefix (no third-party)', () => {
  /** @type {unknown[]} */
  const lines = [];
  trackRetentionEvent('demo_event', { a: 1 }, {
    log: (...args) => lines.push(args)
  });
  assert.deepEqual(lines[0], ['[RetentionTelemetry]', 'demo_event', { a: 1 }]);
});

test('MICRO_RITUAL_COMPLETE constant is stable and trackRetentionEvent logs it without store mutation', () => {
  const storage = createStorage();
  const store = new RetentionFunnelStore({ storage });
  const before = store.getState();
  /** @type {unknown[]} */
  const lines = [];

  assert.equal(
    RETENTION_EVENTS.MICRO_RITUAL_COMPLETE,
    'micro_ritual_complete'
  );
  trackRetentionEvent(
    RETENTION_EVENTS.MICRO_RITUAL_COMPLETE,
    { durationMinutes: 1 },
    { log: (...args) => lines.push(args) }
  );

  assert.deepEqual(lines[0], [
    '[RetentionTelemetry]',
    'micro_ritual_complete',
    { durationMinutes: 1 }
  ]);
  assert.deepEqual(store.getState(), before);
  assert.equal(storage.getItem(RETENTION_FUNNEL_STORAGE_KEY), null);
});

test('calendarDaysBetween uses local calendar keys', () => {
  assert.equal(calendarDaysBetween('2026-07-22', '2026-07-22'), 0);
  assert.equal(calendarDaysBetween('2026-07-22', '2026-07-23'), 1);
  assert.equal(calendarDaysBetween('2026-07-22', '2026-07-25'), 3);
  assert.equal(calendarDaysBetween('2026-07-22', '2026-07-21'), -1);
  assert.equal(calendarDaysBetween('bad', '2026-07-22'), -1);
});

test('noteAppOpen fires app_first_open once; same day reopen silent', () => {
  const storage = createStorage();
  /** @type {string[]} */
  const events = [];
  let clock = new Date(2026, 6, 22, 9);
  const store = new RetentionFunnelStore({
    storage,
    now: () => clock,
    track: (name) => events.push(name)
  });

  const first = store.noteAppOpen();
  assert.equal(first.firstOpen, true);
  assert.deepEqual(events, [RETENTION_EVENTS.APP_FIRST_OPEN]);
  assert.equal(storage.getItem(RETENTION_FUNNEL_STORAGE_KEY) != null, true);

  events.length = 0;
  clock = new Date(2026, 6, 22, 18);
  const again = store.noteAppOpen();
  assert.equal(again.firstOpen, false);
  assert.deepEqual(events, []);
});

test('day1/3/7/30_return fire once when daysSince crosses threshold', () => {
  const storage = createStorage();
  /** @type {string[]} */
  const events = [];
  let clock = new Date(2026, 6, 1, 10);
  const store = new RetentionFunnelStore({
    storage,
    now: () => clock,
    track: (name) => events.push(name)
  });
  store.noteAppOpen();
  events.length = 0;

  clock = new Date(2026, 6, 2, 10);
  store.noteAppOpen();
  assert.deepEqual(events, [RETENTION_EVENTS.DAY1_RETURN]);
  events.length = 0;

  clock = new Date(2026, 6, 8, 10);
  store.noteAppOpen();
  assert.deepEqual(events, [
    RETENTION_EVENTS.DAY3_RETURN,
    RETENTION_EVENTS.DAY7_RETURN
  ]);
  events.length = 0;

  clock = new Date(2026, 6, 31, 10);
  store.noteAppOpen();
  assert.deepEqual(events, [RETENTION_EVENTS.DAY30_RETURN]);
  events.length = 0;

  clock = new Date(2026, 7, 5, 10);
  store.noteAppOpen();
  assert.deepEqual(events, []);
});

test('noteSessionComplete once with secondsSinceFirstOpen', () => {
  const storage = createStorage();
  /** @type {{ name: string, props: Record<string, unknown> }[]} */
  const events = [];
  let clock = new Date(2026, 6, 22, 10, 0, 0);
  const store = new RetentionFunnelStore({
    storage,
    now: () => clock,
    track: (name, props = {}) => events.push({ name, props })
  });
  store.noteAppOpen();
  events.length = 0;

  clock = new Date(2026, 6, 22, 10, 5, 30);
  assert.equal(store.noteSessionComplete({ durationMinutes: 20 }), true);
  assert.equal(events.length, 1);
  assert.equal(events[0].name, RETENTION_EVENTS.FIRST_SESSION_COMPLETE);
  assert.equal(events[0].props.secondsSinceFirstOpen, 330);
  assert.equal(events[0].props.durationMinutes, 20);

  events.length = 0;
  assert.equal(store.noteSessionComplete({ durationMinutes: 10 }), false);
  assert.deepEqual(events, []);
});

test('bridge helpers emit shown / accepted / declined names', () => {
  /** @type {string[]} */
  const events = [];
  const store = new RetentionFunnelStore({
    storage: createStorage(),
    track: (name) => events.push(name)
  });
  store.trackBridgeShown();
  store.trackBridgeAccepted();
  store.trackBridgeDeclined();
  assert.deepEqual(events, [
    RETENTION_EVENTS.DORMANT_BRIDGE_SHOWN,
    RETENTION_EVENTS.DORMANT_BRIDGE_ACCEPTED,
    RETENTION_EVENTS.DORMANT_BRIDGE_DECLINED
  ]);
});
