/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T63 — read-only co-practice contract rows for Growth Journey detail.
 * No new storage keys; mirrors existing reminder / work-end / T58 / T54 prefs.
 */

import { getLocalDateKey } from '../utils/localDate.js';
import { getReminderPreference } from './reminderPreference.js';
import { getWorkEndPreference } from './workEndPreference.js';
import { hasT54ResearchConsent } from './t54ResearchLedger.js';
import { INVITE_OUTCOME_KINDS } from './inviteOutcomeStore.js';
import {
  YIN_ADAPTATION_STORAGE_KEY,
  normalizeYinAdaptationState,
  readYinAdaptationState
} from './yinAdaptationStore.js';

/** @typedef {'reminder' | 'work-end' | 'privacy'} CoPracticeContractAction */

/**
 * @typedef {{
 *   id: string,
 *   labelKey: string,
 *   status: { key: string, params?: Record<string, string> },
 *   action: CoPracticeContractAction | null,
 *   actionKey: string | null,
 *   hintKey: string | null
 * }} CoPracticeContractRow
 */

export const CO_PRACTICE_CONTRACT_ROW_IDS = Object.freeze({
  FOCUS_INVITE: 'focus-invite',
  DAILY_REMINDER: 'daily-reminder',
  WORK_END: 'work-end',
  RESEARCH: 'research-share',
  ADAPTATION: 'adaptation-note'
});

/**
 * @param {{ hour: number, minute: number }} pref
 * @returns {string}
 */
export function formatCoPracticeClockTime(pref) {
  const h = String(pref.hour).padStart(2, '0');
  const m = String(pref.minute).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {ReturnType<typeof normalizeYinAdaptationState>}
 */
function readAdaptationStateFromStorage(storage) {
  if (!storage) return readYinAdaptationState();
  try {
    const raw = storage.getItem(YIN_ADAPTATION_STORAGE_KEY);
    return normalizeYinAdaptationState(raw ? JSON.parse(raw) : null);
  } catch {
    return readYinAdaptationState();
  }
}

/**
 * @param {ReturnType<typeof normalizeYinAdaptationState>} state
 * @param {number} now
 * @returns {number | null}
 */
function maxActiveInvitePauseUntilState(state, now) {
  let max = 0;
  for (const kind of [
    INVITE_OUTCOME_KINDS.AWAY,
    INVITE_OUTCOME_KINDS.EXTEND,
    INVITE_OUTCOME_KINDS.LONG_SIT
  ]) {
    const bucket = state.kindState[kind];
    const until = Number(bucket?.pausedUntil) || 0;
    if (until > now) max = Math.max(max, until);
  }
  return max > now ? max : null;
}

/**
 * @param {number} now
 * @param {Storage | null | undefined} [storage]
 * @returns {number | null}
 */
export function maxActiveInvitePauseUntil(now, storage) {
  const state = readAdaptationStateFromStorage(storage);
  return maxActiveInvitePauseUntilState(state, now);
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {number} [opts.now]
 * @returns {CoPracticeContractRow[]}
 */
export function buildCoPracticeContractRows(opts = {}) {
  const storage = opts.storage ?? null;
  const now = Number(opts.now) || Date.now();
  const adaptationState = readAdaptationStateFromStorage(storage);
  const adaptationEnabled = adaptationState.enabled !== false;
  const pauseUntil = maxActiveInvitePauseUntilState(adaptationState, now);

  /** @type {CoPracticeContractRow} */
  const focusInvite = {
    id: CO_PRACTICE_CONTRACT_ROW_IDS.FOCUS_INVITE,
    labelKey: 'CO_PRACTICE_CONTRACT_ROW_FOCUS_INVITE',
    status: { key: 'CO_PRACTICE_CONTRACT_STATUS_ON' },
    action: null,
    actionKey: null,
    hintKey: null
  };
  if (!adaptationEnabled) {
    focusInvite.status = {
      key: 'CO_PRACTICE_CONTRACT_STATUS_INVITE_QUIET'
    };
  } else if (pauseUntil != null) {
    focusInvite.status = {
      key: 'CO_PRACTICE_CONTRACT_STATUS_PAUSED',
      params: { date: getLocalDateKey(new Date(pauseUntil)) }
    };
  }

  const reminderPref = getReminderPreference({ storage });
  /** @type {CoPracticeContractRow} */
  const dailyReminder = {
    id: CO_PRACTICE_CONTRACT_ROW_IDS.DAILY_REMINDER,
    labelKey: 'CO_PRACTICE_CONTRACT_ROW_DAILY_REMINDER',
    status: reminderPref
      ? {
          key: 'CO_PRACTICE_CONTRACT_STATUS_AT_TIME',
          params: { time: formatCoPracticeClockTime(reminderPref) }
        }
      : { key: 'CO_PRACTICE_CONTRACT_STATUS_OFF' },
    action: 'reminder',
    actionKey: 'CO_PRACTICE_CONTRACT_ACTION_CHANGE',
    hintKey: null
  };

  const workEndPref = getWorkEndPreference({ storage });
  /** @type {CoPracticeContractRow} */
  const workEnd = {
    id: CO_PRACTICE_CONTRACT_ROW_IDS.WORK_END,
    labelKey: 'CO_PRACTICE_CONTRACT_ROW_WORK_END',
    status: workEndPref
      ? {
          key: 'CO_PRACTICE_CONTRACT_STATUS_AT_TIME',
          params: { time: formatCoPracticeClockTime(workEndPref) }
        }
      : { key: 'CO_PRACTICE_CONTRACT_STATUS_OFF' },
    action: 'work-end',
    actionKey: 'CO_PRACTICE_CONTRACT_ACTION_CHANGE',
    hintKey: null
  };

  const researchOn = hasT54ResearchConsent(storage);
  /** @type {CoPracticeContractRow} */
  const research = {
    id: CO_PRACTICE_CONTRACT_ROW_IDS.RESEARCH,
    labelKey: 'CO_PRACTICE_CONTRACT_ROW_RESEARCH',
    status: {
      key: researchOn
        ? 'CO_PRACTICE_CONTRACT_STATUS_ON'
        : 'CO_PRACTICE_CONTRACT_STATUS_OFF'
    },
    action: 'privacy',
    actionKey: 'CO_PRACTICE_CONTRACT_ACTION_PRIVACY',
    hintKey: null
  };

  /** @type {CoPracticeContractRow} */
  const adaptation = {
    id: CO_PRACTICE_CONTRACT_ROW_IDS.ADAPTATION,
    labelKey: 'CO_PRACTICE_CONTRACT_ROW_ADAPTATION',
    status: {
      key: adaptationEnabled
        ? 'CO_PRACTICE_CONTRACT_STATUS_ON'
        : 'CO_PRACTICE_CONTRACT_STATUS_OFF'
    },
    action: null,
    actionKey: null,
    hintKey: 'CO_PRACTICE_CONTRACT_ADAPTATION_SWITCH_ABOVE'
  };

  return [focusInvite, dailyReminder, workEnd, research, adaptation];
}
