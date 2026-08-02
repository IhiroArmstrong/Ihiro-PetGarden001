/**
 * Scene Animation Dispatcher (Slice A′ + B).
 * Business emits semantic events; this module maps → emotion key (single or weighted),
 * applies gate / daily quota / cooldown, then callers playEmotion.
 *
 * Authority: SCENE_ANIMATION_WIRING.md §七 / §十.
 */

import { getLocalDateKey } from '../utils/localDate.js';
import {
  LOCALE_GREETING_STORAGE_KEY,
  markLocaleGreetingPlayed,
  playOptionsForLocaleGreeting,
  resolveLocaleGreetingPlay
} from './localeGreeting.js';

export const SCENE_ANIM_EVENTS = Object.freeze({
  LANGUAGE_CHANGED: 'language_changed',
  HONESTY_COMPLETED: 'honesty_completed',
  MICRO_RITUAL_COMPLETE: 'micro_ritual_complete',
  SESSION_COMPLETE_LIGHT: 'session_complete_light',
  WELCOME_APP: 'welcome_app',
  STRETCH_REMINDER: 'stretch_reminder',
  LATE_NIGHT: 'late_night',
  CURIOSITY: 'curiosity'
});

export const SCENE_ANIM_COOLDOWN_STORAGE_KEY =
  'focus-tiger.scene-anim-cooldown.v1';
export const SCENE_ANIM_DAILY_STORAGE_KEY = 'focus-tiger.scene-anim-daily.v1';

/** Honesty: ≤20 and 21–29 → nod; ≥30 → halo oneshot */
export const HONESTY_LONG_MIN_MINUTES = 30;

/** Life-sense cooldown (yawn / tea / curiosity): 1 hour */
export const LIFE_COOLDOWN_MS = 60 * 60 * 1000;

/** Late night local hour ≥ this */
export const LATE_NIGHT_HOUR = 23;

/** Curiosity roll probability when opportunity fires */
export const CURIOSITY_CHANCE = 0.05;

/**
 * @typedef {{ key: string, weight: number }} WeightedEntry
 */

/**
 * 冷启动同日欢迎池（试验 · 2026-08-02 晚修订）。
 * 挥手新旧（wave-hello / wave-hello-pingpong / welcomeBack）2026-08-02 **暂时停接线**；
 * 池内仅 `magicBookReading` + `nodGreeting`。勿把 welcomeBack 抽回本池，直至另议场景。
 * @type {ReadonlyArray<WeightedEntry>}
 */
export const WELCOME_POOL = Object.freeze([
  Object.freeze({ key: 'magicBookReading', weight: 60 }),
  Object.freeze({ key: 'nodGreeting', weight: 40 })
]);

/** Light completion / micro-ritual — never celebrate-dance */
/** @type {ReadonlyArray<WeightedEntry>} */
export const LIGHT_COMPLETE_POOL = Object.freeze([
  Object.freeze({ key: 'sessionComplete', weight: 60 }),
  Object.freeze({ key: 'mindfulAcknowledge', weight: 20 }),
  Object.freeze({ key: 'curiousTilt', weight: 20 })
]);

/** @type {ReadonlyArray<WeightedEntry>} */
export const STRETCH_POOL = Object.freeze([
  Object.freeze({ key: 'stretchReminder', weight: 60 }),
  Object.freeze({ key: 'yawnStretch', weight: 40 })
]);

/** @type {ReadonlyArray<WeightedEntry>} */
export const LATE_NIGHT_POOL = Object.freeze([
  Object.freeze({ key: 'yawnStretch', weight: 50 }),
  Object.freeze({ key: 'teaDrinking', weight: 50 })
]);

/** @type {ReadonlyArray<WeightedEntry>} */
export const CURIOSITY_POOL = Object.freeze([
  Object.freeze({ key: 'earWiggleHeadTouch', weight: 50 }),
  Object.freeze({ key: 'gazeLookAround', weight: 50 })
]);

/**
 * @param {ReadonlyArray<WeightedEntry>} entries
 * @param {() => number} [random]
 * @returns {string | null}
 */
export function pickWeighted(entries, random = Math.random) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const total = entries.reduce((sum, e) => sum + Math.max(0, Number(e.weight) || 0), 0);
  if (total <= 0) return entries[0]?.key ?? null;
  let roll = random() * total;
  for (const entry of entries) {
    roll -= Math.max(0, Number(entry.weight) || 0);
    if (roll < 0) return entry.key;
  }
  return entries[entries.length - 1].key;
}

