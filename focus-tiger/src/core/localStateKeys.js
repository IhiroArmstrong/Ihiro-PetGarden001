/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Tiger 全部 localStorage key（一键重置用）。
 * 新增 key 时：同步本列表 + docs/SHARED_RESOURCES.md。
 */

export const FOCUS_TIGER_LOCAL_STORAGE_KEYS = Object.freeze([
  'focus-tiger.daily-completions.v1',
  'focus-tiger.focus-session-end.v1',
  'focus-tiger.practice-days.v1',
  'focus-tiger.lotus-pond.v1',
  'focus-tiger.milestone-glow.v1',
  'focus-tiger.ritual-completions.v1',
  'focus-tiger.honesty-bridge.v1',
  'focus-tiger.retention-funnel.v1',
  'focus-tiger.intentions.v1',
  'focus-tiger.reflections.v1',
  'focus-tiger.presence-signals.v1',
  'focus-tiger.companion-mode.v1',
  'focus-tiger.reminder-quota.v1',
  'focus-tiger.reminder-preference.v1',
  'focus-tiger.hints-seen.v1',
  'focus-tiger.ambient-nudge.seen.v1',
  'focus-tiger.ambient-pref.v1',
  'focus-tiger.session-cues.v1',
  'focus-tiger.locale.v1',
  'focus-tiger.locale-greeting.v1',
  'focus-tiger.scene-anim-cooldown.v1',
  'focus-tiger.scene-anim-daily.v1',
  'focus-tiger.flower-welcome.v1',
  'focus-tiger.flower-welcome-flag.v1',
  'focus-tiger.tip-jar.v1',
  'focus-tiger.contextual-tea-tip.v1',
  'focus-tiger.monetization-funnel.v1',
  'focus-tiger.monetization-funnel-opt-in.v1',
  'focus-tiger.newsletter-capture.v1',
  'focus-tiger.sanctuary-entitlement.v1',
  'focus-tiger.entitlement-cache.v1',
  'focus-tiger.companion-entitlement.v1',
  'focus-tiger.entitlement-ownership.v1',
  'focus-tiger.entitlement-mock.v1',
  'focus-tiger.membership-device.v1',
  'focus-tiger.five-moments-compass-seen.v1',
  'focus-tiger.wellness-disclaimer-seen.v1',
  'focus-tiger.moment-whispers-seen.v1',
  'focus-tiger.journey-log.v1',
  'focus-tiger.practice-backup.v1',
  'focus-tiger.daily-wisdom.v1',
  'focus-tiger.mustard-seed-seal.v1',
  'focus-tiger.daily-zen-quote-pool-v2.v1',
  'focus-tiger.idle-companion-pip.v1',
  'focus-tiger.focus-coins.v1'
]);

/** sessionStorage：重置后首屏 toast（不写入 localStorage，避免被清空逻辑误伤）。 */
export const DEV_RESET_TOAST_SESSION_KEY = 'focus-tiger.dev-reset-toast.v1';

/** sessionStorage：DEV 重置后直接进入 idle 坐禅（测动画用）。 */
export const DEV_BOOT_IDLE_SESSION_KEY = 'focus-tiger.dev-boot-idle.v1';

function getSessionStorage() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function markDevResetToast(storage = getSessionStorage()) {
  try {
    storage?.setItem(DEV_RESET_TOAST_SESSION_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function consumeDevResetToast(storage = getSessionStorage()) {
  try {
    if (storage?.getItem(DEV_RESET_TOAST_SESSION_KEY) !== '1') return false;
    storage.removeItem(DEV_RESET_TOAST_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function markDevBootIdle(storage = getSessionStorage()) {
  try {
    storage?.setItem(DEV_BOOT_IDLE_SESSION_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function consumeDevBootIdle(storage = getSessionStorage()) {
  try {
    if (storage?.getItem(DEV_BOOT_IDLE_SESSION_KEY) !== '1') return false;
    storage.removeItem(DEV_BOOT_IDLE_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * 清空本项目相关 localStorage（仅 focus-tiger.* 白名单）。
 * @param {Storage | { removeItem(key: string): void, getItem?: Function }} [storage]
 * @returns {string[]} 实际尝试清除的 key 列表
 */
export function clearAllFocusTigerLocalState(
  storage = globalThis.localStorage
) {
  if (!storage?.removeItem) return [];
  for (const key of FOCUS_TIGER_LOCAL_STORAGE_KEYS) {
    try {
      storage.removeItem(key);
    } catch {
      // 隐私模式等：忽略单 key 失败
    }
  }
  return [...FOCUS_TIGER_LOCAL_STORAGE_KEYS];
}
