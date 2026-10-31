/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T68 gift-art ceremony card. Surface stays closed until the grant switch is on.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  findGiftArtPiece
} from '../core/coPracticeGiftArtCatalog.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'co-practice-gift-art-card-styles-v1';
const FADE_MS = 220;

export class CoPracticeGiftArtCardUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {string | null} */
    this._pieceId = null;

    this.root = document.createElement('div');
    this.root.id = 'co-practice-gift-art-card';
    this.root.className = 'co-practice-gift-art-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'co-practice-gift-art-card-title');
    this.root.dataset.testid = 'co-practice-gift-art-card';

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'co-practice-gift-art-backdrop';
    this.backdrop.className = 'co-practice-gift-art-card__backdrop';
    this.backdrop.hidden = true;
    this.backdrop.dataset.testid = 'co-practice-gift-art-backdrop';
    this.backdrop.addEventListener('click', (event) => {
      if (event.target === this.backdrop) this.close();
    });

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'co-practice-gift-art-card-title';
    this.titleEl.className = 'co-practice-gift-art-card__title';

    this.preview = document.createElement('img');
    this.preview.className = 'co-practice-gift-art-card__preview';
    this.preview.alt = '';

    this.storyEl = document.createElement('p');
    this.storyEl.className = 'co-practice-gift-art-card__story';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'co-practice-gift-art-card__close';
    this.closeBtn.dataset.testid = 'co-practice-gift-art-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.root.append(this.titleEl, this.preview, this.storyEl, this.closeBtn);
    this._ensureStyles();
    mountRoot.append(this.backdrop, this.root);
    this._unsubLocale = onLocaleChange(() => this._fillCopy());
    this._fillCopy();
  }

  isOpen() {
    return this._open;
  }

  /**
   * @param {{ pieceId: string }} opts
   */
  open(opts) {
    const piece = findGiftArtPiece(opts?.pieceId);
    if (!piece) return;
    this._pieceId = piece.id;
    this._open = true;
    this.root.hidden = false;
    this.backdrop.hidden = false;
    this._fillCopy();
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.hidden = true;
    this.backdrop.hidden = true;
    this.handlers.onClose?.();
  }

  _fillCopy() {
    const piece = findGiftArtPiece(this._pieceId || '');
    this.closeBtn.textContent = t('CO_PRACTICE_GIFT_ART_CLOSE');
    if (!piece) return;
    this.titleEl.textContent = t(piece.titleKey);
    this.storyEl.textContent = t(piece.storyKey);
    this.preview.src = piece.previewSrc;
  }

  _ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .co-practice-gift-art-card__backdrop {
        position: fixed; inset: 0; z-index: ${Z.OVERLAY_DIM};
        background: rgba(40, 32, 24, 0.28);
        pointer-events: auto;
      }
      .co-practice-gift-art-card {
        position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
        z-index: ${Z.GLASS_CARD};
        pointer-events: auto;
        width: min(420px, calc(100vw - 32px));
        padding: 20px 18px 16px;
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL_STRONG};
        border: ${GLASS_BORDER};
        box-shadow: ${GLASS_SHADOW};
        backdrop-filter: ${GLASS_BLUR_CSS};
        color: #3a3128;
      }
      .co-practice-gift-art-card__title {
        margin: 0 0 12px; font-size: 1.05rem; font-weight: 600;
      }
      .co-practice-gift-art-card__preview {
        display: block; width: 100%; height: auto; border-radius: 12px;
      }
      .co-practice-gift-art-card__story {
        margin: 12px 0 16px; font-size: 0.92rem; line-height: 1.45;
      }
      .co-practice-gift-art-card__close {
        display: block; width: 100%; min-height: 40px;
        border-radius: 999px; border: ${GLASS_BORDER};
        background: transparent; cursor: pointer;
      }
    `;
    document.head.append(style);
    void FADE_MS;
  }
}
