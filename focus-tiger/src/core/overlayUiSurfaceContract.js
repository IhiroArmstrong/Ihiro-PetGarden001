/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Overlay UI surface checklist (DOC_CODE_CONTRACT O-04).
 *
 * This table is the category contract for clickable stacked UI — not a
 * post-hoc list of last week's bugs. Every `OVERLAY_UI_FILE_SOURCES` file
 * must have a row. New occupancy overlays may not use `mode: 'gap'`.
 *
 * Scan: `scripts/overlay-contract-ui-check.js`.
 */

/** Known body-level occluders. Full z-index constant extraction is deferred (Z-dim). */
export const OVERLAY_UI_KNOWN_OCCLUDERS = Object.freeze({
  NARROW_SHELL: 30,
  ONBOARDING_HINT: 34
});

export const OVERLAY_UI_SURFACE_COLUMNS = Object.freeze([
  'registry',
  'slotRequest',
  'zIndexFloor',
  'mountPointer',
  'failureFeedback',
  'e2eOverlap',
  'trackerCoverage'
]);

/** @type {{ mode: 'gap', grandfather: true }} */
const GAP = Object.freeze({ mode: 'gap', grandfather: true });

/**
 * @param {object} row
 */
function surface(row) {
  return Object.freeze({
    occupancy: true,
    ...row
  });
}

function deriveSlot() {
  return Object.freeze({ mode: 'derive' });
}

function requestSlot(uiTokens, wiringTokens) {
  return Object.freeze({
    mode: 'request',
    uiTokens: Object.freeze([...uiTokens]),
    wiringFiles: Object.freeze(['src/main.js']),
    wiringTokens: Object.freeze([...wiringTokens])
  });
}

function overlayStack() {
  return Object.freeze({ mode: 'ui-overlay-stack' });
}

function bodyMin(min = OVERLAY_UI_KNOWN_OCCLUDERS.ONBOARDING_HINT) {
  return Object.freeze({ mode: 'body-min', min });
}

function glassCard(file) {
  return surface({
    file,
    slotRequest: deriveSlot(),
    zIndexFloor: overlayStack(),
    mount: 'ui-overlay',
    failureFeedback: GAP,
    e2eOverlap: GAP,
    trackerCoverage: GAP
  });
}

/**
 * @type {ReadonlyArray<object>}
 */
