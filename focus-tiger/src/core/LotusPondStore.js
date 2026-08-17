/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lifetime practice minutes for the lotus pond. Only-add.
 *
 * MUST NOT reuse PracticeDaysStore / mustard-seed `lifetimeMinutes`
 * (those roll off a 90-day window). This key is an independent counter.
 */

import {
  bloomCountForMinutes,
  newBloomIndices
} from './lotusPondMath.js';

export const LOTUS_POND_STORAGE_KEY = 'focus-tiger.lotus-pond.v1';

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw
 * @returns {number}
 */
export function parseLotusPondLifetimeMinutes(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
    return raw;
  }
  if (raw && typeof raw === 'object' && 'lifetimeMinutes' in raw) {
    const n = Number(/** @type {{ lifetimeMinutes?: unknown }} */ (raw).lifetimeMinutes);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

export class LotusPondStore {
  /**
   * @param {{ storage?: Storage | null, storageKey?: string }} [opts]
   */
  constructor(opts = {}) {
    this.storage =
      opts.storage === undefined ? getDefaultStorage() : opts.storage;
    this.storageKey = opts.storageKey ?? LOTUS_POND_STORAGE_KEY;
    /** @type {{ lifetimeMinutes: number }} */
    this._memoryState = { lifetimeMinutes: 0 };
    this._read();
  }

  /** @returns {number} */
  getLifetimeMinutes() {
    return this._read().lifetimeMinutes;
  }

  /** @returns {number} */
  getVisibleBloomCount() {
    return bloomCountForMinutes(this.getLifetimeMinutes());
  }

  /**
   * Only-add. Non-positive deltas are no-ops.
   * @param {number} durationMinutes
   * @returns {{
   *   previousMinutes: number,
   *   nextMinutes: number,
   *   previousBloomCount: number,
   *   nextBloomCount: number,
   *   newBloomIndices: number[]
   * }}
   */
  addMinutes(durationMinutes) {
    const previousMinutes = this.getLifetimeMinutes();
    const delta = Number(durationMinutes);
    const add =
      Number.isFinite(delta) && delta > 0 ? delta : 0;
    const nextMinutes = previousMinutes + add;
    if (add > 0) {
      this._write({ lifetimeMinutes: nextMinutes });
    }
    const previousBloomCount = bloomCountForMinutes(previousMinutes);
    const nextBloomCount = bloomCountForMinutes(nextMinutes);
    return {
      previousMinutes,
      nextMinutes,
      previousBloomCount,
      nextBloomCount,
      newBloomIndices: newBloomIndices(previousBloomCount, nextBloomCount)
    };
  }

  /**
   * QA / tests only — may set any non-negative total (including 0).
   * @param {number} minutes
   */
  replaceLifetimeMinutes(minutes) {
    const n = Number(minutes);
    const next = Number.isFinite(n) && n >= 0 ? n : 0;
    this._write({ lifetimeMinutes: next });
  }

  _read() {
    if (!this.storage) return this._memoryState;
    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      const lifetimeMinutes = parseLotusPondLifetimeMinutes(parsed);
      this._memoryState = { lifetimeMinutes };
    } catch {
      // keep memory
    }
    return this._memoryState;
  }

  /** @param {{ lifetimeMinutes: number }} state */
  _write(state) {
    this._memoryState = { lifetimeMinutes: state.lifetimeMinutes };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      // ignore
    }
  }
}
