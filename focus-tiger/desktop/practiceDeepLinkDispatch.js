/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Electron `open-url` classifier (Brief C): checkout first, then practice whitelist, else discard.
 * No fetch. No Sit apply (that is Web B).
 */

import {
  DESKTOP_CUSTOM_ORIGIN,
  desktopCheckoutReturnSearch,
  isDesktopCheckoutReturnUrl
} from './ipcGuard.js';
import { isCheckoutReturnSearch } from '../src/core/paymentCheckoutThanks.js';
import {
  PRACTICE_DEEP_LINK_START_PARAM,
  parsePracticeDeepLink
} from '../src/core/practiceDeepLinkParse.js';

/** @typedef {'foreign' | 'checkout' | 'practice' | 'discard' | 'open'} DesktopDeepLinkKind */

/**
 * @param {unknown} rawUrl
 * @returns {{
 *   kind: DesktopDeepLinkKind,
 *   search: string,
 *   intent?: { start: string, minutes: number }
 * }}
 */
export function classifyDesktopDeepLink(rawUrl) {
  if (!isDesktopCheckoutReturnUrl(rawUrl)) {
    return { kind: 'foreign', search: '' };
  }
  const search = desktopCheckoutReturnSearch(rawUrl);
  if (isCheckoutReturnSearch(search)) {
    return { kind: 'checkout', search };
  }
  const intent = parsePracticeDeepLink(search);
  if (intent) {
    return { kind: 'practice', search, intent };
  }
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const startRaw = params.get(PRACTICE_DEEP_LINK_START_PARAM);
  if (startRaw != null && String(startRaw).trim() !== '') {
    return { kind: 'discard', search };
  }
  return { kind: 'open', search };
}

/**
 * @param {string} search
 * @param {{ isDev?: boolean }} [opts]
 * @returns {string}
 */
export function desktopPracticeLoadUrl(search, opts = {}) {
  const qs = String(search || '').replace(/^\?/, '');
  if (opts.isDev) {
    return `http://127.0.0.1:5173/?${qs}`;
  }
  return `${DESKTOP_CUSTOM_ORIGIN}/index.html?${qs}`;
}
