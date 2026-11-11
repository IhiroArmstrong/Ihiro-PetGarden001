/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Renderer custom event when Electron delivers a practice/discard query in-page. */
export const PRACTICE_DEEP_LINK_EVENT = 'ft-practice-deep-link';

/**
 * @param {string} pathname
 * @param {string} hash
 * @param {unknown} search
 * @returns {string}
 */
export function buildPracticeDeepLinkHref(pathname, hash, search) {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  if (!params.has('product')) params.set('product', '1');
  return `${pathname || '/'}?${params.toString()}${hash || ''}`;
}

/**
 * In-page query swap (no reload) so overlayBusy can still reject after B lands.
 *
 * @param {{ replaceState?: Function }} historyLike
 * @param {{ pathname?: string, hash?: string }} locationLike
 * @param {unknown} search
 * @returns {string}
 */
export function replacePracticeDeepLinkSearch(historyLike, locationLike, search) {
  const href = buildPracticeDeepLinkHref(
    locationLike?.pathname || '/',
    locationLike?.hash || '',
    search
  );
  if (typeof historyLike?.replaceState === 'function') {
    historyLike.replaceState(null, '', href);
  }
  return href;
}
