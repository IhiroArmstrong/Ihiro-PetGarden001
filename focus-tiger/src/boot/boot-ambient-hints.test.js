/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBootAmbientHintsState,
  mountAmbientSoundscape,
  mountSessionCues,
  mountOnboardingHints
} from './boot-ambient-hints.js';

describe('bootAmbientHints (A7.5)', () => {
  it('creates ambient / cues / hints / pending Choose before construct', () => {
    const state = createBootAmbientHintsState();
    assert.equal(state.ambientSoundscape, null);
    assert.equal(state.sessionCues, null);
    assert.equal(state.onboardingHints, null);
    assert.equal(state.pendingChoose, null);
    state.pendingChoose = { text: 'sit', source: 'icon' };
    assert.equal(state.pendingChoose.text, 'sit');
  });

  it('mounts controllers and hints onto the same state object', () => {
    const state = createBootAmbientHintsState();
    class Fake {
      constructor(...args) {
        this.args = args;
      }
    }
    const overlay = { id: 'body' };
    const handlers = { getScene: () => ({}) };
    const ambient = mountAmbientSoundscape(state, { auditionMs: 12 }, {
      Controller: Fake
    });
    const cues = mountSessionCues(state, { Cues: Fake });
    const hints = mountOnboardingHints(state, overlay, handlers, {
      HintsUI: Fake
    });
    assert.throws(() => mountAmbientSoundscape(createBootAmbientHintsState(), {}));
    assert.equal(state.ambientSoundscape, ambient);
    assert.equal(state.sessionCues, cues);
    assert.equal(state.onboardingHints, hints);
    assert.deepEqual(ambient.args[0], { auditionMs: 12 });
    assert.equal(hints.args[0], overlay);
    assert.equal(hints.args[1], handlers);
    assert.equal(state.pendingChoose, null);
  });
});
