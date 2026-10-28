/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T61 — user-set work-end time (local only). Separate from reminder-preference.
 */

import { getLocalDateKey } from '../utils/localDate.js';
import { isAtOrPastReminderTime } from './reminderPreference.js';

/** @typedef {{ hour: number, minute: number }} WorkEndTimePreference */

export const WORK_END_PREFERENCE_STORAGE_KEY =
  'focus-tiger.work-end-preference.v1';

export const WORK_END_INVITE_DAY_STORAGE_KEY =
  'focus-tiger.work-end-invite-day.v1';

export const WORK_END_INVITE_PROMPT_KEY = 'WORK_END_INVITE_PROMPT';
export const WORK_END_INVITE_YES_KEY = 'WORK_END_INVITE_YES';
export const WORK_END_INVITE_NOT_NOW_KEY = 'WORK_END_INVITE_NOT_NOW';
export const WORK_END_PANEL_TITLE_KEY = 'WORK_END_PANEL_TITLE';
export const WORK_END_ENABLE_LABEL_KEY = 'WORK_END_ENABLE_LABEL';
export const WORK_END_DAILY_BLURB_KEY = 'WORK_END_DAILY_BLURB';

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} value
 * @returns {WorkEndTimePreference | null}
 */
export function normalizeWorkEndPreference(value) {
  if (!value || typeof value !== 'object') return null;
  const hour = Number(/** @type {{ hour?: unknown }} */ (value).hour);
  const minute = Number(/** @type {{ minute?: unknown }} */ (value).minute);
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return { hour, minute };
}

/**
 * @param {object} [options]
 * @param {Storage | null} [options.storage]
 * @param {string} [options.storageKey]
 * @returns {WorkEndTimePreference | null}
 */
export function getWorkEndPreference({
  storage = getDefaultStorage(),
  storageKey = WORK_END_PREFERENCE_STORAGE_KEY
} = {}) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey);
    if (raw == null) return null;
    return normalizeWorkEndPreference(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * @param {WorkEndTimePreference | null} preference
 * @param {object} [options]
 * @returns {boolean}
 */
export function setWorkEndPreference(
  preference,
  {
    storage = getDefaultStorage(),
    storageKey = WORK_END_PREFERENCE_STORAGE_KEY
  } = {}
) {
  if (!storage) return false;
  if (preference == null) {
    try {
      storage.removeItem(storageKey);
      return true;
    } catch {
      return false;
    }
  }
  const normalized = normalizeWorkEndPreference(preference);
  if (!normalized) return false;
  try {
    storage.setItem(storageKey, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {WorkEndTimePreference} preference
 * @returns {string}
 */
export function formatWorkEndClock(preference) {
  const h = String(preference.hour).padStart(2, '0');
  const m = String(preference.minute).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * @param {Date} now
 * @returns {string}
 */
export function formatWorkEndNowClock(now) {
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * @param {string} template
 * @param {WorkEndTimePreference} preference
 * @param {Date} now
 * @returns {string}
 */
export function fillWorkEndInvitePrompt(template, preference, now) {
  return String(template || '')
    .replace(/\{\{target\}\}/g, formatWorkEndClock(preference))
    .replace(/\{\{now\}\}/g, formatWorkEndNowClock(now));
}

/**
 * @param {object} [options]
 * @returns {string | null} local date key when invite was shown, else null
 */
export function getWorkEndInviteShownDateKey({
  storage = getDefaultStorage(),
  storageKey = WORK_END_INVITE_DAY_STORAGE_KEY
} = {}) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.dateKey === 'string' ? parsed.dateKey : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} dateKey
 * @param {object} [options]
 * @returns {boolean}
 */
export function markWorkEndInviteShownForDate(
  dateKey,
  {
    storage = getDefaultStorage(),
    storageKey = WORK_END_INVITE_DAY_STORAGE_KEY
  } = {}
) {
  if (!storage || !dateKey) return false;
  try {
    storage.setItem(storageKey, JSON.stringify({ dateKey }));
    return true;
  } catch {
    return false;
  }
}

/**
 * @typedef {{ shouldShow: boolean, reason?: string }} WorkEndInviteCandidate
 */

/**
 * @param {object} [options]
 * @param {() => Date} [options.now]
 * @param {Storage | null} [options.storage]
 * @param {boolean} [options.focusing]
 * @param {boolean} [options.sessionBusy]
 * @param {boolean} [options.inviteVisible]
 * @param {boolean} [options.adaptationPaused]
 * @returns {WorkEndInviteCandidate}
 */
export function evaluateWorkEndInvite({
  now = () => new Date(),
  storage = getDefaultStorage(),
  focusing = false,
  sessionBusy = false,
  inviteVisible = false,
  adaptationPaused = false
} = {}) {
  const preference = getWorkEndPreference({ storage });
  if (!preference) return { shouldShow: false, reason: 'no-preference' };
  if (focusing) return { shouldShow: false, reason: 'focusing' };
  if (sessionBusy) return { shouldShow: false, reason: 'session-busy' };
  if (inviteVisible) return { shouldShow: false, reason: 'already-visible' };
  if (adaptationPaused) return { shouldShow: false, reason: 'adaptation-pause' };

  const current = now();
  if (!isAtOrPastReminderTime(current, preference)) {
    return { shouldShow: false, reason: 'before-time' };
  }

  const todayKey = getLocalDateKey(current);
  const shownKey = getWorkEndInviteShownDateKey({ storage });
  if (shownKey === todayKey) {
    return { shouldShow: false, reason: 'daily-cap' };
  }

  return { shouldShow: true };
}
