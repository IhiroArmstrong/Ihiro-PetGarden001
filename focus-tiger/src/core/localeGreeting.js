/**
 * Locale-change greeting (SCENE_ANIMATION_WIRING Slice A / A′).
 * ja → palmsTogether（真合十；与 Arrival Choose 的 intentionSet/nod 解耦）；
 * other ready locales → mindfulAcknowledge（鞠躬）.
 * Same local day + same target locale: at most once. Focusing/Celebrate/busy → skip, no replay.
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const LOCALE_GREETING_STORAGE_KEY = 'focus-tiger.locale-greeting.v1';

/**
 * @param {string} locale
 * @returns {'palmsTogether' | 'mindfulAcknowledge'}
 */
export function emotionKeyForLocaleGreeting(locale) {
  return locale === 'ja' ? 'palmsTogether' : 'mindfulAcknowledge';
}

/**
 * @param {{ sessionState: string, overlayBusy?: boolean }} opts
 * @returns {boolean}
 */
export function canPlayLocaleGreetingGate({ sessionState, overlayBusy = false }) {
  if (sessionState === 'FOCUSING' || sessionState === 'CELEBRATE') return false;
  if (overlayBusy) return false;
  return true;
}

/**
 * @param {unknown} raw
 * @param {string} todayKey
 * @returns {{ dateKey: string, locales: string[] }}
 */
export function normalizeLocaleGreetingState(raw, todayKey) {
  if (!raw || typeof raw !== 'object') {
    return { dateKey: todayKey, locales: [] };
  }
  const dateKey =
    typeof /** @type {{ dateKey?: unknown }} */ (raw).dateKey === 'string'
      ? /** @type {{ dateKey: string }} */ (raw).dateKey
      : todayKey;
  const localesRaw = /** @type {{ locales?: unknown }} */ (raw).locales;
  const locales = Array.isArray(localesRaw)
    ? localesRaw.filter((x) => typeof x === 'string')
    : [];
  if (dateKey !== todayKey) {
    return { dateKey: todayKey, locales: [] };
  }
  return { dateKey, locales: [...new Set(locales)] };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 * @returns {{ dateKey: string, locales: string[] }}
 */
export function readLocaleGreetingState(storage, now = () => new Date()) {
  const todayKey = getLocalDateKey(now());
  if (!storage) return { dateKey: todayKey, locales: [] };
  try {
    const raw = storage.getItem(LOCALE_GREETING_STORAGE_KEY);
    if (!raw) return { dateKey: todayKey, locales: [] };
    return normalizeLocaleGreetingState(JSON.parse(raw), todayKey);
  } catch {
    return { dateKey: todayKey, locales: [] };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ dateKey: string, locales: string[] }} state
 */
export function writeLocaleGreetingState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(LOCALE_GREETING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Decide whether to play a greeting for a locale that just became current.
 * On play: persists the locale into today's list (consume).
 *
 * @param {object} opts
 * @param {string} opts.locale
 * @param {string} opts.sessionState  StateManager.state
 * @param {boolean} [opts.overlayBusy]
 * @param {Storage | null | undefined} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {{ play: boolean, emotionKey: string | null, reason: string }}
 */
export function resolveLocaleGreetingPlay({
  locale,
  sessionState,
  overlayBusy = false,
  storage = globalThis.localStorage,
  now = () => new Date()
}) {
  if (!locale || typeof locale !== 'string') {
    return { play: false, emotionKey: null, reason: 'invalid-locale' };
  }
  if (!canPlayLocaleGreetingGate({ sessionState, overlayBusy })) {
    return { play: false, emotionKey: null, reason: 'gate' };
  }
  const todayKey = getLocalDateKey(now());
  const state = readLocaleGreetingState(storage, now);
  if (state.locales.includes(locale)) {
    return { play: false, emotionKey: null, reason: 'quota' };
  }
  const emotionKey = emotionKeyForLocaleGreeting(locale);
  writeLocaleGreetingState(storage, {
    dateKey: todayKey,
    locales: [...state.locales, locale]
  });
  return { play: true, emotionKey, reason: 'ok' };
}
