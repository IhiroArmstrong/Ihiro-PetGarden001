/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * DOC_CODE_CONTRACT M-01 — click-mutation files vs written background exemptions.
 * Definition of three-state visibility lives in INTERACTION_FEEDBACK_PRINCIPLES.md.
 * Scan: scripts/mutation-m01-check.js (docs:check).
 */

/** User-click (or same-directory click-adjacent) cloud mutations that must timeout. */
export const M01_CLICK_MUTATION_FILES = Object.freeze([
  'src/core/cloudApiClient.js',
  'src/core/focusCircleMembership.js',
  'src/core/focusCircleIdentity.js',
  'src/core/focusCircleWitness.js',
  'src/core/focusCircleWasHere.js',
  'src/ui/FocusCircleControlsUI.js',
  'src/ui/FocusCirclePanelUI.js',
  'src/ui/FocusCircleWitnessLeaveUI.js',
  'src/ui/SupportYinModalUI.js',
  'src/ui/TipJarUI.js',
  'src/ui/SanctuaryUnlockUI.js',
  'src/ui/MembershipUnlockUI.js',
  'src/ui/NewsletterCaptureUI.js',
  'src/ui/JourneyLogUI.js',
  'src/core/newsletter/workerNewsletterProvider.js',
  'src/core/practiceBackup/practiceBackupSync.js',
  'src/core/membershipCheckout.js'
]);

/**
 * Background / skip-same-write paths. Three-state UI is not required.
 * They still inherit postCloudJson's default timeout unless they wrap shorter.
 */
export const M01_BACKGROUND_EXEMPTIONS = Object.freeze([
  {
    file: 'src/core/tasteLayerSync.js',
    reason: 'background overlay fetch; skip write when content identical'
  },
  {
    file: 'src/core/growthMetricsConfigSync.js',
    reason: 'background config fetch; skip write when content identical'
  },
  {
    file: 'src/core/monetizationFunnelUpload.js',
    reason: 'BACKGROUND_NETWORK funnel upload; not a click mutation'
  },
  {
    file: 'src/core/ypePersonalizationSync.js',
    reason: 'YPE ingest is background; delete-on-opt-out still uses default timeout'
  },
  {
    file: 'src/audio/UserAmbientLibrary.js',
    reason: 'IndexedDB atmosphere library; not an O-04 / postCloudJson mutation'
  }
]);
