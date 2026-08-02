/**
 * Locale-change greeting (SCENE_ANIMATION_WIRING Slice A / A′).
 * ja → palmsTogether（真合十；与 Arrival Choose 的 intentionSet/nod 解耦）；
 * en（及其它 ready）→ teaDrinking（单程喝茶，无倒放；回 Idle 约 1s CapCut）。
 * Same local day + same target locale: at most once. Focusing/Celebrate/busy → skip, no replay.
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const LOCALE_GREETING_STORAGE_KEY = 'focus-tiger.locale-greeting.v1';

/** Matches EmotionController CAPCUT_DISSOLVE_MS — keep literal to avoid import cycle. */
export const LOCALE_GREETING_RETURN_CROSS_FADE_MS = 1000;

/**
 * @param {string} locale
 * @returns {'palmsTogether' | 'teaDrinking'}
 */
export function emotionKeyForLocaleGreeting(locale) {
  return locale === 'ja' ? 'palmsTogether' : 'teaDrinking';
}

/**
 * playEmotion options for the locale greeting key.
 * EN tea: oneshot + CapCut idle (EmotionController tea also defaults CapCut; keep explicit).
 *
 * @param {string} locale
 * @returns {Record<string, unknown>}
 */
export function playOptionsForLocaleGreeting(locale) {
  if (emotionKeyForLocaleGreeting(locale) !== 'teaDrinking') {
    return {};
  }
  return {
    returnCrossFadeMs: LOCALE_GREETING_RETURN_CROSS_FADE_MS,
    freezeUntilCrossFadeEnds: true
  };
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
 * Does **not** consume quota — call {@link markLocaleGreetingPlayed} only after
 * `playEmotion` actually starts (avoids burning the day slot when gated/stolen).
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
  const state = readLocaleGreetingState(storage, now);
  if (state.locales.includes(locale)) {
    return { play: false, emotionKey: null, reason: 'quota' };
  }
  return {
    play: true,
    emotionKey: emotionKeyForLocaleGreeting(locale),
    reason: 'ok'
  };
}

/**
 * Persist that today's greeting for `locale` was started (consume daily quota).
 *
 * @param {object} opts
 * @param {string} opts.locale
 * @param {Storage | null | undefined} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {boolean} true if newly recorded
 */
export function markLocaleGreetingPlayed({
  locale,
  storage = globalThis.localStorage,
  now = () => new Date()
}) {
  if (!locale || typeof locale !== 'string') return false;
  const todayKey = getLocalDateKey(now());
  const state = readLocaleGreetingState(storage, now);
  if (state.locales.includes(locale)) return false;
  writeLocaleGreetingState(storage, {
    dateKey: todayKey,
    locales: [...state.locales, locale]
  });
  return true;
}
