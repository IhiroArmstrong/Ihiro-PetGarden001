/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Circle passive marks (was-here-today) — local opt-out (default share on).
 * Missing key = allow automatic was-here marks. Witness leave remains voluntary per session.
 */

export const FOCUS_CIRCLE_PASSIVE_SHARE_STORAGE_KEY =
  'focus-tiger.focus-circle-passive-share.v1';
export const FOCUS_CIRCLE_PASSIVE_SHARE_EVENT =
  'focus-tiger:focus-circle-passive-share-change';

/**
 * @param {unknown} raw
 * @returns {{ sharePassiveMarks: boolean }}
 */
export function normalizeFocusCirclePassiveSharePreference(raw) {
  if (!raw || typeof raw !== 'object') {
    return { sharePassiveMarks: true };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (o.sharePassiveMarks === false) return { sharePassiveMarks: false };
  return { sharePassiveMarks: true };
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
 * @returns {{ sharePassiveMarks: boolean }}
 */
export function readFocusCirclePassiveSharePreference(storage) {
  if (!storage) return { sharePassiveMarks: true };
  try {
    const raw = storage.getItem(FOCUS_CIRCLE_PASSIVE_SHARE_STORAGE_KEY);
    if (!raw) return { sharePassiveMarks: true };
    return normalizeFocusCirclePassiveSharePreference(JSON.parse(raw));
  } catch {
    return { sharePassiveMarks: true };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function isFocusCirclePassiveShareEnabled(storage) {
  return readFocusCirclePassiveSharePreference(storage).sharePassiveMarks === true;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} sharePassiveMarks
 * @param {{ dispatch?: (name: string) => void }} [opts]
 */
export function setFocusCirclePassiveShareEnabled(
  storage,
  sharePassiveMarks,
  opts = {}
) {
  const store = storage ?? getDefaultStorage();
  if (!store) return { sharePassiveMarks: Boolean(sharePassiveMarks) };
  const next = { sharePassiveMarks: Boolean(sharePassiveMarks) };
  try {
    store.setItem(FOCUS_CIRCLE_PASSIVE_SHARE_STORAGE_KEY, JSON.stringify(next));
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
  dispatch(FOCUS_CIRCLE_PASSIVE_SHARE_EVENT);
  return next;
}
