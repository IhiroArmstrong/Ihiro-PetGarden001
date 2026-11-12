/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** PO 2026-11-12: self-hosted generic feed on Cloudflare R2. */
export const CANONICAL_UPDATE_FEED_HOST = 'updates.twinsology.com';

/** Trailing slash required by electron-updater generic provider. */
export const CANONICAL_UPDATE_FEED_URL = 'https://updates.twinsology.com/';

/**
 * @param {string} raw
 * @param {{ requireNonEmpty?: boolean }} [opts]
 * @returns {{ ok: true, url: string } | { ok: false, error: string }}
 */
export function evaluateUpdateFeedUrl(raw, opts = {}) {
  const requireNonEmpty = opts.requireNonEmpty !== false;
  const trimmed = String(raw || '').trim();
  if (!trimmed) {
    if (requireNonEmpty) {
      return {
        ok: false,
        error: 'FT_UPDATE_FEED_URL must be a non-empty https URL'
      };
    }
    return { ok: true, url: '' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: 'FT_UPDATE_FEED_URL must be a valid URL' };
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, error: 'FT_UPDATE_FEED_URL must use https' };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: 'FT_UPDATE_FEED_URL must not include credentials' };
  }
  if (parsed.hostname !== CANONICAL_UPDATE_FEED_HOST) {
    return {
      ok: false,
      error: `FT_UPDATE_FEED_URL host must be ${CANONICAL_UPDATE_FEED_HOST}`
    };
  }
  if (parsed.search || parsed.hash) {
    return {
      ok: false,
      error: 'FT_UPDATE_FEED_URL must not include query or hash'
    };
  }

  const pathname = parsed.pathname || '/';
  const withSlash = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return { ok: true, url: `https://${CANONICAL_UPDATE_FEED_HOST}${withSlash}` };
}

/**
 * Packaged Mac builds always use the canonical host unless env overrides
 * with another valid URL on that host. Unpackaged / Vite keeps empty env
 * so developers do not hit the update bucket.
 *
 * @param {Record<string, string | undefined>} [env]
 * @param {{ isPackaged?: boolean }} [opts]
 * @returns {string}
 */
export function resolveUpdaterFeedUrl(env = {}, opts = {}) {
  const fromEnv = String(env.FT_UPDATE_FEED_URL || '').trim();
  if (fromEnv) {
    const checked = evaluateUpdateFeedUrl(fromEnv, { requireNonEmpty: true });
    return checked.ok ? checked.url : '';
  }
  if (opts.isPackaged) return CANONICAL_UPDATE_FEED_URL;
  return '';
}
