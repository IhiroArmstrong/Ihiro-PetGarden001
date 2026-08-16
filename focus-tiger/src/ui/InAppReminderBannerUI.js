/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 应用内提醒横幅：#ui-overlay 顶部居中，非模态、可关闭。
 * 淡入淡出节奏供人工验收；状态流转由 inAppReminderBannerSession 单测覆盖。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { REMINDER_GENTLE_WAITING_MESSAGE_KEY } from '../core/reminderPreference.js';

const FADE_MS = 280;

export class InAppReminderBannerUI {
  /**
   * @param {HTMLElement} overlayRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onDismiss]
   */
  constructor(overlayRoot, handlers = {}) {
    this.handlers = handlers;
    this._visible = false;
    this._messageKey = REMINDER_GENTLE_WAITING_MESSAGE_KEY;
    this._hideTimer = null;

    this.element = document.createElement('div');
    this.element.id = 'in-app-reminder-banner';
    this.element.className = 'in-app-reminder-banner';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.hidden = true;

    this.messageEl = document.createElement('p');
    this.messageEl.className = 'in-app-reminder-banner__message';

    this.dismissBtn = document.createElement('button');
    this.dismissBtn.type = 'button';
    this.dismissBtn.id = 'in-app-reminder-banner-dismiss';
    this.dismissBtn.className = 'in-app-reminder-banner__dismiss';
    this.dismissBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handlers.onDismiss?.();
    });

    this.element.append(this.messageEl, this.dismissBtn);
    overlayRoot.appendChild(this.element);

    this._unsubLocale = onLocaleChange(() => this._refreshCopy());
    this._injectStyles();
    this._refreshCopy();
  }

  isVisible() {
    return this._visible;
  }

  /**
   * @param {string} [messageKey]
   */
  show(messageKey = REMINDER_GENTLE_WAITING_MESSAGE_KEY) {
    window.clearTimeout(this._hideTimer);
    this._hideTimer = null;
    this._messageKey = messageKey || REMINDER_GENTLE_WAITING_MESSAGE_KEY;
    this._refreshCopy();
    this.element.hidden = false;
    this._visible = true;
    requestAnimationFrame(() => {
      this.element.classList.add('is-visible');
    });
  }

  /**
   * @param {{ immediate?: boolean, silent?: boolean }} [opts]
   *   `silent` 与 `immediate` 同义（忙时/状态切走时不播淡出）。
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
    this.messageEl.textContent = t(this._messageKey);
    this.dismissBtn.setAttribute('aria-label', t('reminder.banner_dismiss_aria'));
    this.dismissBtn.textContent = '×';
  }

  _injectStyles() {
    let style = document.getElementById('in-app-reminder-banner-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'in-app-reminder-banner-styles';
      document.head.appendChild(style);
    }
    style.textContent = `
      .in-app-reminder-banner {
        position: absolute;
        top: max(16px, env(safe-area-inset-top, 0px));
        left: 50%;
        z-index: 16;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: min(360px, calc(100vw - 140px));
        padding: 10px 12px 10px 16px;
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
      /* 窄屏 Idle：横幅须在 ActionBar 下方，禁止贴顶被裁（图11） */
      body.ft-narrow-shell.ft-narrow-idle .in-app-reminder-banner,
      body.ft-narrow-shell.ft-narrow-park .in-app-reminder-banner {
        top: calc(env(safe-area-inset-top, 0px) + 58px);
        z-index: 34;
        max-width: min(340px, calc(100vw - 24px));
      }
      .in-app-reminder-banner.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .in-app-reminder-banner[hidden] {
        display: none !important;
      }
      .in-app-reminder-banner__message {
        margin: 0;
        flex: 1;
        text-align: center;
      }
      .in-app-reminder-banner__dismiss {
        flex: 0 0 auto;
        width: 28px;
        height: 28px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: rgba(139, 115, 85, 0.1);
        color: rgba(74, 58, 40, 0.72);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
      }
      .in-app-reminder-banner__dismiss:hover {
        background: rgba(139, 115, 85, 0.18);
      }
    `;
  }
}
