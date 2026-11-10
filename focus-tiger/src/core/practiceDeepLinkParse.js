/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Practice deep-link query parsing (Brief: task-deep-link-shortcuts-cookbook §3).
 * Pure functions only — no UI, no fetch, no localStorage.
 */

import { MICRO_RITUAL_DURATION_OPTIONS_MINUTES } from './MicroRitual.js';
import { checkoutKindFromSearch } from './desktopCheckoutConfirm.js';

/** @typedef {'sit' | 'breath' | 'micro'} PracticeDeepLinkStart */

export const PRACTICE_DEEP_LINK_START_PARAM = 'start';
export const PRACTICE_DEEP_LINK_MIN_PARAM = 'min';

/** @type {ReadonlySet<PracticeDeepLinkStart>} */
export const PRACTICE_DEEP_LINK_START_WHITELIST = new Set(
  /** @type {PracticeDeepLinkStart[]} */ (['sit', 'breath', 'micro'])
);

/** Sit + micro share the MicroRitual duration table. */
export const PRACTICE_DEEP_LINK_SIT_MINUTES = MICRO_RITUAL_DURATION_OPTIONS_MINUTES;

/** Breath only supports one wall-clock minute in product today. */
export const PRACTICE_DEEP_LINK_BREATH_MINUTES = Object.freeze([1]);

/**
 * @typedef {{ start: PracticeDeepLinkStart, minutes: number }} PracticeDeepLinkIntent
 */

/**
 * @param {unknown} raw
 * @returns {URLSearchParams}
 */
function searchParamsFromUnknown(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return new URLSearchParams();
  const query = text.startsWith('?') ? text.slice(1) : text;
  return new URLSearchParams(query);
}

/**
 * @param {string} raw
 * @returns {number | null}
 */
function parseWhitelistMinute(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || value <= 0) return null;
  return value;
}

/**
 * @param {PracticeDeepLinkStart} start
 * @param {number} minutes
 * @returns {boolean}
 */
function minutesAllowedForStart(start, minutes) {
  if (start === 'breath') {
    return PRACTICE_DEEP_LINK_BREATH_MINUTES.includes(minutes);
  }
  return PRACTICE_DEEP_LINK_SIT_MINUTES.includes(minutes);
}

/**
 * Parse `?start=&min=` for external practice entry. Unknown or partial → `null` (discard whole link).
 *
 * @param {unknown} search Query string (`?product=1&start=sit&min=5` or bare `start=sit&min=5`).
 * @returns {PracticeDeepLinkIntent | null}
 */
export function parsePracticeDeepLink(search) {
  const params = searchParamsFromUnknown(search);
  const startRaw = params.get(PRACTICE_DEEP_LINK_START_PARAM);
  if (startRaw == null || startRaw === '') return null;

  const start = String(startRaw).trim().toLowerCase();
  if (!PRACTICE_DEEP_LINK_START_WHITELIST.has(/** @type {PracticeDeepLinkStart} */ (start))) {
    return null;
  }

  const minRaw = params.get(PRACTICE_DEEP_LINK_MIN_PARAM);
  if (minRaw == null || minRaw === '') return null;

  const minutes = parseWhitelistMinute(minRaw);
  if (minutes == null) return null;
  if (!minutesAllowedForStart(/** @type {PracticeDeepLinkStart} */ (start), minutes)) {
    return null;
  }

  return {
    start: /** @type {PracticeDeepLinkStart} */ (start),
    minutes
  };
}

/**
 * Checkout return queries take priority over practice `start`/`min` (Electron + Worker).
 *
 * @param {unknown} search
 * @returns {PracticeDeepLinkIntent | null}
 */
export function parsePracticeDeepLinkUnlessCheckout(search) {
  if (checkoutKindFromSearch(search)) return null;
  return parsePracticeDeepLink(search);
}
