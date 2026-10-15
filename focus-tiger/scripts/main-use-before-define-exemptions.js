/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A6 / R3: remaining `no-use-before-define` (variables) hits in `src/main.js`.
 * Caps only shrink. New names or extra hits fail `lint:main-use-before-define`.
 * Caps shrink via A7 boot extracts (A7.5: ambient / cues / hints / pending Choose).
 */

export const MAIN_JS_USE_BEFORE_DEFINE_EXEMPTIONS = Object.freeze([
  {
    name: 'focusInput',
    maxHits: 2,
    reason: 'Focus HUD helpers close over input constructed near end of init.'
  }
]);
