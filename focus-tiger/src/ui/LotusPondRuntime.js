/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Persist minutes immediately; plant visible blooms on the Where you are
 * row only when `releaseBirths()` runs (after MilestoneGlow / Celebrating).
 * Idle overlay is never a pond host.
 */

import { LotusPondChrome } from './LotusPondChrome.js';

export class LotusPondRuntime {
  /**
   * @param {{
   *   store: import('../core/LotusPondStore.js').LotusPondStore,
   *   incenseGreeting: { getLotusDomSrc: () => string },
   *   chrome?: LotusPondChrome
   * }} opts
   */
  constructor(opts) {
    this.store = opts.store;
    this.incenseGreeting = opts.incenseGreeting;
    this.chrome = opts.chrome ?? new LotusPondChrome();
    /** @type {number[]} */
    this._pending = [];
  }

  /**
   * @param {HTMLElement | null} rowEl
   */
  attach(rowEl) {
    this.chrome.attach(rowEl);
  }

  boot() {
    this.chrome.renderQuiet(
      this.store.getVisibleBloomCount(),
      this.incenseGreeting.getLotusDomSrc()
    );
  }

  /**
   * Accrue minutes now; queue visual births for `releaseBirths()`.
   * @param {number} durationMinutes
   */
  notePracticeMinutes(durationMinutes) {
    const result = this.store.addMinutes(durationMinutes);
    for (const idx of result.newBloomIndices) {
      this._pending.push(idx);
    }
    return result;
  }

  /** Plant queued blooms on the Where you are row (fade if the row is attached). */
  releaseBirths() {
    const src = this.incenseGreeting.getLotusDomSrc();
    const pending = this._pending.splice(0);
    for (const index of pending) {
      this.chrome.plantBloom(index, src);
    }
  }
}
