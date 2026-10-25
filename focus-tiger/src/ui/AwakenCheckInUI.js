/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T52 awaken micro check-in (ease / restless / tired). Local labels only.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { AWAKEN_AUTO_DISMISS_MS } from '../core/InterventionOrchestrator.js';
import { AWAKEN_CHECKIN_LABELS } from '../core/AwakenCheckInOrchestrator.js';
import { recordAwakenCheckIn } from '../core/awakenCheckInStore.js';
import { homeClearanceTopCss } from './homeChromeClearance.js';
import { Z } from './zIndexLayers.js';

const ROOT_ID = 'awaken-check-in';
const STYLE_ID = 'awaken-check-in-styles-v1';
const FADE_MS = 380;

export class AwakenCheckInUI {
  /**
   * @param {HTMLElement} overlayContainer
   * @param {object} handlers
   * @param {() => boolean} [handlers.requestMidSlot]
   * @param {() => void} [handlers.releaseMidSlot]
   * @param {(reason: 'dismiss'|'timeout'|'pick', phase: 'mid'|'end') => void} [handlers.onClose]
   */
  constructor(overlayContainer, handlers = {}) {
    this.overlayContainer = overlayContainer;
    this.handlers = handlers;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    this._visible = false;
    /** @type {'mid' | 'end' | null} */
    this._phase = null;
    /** @type {string | null} */
    this._sessionId = null;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._visible && this.root) this._refreshCopy();
    });
  }

  isVisible() {
    return this._visible;
  }

  /**
   * @param {{ phase: 'mid' | 'end', sessionId: string }} opts
   * @returns {boolean}
   */
  tryShow(opts) {
    const phase = opts.phase === 'end' ? 'end' : 'mid';
    const sessionId =
      typeof opts.sessionId === 'string' && opts.sessionId ? opts.sessionId : '';
    if (!sessionId) return false;
    if (this._visible) this.hide({ immediate: true });

    let parent = this.overlayContainer;
    if (phase === 'end') {
      const reflection = document.getElementById('tiger-reflection-moment');
      if (!reflection) return false;
      parent = reflection;
    } else if (!this.handlers.requestMidSlot?.()) {
      return false;
    }

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = `awaken-check-in awaken-check-in--${phase}`;
    root.dataset.testid = ROOT_ID;
    root.dataset.phase = phase;
    root.setAttribute('role', 'group');
    root.setAttribute('aria-live', 'polite');

    const prompt = document.createElement('p');
    prompt.className = 'awaken-check-in__prompt';
    prompt.dataset.testid = 'awaken-check-in-prompt';
    root.appendChild(prompt);

    const actions = document.createElement('div');
    actions.className = 'awaken-check-in__actions';

    for (const label of AWAKEN_CHECKIN_LABELS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'awaken-check-in__choice';
      btn.dataset.testid = `awaken-check-in-${label}`;
      btn.dataset.label = label;
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        btn.classList.add('is-selected');
        recordAwakenCheckIn(label, { sessionId, phase });
        this.hide({ immediate: true });
        this.handlers.onClose?.('pick', phase);
      });
      actions.appendChild(btn);
    }

    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'awaken-check-in__skip';
    skip.dataset.testid = 'awaken-check-in-skip';
    skip.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
      this.handlers.onClose?.('dismiss', phase);
    });
    actions.appendChild(skip);

    root.appendChild(actions);

    if (phase === 'mid') {
      root.style.top = homeClearanceTopCss();
    }

    parent.appendChild(root);
    this.root = root;
    this._visible = true;
    this._phase = phase;
    this._sessionId = sessionId;
    this._refreshCopy();
    root.getBoundingClientRect();
    root.classList.add('is-visible');
    this._holdTimer = window.setTimeout(() => {
      this.hide();
      this.handlers.onClose?.('timeout', phase);
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
    const phase = this._phase;
    this.root = null;
    const wasVisible = this._visible;
    this._visible = false;
    this._phase = null;
    this._sessionId = null;
    if (wasVisible && phase === 'mid') this.handlers.releaseMidSlot?.();
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
    const prompt = this.root.querySelector('.awaken-check-in__prompt');
    const skip = this.root.querySelector('.awaken-check-in__skip');
    if (prompt) {
      prompt.textContent = t(
        this._phase === 'end'
          ? 'AWAKEN_CHECKIN_END_PROMPT'
          : 'AWAKEN_CHECKIN_MID_PROMPT'
      );
    }
    for (const label of AWAKEN_CHECKIN_LABELS) {
      const btn = this.root.querySelector(`[data-label="${label}"]`);
      if (btn) {
        btn.textContent = t(
          label === 'ease'
            ? 'AWAKEN_CHECKIN_LABEL_EASE'
            : label === 'restless'
              ? 'AWAKEN_CHECKIN_LABEL_RESTLESS'
              : 'AWAKEN_CHECKIN_LABEL_TIRED'
        );
      }
    }
    if (skip) skip.textContent = t('AWAKEN_CHECKIN_SKIP');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .awaken-check-in--mid {
        position: absolute;
        left: 50%;
        top: max(12px, env(safe-area-inset-top, 0px));
        bottom: auto;
        z-index: ${Z.OVERLAY_DIM};
        max-width: min(320px, calc(100vw - 48px));
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
      .awaken-check-in--end {
        position: relative;
        margin: 14px 0 0;
        padding: 12px 0 0;
        border-top: 1px solid rgba(139, 115, 85, 0.18);
        text-align: center;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .awaken-check-in--mid.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .awaken-check-in--end.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      .awaken-check-in__prompt {
        margin: 0 0 8px;
        font-size: 0.82rem;
        line-height: 1.4;
        font-weight: 500;
      }
      .awaken-check-in__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;
        align-items: center;
      }
      .awaken-check-in__choice,
      .awaken-check-in__skip {
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
      .awaken-check-in__choice.is-selected {
        font-weight: 600;
        border-color: rgba(180, 120, 70, 0.55);
        background: rgba(255, 248, 235, 0.95);
      }
      .awaken-check-in__skip {
        font-weight: 500;
        background: transparent;
        border-color: transparent;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }
}
