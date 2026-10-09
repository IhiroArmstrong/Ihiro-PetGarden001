/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Open-ended gentle notes (90 minutes / 3 hours). Default on.
 * Write only when the user turns them off or back on.
 */

export const OPEN_ENDED_NUDGE_STORAGE_KEY = 'focus-tiger.open-ended-nudge.v1';

/**
 * @param {unknown} raw
 * @returns {{ enabled: boolean }}
 */
export function normalizeOpenEndedNudgePreference(raw) {
  if (!raw || typeof raw !== 'object') return { enabled: true };
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (o.enabled === false) return { enabled: false };
  return { enabled: true };
}

/**
 * @returns {Storage | null}
 */
function getDefaultStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ enabled: boolean }}
 */
export function readOpenEndedNudgePreference(storage) {
  const store = storage === undefined ? getDefaultStorage() : storage;
  if (!store) return { enabled: true };
  try {
    const raw = store.getItem(OPEN_ENDED_NUDGE_STORAGE_KEY);
    if (!raw) return { enabled: true };
    return normalizeOpenEndedNudgePreference(JSON.parse(raw));
  } catch {
    return { enabled: true };
  }
}

/**
 * @param {Storage | null | undefined} [storage]
 * @returns {boolean}
 */
export function isOpenEndedNudgeEnabled(storage) {
  return readOpenEndedNudgePreference(storage).enabled === true;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @returns {{ enabled: boolean, saved: boolean }}
 */
export function setOpenEndedNudgeEnabled(storage, enabled) {
  const store = storage === undefined ? getDefaultStorage() : storage;
  const next = { enabled: Boolean(enabled) };
  if (!store) return { ...next, saved: false };
  try {
    store.setItem(OPEN_ENDED_NUDGE_STORAGE_KEY, JSON.stringify(next));
    return { ...next, saved: true };
  } catch {
    return { ...next, saved: false };
  }
}
