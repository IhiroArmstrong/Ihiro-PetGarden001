/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Persist minutes immediately; play incense birth FX only when
 * `releaseBirths()` runs (after MilestoneGlow / Celebrating / sessionComplete).
 */

import { spiralSlotForBloomIndex } from '../core/lotusPondMath.js';
import { LotusPondChrome } from './LotusPondChrome.js';

export class LotusPondRuntime {
  /**
   * @param {{
   *   store: import('../core/LotusPondStore.js').LotusPondStore,
   *   overlayEl?: HTMLElement | null,
   *   incenseGreeting: {
   *     getLotusDomSrc: () => string,
   *     playBirthAt: (slot: object, opts?: { container?: HTMLElement | null, onPlanted?: () => void }) => void
   *   },
   *   chrome?: LotusPondChrome
   * }} opts
   */
  constructor(opts) {
    this.store = opts.store;
    this.incenseGreeting = opts.incenseGreeting;
    this.chrome = opts.chrome ?? new LotusPondChrome(opts.overlayEl ?? null);
    /** @type {number[]} */
    this._pending = [];
    this._playing = false;
  }

  boot() {
    this.chrome.mount();
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

  /** Play queued births sequentially (incense FX → persist). */
  releaseBirths() {
    if (this._playing) return;
    this._playNext();
  }

  _playNext() {
    const index = this._pending.shift();
    if (index == null) {
      this._playing = false;
      return;
    }
    this._playing = true;
    const slot = spiralSlotForBloomIndex(index);
    const src = this.incenseGreeting.getLotusDomSrc();
    const onPlanted = () => {
      this.chrome.plantBloom(index, src);
      this._playNext();
    };
    this.incenseGreeting.playBirthAt(slot, {
      container: this.chrome.birthRoot,
      onPlanted
    });
  }
}
