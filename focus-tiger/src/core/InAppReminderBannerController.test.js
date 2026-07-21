import test from 'node:test';
import assert from 'node:assert/strict';

import {
  InAppReminderBannerController,
  isReminderBusySession,
  resolveBusySessionPolicy
} from './InAppReminderBannerController.js';

const CANDIDATE = {
  shouldShow: true,
  messageKey: 'reminder.gentle_waiting'
};

test('isReminderBusySession: FOCUSING / CELEBRATE / overlays', () => {
  assert.equal(isReminderBusySession({ state: 'IDLE' }), false);
  assert.equal(isReminderBusySession({ state: 'DORMANT' }), false);
  assert.equal(isReminderBusySession({ state: 'FOCUSING' }), true);
  assert.equal(isReminderBusySession({ state: 'CELEBRATE' }), true);
  assert.equal(
    isReminderBusySession({ state: 'IDLE', arrivalOpen: true }),
    true
  );
  assert.equal(
    isReminderBusySession({ state: 'IDLE', reflectionOpen: true }),
    true
  );
  assert.equal(
    isReminderBusySession({ state: 'IDLE', microRitualOpen: true }),
    true
  );
});

test('resolveBusySessionPolicy: suppress → hide; defer → defer', () => {
  assert.equal(resolveBusySessionPolicy('suppress'), 'hide');
  assert.equal(resolveBusySessionPolicy(), 'hide');
  assert.equal(resolveBusySessionPolicy('defer'), 'defer');
});

test('eligible + idle → show', () => {
  const ctrl = new InAppReminderBannerController();
  assert.deepEqual(ctrl.resolve(CANDIDATE, { isBusySession: false }), {
    action: 'show',
    messageKey: 'reminder.gentle_waiting'
  });
});

test('candidate false → hide', () => {
  const ctrl = new InAppReminderBannerController();
  assert.deepEqual(
    ctrl.resolve({ shouldShow: false, messageKey: null }),
    { action: 'hide', messageKey: null }
  );
});

test('suppress busy → hide without pending; still hide after idle return', () => {
  const ctrl = new InAppReminderBannerController({ busyPolicy: 'suppress' });
  assert.deepEqual(ctrl.resolve(CANDIDATE, { isBusySession: true }), {
    action: 'hide',
    messageKey: null
  });
  assert.equal(ctrl.pendingAfterSession, false);
  // suppress 不排队：回 Idle 仍可按候选再展示（未 dismiss）
  assert.deepEqual(ctrl.resolve(CANDIDATE, { isBusySession: false }), {
    action: 'show',
    messageKey: 'reminder.gentle_waiting'
  });
});

test('defer busy → hide+pending; idle return → show once', () => {
  const ctrl = new InAppReminderBannerController({ busyPolicy: 'defer' });
  const busy = ctrl.resolve(CANDIDATE, { isBusySession: true });
  assert.equal(busy.action, 'hide');
  assert.equal(busy.deferred, true);
  assert.equal(ctrl.pendingAfterSession, true);

  assert.deepEqual(ctrl.resolve(CANDIDATE, { isBusySession: false }), {
    action: 'show',
    messageKey: 'reminder.gentle_waiting'
  });
  assert.equal(ctrl.pendingAfterSession, false);
});

test('dismiss → hide and never show again this page session', () => {
  const ctrl = new InAppReminderBannerController();
  assert.equal(ctrl.resolve(CANDIDATE).action, 'show');

  ctrl.dismiss();
  assert.equal(ctrl.dismissedThisPageSession, true);
  assert.deepEqual(ctrl.resolve(CANDIDATE, { isBusySession: false }), {
    action: 'hide',
    messageKey: null
  });
  // 条件仍满足也不再展示
  assert.deepEqual(ctrl.resolve(CANDIDATE, { isBusySession: false }), {
    action: 'hide',
    messageKey: null
  });

  ctrl.resetPageSession();
  assert.equal(ctrl.resolve(CANDIDATE).action, 'show');
});

test('dismiss clears pending defer queue', () => {
  const ctrl = new InAppReminderBannerController({ busyPolicy: 'defer' });
  ctrl.resolve(CANDIDATE, { isBusySession: true });
  assert.equal(ctrl.pendingAfterSession, true);
  ctrl.dismiss();
  assert.equal(ctrl.pendingAfterSession, false);
  assert.equal(ctrl.resolve(CANDIDATE, { isBusySession: false }).action, 'hide');
});
