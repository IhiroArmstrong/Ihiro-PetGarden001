/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Passive Re-focus follow-up — optional emoji strip after nod-bow + toast.
 * Does not replace REFOCUS_ACKNOWLEDGE observation toast.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { homeClearanceBottomCss } from './homeChromeClearance.js';

export const RESET_ROUTES = Object.freeze({
  STEADY: 'steady',
  GROUND: 'ground',
  BREATH: 'breath',
  LOOK: 'look',
  OVERWHELMED: 'overwhelmed'
});

/** @typedef {'steady' | 'ground' | 'breath' | 'look' | 'overwhelmed'} ResetRoute */

const ROOT_ID = 'recover-reset-offer';
const STYLE_ID = 'recover-reset-offer-styles-v1';
const OFFER_DELAY_MS = 8_200;
const FADE_MS = 320;

/** @type {readonly { emoji: string, route: ResetRoute, labelKey: string }[]} */
const EMOJI_OPTIONS = Object.freeze([
  { emoji: '🌤️', route: RESET_ROUTES.STEADY, labelKey: 'RESET_EMOJI_STEADY' },
  { emoji: '🪨', route: RESET_ROUTES.GROUND, labelKey: 'RESET_EMOJI_HEAVY' },
  { emoji: '💨', route: RESET_ROUTES.BREATH, labelKey: 'RESET_EMOJI_TIGHT' },
  { emoji: '👀', route: RESET_ROUTES.LOOK, labelKey: 'RESET_EMOJI_SCANNING' },
  { emoji: '😰', route: RESET_ROUTES.OVERWHELMED, labelKey: 'RESET_EMOJI_OVERWHELMED' }
]);

export class RecoverResetOfferUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   * @param {object} deps
   * @param {() => boolean} deps.requestSlot
   * @param {() => void} deps.releaseSlot
   * @param {(route: ResetRoute) => void} deps.onSelect
   * @param {() => boolean} [deps.getBusy]
   */
  constructor(container, { requestSlot, releaseSlot, onSelect, getBusy = () => false }) {
    this.container = container;
    this.requestSlot = requestSlot;
    this.releaseSlot = releaseSlot;
    this.onSelect = onSelect;
    this.getBusy = getBusy;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._delayTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    this._visible = false;
    this._offeredThisSession = false;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._visible && this.root) this._refreshCopy(this.root);
    });
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  resetSession() {
    this._offeredThisSession = false;
    this.hide({ immediate: true });
  }

  /**
   * Schedule offer after passive refocus acknowledge (~8s).
   * @returns {boolean} true if scheduled (once per session)
   */
  tryScheduleAfterRefocus() {
    if (this._offeredThisSession) return false;
    this._offeredThisSession = true;
    this._clearDelayTimer();
    this._delayTimer = window.setTimeout(() => {
      this._delayTimer = null;
      this.tryShow();
    }, OFFER_DELAY_MS);
    return true;
  }

  /**
   * @returns {boolean} true if shown
   */
  tryShow() {
    if (this._visible || this.getBusy()) return false;
    if (!this.requestSlot()) return false;

    this.hide({ immediate: true });

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'recover-reset-offer';
    root.dataset.testid = ROOT_ID;
    root.setAttribute('role', 'group');
    root.setAttribute('aria-live', 'polite');

    const prompt = document.createElement('p');
    prompt.className = 'recover-reset-offer__prompt';
    root.appendChild(prompt);

    const row = document.createElement('div');
    row.className = 'recover-reset-offer__emoji-row';
    for (const opt of EMOJI_OPTIONS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'recover-reset-offer__emoji-btn';
      btn.dataset.route = opt.route;
      btn.dataset.testid = `recover-reset-emoji-${opt.route}`;
      btn.innerHTML = `<span class="recover-reset-offer__emoji" aria-hidden="true">${opt.emoji}</span><span class="recover-reset-offer__label"></span>`;
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        btn.classList.add('is-pressed');
        window.setTimeout(() => btn.classList.remove('is-pressed'), 120);
        const route = /** @type {ResetRoute} */ (opt.route);
        this.hide();
        this.onSelect(route);
      });
      row.appendChild(btn);
    }
    root.appendChild(row);

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'recover-reset-offer__dismiss';
    dismiss.dataset.testid = 'recover-reset-offer-dismiss';
    dismiss.setAttribute('aria-label', 'Close');
    dismiss.textContent = '✕';
    dismiss.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
    });
    root.appendChild(dismiss);

    root.style.bottom = homeClearanceBottomCss();
    root.style.top = 'auto';

    this._refreshCopy(root);
    this.container.appendChild(root);
    this.root = root;
    this._visible = true;

    root.getBoundingClientRect();
    root.classList.add('is-visible');
    return true;
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  hide(opts = {}) {
    this._clearDelayTimer();
    if (this._fadeTimer) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = null;
    }

    const root = this.root;
    this.root = null;
    const wasVisible = this._visible;
    this._visible = false;
    if (wasVisible) this.releaseSlot();
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

  _clearDelayTimer() {
    if (this._delayTimer) {
      clearTimeout(this._delayTimer);
      this._delayTimer = null;
    }
  }

  /**
   * @param {HTMLElement} root
   */
  _refreshCopy(root) {
    const prompt = root.querySelector('.recover-reset-offer__prompt');
    if (prompt) prompt.textContent = t('RESET_OFFER_PROMPT');
    root.querySelectorAll('.recover-reset-offer__emoji-btn').forEach((btn) => {
      const route = btn.dataset.route;
      const opt = EMOJI_OPTIONS.find((o) => o.route === route);
      const label = btn.querySelector('.recover-reset-offer__label');
      if (label && opt) label.textContent = t(opt.labelKey);
    });
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .recover-reset-offer {
        position: absolute;
        left: 50%;
        bottom: 88px;
        top: auto;
        z-index: 17;
        width: min(360px, calc(100vw - 32px));
        margin: 0;
        padding: 12px 14px 10px;
        border: 1px solid rgba(196, 165, 116, 0.28);
        border-radius: 16px;
        background: rgba(255, 252, 245, 0.88);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        font: inherit;
        opacity: 0;
        transform: translate(-50%, 12px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
        box-shadow: 0 8px 24px rgba(58, 46, 34, 0.08);
      }
      .recover-reset-offer.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .recover-reset-offer__prompt {
        margin: 0 0 10px;
        font-size: 0.82rem;
        line-height: 1.45;
        text-align: center;
        letter-spacing: 0.01em;
      }
      .recover-reset-offer__emoji-row {
        display: flex;
        gap: 4px;
        justify-content: center;
        flex-wrap: nowrap;
      }
      .recover-reset-offer__emoji-btn {
        display: flex;
        flex: 1 1 0;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 0;
        padding: 6px 2px;
        border: 1px solid rgba(196, 165, 116, 0.22);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.55);
        cursor: pointer;
        font: inherit;
        color: inherit;
      }
      .recover-reset-offer__emoji-btn.is-pressed {
        transform: translateY(1px);
      }
      .recover-reset-offer__emoji {
        font-size: 1.35rem;
        line-height: 1;
      }
      .recover-reset-offer__label {
        font-size: 0.58rem;
        line-height: 1.15;
        opacity: 0.82;
        max-width: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .recover-reset-offer__dismiss {
        position: absolute;
        top: 6px;
        right: 8px;
        border: 0;
        background: transparent;
        color: rgba(58, 46, 34, 0.45);
        font-size: 16px;
        cursor: pointer;
        padding: 2px 4px;
        line-height: 1;
      }
      .recover-reset-offer__dismiss:active {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }
}
