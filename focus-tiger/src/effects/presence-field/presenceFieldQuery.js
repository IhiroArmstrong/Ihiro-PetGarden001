/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * @param {string} [search]
 * @returns {{ forceOn: boolean, debug: boolean }}
 */
export function readPresenceFieldQuery(search) {
  const raw =
    search ??
    (typeof location !== 'undefined' && location.search ? location.search : '');
  let params;
  try {
    params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
  } catch {
    return { forceOn: false, debug: false };
  }
  return {
    forceOn: params.get('presenceField') === '1',
    debug: params.get('presenceFieldDebug') === '1'
  };
}
