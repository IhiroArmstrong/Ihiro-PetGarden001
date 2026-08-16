/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 应用内提醒时间偏好（本地存储）+ 横幅候选判定。
 *
 * 不涉及浏览器 Notification 权限；不渲染 UI（纯逻辑）。
 * 设置入口见 `src/ui/ReminderPreferenceUI.js`（Idle 热力图簇旁的小型时钟图标）；
 * 候选展示由
 * `src/ui/InAppReminderBannerUI.js`（#ui-overlay 顶部居中横幅）渲染。
 * 调用方在 App 启动 / visibilitychange→visible / 状态切换时调用
 * `evaluateInAppReminderBanner`，再决定是否展示横幅（见 `main.js`
 * `syncInAppReminderBanner`）。
 *
 * 形状：`{ hour, minute }` 或 `null`；**无 `enabled` 字段**——
 * 有值即代表已开启提醒，`null`/未设置代表关闭。关闭时直接
 * `setReminderPreference(null)` 清除存储，禁止改用 `enabled:false` 混合形状。
 *
 * 「今日已完成」目前用 `DailyCompletionStore.hasCompletedToday()`
 *（计时会话与 Honesty 共用；微仪式若另开任务再扩展）。
 */

import { DailyCompletionStore } from './DailyCompletionStore.js';

/** 与 `localStateKeys.js` 白名单同步；新增 key 时两边一起改。 */
export const REMINDER_PREFERENCE_STORAGE_KEY =
  'focus-tiger.reminder-preference.v1';

/** i18n key；正文在 locales，禁止硬编码句子。 */
/** Banner copy key — presence, not “waiting” pressure (`PRINCIPLES` 不制造焦虑). */
export const REMINDER_GENTLE_WAITING_MESSAGE_KEY = 'reminder.gentle_waiting';

/** Panel always-on blurb: preference is a daily time, not a one-shot today-only alarm. */
export const REMINDER_DAILY_BLURB_MESSAGE_KEY = 'reminder.daily_blurb';

/** Soft note when chosen time is already past today (still savable). */
export const REMINDER_PAST_TIME_NOTE_KEY = 'reminder.past_time_note';

/** Soft note when today is already practiced (time stays editable for other days). */
export const REMINDER_PRACTICED_TODAY_NOTE_KEY = 'reminder.practiced_today_note';

/**
 * @typedef {{ hour: number, minute: number }} ReminderTimePreference
 * @typedef {{ shouldShow: boolean, messageKey: string | null }} InAppReminderBannerCandidate
 * @typedef {{
 *   dailyBlurbKey: typeof REMINDER_DAILY_BLURB_MESSAGE_KEY,
 *   statusNoteKey: typeof REMINDER_PRACTICED_TODAY_NOTE_KEY | typeof REMINDER_PAST_TIME_NOTE_KEY | null
 * }} ReminderPreferencePanelNotes
 */

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} value
 * @returns {ReminderTimePreference | null}
 */
export function normalizeReminderPreference(value) {
  if (!value || typeof value !== 'object') return null;
  const hour = Number(/** @type {{ hour?: unknown }} */ (value).hour);
  const minute = Number(/** @type {{ minute?: unknown }} */ (value).minute);
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return { hour, minute };
}

/**
 * @param {object} [options]
 * @param {Storage | null} [options.storage]
 * @param {string} [options.storageKey]
 * @returns {ReminderTimePreference | null}
 */
export function getReminderPreference({
  storage = getDefaultStorage(),
  storageKey = REMINDER_PREFERENCE_STORAGE_KEY
} = {}) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey);
    if (raw == null) return null;
    return normalizeReminderPreference(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * 写入提醒时间；传 `null` 清除（代表关闭）。非法值不写入，返回 false。
 * @param {ReminderTimePreference | null} preference
 * @param {object} [options]
 * @param {Storage | null} [options.storage]
 * @param {string} [options.storageKey]
 * @returns {boolean}
 */
export function setReminderPreference(
  preference,
  {
    storage = getDefaultStorage(),
    storageKey = REMINDER_PREFERENCE_STORAGE_KEY
  } = {}
) {
  if (!storage) return false;

  if (preference == null) {
    try {
      storage.removeItem(storageKey);
      return true;
    } catch {
      return false;
    }
  }

  const normalized = normalizeReminderPreference(preference);
  if (!normalized) return false;

  try {
    storage.setItem(storageKey, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {Date} now
 * @param {ReminderTimePreference} preference
 * @returns {boolean}
 */
export function isAtOrPastReminderTime(now, preference) {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return (
    hours > preference.hour ||
    (hours === preference.hour && minutes >= preference.minute)
  );
}

/**
 * 设置面板文案决策：每日说明常显；情境软提示互斥（今日已练优先于「已过时分」）。
 * 过去时分**允许保存**；今日已练时时间**仍可改**（留给以后的日子）。
 *
 * @param {object} [options]
 * @param {boolean} [options.enabled]
 * @param {ReminderTimePreference | null} [options.preference]
 * @param {Date | (() => Date)} [options.now]
 * @param {boolean | (() => boolean)} [options.hasCompletedToday]
 * @returns {ReminderPreferencePanelNotes}
 */
export function resolveReminderPreferencePanelNotes({
  enabled = false,
  preference = null,
  now = () => new Date(),
  hasCompletedToday = false
} = {}) {
  const current = typeof now === 'function' ? now() : now;
  const completed =
    typeof hasCompletedToday === 'function'
      ? hasCompletedToday() === true
      : hasCompletedToday === true;

  /** @type {ReminderPreferencePanelNotes['statusNoteKey']} */
  let statusNoteKey = null;
  if (enabled && preference) {
    if (completed) {
      statusNoteKey = REMINDER_PRACTICED_TODAY_NOTE_KEY;
    } else if (isAtOrPastReminderTime(current, preference)) {
      statusNoteKey = REMINDER_PAST_TIME_NOTE_KEY;
    }
  }

  return {
    dailyBlurbKey: REMINDER_DAILY_BLURB_MESSAGE_KEY,
    statusNoteKey
  };
}

/**
 * 横幅候选判定（纯逻辑，不渲染）。
 * 触发条件（同时满足）：
 * 1) 已设置提醒时间（非 null）
 * 2) 当前本地时分 ≥ 提醒时分
 * 3) 今日尚未完成（正式会话 / Honesty；微仪式另任务）
 *
 * @param {object} [options]
 * @param {() => Date} [options.now]
 * @param {Storage | null} [options.storage]
 * @param {string} [options.storageKey]
 * @param {() => boolean} [options.hasCompletedToday]
 * @returns {InAppReminderBannerCandidate}
 */
export function evaluateInAppReminderBanner({
  now = () => new Date(),
  storage = getDefaultStorage(),
  storageKey = REMINDER_PREFERENCE_STORAGE_KEY,
  hasCompletedToday
} = {}) {
  const preference = getReminderPreference({ storage, storageKey });
  if (!preference) {
    return { shouldShow: false, messageKey: null };
  }

  const current = now();
  if (!isAtOrPastReminderTime(current, preference)) {
    return { shouldShow: false, messageKey: null };
  }

  const completed =
    typeof hasCompletedToday === 'function'
      ? hasCompletedToday()
      : new DailyCompletionStore({ storage, now }).hasCompletedToday();

  if (completed) {
    return { shouldShow: false, messageKey: null };
  }

  return {
    shouldShow: true,
    messageKey: REMINDER_GENTLE_WAITING_MESSAGE_KEY
  };
}
