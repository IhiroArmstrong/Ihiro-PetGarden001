/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Essence wallet persistence (L1). `essenceTotal` only grows; no redeem.
 *
 * @see docs/planning/focus-essence-coin-split-audit.md
 * @see docs/task-briefs/task-focus-essence-slice1.md
 */

import { getLocalDateKey } from '../utils/localDate.js';
import {
  emptyFocusEssenceDayState,
  emptyFocusEssenceSessionState
} from './focusEssenceLedger.js';

export const FOCUS_ESSENCE_STORAGE_KEY = 'focus-tiger.focus-essence.v1';

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function nonNegInt(n) {
  const v = Math.floor(Number(n) || 0);
  return v > 0 ? v : 0;
}

/**
 * @param {string} dateKey
 */
export function emptyFocusEssenceWallet(dateKey) {
  return {
    essenceTotal: 0,
    dateKey,
    day: emptyFocusEssenceDayState(),
    session: emptyFocusEssenceSessionState()
  };
}

/**
 * @param {unknown} raw
 * @param {string} todayKey
 */
export function parseFocusEssenceWallet(raw, todayKey) {
  const fresh = emptyFocusEssenceWallet(todayKey);
  if (!raw || typeof raw !== 'object') return fresh;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const dateKey = typeof o.dateKey === 'string' ? o.dateKey : todayKey;
  const day =
    dateKey === todayKey && o.day && typeof o.day === 'object'
      ? { ...emptyFocusEssenceDayState(), ...o.day }
      : emptyFocusEssenceDayState();
  const session =
    o.session && typeof o.session === 'object'
      ? { ...emptyFocusEssenceSessionState(), ...o.session }
      : emptyFocusEssenceSessionState();
  return {
    essenceTotal: nonNegInt(o.essenceTotal),
    dateKey: todayKey,
    day,
    session
  };
}

export class FocusEssenceStore {
  /**
   * @param {object} [opts]
   * @param {Storage | null} [opts.storage]
   * @param {() => Date} [opts.now]
   */
  constructor({ storage = getDefaultStorage(), now = () => new Date() } = {}) {
    this.storage = storage;
    this.now = now;
    this.storageKey = FOCUS_ESSENCE_STORAGE_KEY;
    /** @type {ReturnType<typeof emptyFocusEssenceWallet> | null} */
    this._memory = null;
  }

  /** @returns {ReturnType<typeof emptyFocusEssenceWallet>} */
  getSnapshot() {
    return this._read();
  }

  /** Re-read persisted state (e.g. after practice backup import). */
  reloadFromStorage() {
    this._memory = null;
    this._read();
  }

  /** @returns {number} */
  getTotal() {
    return this._read().essenceTotal;
  }

  resetSession() {
    const snap = this._read();
    this._write({
      ...snap,
      session: emptyFocusEssenceSessionState()
    });
  }

  /**
   * @param {{
   *   points?: number,
   *   nextDay?: object,
   *   nextSession?: object
   * }} grant
   */
  commitGrant(grant) {
    const snap = this._read();
    this._write({
      ...snap,
      essenceTotal: snap.essenceTotal + nonNegInt(grant?.points),
      day: grant?.nextDay
        ? { ...emptyFocusEssenceDayState(), ...grant.nextDay }
        : snap.day,
      session: grant?.nextSession
        ? { ...emptyFocusEssenceSessionState(), ...grant.nextSession }
        : snap.session
    });
  }

  _today() {
    return getLocalDateKey(this.now());
  }

  _read() {
    const today = this._today();
    if (this._memory && this._memory.dateKey === today) {
      return {
        ...this._memory,
        day: { ...this._memory.day },
        session: { ...this._memory.session }
      };
    }
    let parsed = emptyFocusEssenceWallet(today);
    if (this.storage) {
      try {
        const raw = JSON.parse(
          this.storage.getItem(this.storageKey) ?? 'null'
        );
        parsed = parseFocusEssenceWallet(raw, today);
      } catch {
        parsed = emptyFocusEssenceWallet(today);
      }
    } else if (this._memory) {
      parsed = parseFocusEssenceWallet(this._memory, today);
    }
    this._memory = parsed;
    return {
      ...parsed,
      day: { ...parsed.day },
      session: { ...parsed.session }
    };
  }

  /** @param {ReturnType<typeof emptyFocusEssenceWallet>} state */
  _write(state) {
    const today = this._today();
    this._memory = {
      ...state,
      dateKey: today,
      day: { ...emptyFocusEssenceDayState(), ...state.day },
      session: { ...emptyFocusEssenceSessionState(), ...state.session }
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memory));
    } catch {
      // ignore quota / private mode
    }
  }
}
