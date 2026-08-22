/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle Confide second entry — wide top-left ear disc.
 * Narrow ActionBar owns its own button (same panel, same gate).
 */

import { t, onLocaleChange } from '../locales/i18n.js';

const STYLE_ID = 'confide-ear-chrome-styles-v1';
const ROOT_ID = 'confide-ear-chrome';
const ICON_SRC = '/icons/icon-confide-to-yin.png';

/**
 * @param {HTMLElement | null} mountRoot
 * @param {object} [handlers]
 * @param {() => boolean} [handlers.canShow]
 * @param {() => void} [handlers.onOpen]
 */
export class ConfideEarChromeUI {
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._unsubLocale = null;

    this.btn = document.createElement('button');
    this.btn.type = 'button';
    this.btn.id = ROOT_ID;
    this.btn.className = 'confide-ear-chrome';
    this.btn.hidden = true;
    this.btn.dataset.testid = ROOT_ID;
    this.btn.setAttribute('aria-haspopup', 'dialog');
    this.btn.setAttribute('aria-controls', 'confide-to-yin-card');

    const img = document.createElement('img');
    img.className = 'confide-ear-chrome__img';
    img.src = ICON_SRC;
    img.alt = '';
    img.width = 52;
    img.height = 52;
    img.draggable = false;
    img.decoding = 'async';
    this.btn.appendChild(img);

    this._injectStyles();
    this._refreshLabel();
    this.btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (this.handlers.canShow && !this.handlers.canShow()) {
        this.sync();
        return;
      }
      this.handlers.onOpen?.();
    });

    (mountRoot || document.body).appendChild(this.btn);
    this._unsubLocale = onLocaleChange(() => this._refreshLabel());
    this.sync();
  }

  /** @returns {void} */
  _refreshLabel() {
    this.btn.setAttribute('aria-label', t('CONFIDE_MENU_LABEL'));
    this.btn.title = t('CONFIDE_MENU_LABEL');
  }

  /** @returns {void} */
  sync() {
    const show = this.handlers.canShow ? this.handlers.canShow() === true : false;
    this.btn.hidden = !show;
  }

  /** @returns {void} */
  destroy() {
    this._unsubLocale?.();
    this._unsubLocale = null;
    this.btn.remove();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .confide-ear-chrome {
        position: fixed;
        top: max(14px, env(safe-area-inset-top, 0px));
        left: max(14px, env(safe-area-inset-left, 0px));
        z-index: 24;
        width: 52px;
        height: 52px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 3px 12px rgba(44, 31, 20, 0.08);
        transition: transform 120ms ease, box-shadow 160ms ease, opacity 180ms ease;
      }
      .confide-ear-chrome[hidden] {
        display: none !important;
      }
      .confide-ear-chrome:hover {
        box-shadow: 0 6px 16px rgba(44, 31, 20, 0.14);
      }
      .confide-ear-chrome:active {
        transform: scale(0.96);
      }
      .confide-ear-chrome__img {
        display: block;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        object-fit: contain;
        pointer-events: none;
      }
      @media (max-width: 479px) {
        .confide-ear-chrome {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
