/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * H5: one short Idle greeting, stable for the local calendar day.
 * Not Quiet Line, not locale-change emotion, not Confide companion_greeting.
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const HOME_IDLE_GREETING_KEYS = Object.freeze([
  'HOME_IDLE_GREETING_1',
  'HOME_IDLE_GREETING_2',
  'HOME_IDLE_GREETING_3',
  'HOME_IDLE_GREETING_4'
]);

/**
 * @param {string} dateKey
 * @returns {number}
 */
function dayIndex(dateKey) {
  let hash = 2166136261;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % HOME_IDLE_GREETING_KEYS.length;
}

/**
 * @param {Date} [now]
 * @returns {string}
 */
export function pickHomeIdleGreetingKey(now = new Date()) {
  const dateKey = getLocalDateKey(now);
  return HOME_IDLE_GREETING_KEYS[dayIndex(dateKey)];
}
