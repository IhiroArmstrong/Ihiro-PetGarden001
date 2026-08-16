/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 留存漏斗本地埋点占位（无第三方、无 UI）。
 * 权威节点与口径：docs/RETENTION_FUNNEL.md
 *
 * 正式分析工具选定后：只替换 trackRetentionEvent 的 sink，保持事件名稳定。
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const RETENTION_FUNNEL_STORAGE_KEY = 'focus-tiger.retention-funnel.v1';

export const RETENTION_EVENTS = Object.freeze({
  APP_FIRST_OPEN: 'app_first_open',
  FIRST_SESSION_COMPLETE: 'first_session_complete',
  DAY1_RETURN: 'day1_return',
  DAY3_RETURN: 'day3_return',
  DAY7_RETURN: 'day7_return',
  DAY30_RETURN: 'day30_return',
  DORMANT_BRIDGE_SHOWN: 'dormant_bridge_shown',
  DORMANT_BRIDGE_ACCEPTED: 'dormant_bridge_accepted',
  DORMANT_BRIDGE_DECLINED: 'dormant_bridge_declined',
  /** 微仪式 1 分钟计时结束；仅 console 占位，不参与 first_session / 指标计算 */
  MICRO_RITUAL_COMPLETE: 'micro_ritual_complete',
  /** Advanced RitualFlow scene completed (not MicroRitual / Focus). */
  RITUAL_FLOW_COMPLETE: 'ritual_flow_complete'
});

/** @type {readonly number[]} */
export const RETENTION_RETURN_DAY_THRESHOLDS = Object.freeze([1, 3, 7, 30]);

/** @type {Readonly<Record<number, string>>} */
const RETURN_EVENT_BY_DAY = Object.freeze({
  1: RETENTION_EVENTS.DAY1_RETURN,
  3: RETENTION_EVENTS.DAY3_RETURN,
  7: RETENTION_EVENTS.DAY7_RETURN,
  30: RETENTION_EVENTS.DAY30_RETURN
});

/**
 * @param {string} name
 * @param {Record<string, unknown>} [props]
 * @param {{ log?: (...args: unknown[]) => void }} [options]
 */
export function trackRetentionEvent(name, props = {}, { log = console.log } = {}) {
  log('[RetentionTelemetry]', name, props);
}

/**
 * 本地自然日差（open − first）。非法键 → -1。
 * @param {string} firstOpenDateKey
 * @param {string} openDateKey
 */
export function calendarDaysBetween(firstOpenDateKey, openDateKey) {
  const parse = (key) => {
    const parts = String(key).split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d).getTime();
  };
  const a = parse(firstOpenDateKey);
  const b = parse(openDateKey);
  if (a == null || b == null) return -1;
  return Math.round((b - a) / 86_400_000);
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @typedef {{
 *   firstOpenAt: number | null,
 *   firstOpenDateKey: string | null,
 *   firstSessionCompleteAt: number | null,
 *   emitted: {
 *     day1?: boolean,
 *     day3?: boolean,
 *     day7?: boolean,
 *     day30?: boolean,
 *     firstSession?: boolean
 *   }
 * }} RetentionFunnelState
 */

/**
 * @param {number} threshold
 * @returns {'day1'|'day3'|'day7'|'day30'|null}
 */
function returnEmittedFlag(threshold) {
  if (threshold === 1) return 'day1';
  if (threshold === 3) return 'day3';
  if (threshold === 7) return 'day7';
  if (threshold === 30) return 'day30';
  return null;
}

export class RetentionFunnelStore {
  /**
   * @param {object} [options]
   * @param {Storage | null} [options.storage]
   * @param {string} [options.storageKey]
   * @param {() => Date} [options.now]
   * @param {(name: string, props?: Record<string, unknown>) => void} [options.track]
   */
  constructor({
    storage = getDefaultStorage(),
    storageKey = RETENTION_FUNNEL_STORAGE_KEY,
    now = () => new Date(),
    track = (name, props) => trackRetentionEvent(name, props)
  } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.now = now;
    this.track = track;
    /** @type {RetentionFunnelState} */
    this._memoryState = {
      firstOpenAt: null,
      firstOpenDateKey: null,
      firstSessionCompleteAt: null,
      emitted: {}
    };
  }

