/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Persistent lotus blooms inside Where you are (`#growth-journey-lotus-row`).
 * Idle Yin stage must never host the pond.
 * Texture must be the incense lotus (`/textures/lotus.png`), never
 * lotus-front-rising / lotus-chest-halo frames.
 */

/** Half of the retired Idle width `min(12vw, 96px)`. */
export const LOTUS_ROW_BLOOM_WIDTH_CSS = 'min(6vw, 48px)';

export class LotusPondChrome {
  constructor() {
    /** @type {HTMLElement | null} */
    this.root = null;
  }

  /**
   * @param {HTMLElement | null} rowEl `#growth-journey-lotus-row`
   */
  attach(rowEl) {
    this.root = rowEl || null;
  }

  /**
   * @param {number} count
   * @param {string} src
   */
  renderQuiet(count, src) {
    if (!this.root) return;
    this.root.replaceChildren();
    const n = Math.max(0, Math.floor(Number(count)) || 0);
    this.root.hidden = n === 0;
    for (let i = 0; i < n; i += 1) {
      this.plantBloom(i, src, { quiet: true });
    }
  }

  /**
   * @param {number} index 0-based
   * @param {string} src de-watermarked incense lotus
   * @param {{ quiet?: boolean }} [opts]
   */
  plantBloom(index, src, opts = {}) {
    if (!this.root) return;
    const i = Math.floor(Number(index));
    if (!Number.isFinite(i) || i < 0) return;
    if (this.root.querySelector(`[data-lotus-index="${i}"]`)) return;
    const quiet = opts.quiet === true;
    this.root.hidden = false;
    const el = document.createElement('img');
    el.className = 'lotus-pond-bloom';
    el.dataset.lotusIndex = String(i);
    el.alt = '';
    el.draggable = false;
    el.src = src;
    el.style.cssText = [
      'flex:1 1 0',
      'min-width:0',
      `max-width:${LOTUS_ROW_BLOOM_WIDTH_CSS}`,
      'width:auto',
      'height:auto',
      'transform-origin:50% 100%',
      `transform:scale(${quiet ? 1 : 0.58})`,
      `opacity:${quiet ? 1 : 0}`,
      'pointer-events:none',
      'user-select:none',
      'filter:drop-shadow(0 4px 8px rgba(120,80,40,.18))'
    ].join(';');
    this.root.appendChild(el);
    if (quiet) return;
    requestAnimationFrame(() => {
      el.style.transition =
        'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    });
  }

  /** @returns {number} */
  getPlantedCount() {
    if (!this.root) return 0;
    return this.root.querySelectorAll('.lotus-pond-bloom').length;
  }
}
