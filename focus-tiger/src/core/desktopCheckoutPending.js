/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Track external Stripe Checkout opened from Electron so we can confirm in
 * this shell's storage even if Stripe's success_url opens Safari.
 */

import { isDesktopShellRuntime } from './desktopShell.js';

export const DESKTOP_CHECKOUT_PENDING_STORAGE_KEY =
  'focus-tiger.desktop-checkout-pending.v1';

export const DESKTOP_CHECKOUT_KINDS = Object.freeze([
  'pro',
  'companion-addon',
  'sanctuary',
  'membership',
  'tea'
]);

/** @typedef {'pro' | 'companion-addon' | 'sanctuary' | 'membership' | 'tea'} DesktopCheckoutKind */

const PENDING_MAX_MS = 2 * 60 * 60 * 1000;

/**
 * @param {unknown} kind
 * @returns {kind is DesktopCheckoutKind}
 */
export function isDesktopCheckoutKind(kind) {
  return DESKTOP_CHECKOUT_KINDS.includes(/** @type {string} */ (kind));
}

/**
 * Stripe Checkout Session ids (`cs_test_…` / `cs_live_…`) from API body or hosted URL.
 *
 * @param {unknown} raw
 * @returns {string}
 */
export function stripeCheckoutSessionIdFromValue(raw) {
  const m = String(raw || '').match(/\bcs_(?:test_|live_)[A-Za-z0-9_]+/);
  return m ? m[0] : '';
}

/**
 * @param {DesktopCheckoutKind} kind
 * @param {string | (() => Date)} [sessionIdOrNow]
 * @param {() => Date} [now]
 */
export function markDesktopCheckoutPending(
  kind,
  sessionIdOrNow = '',
  now = () => new Date()
) {
  if (!isDesktopShellRuntime()) return;
  let sessionId = '';
  let clock = now;
  if (typeof sessionIdOrNow === 'function') {
    clock = sessionIdOrNow;
  } else {
    sessionId = sessionIdOrNow;
  }
  const id = stripeCheckoutSessionIdFromValue(sessionId) || null;
  try {
    sessionStorage.setItem(
      DESKTOP_CHECKOUT_PENDING_STORAGE_KEY,
      JSON.stringify({ kind, startedAt: clock().toISOString(), sessionId: id })
    );
  } catch {
    // ignore quota / privacy mode
  }
}

/**
 * Capture session id from create-checkout JSON (`sessionId` and/or Stripe URL).
 *
 * @param {DesktopCheckoutKind} kind
 * @param {unknown} createResult
 */
export function noteDesktopCheckoutOpened(kind, createResult = null) {
  if (!isDesktopCheckoutKind(kind)) return;
  const url =
    createResult &&
    typeof createResult === 'object' &&
    typeof /** @type {{ url?: unknown }} */ (createResult).url === 'string'
      ? /** @type {{ url: string }} */ (createResult).url
      : typeof createResult === 'string'
        ? createResult
        : '';
  const fromBody =
    createResult &&
    typeof createResult === 'object' &&
    typeof /** @type {{ sessionId?: unknown }} */ (createResult).sessionId ===
      'string'
      ? /** @type {{ sessionId: string }} */ (createResult).sessionId
      : '';
  markDesktopCheckoutPending(
    kind,
    stripeCheckoutSessionIdFromValue(fromBody) ||
      stripeCheckoutSessionIdFromValue(url)
  );
}

export function clearDesktopCheckoutPending() {
  try {
    sessionStorage.removeItem(DESKTOP_CHECKOUT_PENDING_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * @param {() => Date} [now]
 * @returns {{ kind: DesktopCheckoutKind, startedAt: string, sessionId: string | null } | null}
 */
export function readDesktopCheckoutPending(now = () => new Date()) {
  try {
    const raw = sessionStorage.getItem(DESKTOP_CHECKOUT_PENDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const kind = parsed?.kind;
    const startedAt =
      typeof parsed?.startedAt === 'string' ? parsed.startedAt : '';
    const sessionId = stripeCheckoutSessionIdFromValue(parsed?.sessionId) || null;
    if (!isDesktopCheckoutKind(kind)) {
      clearDesktopCheckoutPending();
      return null;
    }
    const startedMs = Date.parse(startedAt);
    if (!startedAt || Number.isNaN(startedMs)) {
      clearDesktopCheckoutPending();
      return null;
    }
    if (now().getTime() - startedMs > PENDING_MAX_MS) {
      clearDesktopCheckoutPending();
      return null;
    }
    return { kind, startedAt, sessionId };
  } catch {
    clearDesktopCheckoutPending();
    return null;
  }
}
