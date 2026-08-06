/**
 * Zen Cinema confirm card — Idle ⋯ / drawer gift entry.
 * Thumb + “opens YouTube” → system browser. No in-app player.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  ZEN_CINEMA_THUMB_SRC,
  ZEN_CINEMA_YOUTUBE_URL,
  openZenCinemaExternal
} from '../core/zenCinemaConfig.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'zen-cinema-card-styles-v1';
const FADE_MS = 220;

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

    this.thumb = document.createElement('img');
    this.thumb.className = 'zen-cinema-card__thumb';
    this.thumb.src = ZEN_CINEMA_THUMB_SRC;
    this.thumb.alt = '';
    this.thumb.width = 320;
    this.thumb.height = 180;
    this.thumb.decoding = 'async';

    this.filmTitleEl = document.createElement('p');
    this.filmTitleEl.className = 'zen-cinema-card__film-title';

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
      this.thumb,
      this.filmTitleEl,
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
    this._refreshTexts();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
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

  _confirmOpen() {
    openZenCinemaExternal();
    this.handlers.onOpenExternal?.(ZEN_CINEMA_YOUTUBE_URL);
    this.close();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('ZEN_CINEMA_CARD_TITLE');
    this.blurbEl.textContent = t('ZEN_CINEMA_CARD_BLURB');
    this.filmTitleEl.textContent = t('ZEN_CINEMA_FILM_TITLE');
    this.noteEl.textContent = t('ZEN_CINEMA_OPENS_YOUTUBE');
    this.cancelBtn.textContent = t('ZEN_CINEMA_CANCEL');
    this.openBtn.textContent = t('ZEN_CINEMA_WATCH');
    this.thumb.alt = t('ZEN_CINEMA_FILM_TITLE');
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
        z-index: 18;
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
      .zen-cinema-card__thumb {
        display: block;
        width: 100%;
        height: auto;
        border-radius: 12px;
        border: 1px solid rgba(139,115,85,.18);
        background: #1a1520;
      }
      .zen-cinema-card__film-title {
        margin: 10px 0 4px;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
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
