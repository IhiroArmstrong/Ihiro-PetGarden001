/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
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

/** @typedef {'focus' | 'calm' | 'study-work' | 'browse'} ColdStartGoalChoice */

export const COLD_START_GOAL_CHOICES = Object.freeze([
  'focus',
  'calm',
  'study-work',
  'browse'
]);

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
  } catch {
    // ignore
  }
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
    return COLD_START_GOAL_CHOICES.includes(raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Map choice → existing product surface (session navigation only).
 *
 * @param {ColdStartGoalChoice} choice
 * @returns {
 *   | { type: 'micro-ritual', minutes: number }
 *   | { type: 'companion' }
 *   | { type: 'browse' }
 *   | null
 * }
 */
export function resolveColdStartGoalAction(choice) {
  switch (choice) {
    case 'focus':
      return { type: 'micro-ritual', minutes: 1 };
    case 'calm':
      return { type: 'companion' };
    case 'study-work':
      return { type: 'micro-ritual', minutes: 20 };
    case 'browse':
      return { type: 'browse' };
    default:
      return null;
  }
}
