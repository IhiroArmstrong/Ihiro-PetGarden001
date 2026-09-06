/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COMPANION_UNLOAD_GRACE_MS,
  bindDesktopCompanionShellUnload,
  createCompanionUnloadScheduler
} from './desktopCompanionUnloadSchedule.js';

describe('desktopCompanionUnloadSchedule', () => {
  it('locks grace at 60 seconds', () => {
    assert.equal(COMPANION_UNLOAD_GRACE_MS, 60_000);
  });

  it('fires unload once after grace and does not stack duplicate timers', () => {
    let unloadCount = 0;
    const timers = [];
    const scheduler = createCompanionUnloadScheduler({
      graceMs: 1000,
      unload: () => {
        unloadCount += 1;
      },
      setTimer: (fn, ms) => {
        const id = { fn, ms };
        timers.push(id);
        return id;
      },
      clearTimer: () => {}
    });

    scheduler.schedule();
    scheduler.schedule();
    assert.equal(timers.length, 1);
    assert.equal(timers[0].ms, 1000);

    timers[0].fn();
    assert.equal(unloadCount, 1);

    scheduler.schedule();
    assert.equal(timers.length, 2);
    timers[1].fn();
    assert.equal(unloadCount, 2);
  });

  it('cancel prevents unload before grace elapses', () => {
    let unloadCount = 0;
    let cleared = 0;
    const scheduler = createCompanionUnloadScheduler({
      graceMs: 5000,
      unload: () => {
        unloadCount += 1;
      },
      setTimer: (fn, ms) => ({ fn, ms }),
      clearTimer: () => {
        cleared += 1;
      }
    });

    scheduler.schedule();
    assert.equal(scheduler.isScheduled(), true);
    scheduler.cancel();
    assert.equal(scheduler.isScheduled(), false);
    assert.equal(cleared, 1);
    assert.equal(unloadCount, 0);
  });

  it('bindDesktopCompanionShellUnload schedules on hidden and cancels on visible', async () => {
    const events = [];
    const scheduler = {
      schedule: () => events.push('schedule'),
      cancel: () => events.push('cancel')
    };
    const listeners = [];
    const shell = {
      onShellVisibility: (cb) => {
        listeners.push(cb);
        return () => {};
      },
      getShellVisibility: () => Promise.resolve({ hidden: true })
    };

    bindDesktopCompanionShellUnload(scheduler, shell);
    await Promise.resolve();
    assert.deepEqual(events, ['schedule']);

    listeners[0]({ hidden: false });
    assert.deepEqual(events, ['schedule', 'cancel']);

    listeners[0]({ hidden: true });
    assert.deepEqual(events, ['schedule', 'cancel', 'schedule']);
  });
});
