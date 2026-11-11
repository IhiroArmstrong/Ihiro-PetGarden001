/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T93 D4 — one-time post-sit email restore prompt (forever-dismiss).
 */

import { STATES } from '../StateManager.js';
import { practiceBackupCloudEnabled } from './practiceBackupCloudEnabled.js';
import { readPracticeBackupOptIn } from './practiceBackupOptIn.js';
import { isEmailJourneyCloudUiAllowedForChannel } from './emailJourneyRestoreStatus.js';

export const EMAIL_JOURNEY_SIT_COMPLETE_PROMPT_KEY =
  'focus-tiger.email-journey-sit-complete-prompt.v1';

/**
 * @param {unknown} storage
 * @returns {Storage | null}
 */
function resolveStorage(storage) {
  if (storage) return /** @type {Storage} */ (storage);
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw
 * @returns {{ dismissed: boolean }}
 */
export function normalizeEmailJourneySitCompletePromptState(raw) {
  if (!raw || typeof raw !== 'object') return { dismissed: false };
  return {
    dismissed: /** @type {{ dismissed?: unknown }} */ (raw).dismissed === true
  };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readEmailJourneySitCompletePromptState(storage) {
  const store = resolveStorage(storage);
  if (!store?.getItem) {
    return normalizeEmailJourneySitCompletePromptState(null);
  }
  try {
    const raw = store.getItem(EMAIL_JOURNEY_SIT_COMPLETE_PROMPT_KEY);
    if (!raw) return normalizeEmailJourneySitCompletePromptState(null);
    return normalizeEmailJourneySitCompletePromptState(JSON.parse(raw));
  } catch {
    return normalizeEmailJourneySitCompletePromptState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function recordEmailJourneySitCompletePromptDismiss(storage) {
  const store = resolveStorage(storage);
  if (!store?.setItem) return false;
  try {
    store.setItem(
      EMAIL_JOURNEY_SIT_COMPLETE_PROMPT_KEY,
      JSON.stringify({ dismissed: true })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {object} [input]
 * @param {Storage | null} [input.storage]
 * @param {boolean} [input.hasQualifiedPractice]
 * @param {boolean} [input.focusing]
 * @param {boolean} [input.sessionBusy]
 * @param {boolean} [input.inviteVisible]
 * @param {boolean} [input.otherPostSitInviteVisible]
 * @param {boolean} [input.coldStartGoalOpen]
 * @param {boolean} [input.postSessionOverlayActive]
 * @param {boolean} [input.completionPending]
 * @param {boolean} [input.supportModalOpen]
 * @param {string} [input.sessionState]
 * @param {string} [input.channel]
 */
export function evaluateEmailJourneySitCompletePrompt(input = {}) {
  if (!practiceBackupCloudEnabled) {
    return { shouldShow: false, reason: 'cloud-gate-off' };
  }
  if (!isEmailJourneyCloudUiAllowedForChannel(input.channel || 'direct')) {
    return { shouldShow: false, reason: 'store-channel' };
  }
  const storage = resolveStorage(input.storage);
  const opt = readPracticeBackupOptIn(storage);
  if (opt.enabled && opt.deviceToken && opt.email) {
    return { shouldShow: false, reason: 'already-bound' };
  }
  if (readEmailJourneySitCompletePromptState(storage).dismissed) {
    return { shouldShow: false, reason: 'dismissed' };
  }
  if (input.hasQualifiedPractice !== true) {
    return { shouldShow: false, reason: 'no-qualified-practice' };
  }
  if (input.focusing === true) {
    return { shouldShow: false, reason: 'focusing' };
  }
  if (input.sessionState === STATES.CELEBRATE) {
    return { shouldShow: false, reason: 'celebrate' };
  }
  if (input.completionPending === true) {
    return { shouldShow: false, reason: 'completion-pending' };
  }
  if (input.postSessionOverlayActive === true) {
    return { shouldShow: false, reason: 'post-session' };
  }
  if (input.sessionBusy === true) {
    return { shouldShow: false, reason: 'session-busy' };
  }
  if (input.coldStartGoalOpen === true) {
    return { shouldShow: false, reason: 'cold-start-goal' };
  }
  if (input.supportModalOpen === true) {
    return { shouldShow: false, reason: 'support-modal' };
  }
  if (input.otherPostSitInviteVisible === true) {
    return { shouldShow: false, reason: 'other-post-sit' };
  }
  return { shouldShow: true };
}