/**
 * @param {{ sessionState: string, overlayBusy?: boolean }} opts
 * @returns {boolean}
 */
export function canPlaySceneAnimGate({ sessionState, overlayBusy = false }) {
  if (sessionState === 'FOCUSING' || sessionState === 'CELEBRATE') return false;
  if (overlayBusy) return false;
  return true;
}

/**
 * Cold-start mutual exclusion: WELCOME_APP and LATE_NIGHT must not both
 * playEmotion on the same boot tick. Late night still runs on visibilitychange,
 * and on boot when welcome is skipped (already played today / gated).
 *
 * @param {{ play?: boolean } | null | undefined} welcomeDecision
 * @returns {boolean}
 */
export function shouldAttemptLateNightOnBoot(welcomeDecision) {
  return welcomeDecision?.play !== true;
}

/**
 * @param {number} minutes
 * @returns {'mindfulAcknowledge' | 'goldenHaloPalms' | null}
 */
export function emotionKeyForHonestyDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return minutes >= HONESTY_LONG_MIN_MINUTES
    ? 'goldenHaloPalms'
    : 'mindfulAcknowledge';
}

/**
 * Assert light pools never include celebrate dance (regression lock).
 * @param {ReadonlyArray<WeightedEntry>} pool
 * @returns {boolean}
 */
