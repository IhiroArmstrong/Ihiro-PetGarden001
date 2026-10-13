/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBootMomentHostsState,
  mountCalmActionRecoverCard,
  mountFiveMomentsCompass,
  mountFocusCircleWitnessChrome,
  mountSupportYinModal
} from './boot-moment-hosts.js';

describe('bootMomentHosts (A7.2)', () => {
  it('creates Recover / compass / witness / Support before construct', () => {
    const state = createBootMomentHostsState();
    assert.equal(state.calmActionRecoverCardUI, null);
    assert.equal(state.fiveMomentsCompassUI, null);
    assert.equal(state.focusCircleWitnessChrome, null);
    assert.equal(state.supportYinModalUI, null);
    const tryShow = () => {};
    state.calmActionRecoverCardUI = { tryShow };
    assert.equal(state.calmActionRecoverCardUI.tryShow, tryShow);
  });

  it('mounts each host onto the same state object', () => {
    const state = createBootMomentHostsState();
    class Fake {
      constructor(root, second) {
        this.root = root;
        this.second = second;
      }
    }
    const overlay = { id: 'ui-overlay' };
    const body = { id: 'body' };
    const recover = mountCalmActionRecoverCard(state, overlay, { store: true }, {
      RecoverCardUI: Fake
    });
    const compass = mountFiveMomentsCompass(state, body, { onOpen: () => {} }, {
      CompassUI: Fake
    });
    const witness = mountFocusCircleWitnessChrome(state, body, { onRespond: () => {} }, {
      WitnessChromeUI: Fake
    });
    const support = mountSupportYinModal(state, body, { onOpen: () => {} }, {
      SupportModalUI: Fake
    });
    assert.equal(state.calmActionRecoverCardUI, recover);
    assert.equal(state.fiveMomentsCompassUI, compass);
    assert.equal(state.focusCircleWitnessChrome, witness);
    assert.equal(state.supportYinModalUI, support);
    assert.equal(support.root, body);
  });
});
