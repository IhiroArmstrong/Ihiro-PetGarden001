/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle Confide second entry — wide ear disc below Focus HUD (C.2 clearance).
 * Narrow ActionBar owns its own button (same panel, same gate).
 *
 * Idle chrome stays ghost-quiet (mute-family opacity), then lifts on hover /
 * keyboard focus with a glass tip — not a native `title` tooltip.
 */

import { t, onLocaleChange } from '../locales/i18n.js';

const STYLE_ID = 'confide-ear-chrome-styles-v2';
const ROOT_ID = 'confide-ear-chrome';
const TIP_ID = 'confide-ear-chrome-tip';
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
    this.btn.setAttribute('aria-describedby', TIP_ID);

    const img = document.createElement('img');
    img.className = 'confide-ear-chrome__img';
    img.src = ICON_SRC;
    img.alt = '';
    img.width = 52;
    img.height = 52;
    img.draggable = false;
    img.decoding = 'async';
    this.btn.appendChild(img);

    this.tipEl = document.createElement('span');
    this.tipEl.id = TIP_ID;
    this.tipEl.className = 'confide-ear-chrome__tip';
    this.tipEl.setAttribute('role', 'tooltip');
    this.tipEl.dataset.testid = TIP_ID;
    this.btn.appendChild(this.tipEl);

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
    // Do not call canShow here: main.js may still be in TDZ for Arrival / Honesty UI.
  }

  /** @returns {void} */
  _refreshLabel() {
    this.btn.setAttribute('aria-label', t('CONFIDE_MENU_LABEL'));
    this.tipEl.textContent = t('CONFIDE_EAR_TOOLTIP');
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
        /* Below #focus-hud glass card (~18px + card height); SANCTUARY_UI_ART_DIRECTION B */
        top: calc(max(18px, env(safe-area-inset-top, 0px)) + 112px);
        left: max(18px, env(safe-area-inset-left, 0px));
        z-index: 24;
        width: 52px;
        height: 52px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: none;
        opacity: 0.3;
        transition: transform 120ms ease, box-shadow 160ms ease, opacity 180ms ease;
      }
      .confide-ear-chrome[hidden] {
        display: none !important;
      }
      .confide-ear-chrome:hover,
      .confide-ear-chrome:focus-visible {
        opacity: 0.8;
        box-shadow: 0 3px 12px rgba(44, 31, 20, 0.08);
      }
      .confide-ear-chrome:focus-visible {
        outline: 2px solid rgba(92, 122, 108, 0.55);
        outline-offset: 2px;
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
      .confide-ear-chrome__tip {
        position: absolute;
        left: calc(100% + 8px);
        top: 50%;
        transform: translateY(-50%) translateX(-4px);
        max-width: min(220px, calc(100vw - 86px));
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.14);
        background: rgba(255, 252, 245, 0.62);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 2px 10px rgba(44, 31, 20, 0.06);
        color: rgba(74, 58, 40, 0.78);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.01em;
        line-height: 1.3;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 180ms ease, transform 180ms ease;
      }
      .confide-ear-chrome:hover .confide-ear-chrome__tip,
      .confide-ear-chrome:focus-visible .confide-ear-chrome__tip {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
      }
      @media (hover: none) {
        .confide-ear-chrome {
          opacity: 0.55;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .confide-ear-chrome,
        .confide-ear-chrome__tip {
          transition: none;
        }
        .confide-ear-chrome__tip {
          transform: translateY(-50%) translateX(0);
        }
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
