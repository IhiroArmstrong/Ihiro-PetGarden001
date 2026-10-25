/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { AWAKEN_FORBIDDEN_COPY } from './InterventionOrchestrator.js';
import {
  AWAKEN_CHECKIN_STORAGE_KEY,
  countMidCheckInsToday
} from './awakenCheckInStore.js';
import { getStorage } from '../utils/Storage.js';

export const AWAKEN_CHECKIN_MID_DAILY_MAX = 4;

export const AWAKEN_CHECKIN_LABELS = Object.freeze([
  'ease',
  'restless',
  'tired'
]);

export { AWAKEN_FORBIDDEN_COPY as AWAKEN_CHECKIN_FORBIDDEN_COPY };

function deny(reason) {
  return { show: false, reason };
}

function allow(phase) {
  return { show: true, phase };
}

/**
 * @param {object} input
 * @returns {{ show: false, reason: string } | { show: true, phase: 'mid' }}
 */
export function decideAwakenMidCheckIn(input = {}) {
  if (input.focusing !== true) return deny('not-focusing');
  if (input.inviteVisible === true) return deny('invite-visible');
  if (input.checkInVisible === true) return deny('already-visible');
  if (input.yieldBusy === true) return deny('yield-busy');
  if (input.mutationCandidate !== true) return deny('no-mutation');
  const midCount =
    typeof input.midCountToday === 'number'
      ? input.midCountToday
      : countMidCheckInsToday(getStorage(AWAKEN_CHECKIN_STORAGE_KEY, []));
  if (midCount >= AWAKEN_CHECKIN_MID_DAILY_MAX) return deny('daily-cap');
  return allow('mid');
}

/**
 * @param {object} input
 * @returns {{ show: false, reason: string } | { show: true, phase: 'end' }}
 */
export function decideAwakenEndCheckIn(input = {}) {
  if (input.reflectionOpen !== true) return deny('reflection-closed');
  if (input.endOfferedForSession === true) return deny('already-offered');
  if (input.checkInVisible === true) return deny('already-visible');
  return allow('end');
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function awakenCheckInCopyIsForbidden(text) {
  return AWAKEN_FORBIDDEN_COPY.test(String(text || ''));
}
