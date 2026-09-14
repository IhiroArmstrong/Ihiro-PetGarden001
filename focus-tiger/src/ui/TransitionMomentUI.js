/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Transition Moment whisper — ~8s CAW-T boundary line near Yin (S21).
 * Non-modal: does not block idle Yin tap; click or auto-dismiss to close.
 */

import { findCalmActionTransitionEntry } from '../content/calm-action-wisdom/index.js';
import { getLocale, onLocaleChange } from '../locales/i18n.js';
import { homeClearanceTopCss } from './homeChromeClearance.js';

const ROOT_ID = 'transition-moment-whisper';
const STYLE_ID = 'transition-moment-whisper-styles-v1';
const HOLD_MS = 8000;
const FADE_MS = 380;

export class TransitionMomentUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {import('../core/CalmActionTransitionStore.js').CalmActionTransitionStore} store
   * @param {object} [handlers]
   * @param {() => boolean} [handlers.requestSlot]
   * @param {() => void} [handlers.releaseSlot]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onPlayPalmsTogether]
   * @param {() => void} [handlers.onReturnIdle]
   */
  constructor(mountRoot, store, handlers = {}) {
    this.mountRoot = mountRoot;
    this.store = store;
    this.handlers = handlers;
    this._open = false;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    /** @type {string | null} */
    this._activeQuoteId = null;

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (!this._open || !this.root || !this._activeQuoteId) return;
      const entry = findCalmActionTransitionEntry(
        this._activeQuoteId,
        getLocale()
      );
      if (entry?.text) this.root.textContent = entry.text;
    });
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  /** @returns {boolean} */
  tryOpen() {
    if (this._open) return false;
    if (this.handlers.requestSlot && !this.handlers.requestSlot()) return false;

    const entry = this.store.resolveQuote(getLocale());
    if (!entry?.text) {
      this.handlers.releaseSlot?.();
      return false;
    }

    this.close({ immediate: true });

    const root = document.createElement('button');
    root.type = 'button';
    root.id = ROOT_ID;
    root.className = 'transition-moment-whisper';
    root.dataset.testid = 'transition-moment-quote';
    root.setAttribute('aria-live', 'polite');
    root.textContent = entry.text;
    root.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    });

    root.style.top = homeClearanceTopCss();
    this.mountRoot.appendChild(root);
    this.root = root;
    this._open = true;
    this._activeQuoteId = entry.id;

    root.getBoundingClientRect();
    root.classList.add('is-visible');
    this.handlers.onPlayPalmsTogether?.();
    this.handlers.onOpen?.();

    this._holdTimer = window.setTimeout(() => this.close(), HOLD_MS);
    return true;
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  close(opts = {}) {
    if (!this._open && !this.root) return;
    this._clearTimers();
    const wasOpen = this._open;
    this._open = false;
    this._activeQuoteId = null;
    const root = this.root;
    this.root = null;
    if (wasOpen) {
      this.handlers.onReturnIdle?.();
      this.handlers.releaseSlot?.();
      this.handlers.onClose?.();
    }
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
    this._clearTimers();
    this.close({ immediate: true });
  }

  _clearTimers() {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
    if (this._fadeTimer) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = null;
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .transition-moment-whisper {
        position: absolute;
        left: 50%;
        top: max(12px, env(safe-area-inset-top, 0px));
        bottom: auto;
        z-index: 17;
        max-width: min(340px, calc(100vw - 56px));
        margin: 0;
        padding: 10px 16px;
        border: 1px solid rgba(196, 165, 116, 0.35);
        border-radius: 16px;
        background: rgba(255, 252, 245, 0.82);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        font: inherit;
        font-size: 0.84rem;
        font-weight: 500;
        letter-spacing: 0.01em;
        line-height: 1.45;
        text-align: center;
        cursor: pointer;
        opacity: 0;
        transform: translate(-50%, 8px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
        box-shadow: none;
      }
      .transition-moment-whisper.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
