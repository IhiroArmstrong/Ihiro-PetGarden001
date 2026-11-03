/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Cold-start goal card — first-run seen gate + session-only choice.
 * Brief: docs/task-briefs/task-cold-start-goal-onboarding.md
 *
 * Seen flag (localStorage) prevents re-showing; choice (sessionStorage) drives
 * first-session navigation only — not a persistent profile field.
 */

export const COLD_START_GOAL_SEEN_KEY =
  'focus-tiger.cold-start-goal-seen.v1';

export const COLD_START_GOAL_SESSION_KEY =
  'focus-tiger.cold-start-goal-choice.v1';

/**
 * Bump ONLY when `COLD_START_GOAL_CHOICES` add/remove/replace an id —
 * NOT copy/i18n tweaks. Brief: task-today-direction-help-entry-and-options-version.md
 */
export const COLD_START_GOAL_OPTIONS_VERSION = 2;

/** Users who saw the card before this bump actually saw version 1. */
export const COLD_START_GOAL_OPTIONS_VERSION_BEFORE_T76 = 1;

export const COLD_START_DIRECT_SIT_HINT_KEY =
  'focus-tiger.cold-start-direct-sit-hint.v1';

export const COLD_START_DIRECT_SIT_PENDING_KEY =
  'focus-tiger.cold-start-direct-sit-pending.v1';

export const COLD_START_GOAL_OPTIONS_SEEN_KEY =
  'focus-tiger.cold-start-goal-options-seen.v1';

/** Persistent “already saw the four-choice card”. */
export const COLD_START_GOAL_RESET_LOCAL_KEYS = Object.freeze([
  COLD_START_GOAL_SEEN_KEY,
  COLD_START_GOAL_OPTIONS_SEEN_KEY,
  COLD_START_DIRECT_SIT_HINT_KEY
]);

/** This-tab choice; DEV / scenario reset must drop it with the seen flag. */
export const COLD_START_GOAL_RESET_SESSION_KEYS = Object.freeze([
  COLD_START_GOAL_SESSION_KEY,
  COLD_START_DIRECT_SIT_PENDING_KEY
]);

/** @typedef {'mindfulness' | 'breath' | 'study-work' | 'browse'} ColdStartGoalChoice */

export const COLD_START_GOAL_CHOICES = Object.freeze([
  'mindfulness',
  'breath',
  'study-work',
  'browse'
]);

/** Removed in T76. Session-only; never a profile field. */
export const COLD_START_GOAL_LEGACY_CHOICES = Object.freeze(['focus', 'calm']);

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenColdStartGoalCard(storage) {
  if (!storage?.getItem) return false;
  try {
    return storage.getItem(COLD_START_GOAL_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function markColdStartGoalSeen(storage) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(COLD_START_GOAL_SEEN_KEY, '1');
    markColdStartGoalOptionsVersionSeen(storage);
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {number}
 */
export function getSeenColdStartGoalOptionsVersion(storage) {
  if (!storage?.getItem) return 0;
  try {
    const raw = storage.getItem(COLD_START_GOAL_OPTIONS_SEEN_KEY);
    if (raw == null || raw === '') return 0;
    const parsed = Number.parseInt(String(raw), 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [version]
 * @returns {void}
 */
export function markColdStartGoalOptionsVersionSeen(
  storage,
  version = COLD_START_GOAL_OPTIONS_VERSION
) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(COLD_START_GOAL_OPTIONS_SEEN_KEY, String(version));
  } catch {
    // ignore
  }
}

/**
 * One-time: users who saw the card before options-version shipped already
 * saw v1 choices — do not show a false-positive refresh banner on deploy.
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function migrateColdStartGoalOptionsSeen(storage) {
  if (!hasSeenColdStartGoalCard(storage)) return;
  if (!storage?.getItem) return;
  try {
    if (storage.getItem(COLD_START_GOAL_OPTIONS_SEEN_KEY) != null) return;
    markColdStartGoalOptionsVersionSeen(
      storage,
      COLD_START_GOAL_OPTIONS_VERSION_BEFORE_T76
    );
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldOfferColdStartGoalOptionsRefresh(storage) {
  if (!hasSeenColdStartGoalCard(storage)) return false;
  return (
    getSeenColdStartGoalOptionsVersion(storage) <
    COLD_START_GOAL_OPTIONS_VERSION
  );
}

/**
 * First-run card offer: product shell Idle, not yet seen.
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldOfferColdStartGoalCard(storage) {
  return !hasSeenColdStartGoalCard(storage);
}

/**
 * @param {Storage | null | undefined} sessionStorage
 * @param {ColdStartGoalChoice} choice
 * @returns {void}
 */
export function setColdStartGoalSessionChoice(sessionStorage, choice) {
  if (!sessionStorage?.setItem) return;
  if (!COLD_START_GOAL_CHOICES.includes(choice)) return;
  try {
    sessionStorage.setItem(COLD_START_GOAL_SESSION_KEY, choice);
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} sessionStorage
 * @returns {ColdStartGoalChoice | null}
 */
export function getColdStartGoalSessionChoice(sessionStorage) {
  if (!sessionStorage?.getItem) return null;
  try {
    const raw = sessionStorage.getItem(COLD_START_GOAL_SESSION_KEY);
    if (COLD_START_GOAL_CHOICES.includes(raw)) return raw;
    if (COLD_START_GOAL_LEGACY_CHOICES.includes(raw)) {
      try {
        sessionStorage.removeItem(COLD_START_GOAL_SESSION_KEY);
      } catch {
        // ignore
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Remember that the sitting which just started came from the four-choice card.
 * @param {Storage | null | undefined} sessionStorage
 * @returns {void}
 */
export function markColdStartDirectSitPending(sessionStorage) {
  if (!sessionStorage?.setItem) return;
  try {
    sessionStorage.setItem(COLD_START_DIRECT_SIT_PENDING_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * One lifetime toast after a direct-sit started from the four-choice card.
 * @param {Storage | null | undefined} storage
 * @param {Storage | null | undefined} sessionStorage
 * @returns {boolean}
 */
export function consumeColdStartDirectSitHint(storage, sessionStorage) {
  let pending = false;
  try {
    pending = sessionStorage?.getItem?.(COLD_START_DIRECT_SIT_PENDING_KEY) === '1';
  } catch {
    pending = false;
  }
  if (!pending) return false;
  try {
    sessionStorage.removeItem(COLD_START_DIRECT_SIT_PENDING_KEY);
  } catch {
    // ignore
  }
  try {
    if (storage?.getItem?.(COLD_START_DIRECT_SIT_HINT_KEY) === '1') return false;
  } catch {
    return false;
  }
  try {
    storage?.setItem?.(COLD_START_DIRECT_SIT_HINT_KEY, '1');
  } catch {
    // still show once this session
  }
  return true;
}

/**
 * Map choice → existing product surface.
 * Direct sit skips Arrival. Legacy focus/calm must not navigate.
 *
 * @param {string} choice
 * @returns {
 *   | { type: 'micro-ritual', minutes: number }
 *   | { type: 'direct-sit', mode: 'stay' | 'acrossTools', minutes: number }
 *   | { type: 'browse' }
 *   | null
 * }
 */
export function resolveColdStartGoalAction(choice) {
  switch (choice) {
    case 'mindfulness':
      return { type: 'direct-sit', mode: 'stay', minutes: 10 };
    case 'breath':
      return { type: 'micro-ritual', minutes: 1 };
    case 'study-work':
      return { type: 'direct-sit', mode: 'acrossTools', minutes: 25 };
    case 'browse':
      return { type: 'browse' };
    default:
      return null;
  }
}
