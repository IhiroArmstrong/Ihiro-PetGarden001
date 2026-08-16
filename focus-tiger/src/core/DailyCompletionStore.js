/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 当日已完成专注会话记录（正常计时与 Honesty Check-in 共用）。
 * 会话列表一视同仁（无 source 标签）；**Celebrating 日期戳**单独记，
 * 避免 Honesty 补登占掉「当日首次达标庆祝」却不播舞。
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
 * @typedef {{
 *   dateKey: string,
 *   sessions: CompletionSession[],
 *   celebrated?: boolean
 * }} DailyCompletionState
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
      sessions: [],
      celebrated: false
    };
  }

  /** 当天是否已有至少一条完成记录（含 Honesty Check-in）。 */
  hasCompletedToday() {
    return this._getTodayState().sessions.length > 0;
  }

  /**
   * 当日是否已播过完整 Celebrating（与「是否有完成记录」解耦）。
   * Honesty 补登只写 sessions，不置本戳。
   */
  hasCelebratedToday() {
    return this._getTodayState().celebrated === true;
  }

  /** 标记当日已触发 Celebrating；同日再调无副作用。 */
  markCelebratedToday() {
    const state = this._getTodayState();
    if (state.celebrated) return;
    this._writeState({ ...state, celebrated: true });
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
      sessions: [...state.sessions, entry],
      celebrated: state.celebrated === true
    };
    this._writeState(next);
    return entry;
  }

  /** @returns {CompletionSession[]} */
  getTodaySessions() {
    return [...this._getTodayState().sessions];
  }

  /** Sum of today's completed session minutes (Honesty + timed; no source split). */
  getTodayTotalMinutes() {
    return this.getTodaySessions().reduce(
      (sum, session) => sum + (Number(session.durationMinutes) || 0),
      0
    );
  }

  /** @returns {DailyCompletionState} */
  getState() {
    const state = this._getTodayState();
    return {
      dateKey: state.dateKey,
      sessions: this.getTodaySessions(),
      celebrated: state.celebrated === true
    };
  }

  _getTodayState() {
    const today = getLocalDateKey(this.now());
    const stored = this._readState();
    if (stored.dateKey === today) return stored;

    const reset = { dateKey: today, sessions: [], celebrated: false };
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
          ),
          celebrated: parsed.celebrated === true
        };
      }
    } catch {
      // 损坏或不可用时回退内存态
    }
    return this._memoryState;
  }

  _writeState(state) {
    this._memoryState = {
      dateKey: state.dateKey,
      sessions: state.sessions,
      celebrated: state.celebrated === true
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      // 持久化失败时仍保留本次运行期状态
    }
  }
}
