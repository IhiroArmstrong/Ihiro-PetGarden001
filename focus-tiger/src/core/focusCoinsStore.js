/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 同坐点钱包持久化（L1）。不写 entitlement、不进练习备份 6 key。
 *
 * @see docs/FOCUS_COINS.md
 */

import { getLocalDateKey } from '../utils/localDate.js';
import {
  emptyFocusCoinsDayState,
  emptyFocusCoinsSessionState
} from './focusCoinsLedger.js';

export const FOCUS_COINS_STORAGE_KEY = 'focus-tiger.focus-coins.v1';

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
export function emptyFocusCoinsWallet(dateKey) {
  return {
    balance: 0,
    ownedIds: [],
    equippedTitle: null,
    dateKey,
    day: emptyFocusCoinsDayState(),
    session: emptyFocusCoinsSessionState()
  };
}

/**
 * @param {unknown} raw
 * @param {string} todayKey
 */
export function parseFocusCoinsWallet(raw, todayKey) {
  const fresh = emptyFocusCoinsWallet(todayKey);
  if (!raw || typeof raw !== 'object') return fresh;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const owned = Array.isArray(o.ownedIds)
    ? o.ownedIds.filter((id) => typeof id === 'string')
    : [];
  const dateKey = typeof o.dateKey === 'string' ? o.dateKey : todayKey;
  const day =
    dateKey === todayKey && o.day && typeof o.day === 'object'
      ? { ...emptyFocusCoinsDayState(), ...o.day }
      : emptyFocusCoinsDayState();
  const session =
    o.session && typeof o.session === 'object'
      ? { ...emptyFocusCoinsSessionState(), ...o.session }
      : emptyFocusCoinsSessionState();
  return {
    balance: nonNegInt(o.balance),
    ownedIds: owned,
    equippedTitle:
      typeof o.equippedTitle === 'string' ? o.equippedTitle : null,
    dateKey: todayKey,
    day,
    session
  };
}

export class FocusCoinsStore {
  /**
   * @param {object} [opts]
   * @param {Storage | null} [opts.storage]
   * @param {() => Date} [opts.now]
   */
  constructor({ storage = getDefaultStorage(), now = () => new Date() } = {}) {
    this.storage = storage;
    this.now = now;
    this.storageKey = FOCUS_COINS_STORAGE_KEY;
    /** @type {ReturnType<typeof emptyFocusCoinsWallet> | null} */
    this._memory = null;
  }

  /** @returns {ReturnType<typeof emptyFocusCoinsWallet>} */
  getSnapshot() {
    return this._read();
  }

  /** @returns {number} */
  getBalance() {
    return this._read().balance;
  }

  resetSession() {
    const snap = this._read();
    this._write({
      ...snap,
      session: emptyFocusCoinsSessionState()
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
      balance: snap.balance + nonNegInt(grant?.points),
      day: grant?.nextDay
        ? { ...emptyFocusCoinsDayState(), ...grant.nextDay }
        : snap.day,
      session: grant?.nextSession
        ? { ...emptyFocusCoinsSessionState(), ...grant.nextSession }
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
        session: { ...this._memory.session },
        ownedIds: [...this._memory.ownedIds]
      };
    }
    let parsed = emptyFocusCoinsWallet(today);
    if (this.storage) {
      try {
        const raw = JSON.parse(
          this.storage.getItem(this.storageKey) ?? 'null'
        );
        parsed = parseFocusCoinsWallet(raw, today);
      } catch {
        parsed = emptyFocusCoinsWallet(today);
      }
    } else if (this._memory) {
      parsed = parseFocusCoinsWallet(this._memory, today);
    }
    this._memory = parsed;
    return {
      ...parsed,
      day: { ...parsed.day },
      session: { ...parsed.session },
      ownedIds: [...parsed.ownedIds]
    };
  }

  /** @param {ReturnType<typeof emptyFocusCoinsWallet>} state */
  _write(state) {
    const today = this._today();
    this._memory = {
      ...state,
      dateKey: today,
      day: { ...emptyFocusCoinsDayState(), ...state.day },
      session: { ...emptyFocusCoinsSessionState(), ...state.session },
      ownedIds: [...(state.ownedIds || [])]
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memory));
    } catch {
      // ignore quota / private mode
    }
  }
}
