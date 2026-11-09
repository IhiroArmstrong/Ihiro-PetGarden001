/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * When Confide cannot open (mount off, busy, etc.), user-facing feedback must
 * still surface T92 crisis resource guidance — never silent return.
 */

import { formatConfideSafetyResourceGuidance } from './confideSafetyResources.js';

/** Playwright / e2e anchor for blocked-open toast. */
export const CONFIDE_OPEN_BLOCKED_TOAST_TESTID = 'confide-open-blocked-safety-help';

/**
 * @param {string} [locale]
 * @returns {string}
 */
export function confideOpenBlockedUserMessage(locale = 'en') {
  return formatConfideSafetyResourceGuidance(locale).trim();
}
