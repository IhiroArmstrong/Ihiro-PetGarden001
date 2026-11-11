/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { isPracticeBackupCloudDisabledError } from './practiceBackupCloudHttp.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} email
 * @returns {boolean}
 */
export function isEmailJourneyAddressValid(email) {
  return EMAIL_RE.test(String(email || '').trim());
}

/**
 * Map cloud errors to locale keys. 410 must be explicit — never a silent return.
 *
 * @param {unknown} err
 * @returns {string}
 */
export function emailJourneyStatusKeyForError(err) {
  if (isPracticeBackupCloudDisabledError(err)) {
    return 'EMAIL_JOURNEY_STATUS_UNAVAILABLE';
  }
  const reason =
    err && typeof err === 'object'
      ? String(/** @type {{ reason?: unknown }} */ (err).reason || '')
      : '';
  if (reason === 'practice_backup_disabled') {
    return 'EMAIL_JOURNEY_STATUS_UNAVAILABLE';
  }
  if (reason === 'invalid_email' || reason === 'invalid') {
    return 'EMAIL_JOURNEY_STATUS_INVALID';
  }
  return 'EMAIL_JOURNEY_STATUS_NETWORK';
}

/**
 * Setapp / MAS: no cloud login row (store has its own install identity).
 *
 * @param {'direct' | 'setapp' | 'mas' | string} channel
 * @returns {boolean}
 */
export function isEmailJourneyCloudUiAllowedForChannel(channel) {
  return channel !== 'setapp' && channel !== 'mas';
}
