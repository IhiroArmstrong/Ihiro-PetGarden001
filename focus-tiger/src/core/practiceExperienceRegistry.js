/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A9 · Practice experiences — single registry (slice 2: end voice + save-image naming).
 *
 * Monetized checkout products live in `commerceProductRegistry.js` (slice 1).
 *
 * @see docs/root-cause-audit-2026-10-12.md A9
 */

import { PRACTICE_BASELINE_SOURCE_IDS } from './practiceAggregate.js';
import { RITUAL_IDS } from './RitualFlow.js';

/**
 * @typedef {'focus-end-helper' | 'practice-announcement' | 'breath-phase-only' | 'multi-step-ui'} PracticeEndVoiceMode
 * @typedef {'fixed' | 'ritual-config-completeToastKey' | 'per-step-ui'} PracticeEndVoiceLocaleSource
 * @typedef {'time-stamp-suffix' | 'date-key-singleton' | 'entity-id' | 'day-singleton'} PracticeSaveCollisionPolicy
 *
 * @typedef {object} PracticeExperienceRow
 * @property {string} practiceKindId stable id (product / Brief matrix row)
 * @property {import('./practiceAggregate.js').PracticeBaselineSourceId | null} baselineWriteSourceId
 *   when non-null, must match a `PRACTICE_BASELINE_SOURCE_IDS` entry
 * @property {PracticeEndVoiceMode} endVoiceMode
 * @property {string | null} endVoiceLocaleKey fixed i18n key when localeSource is `fixed`
 * @property {PracticeEndVoiceLocaleSource} endVoiceLocaleSource
 * @property {string} endVoiceWiringRelativePath path under `src/` (file or dir)
 * @property {ReadonlyArray<string>} endVoiceWiringMarkers substrings that must exist in wiring file
 * @property {string | null} ceremonySaveArtifactId save-image artifact offered after this practice (if any)
 *
 * @typedef {object} PracticeSaveImageRow
 * @property {string} artifactId
 * @property {string} filenamePrefix ASCII download prefix (no locale)
 * @property {PracticeSaveCollisionPolicy} collisionPolicy
 * @property {string} builderModule path under `src/core/`
 * @property {string | null} builderExport exported filename helper, or null when inline in save fn
 * @property {ReadonlyArray<string>} builderSourceMarkers substrings in builder module (prefix or helper name)
 */

/** @type {ReadonlyArray<PracticeExperienceRow>} */
const PRACTICE_EXPERIENCE_ROWS = Object.freeze([
  Object.freeze({
    practiceKindId: 'sit-timed',
    baselineWriteSourceId: 'sit-timed',
    endVoiceMode: 'focus-end-helper',
    endVoiceLocaleKey: 'system_tts.focus_end',
    endVoiceLocaleSource: 'fixed',
    endVoiceWiringRelativePath: 'main.js',
    endVoiceWiringMarkers: Object.freeze(['maybeSpeakFocusEndAnnouncement']),
    ceremonySaveArtifactId: 'journey-daily-card'
  }),
  Object.freeze({
    practiceKindId: 'sit-open-ended',
    baselineWriteSourceId: null,
    endVoiceMode: 'focus-end-helper',
    endVoiceLocaleKey: 'system_tts.focus_end',
    endVoiceLocaleSource: 'fixed',
    endVoiceWiringRelativePath: 'main.js',
    endVoiceWiringMarkers: Object.freeze([
      'maybeSpeakFocusEndAnnouncement',
      'openEnded: true'
    ]),
    ceremonySaveArtifactId: 'journey-daily-card'
  }),
  Object.freeze({
    practiceKindId: 'honesty-checkin',
    baselineWriteSourceId: 'honesty-checkin',
    endVoiceMode: 'practice-announcement',
    endVoiceLocaleKey: 'HONESTY_CHECKIN_THANKS',
    endVoiceLocaleSource: 'fixed',
    endVoiceWiringRelativePath: 'ui/HonestyCheckInUI.js',
    endVoiceWiringMarkers: Object.freeze([
      "t('HONESTY_CHECKIN_THANKS')",
      'honesty:thanks'
    ]),
    ceremonySaveArtifactId: null
  }),
  Object.freeze({
    practiceKindId: 'breath-micro-ritual',
    baselineWriteSourceId: 'breath-micro-ritual',
    endVoiceMode: 'practice-announcement',
    endVoiceLocaleKey: 'system_tts.focus_end',
    endVoiceLocaleSource: 'fixed',
    endVoiceWiringRelativePath: 'main.js',
    endVoiceWiringMarkers: Object.freeze([
      'function completeMicroRitual',
      "t('system_tts.focus_end')",
      'breath-complete:'
    ]),
    ceremonySaveArtifactId: null
  }),
  Object.freeze({
    practiceKindId: 'ritual-flow',
    baselineWriteSourceId: null,
    endVoiceMode: 'practice-announcement',
    endVoiceLocaleKey: 'ritual.shared.complete',
    endVoiceLocaleSource: 'ritual-config-completeToastKey',
    endVoiceWiringRelativePath: 'main.js',
    endVoiceWiringMarkers: Object.freeze([
      'completeToastKey',
      'ritual-complete:',
      'maybeSpeakPracticeAnnouncement'
    ]),
    ceremonySaveArtifactId: null
  }),
  Object.freeze({
    practiceKindId: 'arrival',
    baselineWriteSourceId: null,
    endVoiceMode: 'breath-phase-only',
    endVoiceLocaleKey: null,
    endVoiceLocaleSource: 'per-step-ui',
    endVoiceWiringRelativePath: 'ui/ArrivalPracticeUI.js',
    endVoiceWiringMarkers: Object.freeze([
      'maybeSpeakBreathPhaseCue',
      'arrival:breath-guide'
    ]),
    ceremonySaveArtifactId: null
  }),
  Object.freeze({
    practiceKindId: 'recover-reset',
    baselineWriteSourceId: null,
    endVoiceMode: 'multi-step-ui',
    endVoiceLocaleKey: null,
    endVoiceLocaleSource: 'per-step-ui',
    endVoiceWiringRelativePath: 'ui/RecoverResetPracticeUI.js',
    endVoiceWiringMarkers: Object.freeze([
      'RESET_GROUND_OUTRO',
      'RESET_LOOK_OUTRO',
      'maybeSpeakPracticeAnnouncement'
    ]),
    ceremonySaveArtifactId: null
  })
]);

