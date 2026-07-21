/**
 * 当日是否已播过 cloak-sleep 正放（进 DORMANT 过渡）。
 * 跨本地自然日重置；与 DailyCompletionStore 日切模式一致。
 */

import { getLocalDateKey } from '../utils/localDate.js';

export const DORMANT_CLOAK_SLEEP_STORAGE_KEY =
  'focus-tiger.dormant-cloak-sleep.v1';

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @typedef {{ dateKey: string, played: boolean }} DormantCloakSleepState
 */

export class DormantCloakSleepStore {
  /**
   * @param {object} [options]
   * @param {Storage | null} [options.storage]
   * @param {string} [options.storageKey]
   * @param {() => Date} [options.now]
   */
  constructor({
    storage = getDefaultStorage(),
    storageKey = DORMANT_CLOAK_SLEEP_STORAGE_KEY,
    now = () => new Date()
  } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.now = now;
    /** @type {DormantCloakSleepState} */
    this._memoryState = {
      dateKey: getLocalDateKey(this.now()),
      played: false
    };
  }

  hasPlayedCloakSleepToday() {
    const today = getLocalDateKey(this.now());
    const stored = this._readState();
    return stored.dateKey === today && stored.played === true;
  }

  markCloakSleepPlayedToday() {
    const today = getLocalDateKey(this.now());
    this._writeState({ dateKey: today, played: true });
  }

  /** @returns {DormantCloakSleepState} */
  getState() {
    return { ...this._getTodayState() };
  }

  _getTodayState() {
    const today = getLocalDateKey(this.now());
    const stored = this._readState();
    if (stored.dateKey === today) return stored;

    const reset = { dateKey: today, played: false };
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
        typeof parsed.played === 'boolean'
      ) {
        this._memoryState = {
          dateKey: parsed.dateKey,
          played: parsed.played
        };
      }
    } catch {
      // ignore
    }
    return this._memoryState;
  }

  /** @param {DormantCloakSleepState} state */
  _writeState(state) {
    this._memoryState = {
      dateKey: state.dateKey,
      played: state.played === true
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      // ignore
    }
  }
}
