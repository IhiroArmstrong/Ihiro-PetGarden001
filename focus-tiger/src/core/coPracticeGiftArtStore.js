/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T68 — cumulative B-day ledger + grants. Only grows; never rebuilt from
 * T67/T57 trimmed streams. T58 forget does not clear this key.
 */

import { getStorage, setStorage } from '../utils/Storage.js';
import { CO_PRACTICE_GIFT_ART_STORAGE_KEY } from './coPracticeGiftArtCatalog.js';

export { CO_PRACTICE_GIFT_ART_STORAGE_KEY };

/**
 * @typedef {{
 *   bDays: string[],
 *   grants: { id: string, grantedDayKey: string, grantedAt: number }[]
 * }} CoPracticeGiftArtState
 */

/**
 * @returns {CoPracticeGiftArtState}
 */
export function emptyCoPracticeGiftArtState() {
  return { bDays: [], grants: [] };
}

/**
 * @param {unknown} raw
 * @returns {CoPracticeGiftArtState}
 */
export function normalizeCoPracticeGiftArtState(raw) {
  const empty = emptyCoPracticeGiftArtState();
  if (!raw || typeof raw !== 'object') return empty;
  const bDays = Array.isArray(raw.bDays)
    ? raw.bDays.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
    : [];
  const unique = [...new Set(bDays)].sort();
  const grants = Array.isArray(raw.grants)
    ? raw.grants.filter(
        (row) =>
          row &&
          typeof row.id === 'string' &&
          typeof row.grantedDayKey === 'string' &&
          typeof row.grantedAt === 'number'
      )
    : [];
  return { bDays: unique, grants };
}

/**
 * @param {string} [key]
 * @returns {CoPracticeGiftArtState}
 */
export function readCoPracticeGiftArtState(key = CO_PRACTICE_GIFT_ART_STORAGE_KEY) {
  return normalizeCoPracticeGiftArtState(getStorage(key, emptyCoPracticeGiftArtState()));
}

/**
 * @param {CoPracticeGiftArtState} state
 * @param {string} [key]
 * @returns {boolean}
 */
export function writeCoPracticeGiftArtState(
  state,
  key = CO_PRACTICE_GIFT_ART_STORAGE_KEY
) {
  try {
    setStorage(key, normalizeCoPracticeGiftArtState(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} dayKey
 * @param {string} [key]
 * @returns {boolean} true when a new calendar day was appended
 */
export function recordCoPracticeGiftArtBDay(
  dayKey,
  key = CO_PRACTICE_GIFT_ART_STORAGE_KEY
) {
  if (typeof dayKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    return false;
  }
  const state = readCoPracticeGiftArtState(key);
  if (state.bDays.includes(dayKey)) return false;
  state.bDays.push(dayKey);
  state.bDays.sort();
  return writeCoPracticeGiftArtState(state, key);
}

/**
 * @param {{ id: string, grantedDayKey: string, grantedAt?: number }} grant
 * @param {string} [key]
 * @returns {boolean}
 */
export function persistCoPracticeGiftArtGrant(
  grant,
  key = CO_PRACTICE_GIFT_ART_STORAGE_KEY
) {
  if (!grant || typeof grant.id !== 'string') return false;
  const state = readCoPracticeGiftArtState(key);
  if (state.grants.some((row) => row.id === grant.id)) return false;
  state.grants.push({
    id: grant.id,
    grantedDayKey: grant.grantedDayKey,
    grantedAt: Number(grant.grantedAt) || Date.now()
  });
  return writeCoPracticeGiftArtState(state, key);
}
