/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
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

/** Keys added in schema v7 (2026-11-06 · T87 stable prefs). */
export const PRACTICE_BACKUP_V7_ADDED_KEYS = Object.freeze([
  'focus-tiger.stable-prefs.v1'
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
  'focus-tiger.system-tts-pref.v1',
  'focus-tiger.contemplative-archive-seals.v1',
  'focus-tiger.lotus-pond.v1',
  'focus-tiger.tip-jar.v1',
  'focus-tiger.sanctuary-entitlement.v1',
  'focus-tiger.focus-coins.v1',
  ...PRACTICE_BACKUP_V5_ADDED_KEYS,
  ...PRACTICE_BACKUP_V6_ADDED_KEYS,
  ...PRACTICE_BACKUP_V7_ADDED_KEYS
]);

/**
 * Named non-export rows (product notes). Remaining reset-only keys are
 * `LOCAL_BACKUP_RESET_ONLY_KEYS` — every reset key must be export or exclude.
 * @type {readonly LocalBackupStorageRow[]}
 */
export const LOCAL_BACKUP_NAMED_EXCLUDE_ROWS = Object.freeze([
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
  },
  {
    key: 'focus-tiger.ritual-recipe.v1',
    tier: 'exclude-product',
    note: 'Sitting recipe is preview-then-adopt; never overwrite-restore with practice backup'
  },
  {
    key: 'focus-tiger.ritual-recipe-analytics-opt-in.v1',
    tier: 'exclude-product',
    note: 'Recipe analytics consent is independent of practice backup'
  },
  {
    key: 'focus-tiger.co-practice-research-week-ledger.v1',
    tier: 'exclude-product',
    note: 'T81 week ledger is device research state; not practice memory; do not copy study weeks across devices'
  },
  {
    key: 'focus-tiger.co-practice-research-consent.v1',
    tier: 'exclude-product',
    note: 'T81 consent + studyId must not restore onto another machine (duplicate studyId / silent re-consent)'
  },
  {
    key: 'focus-tiger.co-practice-research-last-post.v1',
    tier: 'exclude-ephemeral',
    note: 'T81 last POST fingerprint; restoring would skip or duplicate a week upload'
  },
  {
    key: 'focus-tiger.co-practice-research-weekly-schedule.v1',
    tier: 'exclude-ephemeral',
    note: 'T81 this-device week schedule flag; not practice memory'
  },
  {
    key: 'focus-tiger.co-practice-research-first-sit-prompt.v1',
    tier: 'exclude-ephemeral',
    note: 'T83 first-sit prompt latch; hints-seen class; T83 is reset-only'
  },
  {
    key: 'focus-tiger.email-journey-sit-complete-prompt.v1',
    tier: 'exclude-ephemeral',
    note: 'T93 D4 sit-complete email prompt forever-dismiss; hints-seen class; reset-only'
  },
  {
    key: 'focus-tiger.dev-co-practice-research-consent-fixture.v1',
    tier: 'exclude-product',
    note: 'DEV/test fixture; never export; must remain on reset whitelist'
  },
  {
    key: 'focus-tiger.t54-research-log.v1',
    tier: 'exclude-product',
    note: 'T54 research log is not practice-backup memory'
  },
  {
    key: 'focus-tiger.t54-research-consent.v1',
    tier: 'exclude-product',
    note: 'T54 consent must not restore without a fresh in-app grant'
  },
  {
    key: 'focus-tiger.t54-research-last-post.v1',
    tier: 'exclude-ephemeral',
    note: 'T54 last POST fingerprint; device throttle'
  }
]);

/**
 * Reset-whitelist keys that are not practice-backup export (schema v7) and not
 * in `LOCAL_BACKUP_NAMED_EXCLUDE_ROWS`. Adding a key here is the "do not export"
 * declaration; to export instead, add it to `PRACTICE_BACKUP_EXPORT_KEYS` in the
 * same PR (and bump snapshot schema).
 * @type {readonly string[]}
 */
