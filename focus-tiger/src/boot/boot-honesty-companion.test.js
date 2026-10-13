/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBootHonestyCompanionState,
  mountHonestyCheckInUI,
  mountCompanionModePicker,
  mountMicroRitualUI
} from './boot-honesty-companion.js';

describe('bootHonestyCompanion (A7.3)', () => {
  it('creates Honesty / Companion / ritual / Arrival before construct', () => {
    const state = createBootHonestyCompanionState();
    assert.equal(state.honestyCheckInUI, null);
    assert.equal(state.companionModePicker, null);
    assert.equal(state.microRitualUI, null);
    assert.equal(state.arrivalPractice, null);
    const hide = () => {};
    state.honestyCheckInUI = { hide };
    assert.equal(state.honestyCheckInUI.hide, hide);
  });

  it('mounts Honesty / Companion / ritual onto the same state object', () => {
    const state = createBootHonestyCompanionState();
    class Fake {
      constructor(...args) {
        this.args = args;
      }
    }
    const overlay = { id: 'ui-overlay' };
    const sit = { id: 'btn-focus' };
    const handlers = { onOpen: () => {} };
    const honesty = mountHonestyCheckInUI(state, overlay, handlers, {
      CheckInUI: Fake
    });
    const picker = mountCompanionModePicker(state, overlay, sit, handlers, {
      PickerUI: Fake
    });
    const ritual = mountMicroRitualUI(state, overlay, handlers, {
      RitualUI: Fake
    });
    assert.equal(state.honestyCheckInUI, honesty);
    assert.equal(state.companionModePicker, picker);
    assert.equal(state.microRitualUI, ritual);
    assert.equal(state.arrivalPractice, null);
    assert.equal(picker.args[1], sit);
  });
});
