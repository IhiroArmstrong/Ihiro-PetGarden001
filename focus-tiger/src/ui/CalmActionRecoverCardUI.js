/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Active Recover · Calm Action Wisdom card — permission line below center toast.
 * Does not replace ACTIVE_RECOVER_* observation toast.
 */

import { getLocale, onLocaleChange } from '../locales/i18n.js';
import { homeClearanceBottomCss } from './homeChromeClearance.js';

const ROOT_ID = 'calm-action-recover-card';
const STYLE_ID = 'calm-action-recover-card-styles-v1';
const HOLD_MS = 5200;
const FADE_MS = 380;
const SHOW_DELAY_MS = 420;

export class CalmActionRecoverCardUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   * @param {import('../core/CalmActionRecoverStore.js').CalmActionRecoverStore} store
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

  resetSession() {
    this.hide({ immediate: true });
  }

  /**
   * Schedule card after Active Recover toast. Session quote id is locked in store.
   * @returns {boolean} true if scheduled (quote available)
   */
  tryShowAfterActiveRecover() {
    const entry = this.store.resolveQuote(getLocale());
    if (!entry?.text) return false;

    this.hide({ immediate: true });
    this._showTimer = window.setTimeout(() => {
      this._showTimer = null;
      this._render(entry);
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
    root.className = 'calm-action-recover-card';
    root.dataset.testid = ROOT_ID;
    root.setAttribute('aria-live', 'polite');
    root.textContent = entry.text;
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
      .calm-action-recover-card {
        position: absolute;
        left: 50%;
        bottom: 96px;
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
      .calm-action-recover-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
