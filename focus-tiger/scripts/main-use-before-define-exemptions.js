/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A6 / R3: remaining `no-use-before-define` (variables) hits in `src/main.js`.
 * Caps only shrink. New names or extra hits fail `lint:main-use-before-define`.
 * Caps shrink via A7 boot extracts (A7.2: Recover / compass / witness / Support).
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
    name: 'sessionUiGate',
    maxHits: 5,
    reason: 'Instantiated after chrome callbacks that close over the gate.'
  },
  {
    name: 'companionModePicker',
    maxHits: 4,
    reason: 'Constructed after Arrival / Honesty helpers.'
  },
  {
    name: 'honestyCheckInUI',
    maxHits: 2,
    reason: 'Predeclared null after some Honesty callers (ear TDZ pair lives earlier).'
  },
  {
    name: 'focusInput',
    maxHits: 2,
    reason: 'Focus HUD helpers close over input constructed near end of init.'
  },
  {
    name: 'microRitualUI',
    maxHits: 1,
    reason: 'Ritual helpers sit above the null predeclare.'
  },
  {
    name: 'arrivalPractice',
    maxHits: 1,
    reason: 'Arrival helpers sit above the null predeclare.'
  },
  {
    name: 'pendingAutoStartMode',
    maxHits: 1,
    reason: 'Arrival commit closes over flags declared later.'
  },
  {
    name: 'arrivalChoseThisRun',
    maxHits: 1,
    reason: 'Arrival commit closes over flags declared later.'
  },
  {
    name: 'suppressCompanionOpenAfterNod',
    maxHits: 1,
    reason: 'Arrival commit closes over flags declared later.'
  },
  {
    name: 'pendingChoose',
    maxHits: 1,
    reason: 'Arrival commit closes over flags declared later.'
  },
  {
    name: 'postChooseChrome',
    maxHits: 1,
    reason: 'Arrival commit closes over chrome box declared later.'
  },
  {
    name: 'syncArrivalGateReady',
    maxHits: 1,
    reason: 'Destructured from sessionChromeSyncApi after earlier Arrival helpers.'
  },
  {
    name: 'syncHonestyIdleEntry',
    maxHits: 1,
    reason: 'Destructured from sessionChromeSyncApi after earlier Honesty helpers.'
  }
]);
