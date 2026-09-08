/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Calm Action Arrive quote picker — one id per calendar day, shown once per Arrival flow.
 * ≠ Quiet Line day lock; ≠ Companion / Honesty copy.
 */

import {
  findCalmActionArriveEntry,
  getCalmActionArrivePool
} from '../content/calm-action-wisdom/index.js';
import { pickDailyWisdomId } from './DailyWisdomStore.js';

function localDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class CalmActionArriveStore {
  constructor() {
    /** @type {boolean} */
    this._armed = false;
    /** @type {boolean} */
    this._shownThisFlow = false;
    /** @type {string | null} */
    this._quoteId = null;
    /** @type {string | null} */
    this._lockedDay = null;
  }

  /** Call when Arrival Practice starts (Sit path, not Quick Start). */
  arm() {
    this._armed = true;
    this._shownThisFlow = false;
  }

  disarm() {
    this._armed = false;
    this._shownThisFlow = false;
  }

  /**
   * @param {string} [locale]
   * @returns {{ id: string, text: string } | null}
   */
  resolveQuote(locale = 'en') {
    if (!this._armed || this._shownThisFlow) return null;

    const pool = getCalmActionArrivePool(locale);
    if (!pool.length) return null;

    const day = localDateKey();
    if (this._lockedDay !== day) {
      this._lockedDay = day;
      this._quoteId = null;
    }

    if (this._quoteId) {
      return findCalmActionArriveEntry(this._quoteId, locale);
    }

    const poolIds = pool.map((e) => e.id);
    const quoteId = pickDailyWisdomId(`caw-arrive-${day}`, poolIds, [], 5);
    if (!quoteId) return null;

    this._quoteId = quoteId;
    return findCalmActionArriveEntry(quoteId, locale);
  }

  markShown() {
    this._shownThisFlow = true;
  }
}
