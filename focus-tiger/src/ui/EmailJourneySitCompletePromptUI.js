/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T93 D4 — Idle post-sit email restore prompt (non-modal, z≈17, no countdown).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { homeClearanceTopCss } from './homeChromeClearance.js';
import { Z } from './zIndexLayers.js';

const ROOT_ID = 'email-journey-sit-complete-prompt';
const STYLE_ID = 'email-journey-sit-complete-prompt-styles-v1';
const FADE_MS = 380;

export class EmailJourneySitCompletePromptUI {
  /**
   * @param {HTMLElement} container
   * @param {object} handlers
   * @param {() => boolean} handlers.requestSlot
   * @param {() => void} handlers.releaseSlot
   * @param {() => void} handlers.onSave
   * @param {() => void} [handlers.onDismiss]
   */
  constructor(container, handlers) {
    this.container = container;
    this.handlers = handlers;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    this._visible = false;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._visible && this.root) this._refreshCopy();
    });
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  /** @returns {boolean} */
  tryShow() {
    if (this._visible) this.hide({ immediate: true });
    if (!this.handlers.requestSlot()) return false;

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'email-journey-sit-complete-prompt';
    root.dataset.testid = ROOT_ID;
    root.setAttribute('role', 'status');
    root.setAttribute('aria-live', 'polite');
    root.tabIndex = -1;

    const prompt = document.createElement('p');
    prompt.className = 'email-journey-sit-complete-prompt__prompt';
    prompt.dataset.testid = 'email-journey-sit-complete-prompt-copy';
    root.appendChild(prompt);

    const actions = document.createElement('div');
    actions.className = 'email-journey-sit-complete-prompt__actions';

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'email-journey-sit-complete-prompt__save';
    save.dataset.testid = 'email-journey-sit-complete-prompt-save';
    save.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide({ immediate: true });
      this.handlers.onSave?.();
    });

    const notNow = document.createElement('button');
    notNow.type = 'button';
    notNow.className = 'email-journey-sit-complete-prompt__not-now';
    notNow.dataset.testid = 'email-journey-sit-complete-prompt-not-now';
    notNow.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
      this.handlers.onDismiss?.();
    });

    actions.append(save, notNow);
    root.appendChild(actions);
    root.style.top = homeClearanceTopCss();

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._refreshCopy();
    root.getBoundingClientRect();
    root.classList.add('is-visible');
    return true;
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  hide(opts = {}) {
    if (this._fadeTimer) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = null;
    }
    const root = this.root;
    this.root = null;
    const wasVisible = this._visible;
    this._visible = false;
    if (wasVisible) this.handlers.releaseSlot?.();
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

  _refreshCopy() {
    if (!this.root) return;
    const prompt = this.root.querySelector(
      '.email-journey-sit-complete-prompt__prompt'
    );
    const save = this.root.querySelector(
      '.email-journey-sit-complete-prompt__save'
    );
    const notNow = this.root.querySelector(
      '.email-journey-sit-complete-prompt__not-now'
    );
    if (prompt) prompt.textContent = t('EMAIL_JOURNEY_SIT_PROMPT');
    if (save) save.textContent = t('EMAIL_JOURNEY_MENU_LABEL');
    if (notNow) notNow.textContent = t('EMAIL_JOURNEY_NOT_NOW');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .email-journey-sit-complete-prompt {
        position: absolute;
        left: 50%;
        top: max(12px, env(safe-area-inset-top, 0px));
        bottom: auto;
        z-index: ${Z.OVERLAY_DIM};
        max-width: min(320px, calc(100vw - 40px));
        margin: 0;
        padding: 12px 14px 14px;
        border: 1px solid rgba(196, 165, 116, 0.35);
        border-radius: 18px;
        background: rgba(255, 252, 245, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        font: inherit;
        text-align: center;
        opacity: 0;
        transform: translate(-50%, 8px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
      }
      .email-journey-sit-complete-prompt.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .email-journey-sit-complete-prompt__prompt {
        margin: 0 0 10px;
        font-size: 14px;
        line-height: 1.45;
        white-space: pre-wrap;
      }
      .email-journey-sit-complete-prompt__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }
      .email-journey-sit-complete-prompt__save,
      .email-journey-sit-complete-prompt__not-now {
        border: 1px solid rgba(120, 95, 60, 0.35);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.75);
        color: inherit;
        font: inherit;
        font-size: 13px;
        padding: 6px 12px;
        cursor: pointer;
      }
      .email-journey-sit-complete-prompt__save {
        background: rgba(196, 165, 116, 0.28);
      }
      .email-journey-sit-complete-prompt__save:active:not(:disabled),
      .email-journey-sit-complete-prompt__not-now:active:not(:disabled) {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }
}
