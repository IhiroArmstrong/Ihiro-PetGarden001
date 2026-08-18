/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Sit → Focus 开表前时长（与 Breath practice 分轨：Focus 走 Arrival，Breath 走左球）。
 * 产品 chip：10 / 15 / 25 / 45（默认与最短 10；2026-08-18 拍板）。
 * `?sessionMinutes=` 仍可跳过 picker（e2e / 调试）。
 * 今日同坐 HUD 软顶仍用 `FOCUS_SESSION_DEFAULT_MINUTES`（25），不要和本场 chip 绑死。
 */

import {
  DEMO_SESSION_MINUTES_DEFAULT,
  resolveDemoSessionMinutes
} from './FocusSession.js';

/** @type {readonly number[]} */
export const FOCUS_DURATION_OPTIONS_MINUTES = Object.freeze([10, 15, 25, 45]);

export const FOCUS_DURATION_STORAGE_KEY = 'focus-tiger.focus-duration-pref.v1';

export const FOCUS_DURATION_DEFAULT_MINUTES = 10;

/**
 * Browser `localStorage` when available; Node/unit tests get null.
 * Prefer `window` gate so Node's experimental localStorage stub is never touched.
 * @returns {Storage | null}
 */
function browserLocalStorageOrNull() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * @param {string} [search]
 * @returns {boolean}
 */
export function hasExplicitSessionMinutesQuery(search = '') {
  const raw = new URLSearchParams(search).get('sessionMinutes');
  return raw != null && raw !== '';
}

/**
 * @param {number} minutes
 * @returns {number}
 */
export function normalizeFocusDurationMinutes(minutes) {
  const m = Number(minutes);
  if (
    Number.isFinite(m) &&
    FOCUS_DURATION_OPTIONS_MINUTES.includes(/** @type {10|15|25|45} */ (m))
  ) {
    return m;
  }
  return FOCUS_DURATION_DEFAULT_MINUTES;
}

/**
 * @param {Storage | null | undefined} [storage]
 * @returns {number}
 */
export function loadPreferredFocusDurationMinutes(storage) {
  const store = storage === undefined ? browserLocalStorageOrNull() : storage;
  if (!store) return FOCUS_DURATION_DEFAULT_MINUTES;
  try {
    const raw = store.getItem(FOCUS_DURATION_STORAGE_KEY);
    if (!raw) return FOCUS_DURATION_DEFAULT_MINUTES;
    const parsed = JSON.parse(raw);
    return normalizeFocusDurationMinutes(parsed?.minutes);
  } catch {
    return FOCUS_DURATION_DEFAULT_MINUTES;
  }
}

/**
 * @param {number} minutes
 * @param {Storage | null | undefined} [storage]
 */
export function savePreferredFocusDurationMinutes(minutes, storage) {
  const m = normalizeFocusDurationMinutes(minutes);
  const store = storage === undefined ? browserLocalStorageOrNull() : storage;
  if (!store) return m;
  try {
    store.setItem(
      FOCUS_DURATION_STORAGE_KEY,
      JSON.stringify({ minutes: m })
    );
  } catch {
    /* ignore quota */
  }
  return m;
}

/**
 * 构造 FocusSession 初值 / URL 覆盖目标。
 * - 有 `?sessionMinutes=` → 解析值（可 1–90，供 e2e 短会话）
 * - 否则 → 偏好或产品默认 10（真正开表仍须 chip 或 URL）
 * @param {string} [search]
 * @param {Storage | null | undefined} [storage]
 * @returns {number}
 */
export function resolveFocusSessionTargetMinutes(search = '', storage) {
  if (hasExplicitSessionMinutesQuery(search)) {
    return resolveDemoSessionMinutes(search);
  }
  return loadPreferredFocusDurationMinutes(storage);
}

/**
 * 是否跳过开表前时长 chip（e2e / 调试显式分钟）。
 * @param {string} [search]
 */
export function shouldSkipFocusDurationPicker(search = '') {
  return hasExplicitSessionMinutesQuery(search);
}

export { DEMO_SESSION_MINUTES_DEFAULT, resolveDemoSessionMinutes };
