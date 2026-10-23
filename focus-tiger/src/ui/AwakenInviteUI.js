/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T51 non-modal awaken invite (z≈17). Does not steal window focus.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { AWAKEN_AUTO_DISMISS_MS } from '../core/InterventionOrchestrator.js';
import { homeClearanceTopCss } from './homeChromeClearance.js';
import { Z } from './zIndexLayers.js';

const ROOT_ID = 'awaken-invite';
const STYLE_ID = 'awaken-invite-styles-v1';
const FADE_MS = 380;

export class AwakenInviteUI {
  /**
   * @param {HTMLElement} container
   * @param {object} handlers
   * @param {() => boolean} handlers.requestSlot
   * @param {() => void} handlers.releaseSlot
   * @param {(kind: 'pause'|'extend') => void} handlers.onAccept
   * @param {(reason: 'dismiss'|'timeout') => void} [handlers.onDismiss]
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
    /** @type {'pause'|'extend'|null} */
    this._kind = null;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._visible && this.root) this._refreshCopy();
    });
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  /**
   * @param {'pause'|'extend'} kind
   * @returns {boolean}
   */
  tryShow(kind) {
    if (kind !== 'pause' && kind !== 'extend') return false;
    if (this._visible) this.hide({ immediate: true });
    if (!this.handlers.requestSlot()) return false;

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'awaken-invite';
    root.dataset.testid = ROOT_ID;
    root.dataset.kind = kind;
    root.setAttribute('role', 'status');
    root.setAttribute('aria-live', 'polite');
    root.tabIndex = -1;

    const prompt = document.createElement('p');
    prompt.className = 'awaken-invite__prompt';
    prompt.dataset.testid = 'awaken-invite-prompt';
    root.appendChild(prompt);

    const actions = document.createElement('div');
    actions.className = 'awaken-invite__actions';

    const yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'awaken-invite__yes';
    yes.dataset.testid = 'awaken-invite-yes';
    yes.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const shownKind = this._kind;
      this.hide({ immediate: true });
      this.handlers.onAccept?.(shownKind);
    });

    const no = document.createElement('button');
    no.type = 'button';
    no.className = 'awaken-invite__no';
    no.dataset.testid = 'awaken-invite-dismiss';
    no.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
      this.handlers.onDismiss?.('dismiss');
    });

    actions.appendChild(yes);
    actions.appendChild(no);
    root.appendChild(actions);
    root.style.top = homeClearanceTopCss();

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._kind = kind;
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
    this._kind = null;
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
    const pause = this._kind !== 'extend';
    const prompt = this.root.querySelector('.awaken-invite__prompt');
    const yes = this.root.querySelector('.awaken-invite__yes');
    const no = this.root.querySelector('.awaken-invite__no');
    if (prompt) {
      prompt.textContent = t(
        pause ? 'AWAKEN_INVITE_PAUSE_PROMPT' : 'AWAKEN_INVITE_EXTEND_PROMPT'
      );
    }
    if (yes) {
      yes.textContent = t(pause ? 'AWAKEN_INVITE_YES' : 'AWAKEN_INVITE_EXTEND_YES');
    }
    if (no) no.textContent = t('AWAKEN_INVITE_NOT_NOW');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .awaken-invite {
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
      .awaken-invite.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .awaken-invite__prompt {
        margin: 0 0 8px;
        font-size: 0.84rem;
        line-height: 1.4;
        font-weight: 500;
      }
      .awaken-invite__actions {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      .awaken-invite__yes,
      .awaken-invite__no {
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
      .awaken-invite__yes {
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
}
