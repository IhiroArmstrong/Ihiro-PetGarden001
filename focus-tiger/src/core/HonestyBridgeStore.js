/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Honesty 桥接 CTA 当日是否已展示（与补登完成解耦，仅限频）。
 * 见 docs/HONESTY_BRIDGE_CTA.md
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const HONESTY_BRIDGE_STORAGE_KEY = 'focus-tiger.honesty-bridge.v1';

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @typedef {{ dateKey: string, shown: boolean }} HonestyBridgeState
 */

export class HonestyBridgeStore {
  /**
   * @param {object} [options]
   * @param {Storage | null} [options.storage]
   * @param {string} [options.storageKey]
   * @param {() => Date} [options.now]
   */
  constructor({
    storage = getDefaultStorage(),
    storageKey = HONESTY_BRIDGE_STORAGE_KEY,
    now = () => new Date()
  } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.now = now;
    /** @type {HonestyBridgeState} */
    this._memoryState = {
      dateKey: getLocalDateKey(this.now()),
      shown: false
    };
  }

  /** 今日是否已展示过桥接邀请（不论 Yes / No）。 */
  hasShownToday() {
    return this._getTodayState().shown === true;
  }

  /** 标记今日已展示；同日再调用无副作用。 */
  markShown() {
    const state = this._getTodayState();
    if (state.shown) return;
    this._writeState({ dateKey: state.dateKey, shown: true });
  }

  _getTodayState() {
    const today = getLocalDateKey(this.now());
    const stored = this._readState();
    if (stored.dateKey === today) return stored;

    const reset = { dateKey: today, shown: false };
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
        typeof parsed.shown === 'boolean'
      ) {
        this._memoryState = {
          dateKey: parsed.dateKey,
          shown: parsed.shown
        };
      }
    } catch {
      // 损坏时回退内存态
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
