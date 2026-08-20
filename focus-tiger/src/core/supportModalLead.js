/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Support Modal lead-card policy.
 *
 * Visitors who have never recorded a practice completion (timed Focus,
 * Honesty check-in, or Breath / micro-ritual) see Buy a Tea first, with
 * Suggested on the tea card. After any recorded completion the layout is
 * permanently the current default (Sanctuary first + Suggested).
 *
 * Reuse lotus-pond lifetime minutes ∪ practice-days entries (same write
 * hook). Do not use DailyCompletionStore (today-only) or in-memory
 * hasEndedAnySession (also set on incomplete Rise).
 *
 * @see docs/task-briefs/task-support-modal-tea-first.md
 */

/**
 * @typedef {{
 *   lifetimeMinutes?: number,
 *   practicedDayCount?: number
 * }} SupportModalPracticeSummary
 */

/**
 * @param {SupportModalPracticeSummary} [summary]
 * @returns {boolean}
 */
export function hasRecordedAnyPractice(summary = {}) {
  const minutes = Number(summary.lifetimeMinutes) || 0;
  const days = Number(summary.practicedDayCount) || 0;
  return minutes > 0 || days > 0;
}

/**
 * @param {SupportModalPracticeSummary} [summary]
 * @returns {boolean}
 */
export function shouldLeadSupportModalWithTea(summary = {}) {
  return !hasRecordedAnyPractice(summary);
}

export const SUPPORT_MODAL_CARD_ORDER_TEA_FIRST = Object.freeze([
  'yin-support-tea-card',
  'yin-support-sanctuary-card',
  'yin-support-membership-card'
]);

export const SUPPORT_MODAL_CARD_ORDER_DEFAULT = Object.freeze([
  'yin-support-sanctuary-card',
  'yin-support-membership-card',
  'yin-support-tea-card'
]);

/**
 * @param {boolean} leadWithTea
 * @returns {readonly string[]}
 */
export function supportModalCardOrder(leadWithTea) {
  return leadWithTea
    ? SUPPORT_MODAL_CARD_ORDER_TEA_FIRST
    : SUPPORT_MODAL_CARD_ORDER_DEFAULT;
}

/**
 * @param {boolean} leadWithTea
 * @returns {'tea' | 'sanctuary'}
 */
export function supportModalSuggestedHost(leadWithTea) {
  return leadWithTea ? 'tea' : 'sanctuary';
}
