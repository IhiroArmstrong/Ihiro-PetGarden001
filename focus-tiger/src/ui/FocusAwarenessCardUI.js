/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Mid-session awareness card — soft observational line at Focusing bottom.
 * Repeatable every interval beat; does NOT touch Moment Whisper seen store.
 */

import { COPY_POOLS, t, onLocaleChange } from '../locales/i18n.js';
import { homeClearanceBottomCss } from './homeChromeClearance.js';

const ROOT_ID = 'focus-awareness-card';
const STYLE_ID = 'focus-awareness-card-styles-v2';
const HOLD_MS = 4000;
const FADE_MS = 380;
const POOL_KEY = 'FOCUS_AWARENESS';

export class FocusAwarenessCardUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   */
  constructor(container) {
    this.container = container;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    this._visible = false;
    /** @type {string | null} */
    this._activeCopyKey = null;
    /** Session-local rotation (not lifetime seen). */
    this._poolIndex = 0;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._visible && this.root && this._activeCopyKey) {
        this.root.textContent = t(this._activeCopyKey);
      }
    });
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  /** Reset pool cursor between Focus sessions. */
  resetSession() {
    this._poolIndex = 0;
    this.hide({ immediate: true });
  }

  /**
   * @param {{ busy?: boolean }} [opts]
   * @returns {boolean} true if shown
   */
  tryShow(opts = {}) {
    if (opts.busy === true) return false;

    const keys = COPY_POOLS[POOL_KEY];
    if (!keys || keys.length === 0) return false;
    const copyKey = keys[this._poolIndex % keys.length];
    this._poolIndex += 1;
    const text = t(copyKey);
    if (!text) return false;

    this.hide({ immediate: true });

    const root = document.createElement('button');
    root.type = 'button';
    root.id = ROOT_ID;
    root.className = 'focus-awareness-card';
    root.dataset.testid = 'focus-awareness-card';
    root.setAttribute('aria-live', 'polite');
    root.textContent = text;
    root.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
    });

    root.style.bottom = homeClearanceBottomCss();
    root.style.top = 'auto';

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._activeCopyKey = copyKey;

    root.getBoundingClientRect();
    root.classList.add('is-visible');

    this._holdTimer = window.setTimeout(() => this.hide(), HOLD_MS);
    return true;
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  hide(opts = {}) {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
    if (this._fadeTimer) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = null;
    }
    const root = this.root;
    this.root = null;
    this._visible = false;
    this._activeCopyKey = null;
    if (!root) return;
    if (opts.immediate) {
      root.remove();
      return;
    }
    root.classList.remove('is-visible');
    this._fadeTimer = window.setTimeout(() => {
      root.remove();
    }, FADE_MS + 40);
  }

  destroy() {
    this._unsubLocale?.();
    this.hide({ immediate: true });
  }

  _injectStyles() {
    const prior = document.getElementById('focus-awareness-card-styles-v1');
    prior?.remove();
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .focus-awareness-card {
        position: absolute;
        left: 50%;
        bottom: 88px;
        top: auto;
        z-index: 17;
        max-width: min(320px, calc(100vw - 48px));
        margin: 0;
        padding: 10px 16px;
        border: 1px solid rgba(196, 165, 116, 0.28);
        border-radius: 14px;
        background: rgba(255, 252, 245, 0.72);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        font: inherit;
        font-size: 0.84rem;
        font-weight: 450;
        letter-spacing: 0.02em;
        line-height: 1.45;
        text-align: center;
        cursor: pointer;
        opacity: 0;
        transform: translate(-50%, 10px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
        box-shadow: none;
      }
      .focus-awareness-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
