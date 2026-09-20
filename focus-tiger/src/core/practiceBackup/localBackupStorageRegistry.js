/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Local backup export registry — SSOT for Preferences → Backup & restore keys.
 * CI: `npm run audit:local-backup-coverage`
 */

/** @typedef {'export' | 'exclude-derived' | 'exclude-ephemeral' | 'exclude-product'} LocalBackupStorageTier */

/**
 * @typedef {{
 *   key: string,
 *   categoryId?: string,
 *   tier: LocalBackupStorageTier,
 *   sinceSchema?: number,
 *   note?: string
 * }} LocalBackupStorageRow
 */

/** Keys added in schema v6 (2026-09-20). */
export const PRACTICE_BACKUP_V6_ADDED_KEYS = Object.freeze([
  'focus-tiger.focus-essence.v1'
]);

/** Keys added in schema v5 (2026-09-16). */
export const PRACTICE_BACKUP_V5_ADDED_KEYS = Object.freeze([
  'focus-tiger.focus-duration-pref.v1',
  'focus-tiger.intentions.v1',
  'focus-tiger.quiet-together.v1',
  'focus-tiger.focus-circle.v1',
  'focus-tiger.focus-circle-witness-responded.v1',
  'focus-tiger.focus-circle-passive-share.v1',
  'focus-tiger.focus-circle-was-here-mark.v1',
  'focus-tiger.focus-circle-identity.v1',
  'focus-tiger.focus-circle-identity-hidden.v1'
]);

/**
 * Full export whitelist (schema v6). Order stable for snapshots / diffs.
 * @type {readonly string[]}
 */
export const PRACTICE_BACKUP_EXPORT_KEYS = Object.freeze([
  'focus-tiger.journey-log.v1',
  'focus-tiger.practice-days.v1',
  'focus-tiger.milestone-glow.v1',
  'focus-tiger.entitlement-ownership.v1',
  'focus-tiger.ritual-completions.v1',
  'focus-tiger.mustard-seed-seal.v1',
  'focus-tiger.presence-signals.v1',
  'focus-tiger.presence-freetext-l3-consent.v1',
  'focus-tiger.reflections.v1',
  'focus-tiger.locale.v1',
  'focus-tiger.reminder-preference.v1',
  'focus-tiger.companion-mode.v1',
  'focus-tiger.ambient-pref.v1',
  'focus-tiger.session-cues.v1',
  'focus-tiger.contemplative-archive-seals.v1',
  'focus-tiger.lotus-pond.v1',
  'focus-tiger.tip-jar.v1',
  'focus-tiger.sanctuary-entitlement.v1',
  'focus-tiger.focus-coins.v1',
  ...PRACTICE_BACKUP_V5_ADDED_KEYS,
  ...PRACTICE_BACKUP_V6_ADDED_KEYS
]);

/**
 * Documented non-export local keys (subset — see docs/local-backup-storage-registry.md).
 * @type {readonly LocalBackupStorageRow[]}
 */
export const LOCAL_BACKUP_EXCLUDE_ROWS = Object.freeze([
  {
    key: 'focus-tiger.entitlement-cache.v1',
    tier: 'exclude-derived',
    note: 'Derived cache; recompute on import via reconcileEntitlementCacheAfterRestore + refreshEntitlement'
  },
  {
    key: 'focus-tiger.daily-completions.v1',
    tier: 'exclude-derived',
    note: 'Reconcile from practice-days on import'
  },
  {
    key: 'focus-tiger.practice-backup.v1',
    tier: 'exclude-ephemeral',
    note: 'Device token / cloud opt-in — rebind on new device'
  }
]);

/**
 * @param {string} key
 * @returns {boolean}
 */
export function isPracticeBackupExportKey(key) {
  return PRACTICE_BACKUP_EXPORT_KEYS.includes(key);
}
