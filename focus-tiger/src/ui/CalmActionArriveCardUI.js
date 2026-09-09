/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Arrive · Calm Action Wisdom card — permission line before Companion / Sit.
 * Shown after Arrival Practice completes (not Quick Start skip).
 */

import { getLocale, onLocaleChange } from '../locales/i18n.js';

const ROOT_ID = 'calm-action-arrive-card';
const STYLE_ID = 'calm-action-arrive-card-styles-v1';
const HOLD_MS = 6200;
const FADE_MS = 380;
const SHOW_DELAY_MS = 520;

export class CalmActionArriveCardUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   * @param {import('../core/CalmActionArriveStore.js').CalmActionArriveStore} store
   */
  constructor(container, store) {
    this.container = container;
    this.store = store;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._showTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    this._visible = false;
    /** @type {string | null} */
    this._activeQuoteId = null;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (!this._visible || !this.root || !this._activeQuoteId) return;
      const entry = this.store.resolveQuote(getLocale());
      if (entry?.text) this.root.textContent = entry.text;
    });
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  resetFlow() {
    this.hide({ immediate: true });
    this.store.disarm();
  }

  /**
   * Schedule card after Arrival onReady (before Focusing).
   * @returns {boolean} true if scheduled (quote available)
   */
  tryShowAfterArrival() {
    const entry = this.store.resolveQuote(getLocale());
    if (!entry?.text) return false;

    this.hide({ immediate: true });
    this._showTimer = window.setTimeout(() => {
      this._showTimer = null;
      this._render(entry);
      this.store.markShown();
    }, SHOW_DELAY_MS);
    return true;
  }

  /**
   * @param {{ id: string, text: string }} entry
   */
  _render(entry) {
    const root = document.createElement('button');
    root.type = 'button';
    root.id = ROOT_ID;
    root.className = 'calm-action-arrive-card';
    root.dataset.testid = ROOT_ID;
    root.setAttribute('aria-live', 'polite');
    root.textContent = entry.text;
    root.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
    });

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._activeQuoteId = entry.id;

    root.getBoundingClientRect();
    root.classList.add('is-visible');
    this._holdTimer = window.setTimeout(() => this.hide(), HOLD_MS);
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  hide(opts = {}) {
    if (this._showTimer) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
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
    this._activeQuoteId = null;
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
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .calm-action-arrive-card {
        position: absolute;
        left: 50%;
        bottom: max(220px, calc(env(safe-area-inset-bottom, 0px) + 204px));
        top: auto;
        z-index: 17;
        max-width: min(340px, calc(100vw - 40px));
        margin: 0;
        padding: 12px 18px;
        border: 1px solid rgba(196, 165, 116, 0.32);
        border-radius: 16px;
        background: rgba(255, 251, 243, 0.82);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        font: inherit;
        font-size: 0.86rem;
        font-weight: 460;
        letter-spacing: 0.015em;
        line-height: 1.5;
        text-align: center;
        cursor: pointer;
        opacity: 0;
        transform: translate(-50%, 12px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
        box-shadow: 0 8px 24px rgba(58, 46, 34, 0.06);
      }
      .calm-action-arrive-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
