/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Fixture only (A6). Mirrors #1139: overlayBusy reads `onboardingHints` before
 * `let onboardingHints`. Not imported by the app. The lint gate must flag this.
 */

function isIdleYinTapOverlayBusy() {
  return onboardingHints?.isPurposeCardOpen?.() === true;
}

void isIdleYinTapOverlayBusy();

let onboardingHints = null;
