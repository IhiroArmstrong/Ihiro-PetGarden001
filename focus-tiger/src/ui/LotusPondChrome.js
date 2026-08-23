/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Persistent lotus blooms inside `#sprite-overlay` (**in front of** Yin).
 * Texture must be the incense lotus (`/textures/lotus.png` via
 * IncenseGreeting), never lotus-front-rising / lotus-chest-halo frames.
 * Sleeping / stretched poses must not cover the pond.
 */

import { spiralForViewportWidth, spiralSlotForBloomIndex } from '../core/lotusPondMath.js';

export class LotusPondChrome {
  /**
   * @param {HTMLElement | null} overlayEl `#sprite-overlay`
   */
  constructor(overlayEl) {
    this.overlayEl = overlayEl;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {HTMLElement | null} */
    this.birthRoot = null;
    /** @type {(() => void) | null} */
    this._onResize = null;
  }

  mount() {
    if (!this.overlayEl || this.root?.isConnected) return;
    const pond = document.createElement('div');
    pond.id = 'lotus-pond';
    pond.setAttribute('aria-hidden', 'true');
    pond.style.cssText =
      'position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;';
    this.overlayEl.insertBefore(pond, this.overlayEl.firstChild);
    this.root = pond;

    const stage = this.overlayEl.querySelector('#sprite-stage');
    if (stage && !stage.style.zIndex) {
      stage.style.zIndex = '1';
    }

    const birth = document.createElement('div');
    birth.id = 'lotus-pond-birth-fx';
    birth.setAttribute('aria-hidden', 'true');
    birth.style.cssText =
      'position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden;';
    this.overlayEl.appendChild(birth);
    this.birthRoot = birth;

    if (typeof window !== 'undefined' && !this._onResize) {
      this._onResize = () => this.relayout();
      window.addEventListener('resize', this._onResize);
    }
  }

  /**
   * Boot / QA: plant 0..count-1 with no birth FX.
   * @param {number} count
   * @param {string} src
   */
  renderQuiet(count, src) {
    if (!this.root) this.mount();
    if (!this.root) return;
    this.root.replaceChildren();
    const n = Math.max(0, Math.floor(Number(count)) || 0);
    for (let i = 0; i < n; i += 1) {
      this.plantBloom(i, src);
    }
  }

  /**
   * @param {number} index 0-based
   * @param {string} src de-watermarked incense lotus
   */
  plantBloom(index, src) {
    if (!this.root) this.mount();
    if (!this.root) return;
    const i = Math.floor(Number(index));
    if (!Number.isFinite(i) || i < 0) return;
    if (this.root.querySelector(`[data-lotus-index="${i}"]`)) return;
    const slot = this._slotForIndex(i);
    const el = document.createElement('img');
    el.className = 'lotus-pond-bloom';
    el.dataset.lotusIndex = String(i);
    el.alt = '';
    el.draggable = false;
    el.src = src;
    el.style.cssText = [
      'position:absolute',
      `left:${slot.leftPct}%`,
      `bottom:${slot.bottomPct}%`,
      `width:${slot.widthCss}`,
      'height:auto',
      'transform:translate(-50%,0)',
      'transform-origin:50% 100%',
      'pointer-events:none',
      'user-select:none',
      'filter:drop-shadow(0 6px 14px rgba(120,80,40,.22))'
    ].join(';');
    this.root.appendChild(el);
  }

  /** Recompute spiral slots when the overlay width crosses the wide breakpoint. */
  relayout() {
    if (!this.root) return;
    const spiral = this._spiral();
    for (const el of this.root.querySelectorAll('.lotus-pond-bloom')) {
      const i = Number(el.dataset.lotusIndex);
      if (!Number.isFinite(i) || i < 0) continue;
      const slot = spiralSlotForBloomIndex(i, spiral);
      el.style.left = `${slot.leftPct}%`;
      el.style.bottom = `${slot.bottomPct}%`;
      el.style.width = slot.widthCss;
    }
  }

  /**
   * Layout slot for bloom `index` at the current overlay width.
   * @param {number} index
   */
  slotForIndex(index) {
    return this._slotForIndex(Math.floor(Number(index)) || 0);
  }

  _slotForIndex(index) {
    return spiralSlotForBloomIndex(index, this._spiral());
  }

  _spiral() {
    const width =
      this.overlayEl?.clientWidth ||
      (typeof window !== 'undefined' ? window.innerWidth : 0);
    return spiralForViewportWidth(width);
  }

  /** @returns {number} */
  getPlantedCount() {
    if (!this.root) return 0;
    return this.root.querySelectorAll('.lotus-pond-bloom').length;
  }
}
