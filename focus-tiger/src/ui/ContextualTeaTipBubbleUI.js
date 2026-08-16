/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Contextual Buy Yin a Tea — soft side bubble (not a modal wall).
 * Highlight moments only; dismissible; CTA opens Tip Jar.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  markContextualTeaTipDismissed,
  markContextualTeaTipShown,
  shouldOfferContextualTeaTip
} from '../core/contextualTeaTipGate.js';
import { homeClearanceBottomCss } from './homeChromeClearance.js';

const ROOT_ID = 'contextual-tea-tip-bubble';
const STYLE_ID = 'contextual-tea-tip-bubble-styles-v1';
const HOLD_MS = 14_000;
const FADE_MS = 380;

export class ContextualTeaTipBubbleUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   * @param {() => boolean} [handlers.isBusy]
   * @param {() => void} [handlers.onBuyTea]
   * @param {() => void} [handlers.onDismiss]
   */
  constructor(container, handlers = {}) {
    this.container = container;
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    this._visible = false;
    /** @type {string | null} */
    this._reason = null;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._visible) this._paintCopy();
    });
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  /**
   * @param {'session-complete' | 'milestone'} reason
   * @param {{ busy?: boolean, now?: Date | number, delayMs?: number }} [opts]
   * @returns {boolean} true if scheduled/shown
   */
  tryOffer(reason, opts = {}) {
    const busy =
      typeof opts.busy === 'boolean'
        ? opts.busy
        : Boolean(this.handlers.isBusy?.());
    if (
      !shouldOfferContextualTeaTip(this._storage, reason, {
        now: opts.now,
        busy
      })
    ) {
      return false;
    }
    const delayMs = Math.max(0, Number(opts.delayMs) || 0);
    if (delayMs > 0) {
      window.setTimeout(() => {
        this._showNow(reason, opts.now);
      }, delayMs);
      return true;
    }
    return this._showNow(reason, opts.now);
  }

  /**
   * @param {'session-complete' | 'milestone'} reason
   * @param {Date | number} [now]
   * @returns {boolean}
   */
  _showNow(reason, now = Date.now()) {
    const busy = Boolean(this.handlers.isBusy?.());
    if (
      !shouldOfferContextualTeaTip(this._storage, reason, { now, busy })
    ) {
      return false;
    }
    this.hide({ immediate: true });
    markContextualTeaTipShown(this._storage, reason, { now });
    this._reason = reason;

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'contextual-tea-tip';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-labelledby', 'contextual-tea-tip-title');
    root.dataset.testid = 'contextual-tea-tip-bubble';
    root.dataset.reason = reason;

    const title = document.createElement('p');
    title.id = 'contextual-tea-tip-title';
    title.className = 'contextual-tea-tip__title';
    title.dataset.testid = 'contextual-tea-tip-title';

    const body = document.createElement('p');
    body.className = 'contextual-tea-tip__body';

    const actions = document.createElement('div');
    actions.className = 'contextual-tea-tip__actions';

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'contextual-tea-tip__cta';
    cta.dataset.testid = 'contextual-tea-tip-cta';
    cta.addEventListener('click', () => {
      this.hide({ immediate: true });
      this.handlers.onBuyTea?.();
    });

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'contextual-tea-tip__dismiss';
    dismiss.dataset.testid = 'contextual-tea-tip-dismiss';
    dismiss.addEventListener('click', () => {
      markContextualTeaTipDismissed(this._storage);
      this.handlers.onDismiss?.();
      this.hide();
    });

    actions.append(cta, dismiss);
    root.append(title, body, actions);
    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._paintCopy();

    requestAnimationFrame(() => {
      root.classList.add('is-visible');
    });

    this._holdTimer = setTimeout(() => {
      this.hide();
    }, HOLD_MS);
    return true;
  }

  _paintCopy() {
    if (!this.root) return;
    const title = this.root.querySelector('.contextual-tea-tip__title');
    const body = this.root.querySelector('.contextual-tea-tip__body');
    const cta = this.root.querySelector('.contextual-tea-tip__cta');
    const dismiss = this.root.querySelector('.contextual-tea-tip__dismiss');
    if (title) {
      title.textContent =
        this._reason === 'milestone'
          ? t('CONTEXTUAL_TEA_TIP_TITLE_MILESTONE')
          : t('CONTEXTUAL_TEA_TIP_TITLE_SESSION');
    }
    if (body) body.textContent = t('CONTEXTUAL_TEA_TIP_BODY');
    if (cta) cta.textContent = t('CONTEXTUAL_TEA_TIP_CTA');
    if (dismiss) dismiss.textContent = t('CONTEXTUAL_TEA_TIP_DISMISS');
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
    if (!root) {
      this._visible = false;
      this._reason = null;
      return;
    }
    if (opts.immediate) {
      root.remove();
      this.root = null;
      this._visible = false;
      this._reason = null;
      return;
    }
    root.classList.remove('is-visible');
    this._fadeTimer = setTimeout(() => {
      root.remove();
      if (this.root === root) {
        this.root = null;
        this._visible = false;
        this._reason = null;
      }
    }, FADE_MS);
  }

  dispose() {
    this.hide({ immediate: true });
    this._unsubLocale?.();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .contextual-tea-tip {
        position: absolute;
        left: 50%;
        bottom: ${homeClearanceBottomCss()};
        transform: translate(-50%, 8px);
        z-index: 17;
        max-width: min(320px, calc(100vw - 40px));
        width: max-content;
        padding: 14px 16px 12px;
        border-radius: 16px;
        background: rgba(255, 252, 247, 0.94);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.72);
        box-shadow: 0 10px 28px rgba(60, 40, 20, 0.12);
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
        text-align: center;
      }
      .contextual-tea-tip.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .contextual-tea-tip__title {
        margin: 0;
        color: #3a2a1c;
        font-size: 14.5px;
        font-weight: 600;
        line-height: 1.45;
      }
      .contextual-tea-tip__body {
        margin: 6px 0 0;
        color: #6a5a4a;
        font-size: 12.5px;
        font-weight: 400;
        line-height: 1.45;
      }
      .contextual-tea-tip__actions {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .contextual-tea-tip__cta {
        appearance: none;
        border: none;
        border-radius: 999px;
        padding: 8px 16px;
        background: rgba(196, 140, 90, 0.92);
        color: #fffaf4;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .contextual-tea-tip__cta:hover {
        background: rgba(180, 124, 76, 0.96);
      }
      .contextual-tea-tip__dismiss {
        appearance: none;
        border: none;
        background: transparent;
        color: #8a7a6a;
        font-size: 12px;
        text-decoration: underline;
        cursor: pointer;
        padding: 4px 8px;
      }
    `;
    document.head.appendChild(style);
  }
}
