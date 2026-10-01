/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Session-scoped toast when background presence polling cannot reach the cloud.
 * Covers Quiet Together lanterns and Focus Circle member presence (shared failure mode).
 */

import { getCloudApiBaseUrl } from './cloudApiClient.js';
import {
  isFocusCircleClientEnabled,
  readFocusCircleMembership
} from './focusCircleMembership.js';
import { isQuietTogetherEnabled } from './quietTogetherPreference.js';

export const CLOUD_PRESENCE_HINT_SESSION_KEY = 'focus-tiger.cloud-presence-hint.v1';
export const CLOUD_PRESENCE_NETWORK_FAILURE_THRESHOLD = 2;

let consecutiveNetworkFailures = 0;
/** @type {(() => void) | null} */
let notifyFn = null;
/** @type {() => boolean} */
let isIdleProbe = () => true;

/**
 * @param {() => void} fn
 */
export function setCloudPresenceDegradedHintNotifier(fn) {
  notifyFn = typeof fn === 'function' ? fn : null;
}

/**
 * @param {() => boolean} fn
 */
export function setCloudPresenceDegradedHintIdleProbe(fn) {
  isIdleProbe = typeof fn === 'function' ? fn : () => true;
}

export function resetCloudPresenceDegradedHintForTests() {
  consecutiveNetworkFailures = 0;
  notifyFn = null;
  isIdleProbe = () => true;
}

/**
 * @param {string} [search]
 * @returns {boolean}
 */
function readQuietTogetherOptOut(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get('quietTogether');
    return value === '0' || value === 'false';
  } catch {
    return false;
  }
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.search]
 * @param {() => string} [opts.getBaseUrl]
 * @returns {boolean}
 */
export function isCloudPresenceFeatureRelevant({
  storage = globalThis.localStorage,
  search = globalThis.location?.search ?? '',
  getBaseUrl = getCloudApiBaseUrl
} = {}) {
  const cloudBaseUrl = getBaseUrl();
  if (!cloudBaseUrl) return false;
  const quietTogether =
    !readQuietTogetherOptOut(search) && isQuietTogetherEnabled(storage);
  const circle =
    isFocusCircleClientEnabled({ search, cloudBaseUrl }) &&
    Boolean(readFocusCircleMembership(storage));
  return quietTogether || circle;
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.sessionStorage]
 * @returns {{ notified: boolean, reason?: string }}
 */
function maybeShowCloudPresenceDegradedHint(opts = {}) {
  const sessionStorage =
    opts.sessionStorage ??
    (typeof globalThis !== 'undefined' ? globalThis.sessionStorage : null);
  if (sessionStorage?.getItem(CLOUD_PRESENCE_HINT_SESSION_KEY) === '1') {
    return { notified: false, reason: 'already_shown' };
  }
  if (!isIdleProbe()) {
    return { notified: false, reason: 'not_idle' };
  }
  if (!notifyFn) {
    return { notified: false, reason: 'no_notifier' };
  }
  sessionStorage?.setItem(CLOUD_PRESENCE_HINT_SESSION_KEY, '1');
  notifyFn();
  return { notified: true };
}

export function noteCloudPresenceNetworkSuccess() {
  consecutiveNetworkFailures = 0;
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.search]
 * @param {() => string} [opts.getBaseUrl]
 * @param {Storage | null} [opts.sessionStorage]
 * @returns {{ notified: boolean, reason?: string }}
 */
export function noteCloudPresenceNetworkFailure(opts = {}) {
  if (!isCloudPresenceFeatureRelevant(opts)) {
    return { notified: false, reason: 'not_relevant' };
  }
  consecutiveNetworkFailures += 1;
  if (consecutiveNetworkFailures < CLOUD_PRESENCE_NETWORK_FAILURE_THRESHOLD) {
    return { notified: false, reason: 'below_threshold' };
  }
  return maybeShowCloudPresenceDegradedHint(opts);
}
