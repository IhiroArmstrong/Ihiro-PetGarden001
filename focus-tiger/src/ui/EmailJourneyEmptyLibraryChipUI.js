/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T93 D4 — Electron empty-library restore chip. Not a first-scene overlay.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { Z } from './zIndexLayers.js';

const ROOT_ID = 'email-journey-empty-library-chip';
const STYLE_ID = 'email-journey-empty-library-chip-styles-v1';

export class EmailJourneyEmptyLibraryChipUI {
  /**
   * @param {HTMLElement} container
   * @param {object} [handlers]
   * @param {() => void} [handlers.onRestore]
   */
  constructor(container, handlers = {}) {
    this.handlers = handlers;
    this._visible = false;
    this._injectStyles();
    this.root = document.createElement('button');
    this.root.type = 'button';
    this.root.id = ROOT_ID;
    this.root.className = 'email-journey-empty-library-chip';
    this.root.dataset.testid = ROOT_ID;
    this.root.hidden = true;
    this.root.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.handlers.onRestore?.();
    });
    container.appendChild(this.root);
    this._refreshCopy();
    this._unsubLocale = onLocaleChange(() => this._refreshCopy());
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  /**
   * @param {boolean} show
   */
  setVisible(show) {
    this._visible = show === true;
    this.root.hidden = !this._visible;
    this.root.classList.toggle('is-visible', this._visible);
  }

  destroy() {
    this._unsubLocale?.();
    this.root.remove();
  }

  _refreshCopy() {
    this.root.textContent = t('EMAIL_JOURNEY_EMPTY_RESTORE');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .email-journey-empty-library-chip {
        position: absolute;
        left: 50%;
        bottom: max(88px, calc(env(safe-area-inset-bottom, 0px) + 72px));
        z-index: ${Z.OVERLAY_DIM};
        transform: translateX(-50%);
        border: 1px solid rgba(196, 165, 116, 0.4);
        border-radius: 999px;
        background: rgba(255, 252, 245, 0.92);
        color: #3a2e22;
        font: inherit;
        font-size: 13px;
        padding: 8px 14px;
        cursor: pointer;
        pointer-events: auto;
      }
      .email-journey-empty-library-chip:active:not(:disabled) {
        transform: translateX(-50%) translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }
}
