/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T93 D4 — Electron empty-library “restore from email” (after first scene).
 */

import { STATES } from '../StateManager.js';
import { practiceBackupCloudEnabled } from './practiceBackupCloudEnabled.js';
import { PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS } from './practiceBackupSnapshot.js';
import { readPracticeBackupOptIn } from './practiceBackupOptIn.js';
import { isEmailJourneyCloudUiAllowedForChannel } from './emailJourneyRestoreStatus.js';

/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isPracticeBackupStoreValueEmpty(raw) {
  if (raw == null) return true;
  const text = String(raw).trim();
  if (!text || text === 'null' || text === '[]' || text === '{}') return true;
  try {
    const value = JSON.parse(text);
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value !== 'object') return false;
    const keys = Object.keys(value);
    if (keys.length === 0) return true;
    if (Array.isArray(value.entries) && value.entries.length === 0) {
      return keys.every(
        (key) => key === 'entries' || value[key] == null || value[key] === ''
      );
    }
    if (Array.isArray(value.records) && value.records.length === 0) {
      return keys.every(
        (key) => key === 'records' || value[key] == null || value[key] === ''
      );
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function isPracticeBackupCloudWhitelistEmpty(storage) {
  if (!storage?.getItem) return true;
  for (const key of PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS) {
    let raw = null;
    try {
      raw = storage.getItem(key);
    } catch {
      return false;
    }
    if (!isPracticeBackupStoreValueEmpty(raw)) return false;
  }
  return true;
}

/**
 * @param {object} [input]
 * @param {Storage | null} [input.storage]
 * @param {boolean} [input.isDesktop]
 * @param {boolean} [input.firstSceneOpen]
 * @param {boolean} [input.welcomeSequencePlaying]
 * @param {boolean} [input.focusing]
 * @param {string} [input.sessionState]
 * @param {string} [input.channel]
 */
export function evaluateEmailJourneyEmptyLibraryChip(input = {}) {
  if (!practiceBackupCloudEnabled) {
    return { shouldShow: false, reason: 'cloud-gate-off' };
  }
  if (input.isDesktop !== true) {
    return { shouldShow: false, reason: 'not-desktop' };
  }
  if (!isEmailJourneyCloudUiAllowedForChannel(input.channel || 'direct')) {
    return { shouldShow: false, reason: 'store-channel' };
  }
  if (input.firstSceneOpen === true || input.welcomeSequencePlaying === true) {
    return { shouldShow: false, reason: 'first-scene' };
  }
  if (input.focusing === true || input.sessionState === STATES.CELEBRATE) {
    return { shouldShow: false, reason: 'session-busy' };
  }
  const opt = readPracticeBackupOptIn(input.storage);
  if (opt.enabled && opt.deviceToken && opt.email) {
    return { shouldShow: false, reason: 'already-bound' };
  }
  if (!isPracticeBackupCloudWhitelistEmpty(input.storage)) {
    return { shouldShow: false, reason: 'library-not-empty' };
  }
  return { shouldShow: true };
}
