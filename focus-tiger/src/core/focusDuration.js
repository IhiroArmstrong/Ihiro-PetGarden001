/**
 * Sit → Focus 开表前时长（与 Breath practice 档位差异化）。
 * 产品 chip：15 / 25 / 45 / 60；`?sessionMinutes=` 仍可跳过 picker（e2e / 调试）。
 */

import { FOCUS_SESSION_DEFAULT_MINUTES } from '../utils/Constants.js';
import {
  DEMO_SESSION_MINUTES_DEFAULT,
  resolveDemoSessionMinutes
} from './FocusSession.js';

/** @type {readonly number[]} */
export const FOCUS_DURATION_OPTIONS_MINUTES = Object.freeze([15, 25, 45, 60]);

export const FOCUS_DURATION_STORAGE_KEY = 'focus-tiger.focus-duration-pref.v1';

export const FOCUS_DURATION_DEFAULT_MINUTES = FOCUS_SESSION_DEFAULT_MINUTES;

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
    FOCUS_DURATION_OPTIONS_MINUTES.includes(/** @type {15|25|45|60} */ (m))
  ) {
    return m;
  }
  return FOCUS_DURATION_DEFAULT_MINUTES;
}

/**
 * @param {Storage} [storage]
 * @returns {number}
 */
export function loadPreferredFocusDurationMinutes(storage = localStorage) {
  try {
    const raw = storage.getItem(FOCUS_DURATION_STORAGE_KEY);
    if (!raw) return FOCUS_DURATION_DEFAULT_MINUTES;
    const parsed = JSON.parse(raw);
    return normalizeFocusDurationMinutes(parsed?.minutes);
  } catch {
    return FOCUS_DURATION_DEFAULT_MINUTES;
  }
}

/**
 * @param {number} minutes
 * @param {Storage} [storage]
 */
export function savePreferredFocusDurationMinutes(
  minutes,
  storage = localStorage
) {
  const m = normalizeFocusDurationMinutes(minutes);
  try {
    storage.setItem(
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
 * - 否则 → 偏好或产品默认 25（真正开表仍须 chip 或 URL）
 * @param {string} [search]
 * @param {Storage} [storage]
 * @returns {number}
 */
export function resolveFocusSessionTargetMinutes(
  search = '',
  storage = localStorage
) {
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
