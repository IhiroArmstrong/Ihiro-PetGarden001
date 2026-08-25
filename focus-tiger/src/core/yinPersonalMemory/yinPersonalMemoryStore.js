/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * In-memory Yin Personal Memory store (tests + renderer cache).
 * Electron persistence lives in desktop/companion/yinPersonalMemoryPersistence.js.
 */

import {
  emptyYinPersonalMemoryState,
  normalizeYinPersonalMemoryState
} from './yinPersonalMemorySchema.js';
import { applyYinMemoryConsent } from './yinPersonalMemoryConsent.js';
import { rememberFromConfideTurn } from './yinPersonalMemoryRemember.js';

export class YinPersonalMemoryStore {
  constructor() {
    /** @type {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} */
    this._state = emptyYinPersonalMemoryState();
  }

  /** @returns {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} */
  snapshot() {
    return normalizeYinPersonalMemoryState(this._state);
  }

  /**
   * @param {unknown} raw
   */
  replace(raw) {
    this._state = normalizeYinPersonalMemoryState(raw);
  }

  /**
   * @param {boolean} granted
   * @param {string} [nowIso]
   */
  setConsent(granted, nowIso) {
    this._state = applyYinMemoryConsent(this.snapshot(), granted, nowIso);
  }

  /**
   * @param {{
   *   userText: string,
   *   route: string,
   *   replySource: string,
   *   turnOrdinal?: number,
   *   nowIso?: string
   * }} payload
   * @returns {boolean}
   */
  rememberFromConfideTurn(payload) {
    const { state, remembered } = rememberFromConfideTurn(this.snapshot(), payload);
    this._state = state;
    return remembered;
  }
}
