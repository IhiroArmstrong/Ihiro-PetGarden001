/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * H3: latest memorabilia + count + enter Yin's Collections in the H2 slot.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { listHomeMemorabiliaPreview } from '../core/homeMemorabiliaPreview.js';

const STYLE_ID = 'ft-home-memorabilia-slot-styles-v1';

/**
 * @param {object} [options]
 * @param {HTMLElement | null} [options.slot]
 * @param {{ proxyMenuItem?: (key: string) => void }} [options.wide]
 */
export class HomeMemorabiliaSlotUI {
  constructor(options = {}) {
    this.slot = options.slot || null;
    this.wide = options.wide || null;
    this._unsubLocale = null;
    this.thumbEl = null;
    this.nameEl = null;
    this.countEl = null;
    this.enterBtn = null;
    if (typeof document === 'undefined' || !this.slot) return;
    this._injectStyles();
    this._build();
    this._unsubLocale = onLocaleChange(() => this.sync(true));
  }

  /**
   * @param {boolean} show
   * @returns {void}
   */
  sync(show) {
    if (!this.slot) return;
    this.slot.hidden = !show;
    if (!show) return;
    const preview = listHomeMemorabiliaPreview();
    if (this.thumbEl) {
      if (preview.latest?.badgeSrc) {
        this.thumbEl.hidden = false;
        this.thumbEl.src = preview.latest.badgeSrc;
        this.thumbEl.alt = preview.latest.nameKey
          ? t(preview.latest.nameKey)
          : t('HOME_MEMORABILIA_ITEM');
      } else {
        this.thumbEl.removeAttribute('src');
        this.thumbEl.alt = '';
        this.thumbEl.hidden = true;
      }
    }
    if (this.nameEl) {
      this.nameEl.textContent = preview.latest
        ? t(preview.latest.nameKey)
        : t('HOME_MEMORABILIA_EMPTY');
    }
    if (this.countEl) {
      this.countEl.textContent = t('HOME_MEMORABILIA_COUNT').replaceAll(
        '{count}',
        String(preview.count)
      );
    }
    if (this.enterBtn) {
      this.enterBtn.textContent = t('HOME_MEMORABILIA_ENTER');
    }
  }

  /** @returns {void} */
  destroy() {
    this._unsubLocale?.();
    this._unsubLocale = null;
    this.slot?.replaceChildren();
    this.thumbEl = null;
    this.nameEl = null;
    this.countEl = null;
    this.enterBtn = null;
    document.getElementById(STYLE_ID)?.remove();
  }

  /** @returns {void} */
  _openCollections() {
    this.wide?.proxyMenuItem?.('yin-coin');
  }

  /** @returns {void} */
  _build() {
    const wrap = document.createElement('div');
    wrap.className = 'ft-home-memorabilia';
    wrap.dataset.testid = 'ft-home-memorabilia';

    this.thumbEl = document.createElement('img');
    this.thumbEl.className = 'ft-home-memorabilia__thumb';
    this.thumbEl.hidden = true;
    this.thumbEl.alt = '';

    this.nameEl = document.createElement('p');
    this.nameEl.className = 'ft-home-memorabilia__name';

    this.countEl = document.createElement('p');
    this.countEl.className = 'ft-home-memorabilia__count';
    this.countEl.dataset.testid = 'ft-home-memorabilia-count';

    this.enterBtn = document.createElement('button');
    this.enterBtn.type = 'button';
    this.enterBtn.className = 'ft-home-memorabilia__enter';
    this.enterBtn.dataset.testid = 'ft-home-memorabilia-enter';
    this.enterBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._openCollections();
    });

    wrap.append(this.thumbEl, this.nameEl, this.countEl, this.enterBtn);
    wrap.addEventListener('click', (event) => {
      if (event.target === this.enterBtn) return;
      event.preventDefault();
      this._openCollections();
    });
    this.slot.appendChild(wrap);
  }

  /** @returns {void} */
  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ft-home-memorabilia {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin: 0 0 8px;
        padding: 8px;
        border-radius: 14px;
        background: rgba(255, 252, 245, 0.35);
        cursor: pointer;
      }
      .ft-home-memorabilia__thumb {
        width: 48px;
        height: 48px;
        object-fit: contain;
        pointer-events: none;
      }
      .ft-home-memorabilia__thumb[hidden] {
        display: none !important;
      }
      .ft-home-memorabilia__name,
      .ft-home-memorabilia__count {
        margin: 0;
        font-size: 0.82rem;
        color: rgba(74, 58, 40, 0.88);
      }
      .ft-home-memorabilia__enter {
        align-self: flex-start;
        margin: 4px 0 0;
        padding: 6px 10px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 252, 245, 0.7);
        color: rgba(74, 58, 40, 0.92);
        font: inherit;
        font-size: 0.82rem;
        cursor: pointer;
      }
      .ft-home-memorabilia__enter:hover,
      .ft-home-memorabilia__enter:focus-visible {
        background: rgba(255, 252, 245, 0.95);
      }
      .ft-home-memorabilia__enter:active:not(:disabled) {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }
}