  /**
   * App 冷/热启动：首次打开 + dayN 回访判定。
   * @returns {{ firstOpen: boolean, returnEvents: string[] }}
   */
  noteAppOpen() {
    const state = this._read();
    const nowDate = this.now();
    const openAt = nowDate.getTime();
    const openDateKey = getLocalDateKey(nowDate);
    /** @type {string[]} */
    const returnEvents = [];

    if (state.firstOpenAt == null || !state.firstOpenDateKey) {
      const next = {
        ...state,
        firstOpenAt: openAt,
        firstOpenDateKey: openDateKey
      };
      this._write(next);
      this.track(RETENTION_EVENTS.APP_FIRST_OPEN, { firstOpenAt: openAt });
      return { firstOpen: true, returnEvents };
    }

    const daysSince = calendarDaysBetween(state.firstOpenDateKey, openDateKey);
    if (daysSince < 0) {
      return { firstOpen: false, returnEvents };
    }

    const emitted = { ...state.emitted };
    let dirty = false;
    for (const threshold of RETENTION_RETURN_DAY_THRESHOLDS) {
      const flag = returnEmittedFlag(threshold);
      const eventName = RETURN_EVENT_BY_DAY[threshold];
      if (!flag || !eventName) continue;
      if (emitted[flag]) continue;
      if (daysSince < threshold) continue;
      emitted[flag] = true;
      dirty = true;
      this.track(eventName, {
        daysSinceFirstOpen: daysSince,
        firstOpenDateKey: state.firstOpenDateKey,
        openDateKey
      });
      returnEvents.push(eventName);
    }

    if (dirty) {
      this._write({ ...state, emitted });
    }
    return { firstOpen: false, returnEvents };
  }

  /**
   * 生平首次完成（计时或 Honesty）。
   * @param {{ durationMinutes: number }} detail
   * @returns {boolean} 是否实际打出事件
   */
  noteSessionComplete({ durationMinutes }) {
    const minutes = Number(durationMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return false;

    const state = this._read();
    if (state.emitted.firstSession || state.firstSessionCompleteAt != null) {
      return false;
    }

    const completeAt = this.now().getTime();
    // 若尚未记首次打开（极端：完成早于 noteAppOpen），补戳以免 seconds 无意义
    let firstOpenAt = state.firstOpenAt;
    let firstOpenDateKey = state.firstOpenDateKey;
    if (firstOpenAt == null) {
      firstOpenAt = completeAt;
      firstOpenDateKey = getLocalDateKey(this.now());
    }

    const secondsSinceFirstOpen = Math.max(
      0,
      Math.floor((completeAt - firstOpenAt) / 1000)
    );

    this._write({
      firstOpenAt,
      firstOpenDateKey,
      firstSessionCompleteAt: completeAt,
      emitted: { ...state.emitted, firstSession: true }
    });
    this.track(RETENTION_EVENTS.FIRST_SESSION_COMPLETE, {
      secondsSinceFirstOpen,
      durationMinutes: minutes
    });
    return true;
  }

  trackBridgeShown() {
    this.track(RETENTION_EVENTS.DORMANT_BRIDGE_SHOWN, {});
  }

  trackBridgeAccepted() {
    this.track(RETENTION_EVENTS.DORMANT_BRIDGE_ACCEPTED, {});
  }

  trackBridgeDeclined() {
    this.track(RETENTION_EVENTS.DORMANT_BRIDGE_DECLINED, {});
  }

  /** @returns {RetentionFunnelState} */
  getState() {
    const state = this._read();
    return {
      firstOpenAt: state.firstOpenAt,
      firstOpenDateKey: state.firstOpenDateKey,
      firstSessionCompleteAt: state.firstSessionCompleteAt,
      emitted: { ...state.emitted }
    };
  }

  _read() {
    if (!this.storage) return this._memoryState;
    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      if (parsed && typeof parsed === 'object') {
        this._memoryState = {
          firstOpenAt:
            Number.isFinite(parsed.firstOpenAt) ? parsed.firstOpenAt : null,
          firstOpenDateKey:
            typeof parsed.firstOpenDateKey === 'string'
              ? parsed.firstOpenDateKey
              : null,
          firstSessionCompleteAt: Number.isFinite(parsed.firstSessionCompleteAt)
            ? parsed.firstSessionCompleteAt
            : null,
          emitted:
            parsed.emitted && typeof parsed.emitted === 'object'
              ? { ...parsed.emitted }
              : {}
        };
      }
    } catch {
      // keep memory
    }
    return this._memoryState;
  }

  /** @param {RetentionFunnelState} state */
  _write(state) {
    this._memoryState = {
      firstOpenAt: state.firstOpenAt,
      firstOpenDateKey: state.firstOpenDateKey,
      firstSessionCompleteAt: state.firstSessionCompleteAt,
      emitted: { ...state.emitted }
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      // ignore
    }
  }
}
