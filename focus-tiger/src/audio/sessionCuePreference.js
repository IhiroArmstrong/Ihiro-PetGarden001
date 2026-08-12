/**
 * Focus 计时提示音偏好（开始磬 / 间隔磬 / 结束铃）。
 * UI 本版只有总开关；底层存三个字段并永远同步，便于以后拆分。
 */

/** 与 `localStateKeys.js` 白名单同步。 */
export const SESSION_CUE_PREF_STORAGE_KEY = 'focus-tiger.session-cues.v1';

/**
 * @typedef {{
 *   sessionStartBellEnabled: boolean,
 *   sessionIntervalBellEnabled: boolean,
 *   sessionEndBellEnabled: boolean
 * }} SessionCuePref
 */

/** @returns {SessionCuePref} */
export function defaultSessionCuePref() {
  return {
    sessionStartBellEnabled: true,
    sessionIntervalBellEnabled: true,
    sessionEndBellEnabled: true
  };
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
  // Missing interval field (pre-#interval prefs) inherits start∧end.
  const interval =
    typeof raw.sessionIntervalBellEnabled === 'boolean'
      ? raw.sessionIntervalBellEnabled
      : start && end;
  // v1: keep fields in sync (AND). Divergent storage collapses to all-off or all-on.
  const master = start && end && interval;
  return {
    sessionStartBellEnabled: master,
    sessionIntervalBellEnabled: master,
    sessionEndBellEnabled: master
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
 * @param {boolean} enabled master toggle — writes all fields in sync
 * @returns {SessionCuePref}
 */
export function writeSessionCuePrefEnabled(storage, enabled) {
  const on = Boolean(enabled);
  const pref = {
    sessionStartBellEnabled: on,
    sessionIntervalBellEnabled: on,
    sessionEndBellEnabled: on
  };
  try {
    storage?.setItem?.(SESSION_CUE_PREF_STORAGE_KEY, JSON.stringify(pref));
  } catch {
    /* ignore quota / private mode */
  }
  return pref;
}

/**
 * @param {SessionCuePref} pref
 * @returns {boolean}
 */
export function isSessionCueMasterEnabled(pref) {
  return Boolean(
    pref?.sessionStartBellEnabled &&
      pref?.sessionIntervalBellEnabled &&
      pref?.sessionEndBellEnabled
  );
}
