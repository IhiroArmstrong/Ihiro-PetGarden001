/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * QA-only boot seed for the lotus pond. Not a product feature —
 * testers should not sit for hours to see blooms.
 *
 * Canonical:
 *   ?product=1&sessionMinutes=1&qaLotusBlooms=11
 * Seeds lifetime minutes so 11 flowers are visible and a 1-minute sit
 * can birth the 12th. `qaLotusBlooms=12` fills the ring (no further birth).
 */

import { LOTUS_POND_STORAGE_KEY } from './LotusPondStore.js';
import {
  LOTUS_POND_RING_CAPACITY,
  minutesToSeedQaBloomCount
} from './lotusPondMath.js';

/**
 * @param {string} [search]
 * @returns {URLSearchParams}
 */
function paramsFromSearch(search = '') {
  const q = String(search || '');
  return new URLSearchParams(q.startsWith('?') ? q.slice(1) : q);
}

/**
 * @param {string} [search]
 * @returns {number | null} visible bloom count to seed (0–12)
 */
export function parseQaLotusBlooms(search = '') {
  const raw = paramsFromSearch(search).get('qaLotusBlooms');
  if (raw == null || raw === '') return null;
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(LOTUS_POND_RING_CAPACITY, n);
}

/**
 * @param {{
 *   search?: string,
 *   storage?: Storage | null
 * }} [opts]
 * @returns {{
 *   seededBlooms: number | null,
 *   lifetimeMinutes: number | null,
 *   applied: boolean
 * }}
 */
export function applyQaLotusPondSeedFromSearch(opts = {}) {
  const search = opts.search ?? '';
  const storage = opts.storage ?? null;
  const seededBlooms = parseQaLotusBlooms(search);

  if (seededBlooms == null || !storage) {
    return {
      seededBlooms,
      lifetimeMinutes: null,
      applied: false
    };
  }

  const lifetimeMinutes = minutesToSeedQaBloomCount(seededBlooms);
  storage.setItem(
    LOTUS_POND_STORAGE_KEY,
    JSON.stringify({ lifetimeMinutes })
  );
  return {
    seededBlooms,
    lifetimeMinutes,
    applied: true
  };
}
