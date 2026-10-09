/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * In-app practice reminder menu asks (⋯ → Preferences → Reminder).
 * Not stretch nudges, not companion away reminders, not emotional nagging.
 */

import { normalizeConfideIntentText } from './confideBoundaryRespect.js';

const REMINDER_FEATURE_RES = Object.freeze([
  /\bremind(?:er)?s?\b/i,
  /\bpractice\s+reminder\b/i,
  /\bdaily\s+(?:practice\s+)?reminder\b/i,
  /\bturn\s+on\s+reminders?\b/i,
  /\bset\s+(?:a\s+)?(?:daily\s+)?reminder\b/i,
  /提醒我(?:练习|同坐|练|一下)?/,
  /提醒.*(?:在哪|怎么|如何|设|开|时间|开关)/,
  /(?:怎么|如何).{0,8}提醒/,
  /什么时候提醒你/,
  /提醒从哪开/,
  /练习提醒/
]);

const REMINDER_FEATURE_EXCLUDE_RES = Object.freeze([
  /away\s+reminders?\s+stay\s+off/i,
  /不想被催/,
  /别催我/,
  /stretch/i,
  /舒展/
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideReminderFeatureQuestion(text) {
  const raw = normalizeConfideIntentText(text).replace(/\s+/g, ' ').trim();
  if (!raw) return false;
  const compact = raw.replace(/\s+/g, '');
  if (REMINDER_FEATURE_EXCLUDE_RES.some((re) => re.test(raw) || re.test(compact))) {
    return false;
  }
  return REMINDER_FEATURE_RES.some((re) => re.test(raw) || re.test(compact));
}