/** @type {ReadonlyArray<PracticeSaveImageRow>} */
const PRACTICE_SAVE_IMAGE_ROWS = Object.freeze([
  Object.freeze({
    artifactId: 'journey-daily-card',
    filenamePrefix: 'focus-tiger-daily-card-',
    collisionPolicy: 'time-stamp-suffix',
    builderModule: 'journeyDailyCard.js',
    builderExport: 'journeyDailyCardFilename',
    builderSourceMarkers: Object.freeze(['focus-tiger-daily-card-'])
  }),
  Object.freeze({
    artifactId: 'mindfulness-scroll',
    filenamePrefix: 'focus-tiger-mindfulness-scroll-',
    collisionPolicy: 'day-singleton',
    builderModule: 'mindfulnessScroll.js',
    builderExport: null,
    builderSourceMarkers: Object.freeze(['focus-tiger-mindfulness-scroll-'])
  }),
  Object.freeze({
    artifactId: 'daily-zen-quote',
    filenamePrefix: 'focus-tiger-quiet-line-',
    collisionPolicy: 'date-key-singleton',
    builderModule: 'dailyZenQuote.js',
    builderExport: null,
    builderSourceMarkers: Object.freeze(['focus-tiger-quiet-line-'])
  }),
  Object.freeze({
    artifactId: 'mustard-seed-seal',
    filenamePrefix: 'focus-tiger-mustard-seed-',
    collisionPolicy: 'entity-id',
    builderModule: 'saveMustardSeedSealImage.js',
    builderExport: 'mustardSeedSealExportFilename',
    builderSourceMarkers: Object.freeze([
      'focus-tiger-mustard-seed-',
      'mustardSeedSealExportFilename'
    ])
  }),
  Object.freeze({
    artifactId: 'digital-wallpaper',
    filenamePrefix: 'focus-tiger-wallpaper-',
    collisionPolicy: 'entity-id',
    builderModule: 'digitalWallpapersCatalog.js',
    builderExport: 'digitalWallpaperFilename',
    builderSourceMarkers: Object.freeze([
      'focus-tiger-wallpaper-',
      'digitalWallpaperFilename'
    ])
  }),
  Object.freeze({
    artifactId: 'art-chosen-piece',
    filenamePrefix: 'focus-tiger-art-piece-',
    collisionPolicy: 'entity-id',
    builderModule: 'artChosenPieceCard.js',
    builderExport: null,
    builderSourceMarkers: Object.freeze(['focus-tiger-art-piece-'])
  })
]);

const BY_PRACTICE_KIND = new Map(
  PRACTICE_EXPERIENCE_ROWS.map((row) => [row.practiceKindId, row])
);
const BY_SAVE_ARTIFACT = new Map(
  PRACTICE_SAVE_IMAGE_ROWS.map((row) => [row.artifactId, row])
);

/** Ritual ids must stay aligned with `RITUAL_IDS` for Brief / matrix rows. */
export const PRACTICE_RITUAL_FLOW_VARIANT_IDS = Object.freeze(
  Object.values(RITUAL_IDS)
);

/**
 * @returns {ReadonlyArray<PracticeExperienceRow>}
 */
export function listPracticeExperiences() {
  return PRACTICE_EXPERIENCE_ROWS;
}

/**
 * @param {string} practiceKindId
 * @returns {PracticeExperienceRow}
 */
export function getPracticeExperience(practiceKindId) {
  const row = BY_PRACTICE_KIND.get(practiceKindId);
  if (!row) {
    throw new Error(
      `[practice-experience-registry] unknown practice kind: ${practiceKindId}`
    );
  }
  return row;
}

/**
 * @returns {ReadonlyArray<PracticeSaveImageRow>}
 */
export function listPracticeSaveImageArtifacts() {
  return PRACTICE_SAVE_IMAGE_ROWS;
}

/**
 * @param {string} artifactId
 * @returns {PracticeSaveImageRow}
 */
export function getPracticeSaveImageArtifact(artifactId) {
  const row = BY_SAVE_ARTIFACT.get(artifactId);
  if (!row) {
    throw new Error(
      `[practice-experience-registry] unknown save-image artifact: ${artifactId}`
    );
  }
  return row;
}

/**
 * Dev/test guard: every baseline write source has a registry row.
 */
export function assertPracticeRegistryCoversBaselineSources() {
  const fromRegistry = PRACTICE_EXPERIENCE_ROWS
    .map((r) => r.baselineWriteSourceId)
    .filter(Boolean)
    .sort();
  const baseline = [...PRACTICE_BASELINE_SOURCE_IDS].sort();
  if (fromRegistry.join('\0') !== baseline.join('\0')) {
    throw new Error(
      `[practice-experience-registry] PRACTICE_BASELINE_SOURCE_IDS mismatch: registry=${fromRegistry.join(',')} baseline=${baseline.join(',')}`
    );
  }
}

assertPracticeRegistryCoversBaselineSources();
