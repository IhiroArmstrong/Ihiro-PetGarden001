/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Zen Cinema confirm card — Idle ⋯ / drawer gift entry.
 * Curated film grid → “opens YouTube” → system browser. No in-app player.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  ZEN_CINEMA_FILMS,
  findZenCinemaFilmById,
  openZenCinemaExternal
} from '../core/zenCinemaConfig.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'zen-cinema-card-styles-v2';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

export class ZenCinemaCardUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(url: string) => void} [handlers.onOpenExternal] test hook after open
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {string} */
    this._selectedId = ZEN_CINEMA_FILMS[0]?.id || '';

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'zen-cinema-backdrop',
      testId: 'zen-cinema-backdrop',
      zIndex: Z.OVERLAY_DIM,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'zen-cinema-card';
    this.root.className = 'zen-cinema-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'zen-cinema-card-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'zen-cinema-card-title';
    this.titleEl.className = 'zen-cinema-card__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'zen-cinema-card__blurb';

    this.gridEl = document.createElement('div');
    this.gridEl.className = 'zen-cinema-card__grid';
    this.gridEl.dataset.testid = 'zen-cinema-grid';

    /** @type {Map<string, HTMLButtonElement>} */
    this._tileButtons = new Map();
    for (const film of ZEN_CINEMA_FILMS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zen-cinema-card__tile';
      btn.dataset.filmId = film.id;
      btn.dataset.testid = `zen-cinema-tile-${film.id}`;

      const img = document.createElement('img');
      img.src = film.thumbSrc;
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      img.draggable = false;

      const cap = document.createElement('span');
      cap.className = 'zen-cinema-card__tile-label';
      cap.dataset.labelKey = film.titleKey;

      btn.append(img, cap);
      btn.addEventListener('click', () => {
        this._select(film.id);
      });
      this.gridEl.appendChild(btn);
      this._tileButtons.set(film.id, btn);
    }

    this.noteEl = document.createElement('p');
    this.noteEl.className = 'zen-cinema-card__note';

    this.actions = document.createElement('div');
    this.actions.className = 'zen-cinema-card__actions';

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.type = 'button';
    this.cancelBtn.className = 'zen-cinema-card__btn zen-cinema-card__btn--ghost';
    this.cancelBtn.addEventListener('click', () => this.close());

    this.openBtn = document.createElement('button');
    this.openBtn.type = 'button';
    this.openBtn.className = 'zen-cinema-card__btn zen-cinema-card__btn--primary';
    this.openBtn.dataset.testid = 'zen-cinema-open-youtube';
    this.openBtn.addEventListener('click', () => this._confirmOpen());

    this.actions.append(this.cancelBtn, this.openBtn);
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
    if (!findZenCinemaFilmById(this._selectedId)) {
      this._select(ZEN_CINEMA_FILMS[0]?.id || '');
    }
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refreshTexts();
    this.openBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    hideOverlayBackdrop(this.backdrop);
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
    this.backdrop.remove();
    this.root.remove();
  }

  /** @param {string} id */
  _select(id) {
    if (!findZenCinemaFilmById(id)) return;
    this._selectedId = id;
    for (const [tileId, btn] of this._tileButtons) {
      const on = tileId === id;
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  _confirmOpen() {
    const film = findZenCinemaFilmById(this._selectedId) || ZEN_CINEMA_FILMS[0];
    if (!film) return;
    openZenCinemaExternal({ id: film.id });
    this.handlers.onOpenExternal?.(film.youtubeUrl);
    this.close();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('ZEN_CINEMA_CARD_TITLE');
    this.blurbEl.textContent = t('ZEN_CINEMA_CARD_BLURB');
    this.noteEl.textContent = t('ZEN_CINEMA_OPENS_YOUTUBE');
    this.cancelBtn.textContent = t('ZEN_CINEMA_CANCEL');
    this.openBtn.textContent = t('ZEN_CINEMA_WATCH');
    for (const film of ZEN_CINEMA_FILMS) {
      const btn = this._tileButtons.get(film.id);
      const cap = btn?.querySelector('.zen-cinema-card__tile-label');
      const title = t(film.titleKey);
      if (cap) cap.textContent = title;
      if (btn) btn.setAttribute('aria-label', title);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .zen-cinema-card {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: ${Z.GLASS_CARD};
        width: min(360px, calc(100vw - 40px));
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
      .zen-cinema-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .zen-cinema-card__title {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
      }
      .zen-cinema-card__blurb {
        margin: 0 0 12px;
        font-size: 13px;
        line-height: 1.5;
        color: #5c4330;
      }
      .zen-cinema-card__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin: 0 0 10px;
        max-height: min(42vh, 280px);
        overflow: auto;
      }
      .zen-cinema-card__tile {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin: 0;
        padding: 4px;
        border: 1.5px solid rgba(139,115,85,.18);
        border-radius: 12px;
        background: rgba(255,252,245,.45);
        cursor: pointer;
        color: inherit;
        font: inherit;
        text-align: left;
      }
      .zen-cinema-card__tile.is-selected {
        border-color: rgba(120, 90, 55, 0.55);
        box-shadow: 0 0 0 1px rgba(120, 90, 55, 0.25);
        background: ${GLASS_FILL_STRONG};
      }
      .zen-cinema-card__tile img {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border-radius: 8px;
        background: #1a1520;
        pointer-events: none;
      }
      .zen-cinema-card__tile-label {
        font-size: 11px;
        font-weight: 600;
        line-height: 1.35;
        color: #4a3a28;
      }
      .zen-cinema-card__note {
        margin: 0 0 14px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(92,67,48,.85);
      }
      .zen-cinema-card__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .zen-cinema-card__btn {
        padding: 8px 14px;
        font-size: 13px;
        border-radius: 16px;
        cursor: pointer;
        border: 1px solid rgba(139,115,85,.28);
        background: ${GLASS_FILL_STRONG};
        color: #4a3a28;
        box-shadow: 0 1px 0 rgba(255,255,255,.7) inset;
      }
      .zen-cinema-card__btn--primary {
        background: rgba(212,165,116,.35);
        border-color: rgba(139,115,85,.35);
        font-weight: 600;
      }
      .zen-cinema-card__btn--ghost {
        background: rgba(255,252,245,.55);
      }
    `;
    document.head.appendChild(style);
  }
}
