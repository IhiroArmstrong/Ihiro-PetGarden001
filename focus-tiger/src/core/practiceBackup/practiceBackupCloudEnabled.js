/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Practice-memory cloud backup UI + silent sync gate.
 * When false: no upload/restore. Journey Log corner stays hidden even when true
 * (T93 D3: Preferences is the only email entry).
 *
 * First-invite ship: keep this **false**. Opening it is a later public release,
 * not the invite DMG. Pack verifies the default stays off.
 */
export let practiceBackupCloudEnabled = false;

/** @param {boolean} value */
export function setPracticeBackupCloudEnabledForTests(value) {
  practiceBackupCloudEnabled = value;
}
