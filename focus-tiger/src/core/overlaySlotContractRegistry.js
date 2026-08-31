/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Overlay slot arbitration — machine-readable contract registry (SSOT).
 *
 * Tap / enter-sleep occupancy: `overlaySlotArbitration.js` derive* + `main.js`
 * `buildLiveOverlaySnapshot`. UI file ↔ id scan: `scripts/overlay-contract-ui-check.js`.
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
  SEASONAL_WHISPER: 'seasonal-whisper',
  CONFIDE: 'confide',
  PRIVACY_SHEET: 'privacy-sheet',
  PURPOSE_CARD: 'purpose-card',
  JOURNEY_LOG: 'journey-log',
  YIN_COIN: 'yin-coin',
  DAILY_QUOTE: 'daily-quote',
  WALLPAPERS: 'wallpapers',
  ZEN_CINEMA: 'zen-cinema',
  NEWSLETTER: 'newsletter',
  PRESENCE_SIGNALS: 'presence-signals',
  LANGUAGE_PREF: 'language-pref',
  SUPPORT_MODAL: 'support-modal',
  TIP_JAR: 'tip-jar',
  SANCTUARY: 'sanctuary',
  MEMBERSHIP: 'membership'
});

export const OVERLAY_SLOT_KIND = Object.freeze({
  VISUAL_PRIMARY: 'visual-primary',
  VISUAL_SECONDARY: 'visual-secondary',
  GROWTH_CARD: 'growth-card',
  HINT: 'hint',
  BUSY_ONLY: 'busy-only',
  EPHEMERAL: 'ephemeral'
});

export const OVERLAY_OUTSIDE_DISMISS = Object.freeze({
  BLANK_CLOSES: 'blank-closes',
  SB19_HOLD: 'sb19-hold',
  BACKDROP_ONLY: 'backdrop-only',
  NONE: 'none'
});

export const OVERLAY_DORMANT_WAKE = Object.freeze({
  REQUIRED: 'required',
  NOT_NEEDED: 'not-needed'
});

/**
 * @typedef {object} OverlaySourceContract
 * @property {string} id
 * @property {string} kind
 * @property {number} tier
 * @property {string} readers
 * @property {boolean} blocksIdleYinTap
 * @property {boolean} blocksEnterSleep
 * @property {string} outsideDismiss `OVERLAY_OUTSIDE_DISMISS.*`
 * @property {string} dismissRoot CSS id / node the outside-dismiss contains() must use
 * @property {string} dormantWakeOnOpen `OVERLAY_DORMANT_WAKE.*`
 * @property {string|null} snapshotField `OverlaySnapshot` boolean field
 */

/**
 * @param {OverlaySourceContract} row
 * @returns {OverlaySourceContract}
 */
function contract(row) {
  return Object.freeze({
    blocksIdleYinTap: false,
    blocksEnterSleep: false,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.NONE,
    dismissRoot: '',
    dormantWakeOnOpen: OVERLAY_DORMANT_WAKE.NOT_NEEDED,
    snapshotField: null,
    ...row
  });
}

