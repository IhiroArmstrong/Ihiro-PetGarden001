/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 同坐点钱包持久化（L1 发点 / L2 兑换）。不写 entitlement、不进练习备份 6 key。
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

/** @returns {{ honestyWake: boolean, activeRecover: boolean }} */
export function emptyFocusCoinsLifetimeMarks() {
  return { honestyWake: false, activeRecover: false };
}

/**
 * @param {unknown} raw
 * @returns {{ honestyWake: boolean, activeRecover: boolean }}
 */
export function parseFocusCoinsLifetimeMarks(raw) {
  const fresh = emptyFocusCoinsLifetimeMarks();
  if (!raw || typeof raw !== 'object') return fresh;
  const o = /** @type {Record<string, unknown>} */ (raw);
  return {
    honestyWake: o.honestyWake === true,
    activeRecover: o.activeRecover === true
  };
}

/**
 * Owned cosmetic ids only grow.
 * @param {string[]} prev
 * @param {string[]} next
 */
export function unionOwnedIds(prev, next) {
  return [...new Set([...(prev || []), ...(next || [])].filter((id) => typeof id === 'string'))];
}

/**
 * @param {string} dateKey
 */
export function emptyFocusCoinsWallet(dateKey) {
  return {
    balance: 0,
    ownedIds: [],
    equippedTitle: null,
    lifetimeMarks: emptyFocusCoinsLifetimeMarks(),
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
    lifetimeMarks: parseFocusCoinsLifetimeMarks(o.lifetimeMarks),
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

  /**
   * Spend coins; owned ids are unioned (只增不减).
   * @param {{
   *   balance?: number,
   *   ownedIds?: string[],
   *   equippedTitle?: string | null
   * }} redeem
   */
  commitRedeem(redeem) {
    const snap = this._read();
    const nextTitle =
      redeem?.equippedTitle === undefined
        ? snap.equippedTitle
        : redeem.equippedTitle;
    this._write({
      ...snap,
      balance: nonNegInt(redeem?.balance),
      ownedIds: unionOwnedIds(snap.ownedIds, redeem?.ownedIds || []),
      equippedTitle:
        typeof nextTitle === 'string' ? nextTitle : null
    });
  }

  /**
   * @param {string | null} titleId
   * @returns {boolean}
   */
  equipTitle(titleId) {
    const snap = this._read();
    if (titleId == null) {
      this._write({ ...snap, equippedTitle: null });
      return true;
    }
    if (typeof titleId !== 'string' || !snap.ownedIds.includes(titleId)) {
      return false;
    }
    this._write({ ...snap, equippedTitle: titleId });
    return true;
  }

  /**
   * @param {{ honestyWake?: boolean, activeRecover?: boolean }} marks
   */
  markLifetime(marks = {}) {
    const snap = this._read();
    this._write({
      ...snap,
      lifetimeMarks: {
        honestyWake:
          marks.honestyWake === true
            ? true
            : snap.lifetimeMarks.honestyWake,
        activeRecover:
          marks.activeRecover === true
            ? true
            : snap.lifetimeMarks.activeRecover
      }
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
        ownedIds: [...this._memory.ownedIds],
        lifetimeMarks: { ...this._memory.lifetimeMarks }
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
      ownedIds: [...parsed.ownedIds],
      lifetimeMarks: { ...parsed.lifetimeMarks }
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
      ownedIds: [...(state.ownedIds || [])],
      lifetimeMarks: parseFocusCoinsLifetimeMarks(state.lifetimeMarks)
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memory));
    } catch {
      // ignore quota / private mode
    }
  }
}
