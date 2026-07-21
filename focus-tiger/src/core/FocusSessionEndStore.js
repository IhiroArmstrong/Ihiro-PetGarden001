/**
 * 最近一次专注会话结束时刻（达标完成或 Rise 未达标均记账）。
 * 供 DORMANT 滚动空闲窗口判定；Honesty 补登不写入本 store。
 */

export const FOCUS_SESSION_END_STORAGE_KEY =
  'focus-tiger.focus-session-end.v1';

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @typedef {{ lastEndedAt: number | null }} FocusSessionEndState
 */

export class FocusSessionEndStore {
  /**
   * @param {object} [options]
   * @param {Storage | null} [options.storage]
   * @param {string} [options.storageKey]
   * @param {() => Date} [options.now]
   */
  constructor({
    storage = getDefaultStorage(),
    storageKey = FOCUS_SESSION_END_STORAGE_KEY,
    now = () => new Date()
  } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.now = now;
    /** @type {FocusSessionEndState} */
    this._memoryState = { lastEndedAt: null };
  }

  /** 是否曾有过至少一次专注会话结束记录。 */
  hasAnyFocusRecordEver() {
    return this.getLastEndedAt() != null;
  }

  /** @returns {number | null} epoch ms */
  getLastEndedAt() {
    const value = this._readState().lastEndedAt;
    return Number.isFinite(value) ? value : null;
  }

  /**
   * @param {number} [endedAt] epoch ms；默认 `now()`
   */
  recordSessionEnded(endedAt = this.now().getTime()) {
    const ts = Number(endedAt);
    if (!Number.isFinite(ts) || ts <= 0) return;
    this._writeState({ lastEndedAt: ts });
  }

  /** @returns {FocusSessionEndState} */
  getState() {
    return { ...this._readState() };
  }

  _readState() {
    if (!this.storage) return this._memoryState;

    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      if (
        parsed &&
        (parsed.lastEndedAt === null || Number.isFinite(parsed.lastEndedAt))
      ) {
        this._memoryState = {
          lastEndedAt:
            parsed.lastEndedAt === null ? null : Number(parsed.lastEndedAt)
        };
      }
    } catch {
      // 损坏时保留内存态
    }
    return this._memoryState;
  }

  /** @param {FocusSessionEndState} state */
  _writeState(state) {
    this._memoryState = {
      lastEndedAt:
        state.lastEndedAt === null ? null : Number(state.lastEndedAt)
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      // 持久化失败仍保留运行期状态
    }
  }
}
