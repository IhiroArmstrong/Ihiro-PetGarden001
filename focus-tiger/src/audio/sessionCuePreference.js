/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus 计时提示音偏好。
 * - 开始/结束铃：Soundscape「计时提示音」总开关（两字段同步，默认开）
 * - 间隔磬节奏：独立 off / 3min / 5min（默认 off = 纯净陪伴）
 * - 觉察观照卡：独立开关（默认开；无间隔时也不会出卡）
 */

/** 与 `localStateKeys.js` 白名单同步。 */
export const SESSION_CUE_PREF_STORAGE_KEY = 'focus-tiger.session-cues.v1';

/** @typedef {0 | 180000 | 300000} SessionIntervalMs */

export const SESSION_INTERVAL_MS_OFF = 0;
export const SESSION_INTERVAL_MS_3MIN = 180_000;
export const SESSION_INTERVAL_MS_5MIN = 300_000;

export const SESSION_INTERVAL_MS_OPTIONS = Object.freeze([
  SESSION_INTERVAL_MS_OFF,
  SESSION_INTERVAL_MS_3MIN,
  SESSION_INTERVAL_MS_5MIN
]);

/**
 * @typedef {{
 *   sessionStartBellEnabled: boolean,
 *   sessionEndBellEnabled: boolean,
 *   sessionIntervalMs: SessionIntervalMs,
 *   focusAwarenessCardEnabled: boolean
 * }} SessionCuePref
 */

/** @returns {SessionCuePref} */
export function defaultSessionCuePref() {
  return {
    sessionStartBellEnabled: true,
    sessionEndBellEnabled: true,
    sessionIntervalMs: SESSION_INTERVAL_MS_OFF,
    focusAwarenessCardEnabled: true
  };
}

/**
 * @param {unknown} value
 * @returns {SessionIntervalMs}
 */
export function normalizeSessionIntervalMs(value) {
  const n = Number(value);
  if (n === SESSION_INTERVAL_MS_3MIN || n === SESSION_INTERVAL_MS_5MIN) {
    return /** @type {SessionIntervalMs} */ (n);
  }
  return SESSION_INTERVAL_MS_OFF;
}

/**
 * @param {unknown} raw
 * @returns {SessionCuePref}
 */
export function normalizeSessionCuePref(raw) {
  if (!raw || typeof raw !== 'object') return defaultSessionCuePref();
  const start =
    typeof raw.sessionStartBellEnabled === 'boolean'
      ? raw.sessionStartBellEnabled
      : true;
  const end =
    typeof raw.sessionEndBellEnabled === 'boolean'
      ? raw.sessionEndBellEnabled
      : true;
  // Start/end stay synced (AND) for the master toggle.
  const startEnd = start && end;

  /** @type {SessionIntervalMs} */
  let intervalMs = SESSION_INTERVAL_MS_OFF;
  if (Object.prototype.hasOwnProperty.call(raw, 'sessionIntervalMs')) {
    intervalMs = normalizeSessionIntervalMs(raw.sessionIntervalMs);
  } else if (raw.sessionIntervalBellEnabled === true) {
    // Migrate brief v1 boolean-on → 3 min.
    intervalMs = SESSION_INTERVAL_MS_3MIN;
  } else {
    intervalMs = SESSION_INTERVAL_MS_OFF;
  }

  const awareness =
    typeof raw.focusAwarenessCardEnabled === 'boolean'
      ? raw.focusAwarenessCardEnabled
      : true;

  return {
    sessionStartBellEnabled: startEnd,
    sessionEndBellEnabled: startEnd,
    sessionIntervalMs: intervalMs,
    focusAwarenessCardEnabled: awareness
  };
}

/**
 * @param {Storage | { getItem?: Function } | null | undefined} storage
 * @returns {SessionCuePref}
 */
export function readSessionCuePref(storage) {
  if (!storage?.getItem) return defaultSessionCuePref();
  try {
    const raw = storage.getItem(SESSION_CUE_PREF_STORAGE_KEY);
    if (!raw) return defaultSessionCuePref();
    return normalizeSessionCuePref(JSON.parse(raw));
  } catch {
    return defaultSessionCuePref();
  }
}

/**
 * @param {Storage | { setItem?: Function } | null | undefined} storage
 * @param {SessionCuePref} pref
 * @returns {SessionCuePref}
 */
function persistSessionCuePref(storage, pref) {
  const normalized = normalizeSessionCuePref(pref);
  try {
    storage?.setItem?.(
      SESSION_CUE_PREF_STORAGE_KEY,
      JSON.stringify(normalized)
    );
  } catch {
    /* ignore quota / private mode */
  }
  return normalized;
}

/**
 * Master toggle for start/end only — preserves interval + awareness.
 * @param {Storage | { getItem?: Function, setItem?: Function } | null | undefined} storage
 * @param {boolean} enabled
 * @returns {SessionCuePref}
 */
export function writeSessionCuePrefEnabled(storage, enabled) {
  const prev = readSessionCuePref(storage);
  return persistSessionCuePref(storage, {
    ...prev,
    sessionStartBellEnabled: Boolean(enabled),
    sessionEndBellEnabled: Boolean(enabled)
  });
}

/**
 * @param {Storage | { getItem?: Function, setItem?: Function } | null | undefined} storage
 * @param {number} ms
 * @returns {SessionCuePref}
 */
export function writeSessionIntervalMs(storage, ms) {
  const prev = readSessionCuePref(storage);
  return persistSessionCuePref(storage, {
    ...prev,
    sessionIntervalMs: normalizeSessionIntervalMs(ms)
  });
}

/**
 * @param {Storage | { getItem?: Function, setItem?: Function } | null | undefined} storage
 * @param {boolean} enabled
 * @returns {SessionCuePref}
 */
export function writeFocusAwarenessCardEnabled(storage, enabled) {
  const prev = readSessionCuePref(storage);
  return persistSessionCuePref(storage, {
    ...prev,
    focusAwarenessCardEnabled: Boolean(enabled)
  });
}

/**
 * Start/end master (interval is separate).
 * @param {SessionCuePref} pref
 * @returns {boolean}
 */
export function isSessionCueMasterEnabled(pref) {
  return Boolean(
    pref?.sessionStartBellEnabled && pref?.sessionEndBellEnabled
  );
}

/**
 * @param {SessionCuePref} pref
 * @returns {boolean}
 */
export function isSessionIntervalEnabled(pref) {
  return normalizeSessionIntervalMs(pref?.sessionIntervalMs) > 0;
}
