/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Practice-memory cloud backup UI + silent sync gate.
 * When false: no upload/restore, Journey Log backup panel hidden.
 * Worker routes remain for a future encrypted release.
 */
export let practiceBackupCloudEnabled = false;

/** @param {boolean} value */
export function setPracticeBackupCloudEnabledForTests(value) {
  practiceBackupCloudEnabled = value;
}
