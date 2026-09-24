/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Today-direction options refresh banner — evaluate only (no DOM).
 * Brief: docs/task-briefs/task-today-direction-help-entry-and-options-version.md
 */

import { isReminderBusySession } from './InAppReminderBannerController.js';
import { shouldOfferColdStartGoalOptionsRefresh } from './coldStartGoalGate.js';

/**
 * @typedef {{ shouldShow: boolean }} TodayDirectionOptionsBannerCandidate
 */

/**
 * @param {Storage | null | undefined} storage
 * @returns {TodayDirectionOptionsBannerCandidate}
 */
export function evaluateTodayDirectionOptionsRefreshBanner(storage) {
  return {
    shouldShow: shouldOfferColdStartGoalOptionsRefresh(storage)
  };
}

/**
 * Same busy windows as in-app reminder banner (2026-07-23 suppress policy).
 * @param {object} ctx
 * @param {string} [ctx.state]
 * @param {boolean} [ctx.arrivalOpen]
 * @param {boolean} [ctx.reflectionOpen]
 * @param {boolean} [ctx.microRitualOpen]
 * @returns {boolean}
 */
export function isTodayDirectionOptionsBannerBusySession(ctx = {}) {
  return isReminderBusySession(ctx);
}
