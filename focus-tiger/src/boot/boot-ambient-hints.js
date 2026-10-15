/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A7.5: Ambient soundscape / session cues / onboarding hints / pending Choose.
 * Created before cue / overlay helpers so those closures never TDZ.
 * Controllers and `OnboardingHintsUI` stay at the existing construct site
 * in `init()`. `onboardingHintHost` stays a #1139 box in `init()`.
 * Defaults are not imported here so node unit tests stay DOM-free.
 */

export function createBootAmbientHintsState() {
  return {
    ambientSoundscape: /** @type {import('../audio/AmbientSoundscapeController.js').AmbientSoundscapeController | null} */ (
      null
    ),
    sessionCues: /** @type {import('../audio/SessionCueController.js').SessionCueController | null} */ (
      null
    ),
    onboardingHints: /** @type {import('../ui/OnboardingHintsUI.js').OnboardingHintsUI | null} */ (
      null
    ),
    pendingChoose: /** @type {{ text: string, source: 'icon' | 'typed' } | null} */ (
      null
    )
  };
}

export function mountAmbientSoundscape(
  state,
  options = {},
  { Controller } = {}
) {
  if (typeof Controller !== 'function') {
    throw new Error('mountAmbientSoundscape requires Controller');
  }
  state.ambientSoundscape = new Controller(options);
  return state.ambientSoundscape;
}

export function mountSessionCues(state, { Cues } = {}) {
  if (typeof Cues !== 'function') {
    throw new Error('mountSessionCues requires Cues');
  }
  state.sessionCues = new Cues();
  return state.sessionCues;
}

export function mountOnboardingHints(state, root, handlers, { HintsUI } = {}) {
  if (typeof HintsUI !== 'function') {
    throw new Error('mountOnboardingHints requires HintsUI');
  }
  state.onboardingHints = new HintsUI(root, handlers);
  return state.onboardingHints;
}
