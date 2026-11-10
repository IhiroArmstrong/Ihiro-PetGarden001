/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Worker 410 envelope while practice-backup writes are env-disabled. */
export const PRACTICE_BACKUP_DISABLED_ERROR = 'practice_backup_disabled';

/**
 * Client dual-state (T93 D2): recognize Worker 410 vs success JSON.
 * Does not open the client cloud gate or the menu Sign-in row.
 *
 * @param {unknown} err
 * @returns {boolean}
 */
export function isPracticeBackupCloudDisabledError(err) {
  if (!err || typeof err !== 'object') return false;
  const status = /** @type {{ status?: unknown }} */ (err).status;
  if (status !== 410) return false;
  const body = /** @type {{ body?: unknown }} */ (err).body;
  if (!body || typeof body !== 'object') return false;
  return (
    /** @type {{ error?: unknown }} */ (body).error ===
    PRACTICE_BACKUP_DISABLED_ERROR
  );
}

/**
 * @param {unknown} payload
 * @returns {{ kind: 'ok', payload: unknown } | { kind: 'disabled' } | { kind: 'error', err: unknown }}
 */
export function classifyPracticeBackupCloudResult(payload, err) {
  if (err) {
    if (isPracticeBackupCloudDisabledError(err)) {
      return { kind: 'disabled' };
    }
    return { kind: 'error', err };
  }
  return { kind: 'ok', payload };
}
