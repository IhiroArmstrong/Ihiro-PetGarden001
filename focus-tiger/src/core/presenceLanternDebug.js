/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Dev-only lantern chrome preview — forces Idle lanterns without cloud presence.
 * Usage: `?debugLanterns=1` on local / QA preview.
 */

export const DEBUG_LANTERNS_QUERY_PARAM = 'debugLanterns';
export const DEBUG_LANTERNS_GLOBAL_MOCK_COUNT = 3;
export const DEBUG_LANTERNS_CIRCLE_MOCK_COUNT = 2;

/**
 * @param {string} [search]
 * @returns {boolean}
 */
export function readDebugLanternsQueryFlag(search = '') {
  const q =
    typeof search === 'string' && search.length > 0
      ? search.startsWith('?')
        ? search
        : `?${search}`
      : typeof globalThis.location?.search === 'string'
        ? globalThis.location.search
        : '';
  const value = new URLSearchParams(q).get(DEBUG_LANTERNS_QUERY_PARAM);
  if (value === '0' || value === 'false') return false;
  return value === '1' || value === 'true';
}
