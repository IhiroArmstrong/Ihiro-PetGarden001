/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Moment Whisper — soft observational line near Yin (Task A′).
 * Not a top Banner; not Hint auto spray.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { markMomentWhisperSeen } from '../core/momentWhispersGate.js';
import { ypeMayShowMomentWhisper } from '../core/yinPersonalizationEngine.js';
import { homeClearanceTopCss } from './homeChromeClearance.js';

const ROOT_ID = 'moment-whisper';
const STYLE_ID = 'moment-whisper-styles-v1';
const HOLD_MS = 3500;
const FADE_MS = 380;

/** @type {Record<string, string>} */
const COPY_KEYS = {
  arrive: 'MOMENT_WHISPER_ARRIVE',
  focus: 'MOMENT_WHISPER_FOCUS',
  recover: 'MOMENT_WHISPER_RECOVER',
  transition: 'MOMENT_WHISPER_TRANSITION',
  reflect: 'MOMENT_WHISPER_REFLECT'
};

export class MomentWhisperUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   * @param {() => boolean} [handlers.isBusy] busy for *current* key (set via tryShow)
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
    this._activeKey = null;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._visible && this.root && this._activeKey) {
        this.root.textContent = t(COPY_KEYS[this._activeKey] || '');
      }
    });
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  /**
   * @param {string} key
   * @param {{ busy?: boolean }} [opts]
   * @returns {boolean} true if shown
   */
  tryShow(key, opts = {}) {
    const busy =
      typeof opts.busy === 'boolean'
        ? opts.busy
        : Boolean(this.handlers.isBusy?.());
    if (!ypeMayShowMomentWhisper(this._storage, key, { busy })) {
      return false;
    }
    this.hide({ immediate: true });

    const copyKey = COPY_KEYS[key];
    if (!copyKey) return false;
    const text = t(copyKey);
    if (!text) return false;

    const root = document.createElement('button');
    root.type = 'button';
    root.id = ROOT_ID;
    root.className = 'moment-whisper';
    root.dataset.testid = 'moment-whisper';
    root.dataset.moment = key;
    root.setAttribute('aria-live', 'polite');
    root.textContent = text;
    root.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
    });

    root.style.top = homeClearanceTopCss();

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._activeKey = key;
    markMomentWhisperSeen(this._storage, key);

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
    this._activeKey = null;
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
      .moment-whisper {
        position: absolute;
        left: 50%;
        top: max(12px, env(safe-area-inset-top, 0px));
        bottom: auto;
        z-index: 17;
        max-width: min(280px, calc(100vw - 56px));
        margin: 0;
        padding: 8px 14px;
        border: 1px solid rgba(196, 165, 116, 0.35);
        border-radius: 999px;
        background: rgba(255, 252, 245, 0.82);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        font: inherit;
        font-size: 0.82rem;
        font-weight: 500;
        letter-spacing: 0.01em;
        line-height: 1.35;
        text-align: center;
        cursor: pointer;
        opacity: 0;
        transform: translate(-50%, 8px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
        box-shadow: none;
      }
      .moment-whisper.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