export const LOCAL_BACKUP_RESET_ONLY_KEYS = Object.freeze([
  'focus-tiger.focus-session-end.v1',
  'focus-tiger.growth-journey-stage.v1',
  'focus-tiger.honesty-bridge.v1',
  'focus-tiger.retention-funnel.v1',
  'focus-tiger.presence-signals-disclosure-seen.v1',
  'focus-tiger.cold-start-goal-seen.v1',
  'focus-tiger.cold-start-goal-options-seen.v1',
  'focus-tiger.cold-start-direct-sit-hint.v1',
  'focus-tiger.cold-start-direct-sit-pending.v1',
  'focus-tiger.home-sanctuary-nav-seen.v1',
  'focus-tiger.collections-art-bridge-seen.v1',
  'focus-tiger.reminder-quota.v1',
  'focus-tiger.ics-reminder-sequence.v1',
  'focus-tiger.work-end-preference.v1',
  'focus-tiger.work-end-invite-day.v1',
  'focus-tiger.evening-practice-facts-consent.v1',
  'focus-tiger.evening-practice-facts.v1',
  'focus-tiger.hints-seen.v1',
  'focus-tiger.ambient-nudge.seen.v1',
  'focus-tiger.awaken-check-ins.v1',
  'focus-tiger.companion-channel-recent-ids.v1',
  'focus-tiger.contemplative-inquiry-ex1.v1',
  'focus-tiger.invite-outcomes.v1',
  'focus-tiger.session-duration-offer.v1',
  'focus-tiger.pref-state-read.v1',
  'focus-tiger.co-practice-gift-art.v1',
  'focus-tiger.yin-adaptation.v1',
  'focus-tiger.focus-duration-manual-anchor.v1',
  'focus-tiger.locale-greeting.v1',
  'focus-tiger.scene-anim-cooldown.v1',
  'focus-tiger.scene-anim-daily.v1',
  'focus-tiger.flower-welcome.v1',
  'focus-tiger.flower-welcome-flag.v1',
  'focus-tiger.contextual-tea-tip.v1',
  'focus-tiger.monetization-funnel.v1',
  'focus-tiger.monetization-funnel-opt-in.v1',
  'focus-tiger.newsletter-capture.v1',
  'focus-tiger.open-ended-nudge.v1',
  'focus-tiger.companion-entitlement.v1',
  'focus-tiger.entitlement-mock.v1',
  'focus-tiger.membership-device.v1',
  'focus-tiger.five-moments-compass-seen.v1',
  'focus-tiger.wellness-disclaimer-seen.v1',
  'focus-tiger.moment-whispers-seen.v1',
  'focus-tiger.companion-merch.v1',
  'focus-tiger.mindfulness-scroll.v1',
  'focus-tiger.mindflow-nebula-enabled.v1',
  'focus-tiger.presence-field-enabled.v1',
  'focus-tiger.health-shortcut-log-enabled.v1',
  'focus-tiger.practice-paper-hidden.v1',
  'focus-tiger.daily-wisdom.v1',
  'focus-tiger.daily-zen-quote-pool-v2.v1',
  'focus-tiger.idle-companion-pip.v1',
  'focus-tiger.brand-yin-way-first-reflect.v1',
  'focus-tiger.ype-companion-style.v1',
  'focus-tiger.ype-cloud-personalization-consent.v1',
  'focus-tiger.ype-personalization-pack.v1',
  'focus-tiger.idle-yin-tap-hint.v1',
  'focus-tiger.confide-observation.v1',
  'focus-tiger.session-presence-ring.v1',
  'focus-tiger.seasonal-whisper.v1',
  'focus-tiger.desktop-checkout-pending.v1'
]);

const RESET_ONLY_EXCLUDE_ROWS = LOCAL_BACKUP_RESET_ONLY_KEYS.map((key) => ({
  key,
  tier: /** @type {LocalBackupStorageTier} */ ('exclude-ephemeral'),
  note: 'Reset whitelist; not on practice-backup export (schema v7). Promote to export in the same PR if this is practice memory.'
}));

/**
 * Every non-export reset key. CI fails if a reset key is missing here and not exported.
 * @type {readonly LocalBackupStorageRow[]}
 */
export const LOCAL_BACKUP_EXCLUDE_ROWS = Object.freeze([
  ...LOCAL_BACKUP_NAMED_EXCLUDE_ROWS,
  ...RESET_ONLY_EXCLUDE_ROWS
]);

/**
 * @param {readonly string[]} resetKeys
 * @param {readonly string[]} exportKeys
 * @param {readonly { key: string }[]} excludeRows
 * @returns {string[]}
 */
export function listUnclassifiedResetKeys(
  resetKeys,
  exportKeys = PRACTICE_BACKUP_EXPORT_KEYS,
  excludeRows = LOCAL_BACKUP_EXCLUDE_ROWS
) {
  const classified = new Set([
    ...exportKeys,
    ...excludeRows.map((row) => row.key)
  ]);
  return resetKeys.filter((key) => !classified.has(key));
}

/**
 * Keys on this branch's reset list that origin/develop did not have, and that
 * this PR did not classify as export or exclude.
 * @param {readonly string[]} currentResetKeys
 * @param {readonly string[] | null} developResetKeys
 * @param {readonly string[]} exportKeys
 * @param {readonly { key: string }[]} excludeRows
 * @returns {string[]}
 */
export function listUnclassifiedNewResetKeys(
  currentResetKeys,
  developResetKeys,
  exportKeys = PRACTICE_BACKUP_EXPORT_KEYS,
  excludeRows = LOCAL_BACKUP_EXCLUDE_ROWS
) {
  if (!developResetKeys) return [];
  const developSet = new Set(developResetKeys);
  const newKeys = currentResetKeys.filter((key) => !developSet.has(key));
  return listUnclassifiedResetKeys(newKeys, exportKeys, excludeRows);
}

/**
 * @param {string} key
 * @returns {boolean}
 */
export function isPracticeBackupExportKey(key) {
  return PRACTICE_BACKUP_EXPORT_KEYS.includes(key);
}
