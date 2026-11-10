/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Practice-memory cloud backup UI + silent sync gate.
 * When false: no upload/restore, Journey Log backup panel hidden.
 * T93 D2 does not flip this; Worker OTP is env-gated separately.
 */
export let practiceBackupCloudEnabled = false;

/** @param {boolean} value */
export function setPracticeBackupCloudEnabledForTests(value) {
  practiceBackupCloudEnabled = value;
}