export const OVERLAY_UI_SURFACE = Object.freeze([
  surface({
    file: 'ArrivalPracticeUI.js',
    slotRequest: deriveSlot(),
    zIndexFloor: overlayStack(),
    mount: 'ui-overlay',
    failureFeedback: GAP,
    e2eOverlap: GAP,
    trackerCoverage: GAP
  }),
  glassCard('TigerReflectionMoment.js'),
  glassCard('RitualFlowUI.js'),
  glassCard('MicroRitualUI.js'),
  surface({
    file: 'HonestyCheckInUI.js',
    slotRequest: deriveSlot(),
    zIndexFloor: overlayStack(),
    mount: 'ui-overlay',
    failureFeedback: GAP,
    e2eOverlap: GAP,
    trackerCoverage: GAP
  }),
  glassCard('FocusDurationPickerUI.js'),
  glassCard('CompanionModePicker.js'),
  glassCard('ColdStartGoalCardUI.js'),
  glassCard('FiveMomentsCompassUI.js'),
  glassCard('GroundExerciseChoiceUI.js'),
  glassCard('MustardSeedSealCardUI.js'),
  glassCard('ConfideToYinUI.js'),
  glassCard('JourneyLogUI.js'),
  glassCard('FocusCoinsPanelUI.js'),
  glassCard('DailyZenQuoteCardUI.js'),
  glassCard('DigitalWallpapersCardUI.js'),
  glassCard('ZenCinemaCardUI.js'),
  glassCard('NewsletterCaptureUI.js'),
  glassCard('PresenceSignalsPanelUI.js'),
  glassCard('LanguagePreferenceUI.js'),
  glassCard('SupportYinModalUI.js'),
  glassCard('TipJarUI.js'),
  glassCard('SanctuaryUnlockUI.js'),
  glassCard('MembershipUnlockUI.js'),
  surface({
    file: 'OnboardingHintsUI.js',
    slotRequest: deriveSlot(),
    zIndexFloor: overlayStack(),
    mount: 'ui-overlay',
    failureFeedback: GAP,
    e2eOverlap: GAP,
    trackerCoverage: GAP
  }),
  surface({
    file: 'FlowerBlowWelcomeBubbleUI.js',
    slotRequest: deriveSlot(),
    zIndexFloor: overlayStack(),
    mount: 'ui-overlay',
    failureFeedback: GAP,
    e2eOverlap: {
      mode: 'spec',
      path: 'e2e/in-app-reminder.spec.js',
      tokens: Object.freeze(['flower-blow-welcome-bubble', 'reminder-preference-saved'])
    },
    trackerCoverage: GAP
  }),
  surface({
    file: 'InAppReminderBannerUI.js',
    slotRequest: deriveSlot(),
    zIndexFloor: bodyMin(),
    mount: 'mixed',
    failureFeedback: GAP,
    e2eOverlap: {
      mode: 'spec',
      path: 'e2e/in-app-reminder.spec.js',
      tokens: Object.freeze(['ft-onboarding-hint-bubble', 'reminder-preference-saved'])
    },
    trackerCoverage: GAP
  }),
  glassCard('ContextualTeaTipBubbleUI.js'),
  glassCard('MomentWhisperUI.js'),
  glassCard('FocusAwarenessCardUI.js'),
  glassCard('CalmActionRecoverCardUI.js'),
  glassCard('CalmActionArriveCardUI.js'),
  surface({
    file: 'TransitionMomentUI.js',
    slotRequest: requestSlot(
      ['requestSlot', 'releaseSlot'],
      ['TRANSITION_MOMENT', 'requestOverlaySlot']
    ),
    zIndexFloor: overlayStack(),
    mount: 'ui-overlay',
    failureFeedback: GAP,
    e2eOverlap: GAP,
    trackerCoverage: GAP
  }),
  surface({
    file: 'RecoverResetPracticeUI.js',
    slotRequest: requestSlot(
      ['requestSlot', 'releaseSlot'],
      ['RECOVER_RESET_PRACTICE', 'requestOverlaySlot']
    ),
    zIndexFloor: overlayStack(),
    mount: 'ui-overlay',
    failureFeedback: GAP,
    e2eOverlap: GAP,
    trackerCoverage: GAP
  }),
  surface({
    file: 'FocusCircleWitnessLeaveUI.js',
    slotRequest: requestSlot(
      [
        'requestLeaveSlot',
        'requestRespondSlot',
        'releaseLeaveSlot'
      ],
      [
        'FOCUS_CIRCLE_WITNESS_LEAVE',
        'FOCUS_CIRCLE_WITNESS_RESPOND',
        'requestOverlaySlot'
      ]
    ),
    zIndexFloor: bodyMin(),
    mount: 'body',
    failureFeedback: {
      mode: 'token',
      tokens: Object.freeze(['FOCUS_CIRCLE_WITNESS_SUBMIT_ERROR'])
    },
    e2eOverlap: GAP,
    trackerCoverage: {
      mode: 'token',
      files: Object.freeze([
        'docs/tracker-entries/fix-focus-circle-witness-leave-glass.md'
      ]),
      tokens: Object.freeze(['待人工测试', '选句'])
    }
  }),
  surface({
    file: 'ReminderPreferenceUI.js',
    occupancy: false,
    slotRequest: Object.freeze({
      mode: 'na',
      reason: 'settings-panel-not-arbitrated'
    }),
    zIndexFloor: bodyMin(),
    mount: 'body',
    failureFeedback: {
      mode: 'token',
      tokens: Object.freeze(['reminder-preference-saved'])
    },
    e2eOverlap: {
      mode: 'spec',
      path: 'e2e/in-app-reminder.spec.js',
      tokens: Object.freeze(['ft-onboarding-hint-bubble', 'reminder-preference-saved'])
    },
    trackerCoverage: GAP
  })
]);
