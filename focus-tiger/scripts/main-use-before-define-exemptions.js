/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A6 / R3: remaining `no-use-before-define` (variables) hits in `src/main.js`.
 * Caps only shrink. New names or extra hits fail `lint:main-use-before-define`.
 * Caps shrink via A7 boot extracts (A7.4: Session chrome gate / Choose box / Arrival flags).
 */

export const MAIN_JS_USE_BEFORE_DEFINE_EXEMPTIONS = Object.freeze([
  {
    name: 'onboardingHints',
    maxHits: 13,
    reason:
      '#1139 class: overlay helpers still close over the late `let`. Boot overlayBusy uses `onboardingHintHost`.'
  },
  {
    name: 'ambientSoundscape',
    maxHits: 13,
    reason: 'Constructed after cue / overlay helpers that close over the binding.'
  },
  {
    name: 'sessionCues',
    maxHits: 9,
    reason: 'Constructed with ambientSoundscape, after earlier cue callers.'
  },
  {
    name: 'focusInput',
    maxHits: 2,
    reason: 'Focus HUD helpers close over input constructed near end of init.'
  },
  {
    name: 'pendingChoose',
    maxHits: 1,
    reason: 'Arrival commit closes over flags declared later.'
  }
]);
