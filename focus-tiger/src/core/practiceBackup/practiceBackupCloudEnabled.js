/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Practice-memory cloud backup UI + silent sync gate.
 * When false: no upload/restore. Journey Log corner stays hidden even when true
 * (T93 D3: Preferences is the only email entry).
 */
export let practiceBackupCloudEnabled = true;

/** @param {boolean} value */
export function setPracticeBackupCloudEnabledForTests(value) {
  practiceBackupCloudEnabled = value;
}
