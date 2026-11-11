/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPracticeDeepLinkWebHost } from './practiceDeepLinkWebHost.js';
import { peekPracticeDeepLinkFocusMinutes } from './practiceDeepLinkSessionMinutes.js';

function makeHost(overrides = {}) {
  const toasts = [];
  const timers = [];
  let search = overrides.search ?? '?product=1&start=sit&min=5';
  let defer = overrides.defer ?? false;
  let busy = overrides.busy ?? false;
  const host = createPracticeDeepLinkWebHost({
    getSearch: () => search,
    isUiReady: () => overrides.uiReady !== false,
    isOverlayBusy: () => busy,
    getSessionState: () => overrides.sessionState ?? 'IDLE',
    isCompletionPending: () => false,
    isDeferColdStart: () => defer,
    isAlreadyOnSitPath: () => overrides.alreadyOnSitPath === true,
    resolveSitClickWhenIdle: () => overrides.sitAction ?? 'start-arrival',
    startSitArrival: () => {
      overrides.started = (overrides.started || 0) + 1;
    },
    showToast: (kind) => {
      toasts.push(kind);
    },
    schedule: (fn) => {
      timers.push(fn);
      return timers.length;
    },
    clearSchedule: () => {}
  });
  return { host, toasts, timers, setDefer: (v) => { defer = v; }, setBusy: (v) => { busy = v; }, overrides };
}

describe('createPracticeDeepLinkWebHost', () => {
  it('applies sit once and arms this-load minutes', () => {
    const ctx = makeHost();
    assert.equal(ctx.host.noteReady(), 'apply-sit');
    assert.equal(ctx.overrides.started, 1);
    assert.equal(peekPracticeDeepLinkFocusMinutes(), 5);
    assert.equal(ctx.host.tryApply(), 'ignore');
    assert.equal(ctx.overrides.started, 1);
  });

  it('defers then applies after cold start closes', () => {
    const ctx = makeHost({ defer: true });
    assert.equal(ctx.host.noteReady(), 'defer');
    assert.equal(ctx.overrides.started, undefined);
    ctx.setDefer(false);
    ctx.timers[0]();
    assert.equal(ctx.overrides.started, 1);
  });

  it('busy rejects with toast and does not queue', () => {
    const ctx = makeHost({ busy: true });
    assert.equal(ctx.host.noteReady(), 'toast-busy');
    assert.deepEqual(ctx.toasts, ['busy']);
    ctx.setBusy(false);
    assert.equal(ctx.host.tryApply(), 'ignore');
    assert.equal(ctx.overrides.started, undefined);
  });
});
