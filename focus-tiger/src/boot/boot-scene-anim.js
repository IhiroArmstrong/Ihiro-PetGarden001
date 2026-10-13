/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A7.1: scene-anim + occupancy + reminder banner bindings.
 * Created before tryPlay / parrot helpers so those closures never TDZ.
 * `onboardingHintHost` stays in `init()` (A7.5 / #1139 box).
 */

import { SPRITE_OCCUPANCY } from '../core/spriteChannelArbitration.js';
import { InAppReminderBannerUI } from '../ui/InAppReminderBannerUI.js';

export function createBootSceneAnimState() {
  return {
    sceneAnimationDispatch: {
      lastPlay: /** @type {{ event: string, emotionKey: string, reason: string } | null} */ (
        null
      ),
      tryPlay: /** @type {((event: string, extra?: object) => object) | null} */ (
        null
      )
    },
    spriteOccupancy: SPRITE_OCCUPANCY.IDLE_BASELINE,
    inAppReminderBannerUI: /** @type {InAppReminderBannerUI | null} */ (null)
  };
}

export function mountInAppReminderBanner(
  state,
  overlayRoot,
  handlers,
  { BannerUI = InAppReminderBannerUI } = {}
) {
  state.inAppReminderBannerUI = new BannerUI(overlayRoot, handlers);
  return state.inAppReminderBannerUI;
}
