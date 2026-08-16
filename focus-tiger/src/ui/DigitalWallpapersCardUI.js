/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Digital wallpapers gift card — Idle ⋯ / drawer entry.
 * Preview curated stills → Save image (device download; not social share).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  DIGITAL_WALLPAPER_STILLS,
  findDigitalWallpaperById
} from '../core/digitalWallpapersCatalog.js';
import { saveDigitalWallpaperImage } from '../core/saveDigitalWallpaper.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'digital-wallpapers-card-styles-v1';
const FADE_MS = 220;

export class DigitalWallpapersCardUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(info: { ok: boolean, filename: string, id: string }) => void} [handlers.onSaved]
   * @param {typeof saveDigitalWallpaperImage} [handlers.saveImage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._saving = false;
    /** @type {string} */
    this._selectedId = DIGITAL_WALLPAPER_STILLS[0]?.id || '';

    this.root = document.createElement('div');
    this.root.id = 'digital-wallpapers-card';
    this.root.className = 'digital-wallpapers-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'digital-wallpapers-card-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'digital-wallpapers-card-title';
    this.titleEl.className = 'digital-wallpapers-card__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'digital-wallpapers-card__blurb';

    this.gridEl = document.createElement('div');
    this.gridEl.className = 'digital-wallpapers-card__grid';
    this.gridEl.dataset.testid = 'digital-wallpapers-grid';

    /** @type {Map<string, HTMLButtonElement>} */
    this._tileButtons = new Map();
    for (const still of DIGITAL_WALLPAPER_STILLS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'digital-wallpapers-card__tile';
      btn.dataset.wallpaperId = still.id;
      btn.dataset.testid = `digital-wallpaper-tile-${still.id}`;

      const img = document.createElement('img');
      img.src = still.src;
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      img.draggable = false;

      const cap = document.createElement('span');
      cap.className = 'digital-wallpapers-card__tile-label';
      cap.dataset.labelKey = still.labelKey;

      btn.append(img, cap);
      btn.addEventListener('click', () => {
        this._select(still.id);
      });
      this.gridEl.appendChild(btn);
      this._tileButtons.set(still.id, btn);
    }

    this.noteEl = document.createElement('p');
    this.noteEl.className = 'digital-wallpapers-card__note';

    this.actions = document.createElement('div');
    this.actions.className = 'digital-wallpapers-card__actions';

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.type = 'button';
    this.cancelBtn.className =
      'digital-wallpapers-card__btn digital-wallpapers-card__btn--ghost';
    this.cancelBtn.addEventListener('click', () => this.close());

    this.saveBtn = document.createElement('button');
    this.saveBtn.type = 'button';
    this.saveBtn.className =
      'digital-wallpapers-card__btn digital-wallpapers-card__btn--primary';
    this.saveBtn.dataset.testid = 'digital-wallpapers-save';
    this.saveBtn.addEventListener('click', () => {
      void this._confirmSave();
    });

    this.actions.append(this.cancelBtn, this.saveBtn);
    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.gridEl,
      this.noteEl,
      this.actions
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onDocPointer = (event) => {
      if (!this._open) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      this.close();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._select(this._selectedId);
    this._refreshTexts();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    if (!findDigitalWallpaperById(this._selectedId)) {
      this._select(DIGITAL_WALLPAPER_STILLS[0]?.id || '');
    }
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refreshTexts();
    this.saveBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  destroy() {
    this._unsubLocale?.();
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this.root.remove();
  }

  /** @param {string} id */
  _select(id) {
    if (!findDigitalWallpaperById(id)) return;
    this._selectedId = id;
    for (const [tileId, btn] of this._tileButtons) {
      const on = tileId === id;
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  async _confirmSave() {
    if (this._saving || !this._selectedId) return;
    this._saving = true;
    this.saveBtn.disabled = true;
    try {
      const saveFn = this.handlers.saveImage || saveDigitalWallpaperImage;
      const info = await saveFn({ id: this._selectedId });
      this.handlers.onSaved?.(info);
      if (info?.ok) this.close();
    } finally {
      this._saving = false;
      this.saveBtn.disabled = false;
    }
  }

  _refreshTexts() {
    this.titleEl.textContent = t('WALLPAPER_CARD_TITLE');
    this.blurbEl.textContent = t('WALLPAPER_CARD_BLURB');
    this.noteEl.textContent = t('WALLPAPER_SAVE_NOTE');
    this.cancelBtn.textContent = t('WALLPAPER_CANCEL');
    this.saveBtn.textContent = t('WALLPAPER_SAVE');
    for (const still of DIGITAL_WALLPAPER_STILLS) {
      const btn = this._tileButtons.get(still.id);
      const cap = btn?.querySelector('.digital-wallpapers-card__tile-label');
      if (cap) cap.textContent = t(still.labelKey);
      if (btn) btn.setAttribute('aria-label', t(still.labelKey));
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .digital-wallpapers-card {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(400px, calc(100vw - 40px));
        transform: translate(-50%, 10px);
        padding: 16px 16px 14px;
        box-sizing: border-box;
        color: #2c1f14;
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        border: ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        box-shadow: ${GLASS_SHADOW};
        opacity: 0;
        pointer-events: auto;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .digital-wallpapers-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .digital-wallpapers-card__title {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
      }
      .digital-wallpapers-card__blurb {
        margin: 0 0 12px;
        font-size: 13px;
        line-height: 1.5;
        color: #5c4330;
      }
      .digital-wallpapers-card__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin: 0 0 10px;
      }
      .digital-wallpapers-card__tile {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin: 0;
        padding: 4px;
        border: 1.5px solid rgba(139,115,85,.18);
        border-radius: 12px;
        background: rgba(255,252,245,.45);
        cursor: pointer;
        color: inherit;
        font: inherit;
      }
      .digital-wallpapers-card__tile.is-selected {
        border-color: rgba(120, 90, 55, 0.55);
        box-shadow: 0 0 0 1px rgba(120, 90, 55, 0.25);
        background: ${GLASS_FILL_STRONG};
      }
      .digital-wallpapers-card__tile img {
        display: block;
        width: 100%;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        border-radius: 8px;
        pointer-events: none;
      }
      .digital-wallpapers-card__tile-label {
        font-size: 11px;
        line-height: 1.3;
        text-align: center;
        color: #5c4330;
      }
      .digital-wallpapers-card__note {
        margin: 0 0 12px;
        font-size: 12px;
        line-height: 1.45;
        color: #6b5340;
      }
      .digital-wallpapers-card__actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .digital-wallpapers-card__btn {
        margin: 0;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid rgba(139,115,85,.22);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        color: #3d2e22;
        background: rgba(255,252,245,.7);
      }
      .digital-wallpapers-card__btn--primary {
        background: ${GLASS_FILL_STRONG};
        border-color: rgba(120, 90, 55, 0.35);
      }
      .digital-wallpapers-card__btn--ghost {
        background: transparent;
      }
      .digital-wallpapers-card__btn:disabled {
        opacity: 0.55;
        cursor: default;
      }
    `;
    document.head.appendChild(style);
  }
}
