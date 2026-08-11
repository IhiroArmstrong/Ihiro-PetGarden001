/**
 * Quiet soft-update chip (bottom-left, above ? help). Only mounted when revealed.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { formatSoftUpdateLabel } from '../core/appVersionCheck.js';

export class SoftUpdatePromptUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {{ onUpdate?: () => void }} [handlers]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    /** @type {string} */
    this._versionLabel = '';
    this._revealed = false;

    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.id = 'ft-soft-update-prompt';
    this.element.className = 'ft-soft-update-prompt';
    this.element.hidden = true;
    this.element.setAttribute('aria-hidden', 'true');
    this.element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handlers.onUpdate?.();
    });

    mountRoot.appendChild(this.element);
    this._unsubLocale = onLocaleChange(() => this._refreshCopy());
    this._injectStyles();
    this._refreshCopy();
  }

  /**
   * @param {string} versionLabel
   */
  setVersionLabel(versionLabel) {
    this._versionLabel = String(versionLabel || '').trim();
    this._refreshCopy();
  }

  /**
   * @param {boolean} revealed
   */
  setRevealed(revealed) {
    this._revealed = Boolean(revealed);
    this.element.hidden = !this._revealed;
    this.element.setAttribute('aria-hidden', this._revealed ? 'false' : 'true');
    if (this._revealed) {
      this.element.classList.add('is-visible');
    } else {
      this.element.classList.remove('is-visible');
    }
  }

  isRevealed() {
    return this._revealed;
  }

  dispose() {
    this._unsubLocale?.();
    this.element.remove();
  }

  _refreshCopy() {
    const label = formatSoftUpdateLabel(
      t('SOFT_UPDATE_PROMPT'),
      this._versionLabel || '…'
    );
    this.element.textContent = label;
    this.element.setAttribute(
      'aria-label',
      formatSoftUpdateLabel(
        t('SOFT_UPDATE_PROMPT_ARIA'),
        this._versionLabel || '…'
      )
    );
  }

  _injectStyles() {
    let style = document.getElementById('ft-soft-update-prompt-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ft-soft-update-prompt-styles';
      document.head.appendChild(style);
    }
    style.textContent = `
      .ft-soft-update-prompt {
        position: fixed;
        left: max(16px, env(safe-area-inset-left, 0px));
        bottom: calc(28px + 44px + 10px);
        z-index: 22;
        pointer-events: auto;
        max-width: min(220px, calc(100vw - 96px));
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.18);
        background: rgba(255, 252, 245, 0.72);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: rgba(74, 58, 40, 0.82);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.01em;
        line-height: 1.25;
        text-align: left;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(44, 31, 20, 0.06);
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 180ms ease, transform 180ms ease, filter 120ms ease;
      }
      .ft-soft-update-prompt.is-visible {
        opacity: 0.92;
        transform: translateY(0);
      }
      .ft-soft-update-prompt:hover {
        filter: brightness(1.03);
        opacity: 1;
      }
      .ft-soft-update-prompt:active {
        transform: translateY(1px) scale(0.98);
      }
    `;
  }
}
