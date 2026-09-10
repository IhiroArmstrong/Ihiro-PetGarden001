/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Calm Action Reflect quote picker — one id per calendar day.
 * ≠ Daily Wisdom day lock; ≠ Reflection echo rotation.
 */

import {
  findCalmActionReflectEntry,
  getCalmActionReflectPool
} from '../content/calm-action-wisdom/index.js';
import { pickDailyWisdomId } from './DailyWisdomStore.js';

function localDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class CalmActionReflectStore {
  constructor() {
    /** @type {string | null} */
    this._quoteId = null;
    /** @type {string | null} */
    this._lockedDay = null;
  }

  /**
   * @param {string} [locale]
   * @returns {{ id: string, text: string } | null}
   */
  resolveQuote(locale = 'en') {
    const pool = getCalmActionReflectPool(locale);
    if (!pool.length) return null;

    const day = localDateKey();
    if (this._lockedDay !== day) {
      this._lockedDay = day;
      this._quoteId = null;
    }

    if (this._quoteId) {
      return findCalmActionReflectEntry(this._quoteId, locale);
    }

    const poolIds = pool.map((e) => e.id);
    const quoteId = pickDailyWisdomId(`caw-reflect-${day}`, poolIds, [], 5);
    if (!quoteId) return null;

    this._quoteId = quoteId;
    return findCalmActionReflectEntry(quoteId, locale);
  }
}
