/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Yin's Art Collection — separate from Yin's Collections.
 * Buy opens Stripe checkout and does not itself mark a piece owned.
 * A piece already confirmed in this browser session can save a quiet card.
 */

import { t, getLocale, onLocaleChange } from '../locales/i18n.js';
import { artSheetName, artSheetStory } from '../core/artCollectionCatalog.js';
import { saveArtChosenPieceCard } from '../core/artChosenPieceCard.js';
import { ART_EDITION_PRICE_USD, ART_EDITION_SETS } from '../core/artEditionCatalog.js';
import { requestArtPurchase } from '../core/artCollectionPurchase.js';
import { readArtHd } from '../core/artCollectionHd.js';
import {
  subscribeYinArtOwnership,
  visibleYinArtOwnershipFromPage
} from '../core/yinArtCollection.js';
import { postCloudJson } from '../core/cloudApiClient.js';
import { buildCheckoutSessionBody } from '../core/desktopCheckoutReturn.js';
import { openCheckoutUrl } from '../core/desktopShell.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';

const STYLE_ID = 'art-collection-panel-styles-v1';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

export class ArtCollectionPanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {{ onOpen?: () => void, onClose?: () => void }} [handlers]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._busy = false;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'art-collection-backdrop',
      testId: 'art-collection-backdrop',
      zIndex: 17,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'art-collection-panel';
    this.root.className = 'art-collection-panel';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'art-collection-panel-title');
    this.root.dataset.testid = 'art-collection-panel';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'art-collection-panel-title';
    this.titleEl.className = 'art-collection-panel__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'art-collection-panel__blurb';

    this.emailLabel = document.createElement('label');
    this.emailLabel.className = 'art-collection-panel__email-label';
    this.emailLabel.htmlFor = 'art-collection-email';
    this.emailInput = document.createElement('input');
    this.emailInput.id = 'art-collection-email';
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.className = 'art-collection-panel__email';
    this.emailInput.dataset.testid = 'art-collection-email';
    this.emailLabel.appendChild(this.emailInput);

    this.listEl = document.createElement('div');
    this.listEl.className = 'art-collection-panel__list';
    this.listEl.dataset.testid = 'art-collection-list';

    /** @type {Map<string, { name: HTMLElement, story: HTMLElement, notice: HTMLElement, buy: HTMLButtonElement, save: HTMLButtonElement, sheetImgs: Map<string, { img: HTMLImageElement, hdUrl: string, hdReceiptId?: string }> }>} */
    this._cards = new Map();

    for (const set of ART_EDITION_SETS) {
      this.listEl.appendChild(this._card(set));
    }

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'art-collection-panel__btn art-collection-panel__btn--ghost';
    this.closeBtn.dataset.testid = 'art-collection-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.root.append(this.titleEl, this.blurbEl, this.emailLabel, this.listEl, this.closeBtn);
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._unsubHd = subscribeYinArtOwnership(() => {
      void this._applyCachedHd();
    });
    this._refreshTexts();
    void this._applyCachedHd();
  }

  /**
   * @param {(typeof ART_EDITION_SETS)[number]} row
   */
  _card(row) {
    const card = document.createElement('article');
    card.className = 'art-collection-panel__card';
    card.dataset.testid = `art-collection-card-${row.id}`;

    const gallery = document.createElement('div');
    gallery.className = 'art-collection-panel__gallery';
    /** @type {Map<string, { img: HTMLImageElement, hdUrl: string, hdReceiptId?: string }>} */
    const sheetImgs = new Map();
    for (const piece of row.sheets) {
      const img = document.createElement('img');
      img.src = piece.previewSrc;
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      img.draggable = false;
      gallery.appendChild(img);
      sheetImgs.set(piece.id, { img, hdUrl: '' });
    }

    const name = document.createElement('p');
    name.className = 'art-collection-panel__name';
    const story = document.createElement('p');
    story.className = 'art-collection-panel__story';
    const notice = document.createElement('p');
    notice.className = 'art-collection-panel__notice';
    notice.dataset.testid = `art-collection-notice-${row.id}`;
    notice.hidden = true;

    const buy = document.createElement('button');
    buy.type = 'button';
    buy.className = 'art-collection-panel__btn art-collection-panel__btn--buy';
    buy.dataset.testid = `art-collection-buy-${row.id}`;
    buy.addEventListener('click', () => this._buy(row.id));

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'art-collection-panel__btn art-collection-panel__btn--buy';
    save.dataset.testid = `art-collection-save-${row.id}`;
    save.hidden = true;
    save.addEventListener('click', () => {
      void this._save(row.id);
    });

    card.append(gallery, name, story, notice, buy, save);
    this._cards.set(row.id, { name, story, notice, buy, save, sheetImgs });
    return card;
  }

  /**
   * Pieces this session may save. Tests may pass a stand-in.
   * @returns {Record<string, { ownedAt?: string, receiptId?: string }>}
   */
  _ownedPieces() {
    if (typeof this.handlers.ownedPieces === 'function') {
      const rows = this.handlers.ownedPieces();
      return rows && typeof rows === 'object' ? rows : {};
    }
    return visibleYinArtOwnershipFromPage();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  async _applyCachedHd() {
    for (const set of ART_EDITION_SETS) {
      const card = this._cards.get(set.id);
      if (!card) continue;
      for (const piece of set.sheets) {
        const slot = card.sheetImgs.get(piece.id);
        if (!slot) continue;
        const saved = await readArtHd(piece.id);
        if (!saved?.blob) continue;
        if (slot.hdReceiptId === saved.receiptId && slot.hdUrl) continue;
        const next = URL.createObjectURL(saved.blob);
        if (slot.hdUrl) URL.revokeObjectURL(slot.hdUrl);
        slot.hdUrl = next;
        slot.hdReceiptId = saved.receiptId;
        slot.img.src = next;
      }
    }
  }

  open() {
    if (this._open) return;
    this._open = true;
    void this._applyCachedHd();
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refreshTexts();
    this.closeBtn.focus({ preventScroll: true });
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

  /**
   * @param {string} sheetId
   */
  async _buy(sheetId) {
    const card = this._cards.get(sheetId);
    if (!card || this._busy) return;
    const result = requestArtPurchase({
      sheetId,
      email: this.emailInput.value
    });
    if (!result.ok) {
      const key =
        result.reason === 'email_required'
          ? 'ART_COLLECTION_EMAIL_REQUIRED'
          : 'ART_COLLECTION_BUY_ERROR';
      card.notice.hidden = false;
      card.notice.textContent = t(key);
      return;
    }
    this._busy = true;
    this._setBusy(true);
    card.notice.hidden = false;
    card.notice.textContent = t('ART_COLLECTION_BUY_PENDING');
    try {
      const data = await postCloudJson('/api/create-art-collection-checkout-session', {
        body: JSON.stringify(
          buildCheckoutSessionBody({ artId: result.sheetId, email: result.email })
        )
      });
      const url =
        data && typeof data === 'object' && typeof data.url === 'string' ? data.url : '';
      if (!url) throw new Error('missing_checkout_url');
      const mode = await openCheckoutUrl(url);
      if (mode === 'external') {
        this._busy = false;
        this._setBusy(false);
      }
    } catch (err) {
      const offline = err instanceof Error && err.message === 'cloud_api_unconfigured';
      const closed = err && typeof err === 'object' && err.body && err.body.code === 'edition_closed';
      card.notice.textContent = t(
        offline
          ? 'ART_COLLECTION_CLOUD_OFFLINE'
          : closed
            ? 'ART_EDITION_CLOSED'
            : 'ART_COLLECTION_BUY_ERROR'
      );
      this._busy = false;
      this._setBusy(false);
    }
  }

  _setBusy(busy) {
    for (const card of this._cards.values()) {
      card.buy.disabled = busy;
      card.save.disabled = busy;
    }
  }

  /**
   * @param {string} sheetId
   */
  async _save(setId) {
    const card = this._cards.get(setId);
    const set = ART_EDITION_SETS.find((item) => item.id === setId);
    if (!card || !set || card.save.hidden || card.save.disabled) return;
    const piece = this._ownedPieces()[setId];
    if (!piece?.ownedAt || !piece?.receiptId) return;
    card.save.disabled = true;
    card.save.textContent = t('ART_CHOSEN_PIECE_SAVING');
    const saveFn = this.handlers.savePiece || saveArtChosenPieceCard;
    let ok = true;
    for (const sheet of set.sheets) {
      const slot = card.sheetImgs.get(sheet.id);
      const saved = await saveFn({
        sheetId: sheet.id,
        owned: true,
        name: artSheetName(getLocale(), sheet),
        ownedAt: piece.ownedAt,
        previewSrc: slot?.hdUrl || sheet.previewSrc
      });
      if (!saved) ok = false;
    }
    card.save.disabled = false;
    card.save.textContent = ok
      ? t('ART_CHOSEN_PIECE_SAVED')
      : t('ART_CHOSEN_PIECE_FAILED');
  }

  _refreshTexts() {
    const locale = getLocale();
    this.titleEl.textContent = t('ART_COLLECTION_TITLE');
    this.blurbEl.textContent = t('ART_COLLECTION_BLURB');
    this.emailLabel.childNodes[0] &&
      this.emailLabel.replaceChildren(
        document.createTextNode(t('ART_COLLECTION_EMAIL_LABEL')),
        this.emailInput
      );
    this.emailInput.placeholder = t('ART_COLLECTION_EMAIL_PLACEHOLDER');
    this.closeBtn.textContent = t('ART_COLLECTION_CLOSE');
    const price = `$${ART_EDITION_PRICE_USD.toFixed(2)}`;
    const owned = this._ownedPieces();
    for (const row of ART_EDITION_SETS) {
      const card = this._cards.get(row.id);
      if (!card) continue;
      card.name.textContent = artSheetName(locale, row);
      card.story.textContent = artSheetStory(locale, row);
      card.buy.textContent = `${t('ART_COLLECTION_BUY_SET')} · ${price}`;
      const piece = owned[row.id];
      const hasPiece = Boolean(piece?.ownedAt && piece?.receiptId);
      card.buy.hidden = hasPiece;
      card.save.hidden = !hasPiece;
      if (hasPiece) {
        card.save.disabled = false;
        card.save.textContent = t('ART_CHOSEN_PIECE_SAVE');
      }
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .art-collection-panel {
        position: fixed;
        left: 50%;
        bottom: max(72px, env(safe-area-inset-bottom, 0px) + 56px);
        z-index: 18;
        width: min(420px, calc(100vw - 32px));
        max-height: min(72vh, 640px);
        overflow: auto;
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
      .art-collection-panel.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .art-collection-panel__title {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
      }
      .art-collection-panel__blurb,
      .art-collection-panel__story,
      .art-collection-panel__notice {
        margin: 0 0 8px;
        font-size: 13px;
        line-height: 1.5;
        color: #5c4330;
      }
      .art-collection-panel__email-label {
        display: block;
        margin: 0 0 10px;
        font-size: 13px;
      }
      .art-collection-panel__email {
        display: block;
        width: 100%;
        margin-top: 4px;
        box-sizing: border-box;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid rgba(139,115,85,.35);
        font: inherit;
      }
      .art-collection-panel__set {
        margin: 12px 0 6px;
        font-size: 12px;
        letter-spacing: 0.04em;
        color: #7a624c;
      }
      .art-collection-panel__gallery {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 4px;
      }
      .art-collection-panel__gallery img {
        width: 100%;
        height: 72px;
        object-fit: contain;
        background: rgba(255, 252, 245, 0.72);
      }
      .art-collection-panel__card {
        display: block;
        margin: 0 0 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(139,115,85,.15);
      }
      .art-collection-panel__name {
        margin: 0;
        font-size: 14px;
        font-weight: 650;
      }
      .art-collection-panel__notice {
        color: #6b3a2a;
      }
      .art-collection-panel__btn {
        justify-self: start;
        margin: 0;
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid rgba(139,115,85,.35);
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
      .art-collection-panel__btn--buy {
        background: rgba(255,248,236,.9);
      }
      .art-collection-panel__btn:active:not(:disabled) {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }
}
