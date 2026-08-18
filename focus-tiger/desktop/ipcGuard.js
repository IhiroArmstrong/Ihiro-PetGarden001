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
