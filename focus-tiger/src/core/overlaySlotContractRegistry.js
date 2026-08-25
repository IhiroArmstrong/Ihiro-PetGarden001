/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Overlay slot arbitration — machine-readable contract registry (SSOT).
 *
 * Derived: `SHARED_RESOURCES.md` §4 overlay block (`npm run gate:doc-sync`).
 * Behavior: `overlaySlotArbitration.test.js` + `DOC_CODE_CONTRACT.md` **G-05**.
 *
 * @see docs/DOC_CODE_CONTRACT.md
 * @see overlaySlotArbitration.js
 */

export const OVERLAY_SOURCES = Object.freeze({
  ARRIVAL: 'arrival',
  REFLECTION: 'reflection',
  HONESTY_PANEL: 'honesty-panel',
  HONESTY_BRIDGE: 'honesty-bridge',
  HONESTY_PROMPT: 'honesty-prompt',
  MICRO_RITUAL: 'micro-ritual',
  RITUAL_FLOW: 'ritual-flow',
  FOCUS_DURATION_PICKER: 'focus-duration-picker',
  COMPANION_PICKER: 'companion-picker',
  GROWTH_COMPASS: 'growth-compass',
  GROWTH_MUSTARD_SEED: 'growth-mustard-seed',
  REMINDER_BANNER: 'reminder-banner',
  TEA_BUBBLE: 'tea-bubble',
  FLOWER_WELCOME: 'flower-welcome',
  MOMENT_WHISPER: 'moment-whisper',
  FOCUS_AWARENESS: 'focus-awareness',
  ONBOARDING_HINT: 'onboarding-hint',
  WELLNESS_FIRST: 'wellness-first',
  SOFT_UPDATE: 'soft-update',
  SEASONAL_WHISPER: 'seasonal-whisper'
});

export const OVERLAY_SLOT_KIND = Object.freeze({
  VISUAL_PRIMARY: 'visual-primary',
  VISUAL_SECONDARY: 'visual-secondary',
  GROWTH_CARD: 'growth-card',
  HINT: 'hint',
  BUSY_ONLY: 'busy-only',
  EPHEMERAL: 'ephemeral'
});

/**
 * @typedef {object} OverlaySourceContract
 * @property {string} id Stable source id (`OVERLAY_SOURCES.*`)
 * @property {string} kind `OVERLAY_SLOT_KIND.*`
 * @property {number} tier Arbitration tier (0 = session hard gate; lower wins within tier)
 * @property {string} readers Primary consumers (narrative, for docs)
 */

/** @type {ReadonlyArray<OverlaySourceContract>} */
export const OVERLAY_SOURCE_CONTRACTS = Object.freeze([
  {
    id: OVERLAY_SOURCES.ARRIVAL,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 1,
    readers: 'sessionChromeSync postSession source; sceneAnim overlayBusy'
  },
  {
    id: OVERLAY_SOURCES.REFLECTION,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 2,
    readers: 'sessionChromeSync postSession source; reminder busy'
  },
  {
    id: OVERLAY_SOURCES.RITUAL_FLOW,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 3,
    readers: 'sessionChromeSync postSession source'
  },
  {
    id: OVERLAY_SOURCES.MICRO_RITUAL,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 4,
    readers: 'sessionChromeSync postSession source; reminder busy'
  },
  {
    id: OVERLAY_SOURCES.HONESTY_PANEL,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 5,
    readers: 'Honesty duration/breath/thanks; tea/reminder busy (target)'
  },
  {
    id: OVERLAY_SOURCES.FOCUS_DURATION_PICKER,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 6,
    readers: 'sessionChromeSync postSession source'
  },
  {
    id: OVERLAY_SOURCES.COMPANION_PICKER,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 7,
    readers: 'moment whisper / awareness busy'
  },
  {
    id: OVERLAY_SOURCES.HONESTY_BRIDGE,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 8,
    readers: 'Honesty Yes/No bridge; confide gate'
  },
  {
    id: OVERLAY_SOURCES.HONESTY_PROMPT,
    kind: OVERLAY_SLOT_KIND.BUSY_ONLY,
    tier: 9,
    readers:
      'Idle Honesty entry; NOT postSessionOverlay (SHARED_RESOURCES §4); tea/reminder busy (target)'
  },
  {
    id: OVERLAY_SOURCES.GROWTH_COMPASS,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 10,
    readers: 'Five Moments Compass; growth preempt family'
  },
  {
    id: OVERLAY_SOURCES.GROWTH_MUSTARD_SEED,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 10,
    readers: 'Mustard Seed seal card; postSession source (target PR-2)'
  },
  {
    id: OVERLAY_SOURCES.REMINDER_BANNER,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 20,
    readers: 'InAppReminderBannerController suppress path'
  },
  {
    id: OVERLAY_SOURCES.TEA_BUBBLE,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 21,
    readers: 'ContextualTeaTipBubbleUI scheduleShow'
  },
  {
    id: OVERLAY_SOURCES.FLOWER_WELCOME,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 22,
    readers: 'Day1 / 久别吹花 Welcome 气泡; blocks Compass/Wellness first card'
  },
  {
    id: OVERLAY_SOURCES.MOMENT_WHISPER,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 23,
    readers: 'MomentWhisperUI.tryShow (contextKey-aware)'
  },
  {
    id: OVERLAY_SOURCES.FOCUS_AWARENESS,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 24,
    readers: 'FocusAwarenessCardUI.tryShow (Focusing allowed)'
  },
  {
    id: OVERLAY_SOURCES.WELLNESS_FIRST,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 25,
    readers: 'Wellness disclaimer first card (off by default; ?wellnessFirst=1)'
  },
  {
    id: OVERLAY_SOURCES.ONBOARDING_HINT,
    kind: OVERLAY_SLOT_KIND.HINT,
    tier: 30,
    readers: 'OnboardingHintsStore auto/remedy (≤1 visible)'
  }
]);

/**
 * First-card defer queue priority (high → low). Locked by product 2026-08-25.
 * @type {ReadonlyArray<string>}
 */
export const FIRST_CARD_DEFER_PRIORITY = Object.freeze([
  OVERLAY_SOURCES.FLOWER_WELCOME,
  OVERLAY_SOURCES.GROWTH_COMPASS,
  OVERLAY_SOURCES.WELLNESS_FIRST
]);
