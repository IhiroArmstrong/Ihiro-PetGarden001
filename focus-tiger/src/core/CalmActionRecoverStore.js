/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Calm Action Recover quote picker — one id locked per Focus session.
 * ≠ Daily Wisdom day lock; ≠ ACTIVE_RECOVER toast rotation.
 */

import {
  findCalmActionRecoverEntry,
  getCalmActionRecoverPool
} from '../content/calm-action-wisdom/index.js';
import { pickDailyWisdomId } from './DailyWisdomStore.js';

export class CalmActionRecoverStore {
  constructor() {
    /** @type {number} */
    this._sessionEpoch = 0;
    /** @type {string | null} */
    this._quoteId = null;
  }

  /** Call when Focus session starts (same beat as mindfulReminderController.startSession). */
  resetSession() {
    this._sessionEpoch += 1;
    this._quoteId = null;
  }

  /**
   * @param {string} [locale]
   * @returns {{ id: string, text: string } | null}
   */
  resolveQuote(locale = 'en') {
    const pool = getCalmActionRecoverPool(locale);
    if (!pool.length) return null;

    if (this._quoteId) {
      return findCalmActionRecoverEntry(this._quoteId, locale);
    }

    const poolIds = pool.map((e) => e.id);
    const sessionKey = `caw-recover-s${this._sessionEpoch}`;
    const quoteId = pickDailyWisdomId(sessionKey, poolIds, [], 5);
    if (!quoteId) return null;

    this._quoteId = quoteId;
    return findCalmActionRecoverEntry(quoteId, locale);
  }
}
