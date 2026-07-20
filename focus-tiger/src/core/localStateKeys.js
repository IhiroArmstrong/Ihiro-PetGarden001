/**
 * Focus Tiger 全部 localStorage key（一键重置用）。
 * 新增 key 时：同步本列表 + docs/SHARED_RESOURCES.md。
 */

export const FOCUS_TIGER_LOCAL_STORAGE_KEYS = Object.freeze([
  'focus-tiger.daily-completions.v1',
  'focus-tiger.honesty-bridge.v1',
  'focus-tiger.intentions.v1',
  'focus-tiger.reflections.v1',
  'focus-tiger.companion-mode.v1',
  'focus-tiger.reminder-quota.v1',
  'focus-tiger.hints-seen.v1',
  'focus-tiger.ambient-nudge.seen.v1'
]);

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
