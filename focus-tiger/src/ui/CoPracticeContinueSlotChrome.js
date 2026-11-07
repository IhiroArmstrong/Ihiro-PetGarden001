/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T77 — continue usual practice slot on `#session-start-dock` (no new overlay).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { resolveCoPracticeContinueSlot } from '../core/coPracticeContinueSlot.js';
const STYLE_ID = 'co-practice-continue-slot-styles-v1';

/**
 * @typedef {object} CoPracticeContinueSlotHandlers
 * @property {() => void} [onContinue]
 * @property {() => boolean} [canContinue]
 */

export class CoPracticeContinueSlotChrome {
  /**
   * @param {CoPracticeContinueSlotHandlers} [handlers]
   */
  constructor(handlers = {}) {
    /** @type {CoPracticeContinueSlotHandlers} */
    this.handlers = handlers;
    /** @type {Storage | null} */
    this.storage =
      typeof localStorage !== 'undefined' ? localStorage : null;
    this.btn = null;
    this._mounted = false;
    this._unsubLocale = onLocaleChange(() => this.sync());
    this._injectStyles();
    this._tryMount();
  }

  /**
   * @param {CoPracticeContinueSlotHandlers} handlers
   */
  setHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /** @returns {void} */
  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .session-start-dock__continue-slot {
        position: relative;
        display: block;
        width: min(100%, 280px);
        margin: 0 auto 8px;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(12, 18, 22, 0.42);
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        line-height: 1.35;
        text-align: center;
        cursor: pointer;
        backdrop-filter: blur(8px);
      }
      .session-start-dock__continue-slot:hover {
        border-color: rgba(255, 255, 255, 0.38);
        background: rgba(18, 26, 32, 0.52);
      }
      .session-start-dock__continue-slot:active {
        transform: scale(0.98);
      }
      .session-start-dock__continue-slot:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .session-start-dock__continue-slot[hidden] {
        display: none !important;
      }
      body.ft-narrow-focusing .session-start-dock__continue-slot,
      body.ft-wide-focusing .session-start-dock__continue-slot {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /** @returns {boolean} */
  _tryMount() {
    if (this._mounted) return true;
    const dock = document.getElementById('session-start-dock');
    const focusBtn = document.getElementById('btn-focus');
    if (!dock || !focusBtn) return false;

    this.btn = document.createElement('button');
    this.btn.type = 'button';
    this.btn.id = 'co-practice-continue-slot';
    this.btn.className = 'session-start-dock__continue-slot';
    this.btn.dataset.testid = 'co-practice-continue-slot';
    this.btn.hidden = true;
    this.btn.addEventListener('click', () => {
      if (this.btn?.disabled) return;
      this.handlers.onContinue?.();
    });

    dock.insertBefore(this.btn, focusBtn);
    this._mounted = true;
    this.sync();
    return true;
  }

  /** @returns {void} */
  sync() {
    if (!this._tryMount() || !this.btn) return;
    const model = resolveCoPracticeContinueSlot(this.storage);
    if (!model) {
      this.btn.hidden = true;
      return;
    }

    const templateLabel = model.templateLabelKey
      ? t(model.templateLabelKey)
      : t('CO_PRACTICE_CONTINUE_SLOT_CUSTOM_TEMPLATE');
    const label = t('CO_PRACTICE_CONTINUE_SLOT_LABEL', {
      minutes: String(model.minutes),
      template: templateLabel
    });

    this.btn.textContent = label;
    this.btn.setAttribute('aria-label', t('CO_PRACTICE_CONTINUE_SLOT_ARIA'));
    const can = this.handlers.canContinue?.() !== false;
    this.btn.disabled = !can;
    this.btn.hidden = false;
  }

  /** @returns {void} */
  destroy() {
    this._unsubLocale?.();
    this.btn?.remove();
    this.btn = null;
    this._mounted = false;
  }
}
