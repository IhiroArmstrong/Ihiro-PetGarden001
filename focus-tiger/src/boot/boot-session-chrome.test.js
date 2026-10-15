/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBootSessionChromeState,
  mountSessionUiGate,
  attachSessionChromeSync
} from './boot-session-chrome.js';

describe('bootSessionChrome (A7.4)', () => {
  it('creates gate / Choose box / Arrival flags before construct', () => {
    const state = createBootSessionChromeState();
    assert.equal(state.sessionUiGate, null);
    assert.equal(state.postChooseChrome.pending, false);
    assert.equal(state.pendingAutoStartMode, null);
    assert.equal(state.arrivalChoseThisRun, false);
    assert.equal(state.suppressCompanionOpenAfterNod, false);
    state.syncHonestyIdleEntry();
    state.syncArrivalGateReady(false);
  });

  it('mounts SessionUiGate and attaches chrome sync onto the same object', () => {
    const state = createBootSessionChromeState();
    class FakeGate {
      constructor() {
        this.completionPending = false;
      }
    }
    const gate = mountSessionUiGate(state, { Gate: FakeGate });
    assert.equal(state.sessionUiGate, gate);
    assert.equal(gate.completionPending, false);
    const ready = [];
    attachSessionChromeSync(state, {
      syncArrivalGateReady: (value) => {
        ready.push(value);
      },
      syncHonestyIdleEntry: () => {
        ready.push('honesty');
      }
    });
    state.syncArrivalGateReady(true);
    state.syncHonestyIdleEntry();
    assert.deepEqual(ready, [true, 'honesty']);
    state.postChooseChrome.pending = true;
    assert.equal(state.postChooseChrome.pending, true);
  });
});
