/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Track external Stripe Checkout opened from Electron so we can resume confirm
 * when the shell regains focus (deep link may arrive slightly later).
 */

import { isDesktopShellRuntime } from './desktopShell.js';

export const DESKTOP_CHECKOUT_PENDING_STORAGE_KEY =
  'focus-tiger.desktop-checkout-pending.v1';

/** @typedef {'pro' | 'companion-addon'} DesktopCheckoutKind */

const PENDING_MAX_MS = 2 * 60 * 60 * 1000;

/**
 * @param {DesktopCheckoutKind} kind
 * @param {string} [sessionId] Stripe Checkout Session id (`cs_…`) when known.
 * @param {() => Date} [now]
 */
export function markDesktopCheckoutPending(kind, sessionId = '', now = () => new Date()) {
  if (!isDesktopShellRuntime()) return;
  const id =
    typeof sessionId === 'string' && sessionId.startsWith('cs_')
      ? sessionId.trim()
      : null;
  try {
    sessionStorage.setItem(
      DESKTOP_CHECKOUT_PENDING_STORAGE_KEY,
      JSON.stringify({ kind, startedAt: now().toISOString(), sessionId: id })
    );
  } catch {
    // ignore quota / privacy mode
  }
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
    const sessionId =
      typeof parsed?.sessionId === 'string' && parsed.sessionId.startsWith('cs_')
        ? parsed.sessionId
        : null;
    if (kind !== 'pro' && kind !== 'companion-addon') {
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
