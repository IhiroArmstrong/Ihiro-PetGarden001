/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin's Art Collection — separate from Yin's Collections.
 * Buy shows a notice. It does not record ownership.
 */

import { t, getLocale, onLocaleChange } from '../locales/i18n.js';
import {
  ART_COLLECTION_PRICE_USD,
  ART_COLLECTION_SETS,
  ART_COLLECTION_SHEETS,
  artSheetName,
  artSheetStory
} from '../core/artCollectionCatalog.js';
import { requestArtPurchase } from '../core/artCollectionPurchase.js';
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

    /** @type {Map<string, { name: HTMLElement, story: HTMLElement, notice: HTMLElement, buy: HTMLButtonElement }>} */
    this._cards = new Map();

    for (const set of ART_COLLECTION_SETS) {
      const heading = document.createElement('p');
      heading.className = 'art-collection-panel__set';
      heading.dataset.setId = set.id;
      heading.dataset.labelKey = set.labelKey;
      this.listEl.appendChild(heading);
      for (const row of ART_COLLECTION_SHEETS) {
        if (row.setId !== set.id) continue;
        this.listEl.appendChild(this._card(row));
      }
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
    this._refreshTexts();
  }

  /**
   * @param {(typeof ART_COLLECTION_SHEETS)[number]} row
   */
  _card(row) {
    const card = document.createElement('article');
    card.className = 'art-collection-panel__card';
    card.dataset.testid = `art-collection-card-${row.id}`;

    const img = document.createElement('img');
    img.src = row.previewSrc;
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.draggable = false;

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

    card.append(img, name, story, notice, buy);
    this._cards.set(row.id, { name, story, notice, buy });
    return card;
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
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
  _buy(sheetId) {
    const card = this._cards.get(sheetId);
    if (!card) return;
    const result = requestArtPurchase({
      sheetId,
      email: this.emailInput.value
    });
    const key =
      result.reason === 'email_required'
        ? 'ART_COLLECTION_EMAIL_REQUIRED'
        : 'ART_COLLECTION_PAYMENT_NOT_OPEN';
    card.notice.hidden = false;
    card.notice.textContent = t(key);
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
    const price = `$${ART_COLLECTION_PRICE_USD.toFixed(2)}`;
    for (const row of ART_COLLECTION_SHEETS) {
      const card = this._cards.get(row.id);
      if (!card) continue;
      card.name.textContent = artSheetName(locale, row);
      card.story.textContent = artSheetStory(locale, row);
      card.buy.textContent = `${t('ART_COLLECTION_BUY')} · ${price}`;
    }
    for (const heading of this.listEl.querySelectorAll('[data-label-key]')) {
      const key = heading.getAttribute('data-label-key');
      if (key) heading.textContent = t(key);
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
      .art-collection-panel__card {
        display: grid;
        grid-template-columns: 72px 1fr;
        gap: 4px 10px;
        margin: 0 0 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(139,115,85,.15);
      }
      .art-collection-panel__card img {
        grid-row: 1 / span 4;
        width: 72px;
        height: 72px;
        object-fit: contain;
        background: #f6f1e8;
        border-radius: 10px;
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
