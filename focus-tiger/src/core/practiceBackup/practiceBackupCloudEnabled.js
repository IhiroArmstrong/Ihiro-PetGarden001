/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Practice-memory cloud backup UI + silent sync gate.
 * When false: no upload/restore. Journey Log corner stays hidden even when true
 * (T93 D3: Preferences is the only email entry).
 *
 * Direct / Electron / web: **true** (T93 PO 2026-11-13). Setapp / MAS still
 * hide the row via `isEmailJourneyCloudUiAllowedForChannel`.
 * Pack verifies the source default stays on.
 */
export let practiceBackupCloudEnabled = true;

/** @param {boolean} value */
export function setPracticeBackupCloudEnabledForTests(value) {
  practiceBackupCloudEnabled = value;
}
