/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Options refresh nudge — #ui-overlay top banner (non-modal).
 * Brief: docs/task-briefs/task-today-direction-help-entry-and-options-version.md
 */

import { t, onLocaleChange } from '../locales/i18n.js';

const FADE_MS = 280;

export class TodayDirectionOptionsBannerUI {
  /**
   * @param {HTMLElement} overlayRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onCta]
   * @param {() => void} [handlers.onDismiss]
   */
  constructor(overlayRoot, handlers = {}) {
    this.handlers = handlers;
    this._visible = false;
    this._hideTimer = null;

    this.element = document.createElement('div');
    this.element.id = 'today-direction-options-banner';
    this.element.className = 'today-direction-options-banner';
    this.element.dataset.testid = 'today-direction-options-banner';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.hidden = true;

    this.messageEl = document.createElement('p');
    this.messageEl.className = 'today-direction-options-banner__message';

    this.ctaBtn = document.createElement('button');
    this.ctaBtn.type = 'button';
    this.ctaBtn.className = 'today-direction-options-banner__cta';
    this.ctaBtn.dataset.testid = 'today-direction-options-banner-cta';
    this.ctaBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handlers.onCta?.();
    });

    this.dismissBtn = document.createElement('button');
    this.dismissBtn.type = 'button';
    this.dismissBtn.className = 'today-direction-options-banner__dismiss';
    this.dismissBtn.dataset.testid = 'today-direction-options-banner-dismiss';
    this.dismissBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handlers.onDismiss?.();
    });

    this.element.append(this.messageEl, this.ctaBtn, this.dismissBtn);
    overlayRoot.appendChild(this.element);

    this._unsubLocale = onLocaleChange(() => this._refreshCopy());
    this._injectStyles();
    this._refreshCopy();
  }

  isVisible() {
    return this._visible;
  }

  show() {
    window.clearTimeout(this._hideTimer);
    this._hideTimer = null;
    this._refreshCopy();
    this.element.hidden = false;
    this._visible = true;
    requestAnimationFrame(() => {
      this.element.classList.add('is-visible');
    });
  }

  /**
   * @param {{ immediate?: boolean, silent?: boolean }} [opts]
   */
  hide({ immediate = false, silent = false } = {}) {
    window.clearTimeout(this._hideTimer);
    this._hideTimer = null;
    this._visible = false;
    this.element.classList.remove('is-visible');
    if (immediate || silent) {
      this.element.hidden = true;
      return;
    }
    this._hideTimer = window.setTimeout(() => {
      if (!this._visible) this.element.hidden = true;
      this._hideTimer = null;
    }, FADE_MS);
  }

  dispose() {
    window.clearTimeout(this._hideTimer);
    this._unsubLocale();
    this.element.remove();
  }

  _refreshCopy() {
    this.messageEl.textContent = t('TODAY_DIRECTION_OPTIONS_REFRESH_BANNER');
    this.ctaBtn.textContent = t('TODAY_DIRECTION_OPTIONS_REFRESH_CTA');
    this.dismissBtn.textContent = t('TODAY_DIRECTION_OPTIONS_REFRESH_DISMISS');
    this.dismissBtn.setAttribute(
      'aria-label',
      t('TODAY_DIRECTION_OPTIONS_REFRESH_DISMISS')
    );
  }

  _injectStyles() {
    let style = document.getElementById('today-direction-options-banner-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'today-direction-options-banner-styles';
      document.head.appendChild(style);
    }
    style.textContent = `
      .today-direction-options-banner {
        position: absolute;
        top: max(16px, env(safe-area-inset-top, 0px));
        left: 50%;
        z-index: 16;
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: min(420px, calc(100vw - 120px));
        padding: 10px 12px 10px 14px;
        border-radius: 18px;
        border: 1px solid rgba(139, 115, 85, 0.14);
        background: rgba(255, 252, 245, 0.62);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 4px 18px rgba(44, 31, 20, 0.06);
        color: #4a3a28;
        font-family: 'Noto Sans SC', system-ui, sans-serif;
        font-size: 14px;
        line-height: 1.45;
        pointer-events: auto;
        transform: translate(-50%, -6px);
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      body.ft-narrow-shell.ft-narrow-idle .today-direction-options-banner,
      body.ft-narrow-shell.ft-narrow-park .today-direction-options-banner {
        top: calc(env(safe-area-inset-top, 0px) + 58px);
        z-index: 34;
        max-width: min(360px, calc(100vw - 24px));
      }
      body.ft-narrow-shell.ft-narrow-idle .in-app-reminder-banner.is-visible
        ~ .today-direction-options-banner.is-visible,
      body.ft-narrow-shell.ft-narrow-park .in-app-reminder-banner.is-visible
        ~ .today-direction-options-banner.is-visible {
        top: calc(env(safe-area-inset-top, 0px) + 118px);
      }
      .today-direction-options-banner.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .today-direction-options-banner[hidden] {
        display: none !important;
      }
      .today-direction-options-banner__message {
        margin: 0;
        flex: 1;
        text-align: left;
      }
      .today-direction-options-banner__cta {
        flex: 0 0 auto;
        padding: 6px 12px;
        border: none;
        border-radius: 999px;
        background: rgba(139, 115, 85, 0.16);
        color: #4a3a28;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }
      .today-direction-options-banner__cta:hover {
        background: rgba(139, 115, 85, 0.24);
      }
      .today-direction-options-banner__dismiss {
        flex: 0 0 auto;
        padding: 6px 8px;
        border: none;
        border-radius: 999px;
        background: transparent;
        color: rgba(74, 58, 40, 0.72);
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
      }
      .today-direction-options-banner__dismiss:hover {
        background: rgba(139, 115, 85, 0.1);
      }
    `;
  }
}
