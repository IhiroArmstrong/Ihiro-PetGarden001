/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Calm Action Transition quote picker — exclude previous id (windowSize 1).
 * ≠ day lock; ≠ session lock (each trigger re-rolls with one-id exclusion).
 */

import {
  findCalmActionTransitionEntry,
  getCalmActionTransitionPool
} from '../content/calm-action-wisdom/index.js';
import { pickDailyWisdomId } from './DailyWisdomStore.js';

export class CalmActionTransitionStore {
  constructor() {
    /** @type {number} */
    this._triggerOrdinal = 0;
    /** @type {string | null} */
    this._previousQuoteId = null;
  }

  /**
   * @param {string} [locale]
   * @returns {{ id: string, text: string } | null}
   */
  resolveQuote(locale = 'en') {
    const pool = getCalmActionTransitionPool(locale);
    if (!pool.length) return null;

    const poolIds = pool.map((e) => e.id);
    const exclude = this._previousQuoteId ? [this._previousQuoteId] : [];
    this._triggerOrdinal += 1;
    const quoteId = pickDailyWisdomId(
      `caw-transition-${this._triggerOrdinal}`,
      poolIds,
      exclude,
      1
    );
    if (!quoteId) return null;

    this._previousQuoteId = quoteId;
    return findCalmActionTransitionEntry(quoteId, locale);
  }
}
