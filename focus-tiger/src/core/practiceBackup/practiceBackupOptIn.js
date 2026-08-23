/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Local opt-in / credential for practice-memory cloud backup.
 */

import { PRACTICE_BACKUP_OPT_IN_KEY } from './practiceBackupSnapshot.js';

/**
 * @typedef {{
 *   enabled: boolean,
 *   consentedAt: string | null,
 *   email: string | null,
 *   deviceToken: string | null,
 *   lastUploadAt: string | null,
 *   lastUploadError: string | null,
 *   lastRestoreAt: string | null,
 *   lastUploadFingerprint: string | null
 * }} PracticeBackupOptInState
 */

/**
 * @returns {PracticeBackupOptInState}
 */
export function emptyPracticeBackupOptInState() {
  return {
    enabled: false,
    consentedAt: null,
    email: null,
    deviceToken: null,
    lastUploadAt: null,
    lastUploadError: null,
    lastRestoreAt: null,
    lastUploadFingerprint: null
  };
}

/**
 * @param {unknown} raw
 * @returns {PracticeBackupOptInState}
 */
export function normalizePracticeBackupOptInState(raw) {
  const empty = emptyPracticeBackupOptInState();
  if (!raw || typeof raw !== 'object') return empty;
  const o = /** @type {Record<string, unknown>} */ (raw);
  return {
    enabled: o.enabled === true,
    consentedAt:
      typeof o.consentedAt === 'string' && o.consentedAt ? o.consentedAt : null,
    email: typeof o.email === 'string' && o.email.trim() ? o.email.trim() : null,
    deviceToken:
      typeof o.deviceToken === 'string' && o.deviceToken.trim()
        ? o.deviceToken.trim()
        : null,
    lastUploadAt:
      typeof o.lastUploadAt === 'string' && o.lastUploadAt
        ? o.lastUploadAt
        : null,
    lastUploadError:
      typeof o.lastUploadError === 'string' && o.lastUploadError
        ? o.lastUploadError
        : null,
    lastRestoreAt:
      typeof o.lastRestoreAt === 'string' && o.lastRestoreAt
        ? o.lastRestoreAt
        : null,
    lastUploadFingerprint:
      typeof o.lastUploadFingerprint === 'string' && o.lastUploadFingerprint
        ? o.lastUploadFingerprint
        : null
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {PracticeBackupOptInState}
 */
export function readPracticeBackupOptIn(storage) {
  if (!storage) return emptyPracticeBackupOptInState();
  try {
    const raw = storage.getItem(PRACTICE_BACKUP_OPT_IN_KEY);
    if (!raw) return emptyPracticeBackupOptInState();
    return normalizePracticeBackupOptInState(JSON.parse(raw));
  } catch {
    return emptyPracticeBackupOptInState();
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {PracticeBackupOptInState} state
 */
export function writePracticeBackupOptIn(storage, state) {
  if (!storage) return;
  try {
    const next = JSON.stringify(normalizePracticeBackupOptInState(state));
    if (storage.getItem(PRACTICE_BACKUP_OPT_IN_KEY) === next) return;
    storage.setItem(PRACTICE_BACKUP_OPT_IN_KEY, next);
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearPracticeBackupOptIn(storage) {
  if (!storage) return;
  try {
    storage.removeItem(PRACTICE_BACKUP_OPT_IN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Ready for silent put/get: enabled + consent + email + token.
 * @param {PracticeBackupOptInState} state
 */
export function canPracticeBackupUpload(state) {
  return Boolean(
    state?.enabled &&
      state?.consentedAt &&
      state?.email &&
      state?.deviceToken
  );
}
