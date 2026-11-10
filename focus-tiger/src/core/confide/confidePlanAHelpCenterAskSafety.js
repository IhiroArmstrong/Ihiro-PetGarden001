/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Plan A §6 · Help Center ask box crisis lines surface T92 (same copy as blocked Confide open).
 */

import { confideOpenBlockedUserMessage } from './confideOpenBlockedFeedback.js';

/** Playwright / e2e anchor for Help Center crisis ask feedback. */
export const HELP_CENTER_ASK_SAFETY_T92_TESTID = 'help-center-ask-safety-t92';

/**
 * @param {string} [locale]
 * @returns {string}
 */
export function helpCenterAskSafetyT92Message(locale = 'en') {
  return confideOpenBlockedUserMessage(locale);
}
