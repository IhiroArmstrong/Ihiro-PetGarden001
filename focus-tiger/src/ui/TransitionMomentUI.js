/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Transition Moment overlay — ~10s boundary marking (palmsTogether + CAW-T).
 * Idle-only; blocks Yin tap; pure CSS backdrop (no LightProgression).
 */

import { findCalmActionTransitionEntry } from '../content/calm-action-wisdom/index.js';
import { getLocale, onLocaleChange } from '../locales/i18n.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';

const ROOT_ID = 'transition-moment-overlay';
const QUOTE_ID = 'transition-moment-quote';
const STYLE_ID = 'transition-moment-overlay-styles-v1';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;
const HOLD_MS = 8000;
const QUOTE_FADE_MS = 380;

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
    this.store = store;
    this.handlers = handlers;
    this._open = false;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    /** @type {string | null} */
    this._activeQuoteId = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'transition-moment-backdrop',
      testId: 'transition-moment-backdrop',
      zIndex: 17,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = ROOT_ID;
    this.root.className = 'transition-moment-overlay';
    this.root.hidden = true;
    this.root.dataset.testid = ROOT_ID;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', QUOTE_ID);

    this.quoteEl = document.createElement('p');
    this.quoteEl.id = QUOTE_ID;
    this.quoteEl.className = 'transition-moment-overlay__quote';
    this.quoteEl.dataset.testid = 'transition-moment-quote';
    this.quoteEl.setAttribute('aria-live', 'polite');

    this.root.appendChild(this.quoteEl);
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (!this._open || !this._activeQuoteId) return;
      const entry = findCalmActionTransitionEntry(
        this._activeQuoteId,
        getLocale()
      );
      if (entry?.text) this.quoteEl.textContent = entry.text;
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

    this._open = true;
    this._activeQuoteId = entry.id;
    this.quoteEl.textContent = entry.text;
    this.root.hidden = false;
    this.root.classList.remove('is-closing');
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    showOverlayBackdrop(this.backdrop);
    this.handlers.onPlayPalmsTogether?.();
    this.handlers.onOpen?.();

    this._holdTimer = window.setTimeout(() => this.close(), HOLD_MS);
    return true;
  }

  close() {
    if (!this._open) return;
    this._clearTimers();
    this._open = false;
    this._activeQuoteId = null;
    this.root.classList.remove('is-visible');
    this.root.classList.add('is-closing');
    hideOverlayBackdrop(this.backdrop);
    this.handlers.onReturnIdle?.();
    this.handlers.releaseSlot?.();
    this.handlers.onClose?.();
    this._fadeTimer = window.setTimeout(() => {
      this._fadeTimer = null;
      this.root.hidden = true;
      this.root.classList.remove('is-closing');
    }, QUOTE_FADE_MS + 40);
  }

  destroy() {
    this._unsubLocale?.();
    this._clearTimers();
    document.removeEventListener('keydown', this._onKeyDown);
    this.close();
    this.root.remove();
    this.backdrop?.remove?.();
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
      .transition-moment-overlay {
        position: fixed;
        inset: 0;
        z-index: 17;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 20px;
        pointer-events: none;
        opacity: 0;
        transition: opacity ${QUOTE_FADE_MS}ms ease;
      }
      .transition-moment-overlay.is-visible {
        opacity: 1;
        pointer-events: auto;
      }
      .transition-moment-overlay.is-closing {
        opacity: 0;
        pointer-events: none;
      }
      .transition-moment-overlay__quote {
        max-width: min(360px, calc(100vw - 40px));
        margin: 0;
        padding: 14px 20px;
        border: 1px solid rgba(196, 165, 116, 0.32);
        border-radius: 16px;
        background: rgba(255, 251, 243, 0.86);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        font: inherit;
        font-size: 0.9rem;
        font-weight: 460;
        letter-spacing: 0.015em;
        line-height: 1.55;
        text-align: center;
        box-shadow: 0 8px 28px rgba(58, 46, 34, 0.08);
        transform: translateY(10px);
        transition: transform ${QUOTE_FADE_MS}ms ease;
      }
      .transition-moment-overlay.is-visible .transition-moment-overlay__quote {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }
}
