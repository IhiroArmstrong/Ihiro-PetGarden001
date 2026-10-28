/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T61 idle work-end invite (non-modal, z≈17).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { AWAKEN_AUTO_DISMISS_MS } from '../core/InterventionOrchestrator.js';
import {
  WORK_END_INVITE_NOT_NOW_KEY,
  WORK_END_INVITE_PROMPT_KEY,
  WORK_END_INVITE_YES_KEY,
  fillWorkEndInvitePrompt,
  getWorkEndPreference
} from '../core/workEndPreference.js';
import { homeClearanceTopCss } from './homeChromeClearance.js';
import { Z } from './zIndexLayers.js';

const ROOT_ID = 'work-end-invite';
const STYLE_ID = 'work-end-invite-styles-v1';
const FADE_MS = 380;

export class WorkEndInviteUI {
  /**
   * @param {HTMLElement} container
   * @param {object} handlers
   * @param {() => boolean} handlers.requestSlot
   * @param {() => void} handlers.releaseSlot
   * @param {() => void} handlers.onAccept
   * @param {(reason: 'dismiss'|'timeout') => void} [handlers.onDismiss]
   * @param {() => Date} [handlers.now]
   */
  constructor(container, handlers) {
    this.container = container;
    this.handlers = handlers;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
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
    const preference = getWorkEndPreference();
    if (!preference) return false;
    if (this._visible) this.hide({ immediate: true });
    if (!this.handlers.requestSlot()) return false;

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'work-end-invite';
    root.dataset.testid = ROOT_ID;
    root.setAttribute('role', 'status');
    root.setAttribute('aria-live', 'polite');
    root.tabIndex = -1;

    const prompt = document.createElement('p');
    prompt.className = 'work-end-invite__prompt';
    prompt.dataset.testid = 'work-end-invite-prompt';
    root.appendChild(prompt);

    const actions = document.createElement('div');
    actions.className = 'work-end-invite__actions';

    const yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'work-end-invite__yes';
    yes.dataset.testid = 'work-end-invite-yes';
    yes.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide({ immediate: true });
      this.handlers.onAccept?.();
    });

    const no = document.createElement('button');
    no.type = 'button';
    no.className = 'work-end-invite__no';
    no.dataset.testid = 'work-end-invite-dismiss';
    no.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
      this.handlers.onDismiss?.('dismiss');
    });

    actions.append(yes, no);
    root.appendChild(actions);
    root.style.top = homeClearanceTopCss();

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._refreshCopy();
    root.getBoundingClientRect();
    root.classList.add('is-visible');
    this._holdTimer = window.setTimeout(() => {
      this.hide();
      this.handlers.onDismiss?.('timeout');
    }, AWAKEN_AUTO_DISMISS_MS);
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
    const preference = getWorkEndPreference();
    if (!preference) return;
    const nowFn = this.handlers.now || (() => new Date());
    const prompt = this.root.querySelector('.work-end-invite__prompt');
    const yes = this.root.querySelector('.work-end-invite__yes');
    const no = this.root.querySelector('.work-end-invite__no');
    if (prompt) {
      prompt.textContent = fillWorkEndInvitePrompt(
        t(WORK_END_INVITE_PROMPT_KEY),
        preference,
        nowFn()
      );
    }
    if (yes) yes.textContent = t(WORK_END_INVITE_YES_KEY);
    if (no) no.textContent = t(WORK_END_INVITE_NOT_NOW_KEY);
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .work-end-invite {
        position: absolute;
        left: 50%;
        top: max(12px, env(safe-area-inset-top, 0px));
        bottom: auto;
        z-index: ${Z.OVERLAY_DIM};
        max-width: min(300px, calc(100vw - 48px));
        margin: 0;
        padding: 10px 14px 12px;
        border: 1px solid rgba(196, 165, 116, 0.35);
        border-radius: 18px;
        background: rgba(255, 252, 245, 0.88);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        font: inherit;
        text-align: center;
        opacity: 0;
        transform: translate(-50%, 8px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
        box-shadow: none;
      }
      .work-end-invite.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .work-end-invite__prompt {
        margin: 0 0 8px;
        font-size: 0.84rem;
        line-height: 1.4;
        font-weight: 500;
      }
      .work-end-invite__actions {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      .work-end-invite__yes,
      .work-end-invite__no {
        margin: 0;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        background: rgba(255, 252, 245, 0.7);
        color: inherit;
        font: inherit;
        font-size: 0.78rem;
        cursor: pointer;
      }
      .work-end-invite__yes {
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
}
