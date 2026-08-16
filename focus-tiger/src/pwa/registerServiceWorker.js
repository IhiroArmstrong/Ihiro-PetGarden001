/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Register the network-only service worker (production only).
 * Never register under Vite dev — SW would fight HMR.
 *
 * @param {{
 *   isProd?: boolean,
 *   register?: ((url: string) => Promise<unknown>) | null,
 * }} [options]
 * @returns {Promise<unknown | null>}
 */
export function registerServiceWorker(options = {}) {
  const isProd =
    typeof options.isProd === 'boolean'
      ? options.isProd
      : Boolean(import.meta.env?.PROD);
  const register =
    options.register !== undefined
      ? options.register
      : typeof navigator !== 'undefined' && navigator.serviceWorker
        ? (url) => navigator.serviceWorker.register(url)
        : null;

  if (!isProd || typeof register !== 'function') {
    return Promise.resolve(null);
  }

  return register('/sw.js').catch((err) => {
    console.warn('[pwa] service worker registration failed', err);
    return null;
  });
}
