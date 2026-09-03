/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Quiet Together / Global Lanterns — local opt-out (default on).
 * Missing key = participate + see lanterns. Write only when the user toggles.
 */

export const QUIET_TOGETHER_STORAGE_KEY = 'focus-tiger.quiet-together.v1';
export const QUIET_TOGETHER_PREF_EVENT = 'focus-tiger:quiet-together-pref-change';

/**
 * @param {unknown} raw
 * @returns {{ enabled: boolean }}
 */
export function normalizeQuietTogetherPreference(raw) {
  if (!raw || typeof raw !== 'object') {
    return { enabled: true };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (o.enabled === false) return { enabled: false };
  return { enabled: true };
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ enabled: boolean }}
 */
export function readQuietTogetherPreference(storage) {
  if (!storage) return { enabled: true };
  try {
    const raw = storage.getItem(QUIET_TOGETHER_STORAGE_KEY);
    if (!raw) return { enabled: true };
    return normalizeQuietTogetherPreference(JSON.parse(raw));
  } catch {
    return { enabled: true };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function isQuietTogetherEnabled(storage) {
  return readQuietTogetherPreference(storage).enabled === true;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @param {{ dispatch?: (name: string) => void }} [opts]
 */
export function setQuietTogetherEnabled(storage, enabled, opts = {}) {
  const store = storage ?? getDefaultStorage();
  if (!store) return { enabled: Boolean(enabled) };
  const next = { enabled: Boolean(enabled) };
  try {
    store.setItem(QUIET_TOGETHER_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota / private mode
  }
  const dispatch =
    opts.dispatch ??
    ((name) => {
      try {
        globalThis.dispatchEvent?.(new Event(name));
      } catch {
        // non-DOM tests
      }
    });
  dispatch(QUIET_TOGETHER_PREF_EVENT);
  return next;
}
