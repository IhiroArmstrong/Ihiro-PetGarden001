/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITE_OCCUPANCY } from '../core/spriteChannelArbitration.js';
import {
  createBootSceneAnimState,
  mountInAppReminderBanner
} from './boot-scene-anim.js';

describe('bootSceneAnim (A7.1)', () => {
  it('creates dispatch / occupancy / reminder before tryPlay is assigned', () => {
    const state = createBootSceneAnimState();
    assert.equal(state.spriteOccupancy, SPRITE_OCCUPANCY.IDLE_BASELINE);
    assert.equal(state.inAppReminderBannerUI, null);
    assert.equal(state.sceneAnimationDispatch.lastPlay, null);
    assert.equal(state.sceneAnimationDispatch.tryPlay, null);
    const tryPlay = () => ({ play: false });
    state.sceneAnimationDispatch.tryPlay = tryPlay;
    assert.equal(state.sceneAnimationDispatch.tryPlay, tryPlay);
  });

  it('mounts the reminder banner onto the same state object', () => {
    const state = createBootSceneAnimState();
    class FakeBanner {
      constructor(root, handlers) {
        this.root = root;
        this.handlers = handlers;
      }
    }
    const overlay = { id: 'ui-overlay' };
    const mounted = mountInAppReminderBanner(state, overlay, { onDismiss: () => {} }, {
      BannerUI: FakeBanner
    });
    assert.equal(state.inAppReminderBannerUI, mounted);
    assert.equal(mounted.root, overlay);
  });
});
