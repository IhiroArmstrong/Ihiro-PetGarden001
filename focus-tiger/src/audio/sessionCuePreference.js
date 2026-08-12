/**
 * Focus 计时提示音偏好（开始磬 / 结束铃）。
 * UI 本版只有总开关；底层存两个字段并永远同步，便于以后拆分。
 */

/** 与 `localStateKeys.js` 白名单同步。 */
export const SESSION_CUE_PREF_STORAGE_KEY = 'focus-tiger.session-cues.v1';

/**
 * @typedef {{ sessionStartBellEnabled: boolean, sessionEndBellEnabled: boolean }} SessionCuePref
 */

/** @returns {SessionCuePref} */
export function defaultSessionCuePref() {
  return {
    sessionStartBellEnabled: true,
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
  // v1: keep fields in sync (AND). Divergent storage collapses to both-off or both-on.
  const master = start && end;
  return {
    sessionStartBellEnabled: master,
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
 * @param {boolean} enabled master toggle — writes both fields in sync
 * @returns {SessionCuePref}
 */
export function writeSessionCuePrefEnabled(storage, enabled) {
  const pref = {
    sessionStartBellEnabled: Boolean(enabled),
    sessionEndBellEnabled: Boolean(enabled)
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
    pref?.sessionStartBellEnabled && pref?.sessionEndBellEnabled
  );
}
