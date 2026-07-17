/**
 * 当日已完成专注会话记录（正常计时与 Honesty Check-in 共用）。
 * 不做 source / verified 等区分字段——诚实机制下一视同仁。
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const DAILY_COMPLETION_STORAGE_KEY = 'focus-tiger.daily-completions.v1';

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @typedef {{ completedAt: number, durationMinutes: number }} CompletionSession
 * @typedef {{ dateKey: string, sessions: CompletionSession[] }} DailyCompletionState
 */

export class DailyCompletionStore {
  /**
   * @param {object} [options]
   * @param {Storage | null} [options.storage]
   * @param {string} [options.storageKey]
   * @param {() => Date} [options.now]
   */
  constructor({
    storage = getDefaultStorage(),
    storageKey = DAILY_COMPLETION_STORAGE_KEY,
    now = () => new Date()
  } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.now = now;
    /** @type {DailyCompletionState} */
    this._memoryState = {
      dateKey: getLocalDateKey(this.now()),
      sessions: []
    };
  }

  /** 当天是否已有至少一条完成记录（含 Honesty Check-in）。 */
  hasCompletedToday() {
    return this._getTodayState().sessions.length > 0;
  }

  /**
   * 追加一条完成记录。durationMinutes 须为正数。
   * @param {number} durationMinutes
   * @returns {CompletionSession | null}
   */
  recordCompletion(durationMinutes) {
    const minutes = Number(durationMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return null;

    const state = this._getTodayState();
    const entry = {
      completedAt: this.now().getTime(),
      durationMinutes: minutes
    };
    const next = {
      dateKey: state.dateKey,
      sessions: [...state.sessions, entry]
    };
    this._writeState(next);
    return entry;
  }

  /** @returns {CompletionSession[]} */
  getTodaySessions() {
    return [...this._getTodayState().sessions];
  }

  /** @returns {DailyCompletionState} */
  getState() {
    return {
      dateKey: this._getTodayState().dateKey,
      sessions: this.getTodaySessions()
    };
  }

  _getTodayState() {
    const today = getLocalDateKey(this.now());
    const stored = this._readState();
    if (stored.dateKey === today) return stored;

    const reset = { dateKey: today, sessions: [] };
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
        Array.isArray(parsed.sessions)
      ) {
        this._memoryState = {
          dateKey: parsed.dateKey,
          sessions: parsed.sessions.filter(
            (s) =>
              s &&
              Number.isFinite(s.completedAt) &&
              Number.isFinite(s.durationMinutes) &&
              s.durationMinutes > 0
          )
        };
      }
    } catch {
      // 损坏或不可用时回退内存态
    }
    return this._memoryState;
  }

  _writeState(state) {
    this._memoryState = state;
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(state));
    } catch {
      // 持久化失败时仍保留本次运行期状态
    }
  }
}
