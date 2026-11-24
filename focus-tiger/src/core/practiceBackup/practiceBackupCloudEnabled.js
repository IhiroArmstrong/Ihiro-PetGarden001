/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Practice-memory cloud backup UI + silent sync gate.
 * When false: no upload/restore. Journey Log corner stays hidden even when true
 * (T93 D3: Preferences is the only email entry).
 *
 * Source fallback remains **true** (D1–D4 stay in git for a later public open).
 * Invite DMG (12/8): `pack.js` sets `VITE_FT_PRACTICE_BACKUP_CLOUD=0`.
 * Open-gate pack: `VITE_FT_PRACTICE_BACKUP_CLOUD=1`.
 * Node unit tests have no Vite define and keep the fallback on.
 * Setapp / MAS still hide the row via `isEmailJourneyCloudUiAllowedForChannel`.
 */
function compileTimePracticeBackupCloudEnabled() {
  try {
    const v = import.meta.env.VITE_FT_PRACTICE_BACKUP_CLOUD;
    if (v === '0' || v === 'false' || v === 'off') return false;
    if (v === '1' || v === 'true' || v === 'on') return true;
  } catch {
    /* node --test */
  }
  return true;
}

export let practiceBackupCloudEnabled = compileTimePracticeBackupCloudEnabled();

/** @param {boolean} value */
export function setPracticeBackupCloudEnabledForTests(value) {
  practiceBackupCloudEnabled = value;
}
