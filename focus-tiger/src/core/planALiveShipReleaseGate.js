/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Plan A · first public DMG — three release flags must stay OFF until RR-21 B5 passes.
 * PO checklist SSOT: `docs/plan-a-live-ship-release-flags.md`.
 */

export { isPracticeStudyMenuReleaseEnabled } from './practiceStudyReleaseGate.js';
export { practiceBackupCloudEnabled } from './practiceBackup/practiceBackupCloudEnabled.js';

/** @typedef {'qa-boot' | 'practice-study-menu' | 'cloud-practice-backup'} PlanALiveShipFlagId */

/** @type {ReadonlyArray<{ id: PlanALiveShipFlagId, summary: string }>} */
export const PLAN_A_LIVE_SHIP_RELEASE_FLAGS = Object.freeze([
  {
    id: 'qa-boot',
    summary:
      'No QA boot env at pack time; dist must not inline VITE_FT_QA_BOOT or qa* seed literals.'
  },
  {
    id: 'practice-study-menu',
    summary:
      'Practice Study menu row + T83 first-sit invite gated off in production-shaped builds.'
  },
  {
    id: 'cloud-practice-backup',
    summary:
      'practiceBackupCloudEnabled stays false — no silent cloud upload/restore UI.'
  }
]);
