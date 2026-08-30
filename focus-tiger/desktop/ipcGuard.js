/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Main-process IPC allowlists (no Electron import — unit-testable).
 */

/**
 * @param {unknown} apiPath
 * @returns {boolean}
 */
export function isAllowedCloudApiPath(apiPath) {
  if (typeof apiPath !== 'string') return false;
  if (!apiPath.startsWith('/api/')) return false;
  if (apiPath.includes('..') || apiPath.includes('\\') || apiPath.includes('\0')) {
    return false;
  }
  return true;
}

/**
 * Stripe Checkout is https. Local wrangler Stripe test pages may be http on loopback.
 *
 * @param {unknown} rawUrl
 * @returns {boolean}
 */
export function isAllowedExternalUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return false;
  try {
    const url = new URL(rawUrl);
    if (url.protocol === 'https:') return true;
    if (
      url.protocol === 'http:' &&
      (url.hostname === '127.0.0.1' || url.hostname === 'localhost')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Packaged custom-protocol origin (must stay stable for storage + CORS docs). */
export const DESKTOP_CUSTOM_ORIGIN = 'focus-tiger://app';

/** Stripe Checkout deep-link return into the Electron shell. */
export const DESKTOP_CHECKOUT_SCHEME = 'focus-tiger';

/**
 * @param {unknown} rawUrl
 * @returns {boolean}
 */
export function isDesktopCheckoutReturnUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return false;
  try {
    const url = new URL(rawUrl);
    return url.protocol === `${DESKTOP_CHECKOUT_SCHEME}:` && url.host === 'app';
  } catch {
    return false;
  }
}

/**
 * Query string from a desktop checkout return URL (`?product=1&pro_session=…`).
 *
 * @param {unknown} rawUrl
 * @returns {string}
 */
export function desktopCheckoutReturnSearch(rawUrl) {
  if (!isDesktopCheckoutReturnUrl(rawUrl)) return '';
  return new URL(String(rawUrl)).search || '';
}
