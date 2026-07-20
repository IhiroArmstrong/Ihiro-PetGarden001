import { getLocalDateKey } from '../utils/localDate.js';

export { getLocalDateKey };

export const SHARED_DAILY_REMINDER_LIMIT = 3;

/** 与 `localStateKeys.js` 白名单同步；新增 key 时两边一起改。 */
export const REMINDER_QUOTA_STORAGE_KEY = 'focus-tiger.reminder-quota.v1';

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export class ReminderQuotaManager {
  /**
   * @param {object} [options]
   * @param {number} [options.dailyLimit]
   * @param {Storage | null} [options.storage]
   * @param {string} [options.storageKey]
   * @param {() => Date} [options.now]
   */
  constructor({
    dailyLimit = SHARED_DAILY_REMINDER_LIMIT,
    storage = getDefaultStorage(),
    storageKey = REMINDER_QUOTA_STORAGE_KEY,
    now = () => new Date()
  } = {}) {
    this.dailyLimit = dailyLimit;
    this.storage = storage;
    this.storageKey = storageKey;
    this.now = now;
    this._memoryState = { dateKey: getLocalDateKey(this.now()), count: 0 };
  }

  /**
   * 三类提醒共用此入口。额度只在返回 true 时扣减。
   * @returns {boolean}
   */
  tryConsume() {
    const state = this._getTodayState();
    if (state.count >= this.dailyLimit) return false;

    const next = { ...state, count: state.count + 1 };
    this._writeState(next);
    return true;
  }

  /** @returns {number} */
  getRemaining() {
    return Math.max(0, this.dailyLimit - this._getTodayState().count);
  }

  /** @returns {{dateKey: string, count: number}} */
  getState() {
    return { ...this._getTodayState() };
  }

  _getTodayState() {
    const today = getLocalDateKey(this.now());
    const stored = this._readState();
    if (stored.dateKey === today) return stored;

    const reset = { dateKey: today, count: 0 };
    this._writeState(reset);
    return reset;
  }

  _readState() {
    if (!this.storage) return this._memoryState;

    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      if (
        parsed &&
        typeof parsed.dateKey === 'string' &&
        Number.isInteger(parsed.count) &&
        parsed.count >= 0
      ) {
        this._memoryState = parsed;
      }
    } catch {
      // localStorage 被禁用、配额异常或数据损坏时，回退到当前进程内存。
    }
    return this._memoryState;
  }

  _writeState(state) {
    this._memoryState = state;
    if (!this.storage) return;

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(state));
    } catch {
      // 持久化不可用时仍保留本次运行期的额度约束。
    }
  }
}