/** @type {ReadonlyArray<OverlaySourceContract>} */
export const OVERLAY_SOURCE_CONTRACTS = Object.freeze([
  contract({
    id: OVERLAY_SOURCES.ARRIVAL,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 1,
    readers: 'sessionChromeSync postSession source; sceneAnim overlayBusy',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#arrival-practice',
    snapshotField: 'arrivalOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.REFLECTION,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 2,
    readers: 'sessionChromeSync postSession source; reminder busy',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.SB19_HOLD,
    dismissRoot: '#tiger-reflection-moment',
    snapshotField: 'reflectionOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.RITUAL_FLOW,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 3,
    readers: 'sessionChromeSync postSession source',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    snapshotField: 'ritualFlowOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.MICRO_RITUAL,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 4,
    readers: 'sessionChromeSync postSession source; reminder busy',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    snapshotField: 'microRitualOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.HONESTY_PANEL,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 5,
    readers:
      'Honesty duration/breath/thanks tap busy; all non-hidden phases enter-sleep',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#honesty-checkin',
    dormantWakeOnOpen: OVERLAY_DORMANT_WAKE.REQUIRED,
    snapshotField: null
  }),
  contract({
    id: OVERLAY_SOURCES.FOCUS_DURATION_PICKER,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 6,
    readers: 'sessionChromeSync postSession source',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    snapshotField: 'focusDurationPickerOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.COMPANION_PICKER,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 7,
    readers: 'moment whisper / awareness busy',
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#session-start-dock',
    snapshotField: 'companionPickerOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.HONESTY_BRIDGE,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 8,
    readers: 'Honesty Yes/No bridge; confide gate',
    snapshotField: 'honestyBridgeVisible'
  }),
  contract({
    id: OVERLAY_SOURCES.HONESTY_PROMPT,
    kind: OVERLAY_SLOT_KIND.BUSY_ONLY,
    tier: 9,
    readers:
      'Idle Honesty entry; NOT postSessionOverlay; tea/reminder busy (target)',
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#honesty-checkin',
    snapshotField: null
  }),
  contract({
    id: OVERLAY_SOURCES.GROWTH_COMPASS,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 10,
    readers: 'Five Moments Compass; growth preempt family',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#five-moments-compass',
    snapshotField: 'compassOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.GROWTH_MUSTARD_SEED,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 10,
    readers: 'Mustard Seed seal card; postSession source',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#mustard-seed-seal-card',
    snapshotField: 'mustardSeedOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.CONFIDE,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 11,
    readers: 'Confide to Yin; idle tap + enter-sleep; dormantWake on open',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.SB19_HOLD,
    dismissRoot: '#confide-to-yin-card',
    dormantWakeOnOpen: OVERLAY_DORMANT_WAKE.REQUIRED,
    snapshotField: 'confideOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.JOURNEY_LOG,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 12,
    readers: 'Journey Log glass card',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#journey-log',
    snapshotField: 'journeyOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.YIN_COIN,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 12,
    readers: "Yin's Collections glass card",
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#yin-coin-panel',
    snapshotField: 'coinPanelOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.DAILY_QUOTE,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 12,
    readers: 'Daily Zen Quote card',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#daily-zen-quote-card',
    snapshotField: 'quoteOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.WALLPAPERS,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 12,
    readers: 'Digital wallpapers card',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#digital-wallpapers-card',
    snapshotField: 'wallpapersOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.ZEN_CINEMA,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 12,
    readers: 'Zen Cinema card',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#zen-cinema-card',
    snapshotField: 'cinemaOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.NEWSLETTER,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 12,
    readers: 'Stay in touch / newsletter capture',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.SB19_HOLD,
    dismissRoot: '#newsletter-capture-card',
    snapshotField: 'newsletterOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.PRESENCE_SIGNALS,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 12,
    readers: 'Presence Signals panel',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    snapshotField: 'presenceOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.LANGUAGE_PREF,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 13,
    readers: 'Language preference panel',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#language-preference',
    snapshotField: 'languageOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.SUPPORT_MODAL,
    kind: OVERLAY_SLOT_KIND.VISUAL_PRIMARY,
    tier: 14,
    readers: 'Support Yin modal; tap + enter-sleep',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BACKDROP_ONLY,
    dismissRoot: '#yin-support-modal',
    snapshotField: 'supportModalOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.TIP_JAR,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 14,
    readers: 'Buy Yin a Tea card',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.SB19_HOLD,
    dismissRoot: '#yin-tip-jar-card',
    snapshotField: 'tipJarOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.SANCTUARY,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 14,
    readers: 'Sanctuary unlock card',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.SB19_HOLD,
    dismissRoot: '#yin-sanctuary-card',
    snapshotField: 'sanctuaryOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.MEMBERSHIP,
    kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
    tier: 14,
    readers: 'Membership unlock card',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BACKDROP_ONLY,
    dismissRoot: '#yin-membership-card',
    snapshotField: 'membershipOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.PURPOSE_CARD,
    kind: OVERLAY_SLOT_KIND.HINT,
    tier: 28,
    readers: '? product purpose card; idle tap via onboardingHintHost',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#onboarding-app-purpose',
    snapshotField: 'purposeCardOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.PRIVACY_SHEET,
    kind: OVERLAY_SLOT_KIND.HINT,
    tier: 29,
    readers: 'Privacy sheet (sibling of purpose card, not a child)',
    blocksIdleYinTap: true,
    blocksEnterSleep: true,
    outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
    dismissRoot: '#onboarding-privacy-sheet',
    snapshotField: 'privacySheetOpen'
  }),
  contract({
    id: OVERLAY_SOURCES.REMINDER_BANNER,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 20,
    readers: 'InAppReminderBannerController suppress path'
  }),
  contract({
    id: OVERLAY_SOURCES.TEA_BUBBLE,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 21,
    readers: 'ContextualTeaTipBubbleUI scheduleShow'
  }),
  contract({
    id: OVERLAY_SOURCES.FLOWER_WELCOME,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 22,
    readers: 'Day1 / 久别吹花 Welcome 气泡; blocks Compass/Wellness first card',
    snapshotField: 'flowerWelcomeVisible'
  }),
  contract({
    id: OVERLAY_SOURCES.MOMENT_WHISPER,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 23,
    readers: 'MomentWhisperUI.tryShow (contextKey-aware)'
  }),
  contract({
    id: OVERLAY_SOURCES.FOCUS_AWARENESS,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 24,
    readers: 'FocusAwarenessCardUI.tryShow (Focusing allowed)'
  }),
  contract({
    id: OVERLAY_SOURCES.WELLNESS_FIRST,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    tier: 25,
    readers: 'Wellness disclaimer first card (off by default; ?wellnessFirst=1)'
  }),
  contract({
    id: OVERLAY_SOURCES.ONBOARDING_HINT,
    kind: OVERLAY_SLOT_KIND.HINT,
    tier: 30,
    readers: 'OnboardingHintsStore auto/remedy (≤1 visible)'
  })
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

/**
 * UI module basename → overlay source id(s). Scan whitelist lives in
 * `scripts/overlay-contract-ui-check.js`.
 */
export const OVERLAY_UI_FILE_SOURCES = Object.freeze({
  'ArrivalPracticeUI.js': [OVERLAY_SOURCES.ARRIVAL],
  'TigerReflectionMoment.js': [OVERLAY_SOURCES.REFLECTION],
  'RitualFlowUI.js': [OVERLAY_SOURCES.RITUAL_FLOW],
  'MicroRitualUI.js': [OVERLAY_SOURCES.MICRO_RITUAL],
  'HonestyCheckInUI.js': [
    OVERLAY_SOURCES.HONESTY_PANEL,
    OVERLAY_SOURCES.HONESTY_PROMPT
  ],
  'FocusDurationPickerUI.js': [OVERLAY_SOURCES.FOCUS_DURATION_PICKER],
  'CompanionModePicker.js': [OVERLAY_SOURCES.COMPANION_PICKER],
  'FiveMomentsCompassUI.js': [OVERLAY_SOURCES.GROWTH_COMPASS],
  'MustardSeedSealCardUI.js': [OVERLAY_SOURCES.GROWTH_MUSTARD_SEED],
  'ConfideToYinUI.js': [OVERLAY_SOURCES.CONFIDE],
  'JourneyLogUI.js': [OVERLAY_SOURCES.JOURNEY_LOG],
  'FocusCoinsPanelUI.js': [OVERLAY_SOURCES.YIN_COIN],
  'DailyZenQuoteCardUI.js': [OVERLAY_SOURCES.DAILY_QUOTE],
  'DigitalWallpapersCardUI.js': [OVERLAY_SOURCES.WALLPAPERS],
  'ZenCinemaCardUI.js': [OVERLAY_SOURCES.ZEN_CINEMA],
  'NewsletterCaptureUI.js': [OVERLAY_SOURCES.NEWSLETTER],
  'PresenceSignalsPanelUI.js': [OVERLAY_SOURCES.PRESENCE_SIGNALS],
  'LanguagePreferenceUI.js': [OVERLAY_SOURCES.LANGUAGE_PREF],
  'SupportYinModalUI.js': [OVERLAY_SOURCES.SUPPORT_MODAL],
  'TipJarUI.js': [OVERLAY_SOURCES.TIP_JAR],
  'SanctuaryUnlockUI.js': [OVERLAY_SOURCES.SANCTUARY],
  'MembershipUnlockUI.js': [OVERLAY_SOURCES.MEMBERSHIP],
  'OnboardingHintsUI.js': [
    OVERLAY_SOURCES.PURPOSE_CARD,
    OVERLAY_SOURCES.PRIVACY_SHEET,
    OVERLAY_SOURCES.WELLNESS_FIRST,
    OVERLAY_SOURCES.ONBOARDING_HINT
  ],
  'FlowerBlowWelcomeBubbleUI.js': [OVERLAY_SOURCES.FLOWER_WELCOME],
  'InAppReminderBannerUI.js': [OVERLAY_SOURCES.REMINDER_BANNER],
  'ContextualTeaTipBubbleUI.js': [OVERLAY_SOURCES.TEA_BUBBLE],
  'MomentWhisperUI.js': [OVERLAY_SOURCES.MOMENT_WHISPER],
  'FocusAwarenessCardUI.js': [OVERLAY_SOURCES.FOCUS_AWARENESS]
});
