/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Global System TTS announcements (focus end, etc.). Default off.
 * Independent from Confide reply speech and from session chime bells.
 */

/** @typedef {{ announcementsEnabled: boolean }} SystemTtsPref */

export const SYSTEM_TTS_PREF_STORAGE_KEY = 'focus-tiger.system-tts-pref.v1';

/** @returns {SystemTtsPref} */
export function defaultSystemTtsPref() {
  return { announcementsEnabled: false };
}

/**
 * @param {unknown} raw
 * @returns {SystemTtsPref}
 */
export function normalizeSystemTtsPref(raw) {
  if (!raw || typeof raw !== 'object') return defaultSystemTtsPref();
  const o = /** @type {Record<string, unknown>} */ (raw);
  return { announcementsEnabled: o.announcementsEnabled === true };
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
 * @returns {SystemTtsPref}
 */
export function readSystemTtsPref(storage) {
  const store = storage === undefined ? getDefaultStorage() : storage;
  if (!store) return defaultSystemTtsPref();
  try {
    const raw = store.getItem(SYSTEM_TTS_PREF_STORAGE_KEY);
    if (!raw) return defaultSystemTtsPref();
    return normalizeSystemTtsPref(JSON.parse(raw));
  } catch {
    return defaultSystemTtsPref();
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function isSystemTtsAnnouncementsEnabled(storage) {
  return readSystemTtsPref(storage).announcementsEnabled === true;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @returns {{ announcementsEnabled: boolean, saved: boolean }}
 */
export function setSystemTtsAnnouncementsEnabled(storage, enabled) {
  const store = storage === undefined ? getDefaultStorage() : storage;
  const next = { announcementsEnabled: Boolean(enabled) };
  if (!store) return { ...next, saved: false };
  try {
    store.setItem(SYSTEM_TTS_PREF_STORAGE_KEY, JSON.stringify(next));
    return { ...next, saved: true };
  } catch {
    return { ...next, saved: false };
  }
}