export function lightPoolIsCelebrateSafe(pool) {
  return !pool.some(
    (e) =>
      e.key === 'celebrating' ||
      e.key === 'celebrateDance' ||
      e.key === 'celebrateDanceV2'
  );
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {Record<string, number>}
 */
export function readCooldownMap(storage) {
  if (!storage) return {};
  try {
    const raw = storage.getItem(SCENE_ANIM_COOLDOWN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    /** @type {Record<string, number>} */
    const out = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {Record<string, number>} map
 */
export function writeCooldownMap(storage, map) {
  if (!storage) return;
  try {
    storage.setItem(SCENE_ANIM_COOLDOWN_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} kind
 * @param {number} nowMs
 * @param {number} [cooldownMs]
 * @returns {boolean} true if still cooling down
 */
export function isCoolingDown(
  storage,
  kind,
  nowMs,
  cooldownMs = LIFE_COOLDOWN_MS
) {
  const map = readCooldownMap(storage);
  const last = map[kind];
  if (typeof last !== 'number') return false;
  return nowMs - last < cooldownMs;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} kind
 * @param {number} nowMs
 */
export function markCooldown(storage, kind, nowMs) {
  const map = readCooldownMap(storage);
  map[kind] = nowMs;
  writeCooldownMap(storage, map);
}

/**
 * @param {unknown} raw
 * @param {string} todayKey
 * @returns {{ dateKey: string, welcome: boolean }}
 */
export function normalizeDailySceneAnimState(raw, todayKey) {
  if (!raw || typeof raw !== 'object') {
    return { dateKey: todayKey, welcome: false };
  }
  const dateKey =
    typeof /** @type {{ dateKey?: unknown }} */ (raw).dateKey === 'string'
      ? /** @type {{ dateKey: string }} */ (raw).dateKey
      : todayKey;
  if (dateKey !== todayKey) {
    return { dateKey: todayKey, welcome: false };
  }
  return {
    dateKey: todayKey,
    welcome: Boolean(/** @type {{ welcome?: unknown }} */ (raw).welcome)
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 */
export function readDailySceneAnimState(storage, now = () => new Date()) {
  const todayKey = getLocalDateKey(now());
  if (!storage) return { dateKey: todayKey, welcome: false };
  try {
    const raw = storage.getItem(SCENE_ANIM_DAILY_STORAGE_KEY);
    if (!raw) return { dateKey: todayKey, welcome: false };
    return normalizeDailySceneAnimState(JSON.parse(raw), todayKey);
  } catch {
    return { dateKey: todayKey, welcome: false };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ dateKey: string, welcome: boolean }} state
 */
export function writeDailySceneAnimState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(SCENE_ANIM_DAILY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * @param {Date} date
 * @returns {boolean}
 */
export function isLateNightHour(date) {
  return date.getHours() >= LATE_NIGHT_HOUR;
}

/**
 * Resolve whether to play an animation for a semantic scene event.
 *
 * @param {object} opts
 * @param {string} opts.event SCENE_ANIM_EVENTS.*
 * @param {string} opts.sessionState
 * @param {boolean} [opts.overlayBusy]
 * @param {string} [opts.locale]
 * @param {number} [opts.durationMinutes]
 * @param {boolean} [opts.wokeFromDormant]
 * @param {Storage | null | undefined} [opts.storage]
 * @param {() => Date} [opts.now]
 * @param {() => number} [opts.random]
 * @returns {{ play: boolean, emotionKey: string | null, reason: string }}
 */
export function resolveSceneAnimation({
  event,
  sessionState,
  overlayBusy = false,
  locale,
  durationMinutes,
  wokeFromDormant = false,
  storage = globalThis.localStorage,
  now = () => new Date(),
  random = Math.random
}) {
  if (event === SCENE_ANIM_EVENTS.LANGUAGE_CHANGED) {
    return resolveLocaleGreetingPlay({
      locale: locale ?? '',
      sessionState,
      overlayBusy,
      storage,
      now
    });
  }

  // Greetings / life-sense: skip while Focusing / Celebrating / overlay.
  // Completion & stretch fire *from* those contexts — do not gate them here.
  const needsIdleGate =
    event === SCENE_ANIM_EVENTS.WELCOME_APP ||
    event === SCENE_ANIM_EVENTS.LATE_NIGHT ||
    event === SCENE_ANIM_EVENTS.CURIOSITY;
  if (needsIdleGate && !canPlaySceneAnimGate({ sessionState, overlayBusy })) {
    return { play: false, emotionKey: null, reason: 'gate' };
  }

  const date = now();
  const nowMs = date.getTime();

  if (event === SCENE_ANIM_EVENTS.HONESTY_COMPLETED) {
    if (wokeFromDormant) {
      return { play: false, emotionKey: null, reason: 'dormant-wake-path' };
    }
    const emotionKey = emotionKeyForHonestyDuration(durationMinutes ?? 0);
    if (!emotionKey) {
      return { play: false, emotionKey: null, reason: 'invalid-duration' };
    }
    return { play: true, emotionKey, reason: 'ok' };
  }

  if (
    event === SCENE_ANIM_EVENTS.MICRO_RITUAL_COMPLETE ||
    event === SCENE_ANIM_EVENTS.SESSION_COMPLETE_LIGHT
  ) {
    const emotionKey = pickWeighted(LIGHT_COMPLETE_POOL, random);
    return { play: true, emotionKey, reason: 'ok' };
  }

  if (event === SCENE_ANIM_EVENTS.WELCOME_APP) {
    const daily = readDailySceneAnimState(storage, now);
    if (daily.welcome) {
      return { play: false, emotionKey: null, reason: 'quota' };
    }
    const emotionKey = pickWeighted(WELCOME_POOL, random);
    writeDailySceneAnimState(storage, {
      dateKey: daily.dateKey,
      welcome: true
    });
    return { play: true, emotionKey, reason: 'ok' };
  }

  if (event === SCENE_ANIM_EVENTS.STRETCH_REMINDER) {
    const emotionKey = pickWeighted(STRETCH_POOL, random);
    return { play: true, emotionKey, reason: 'ok' };
  }

  if (event === SCENE_ANIM_EVENTS.LATE_NIGHT) {
    if (!isLateNightHour(date)) {
      return { play: false, emotionKey: null, reason: 'not-late-night' };
    }
    if (isCoolingDown(storage, 'late_night', nowMs)) {
      return { play: false, emotionKey: null, reason: 'cooldown' };
    }
    const emotionKey = pickWeighted(LATE_NIGHT_POOL, random);
    markCooldown(storage, 'late_night', nowMs);
    return { play: true, emotionKey, reason: 'ok' };
  }

  if (event === SCENE_ANIM_EVENTS.CURIOSITY) {
    if (isCoolingDown(storage, 'curiosity', nowMs)) {
      return { play: false, emotionKey: null, reason: 'cooldown' };
    }
    if (random() >= CURIOSITY_CHANCE) {
      return { play: false, emotionKey: null, reason: 'chance' };
    }
    const emotionKey = pickWeighted(CURIOSITY_POOL, random);
    markCooldown(storage, 'curiosity', nowMs);
    return { play: true, emotionKey, reason: 'ok' };
  }

  return { play: false, emotionKey: null, reason: 'unknown-event' };
}

export {
  LOCALE_GREETING_STORAGE_KEY,
  markLocaleGreetingPlayed,
  playOptionsForLocaleGreeting
};
