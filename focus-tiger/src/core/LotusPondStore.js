/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lifetime practice minutes for the lotus pond. Only-add.
 *
 * MUST NOT reuse PracticeDaysStore / mustard-seal `lifetimeMinutes`
 * (those roll off a 90-day window). This key is an independent counter.
 *
 * scoreFormula.v3: `scoreEligibleLifetimeMinutes` accrues with a per-calendar-day
 * soft cap; raw `lifetimeMinutes` stays uncapped (blooms / presentation).
 */

import {
  bloomCountForMinutes,
  newBloomIndices
} from './lotusPondMath.js';
import {
  DAILY_SCORE_CAP_MINUTES,
  resolveScoreEligibleIncrement
} from './scoreDailyCap.js';
import { getLocalDateKey } from '../utils/localDate.js';

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

/**
 * @param {unknown} raw
 * @returns {{
 *   lifetimeMinutes: number,
 *   scoreEligibleLifetimeMinutes: number,
 *   scoreCapDayKey: string | null,
 *   scoreCapDayEligibleMinutes: number
 * }}
 */
export function normalizeLotusPondState(raw) {
  const lifetimeMinutes = parseLotusPondLifetimeMinutes(raw);
  let scoreEligibleLifetimeMinutes = lifetimeMinutes;
  if (raw && typeof raw === 'object' && 'scoreEligibleLifetimeMinutes' in raw) {
    const n = Number(
      /** @type {{ scoreEligibleLifetimeMinutes?: unknown }} */ (raw)
        .scoreEligibleLifetimeMinutes
    );
    if (Number.isFinite(n) && n >= 0) {
      scoreEligibleLifetimeMinutes = n;
    }
  }
  const scoreCapDayKey =
    raw &&
    typeof raw === 'object' &&
    typeof /** @type {{ scoreCapDayKey?: unknown }} */ (raw).scoreCapDayKey ===
      'string'
      ? /** @type {{ scoreCapDayKey: string }} */ (raw).scoreCapDayKey
      : null;
  let scoreCapDayEligibleMinutes = 0;
  if (raw && typeof raw === 'object' && 'scoreCapDayEligibleMinutes' in raw) {
    const n = Number(
      /** @type {{ scoreCapDayEligibleMinutes?: unknown }} */ (raw)
        .scoreCapDayEligibleMinutes
    );
    if (Number.isFinite(n) && n >= 0) {
      scoreCapDayEligibleMinutes = Math.min(n, DAILY_SCORE_CAP_MINUTES);
    }
  }
  return {
    lifetimeMinutes,
    scoreEligibleLifetimeMinutes,
    scoreCapDayKey,
    scoreCapDayEligibleMinutes
  };
}

export class LotusPondStore {
  /**
   * @param {{ storage?: Storage | null, storageKey?: string, now?: () => Date }} [opts]
   */
  constructor(opts = {}) {
    this.storage =
      opts.storage === undefined ? getDefaultStorage() : opts.storage;
    this.storageKey = opts.storageKey ?? LOTUS_POND_STORAGE_KEY;
    this._now = opts.now ?? (() => new Date());
    /** @type {ReturnType<typeof normalizeLotusPondState>} */
    this._memoryState = normalizeLotusPondState(null);
    this._read();
  }

  /** @returns {number} */
  getLifetimeMinutes() {
    return this._read().lifetimeMinutes;
  }

  /** @returns {number} */
  getScoreEligibleLifetimeMinutes() {
    return this._read().scoreEligibleLifetimeMinutes;
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
    const state = this._read();
    const previousMinutes = state.lifetimeMinutes;
    const delta = Number(durationMinutes);
    const add = Number.isFinite(delta) && delta > 0 ? delta : 0;
    if (add <= 0) {
      const previousBloomCount = bloomCountForMinutes(previousMinutes);
      return {
        previousMinutes,
        nextMinutes: previousMinutes,
        previousBloomCount,
        nextBloomCount: previousBloomCount,
        newBloomIndices: []
      };
    }

    const dateKey = getLocalDateKey(this._now());
    let scoreCapDayKey = state.scoreCapDayKey;
    let scoreCapDayEligibleMinutes = state.scoreCapDayEligibleMinutes;
    if (scoreCapDayKey !== dateKey) {
      scoreCapDayKey = dateKey;
      scoreCapDayEligibleMinutes = 0;
    }

    const { eligibleAdd, overflow } = resolveScoreEligibleIncrement(
      scoreCapDayEligibleMinutes,
      add
    );
    if (overflow > 0) {
      console.info(
        `[focus-tiger] lotus score daily cap: ${overflow} min over ${DAILY_SCORE_CAP_MINUTES}/day not counted toward practice score (lifetime minutes still accrue).`
      );
    }

    const nextMinutes = previousMinutes + add;
    const nextScoreEligible =
      state.scoreEligibleLifetimeMinutes + eligibleAdd;
    this._write({
      lifetimeMinutes: nextMinutes,
      scoreEligibleLifetimeMinutes: nextScoreEligible,
      scoreCapDayKey,
      scoreCapDayEligibleMinutes: scoreCapDayEligibleMinutes + eligibleAdd
    });

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
   * Grandfathers score-eligible minutes to the same total.
   * @param {number} minutes
   */
  replaceLifetimeMinutes(minutes) {
    const n = Number(minutes);
    const next = Number.isFinite(n) && n >= 0 ? n : 0;
    this._write({
      lifetimeMinutes: next,
      scoreEligibleLifetimeMinutes: next,
      scoreCapDayKey: null,
      scoreCapDayEligibleMinutes: 0
    });
  }

  _read() {
    if (!this.storage) return this._memoryState;
    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      this._memoryState = normalizeLotusPondState(parsed);
    } catch {
      // keep memory
    }
    return this._memoryState;
  }

  /** @param {ReturnType<typeof normalizeLotusPondState>} state */
  _write(state) {
    this._memoryState = {
      lifetimeMinutes: state.lifetimeMinutes,
      scoreEligibleLifetimeMinutes: state.scoreEligibleLifetimeMinutes,
      scoreCapDayKey: state.scoreCapDayKey,
      scoreCapDayEligibleMinutes: state.scoreCapDayEligibleMinutes
    };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      // ignore
    }
  }
}
