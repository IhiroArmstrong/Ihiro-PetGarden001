/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin's Art Collection — separate from #yin-coin-panel.
 * Buy stays visible and does not write ownership while checkout is unwired.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  requestYinArtPurchase,
  YIN_ART_WORKS
} from '../core/yinArtCollection.js';
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

const STYLE_ID = 'yin-art-panel-styles-v1';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

export class YinArtCollectionPanelUI {
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'yin-art-panel-backdrop',
      testId: 'yin-art-panel-backdrop',
      zIndex: 17,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'yin-art-panel';
    this.root.className = 'yin-art-panel';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'yin-art-panel-title');
    this.root.dataset.testid = 'yin-art-panel';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'yin-art-panel-title';
    this.titleEl.className = 'yin-art-panel__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'yin-art-panel__blurb';

    this.listEl = document.createElement('ul');
    this.listEl.className = 'yin-art-panel__list';
    this.listEl.dataset.testid = 'yin-art-list';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'yin-art-panel__status';
    this.statusEl.dataset.testid = 'yin-art-payment-note';
    this.statusEl.hidden = true;

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'yin-art-panel__close';
    this.closeBtn.dataset.testid = 'yin-art-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.listEl,
      this.statusEl,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open || event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      this.close();
    };
    document.addEventListener('keydown', this._onKeyDown);
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._render());
    this._render();
  }

  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.statusEl.hidden = true;
    this.statusEl.textContent = '';
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._render();
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

  _render() {
    this.titleEl.textContent = t('YIN_ART_TITLE');
    this.blurbEl.textContent = t('YIN_ART_BLURB');
    this.closeBtn.textContent = t('YIN_COIN_CLOSE');
    this.listEl.replaceChildren();
    for (const work of YIN_ART_WORKS) {
      const li = document.createElement('li');
      li.className = 'yin-art-panel__row';
      li.dataset.art = work.id;
      const img = document.createElement('img');
      img.className = 'yin-art-panel__img';
      img.src = work.src;
      img.alt = '';
      img.width = 72;
      img.height = 72;
      const name = document.createElement('p');
      name.className = 'yin-art-panel__name';
      name.textContent = t(work.nameKey);
      const note = document.createElement('p');
      note.className = 'yin-art-panel__note';
      note.textContent = t(work.noteKey);
      const price = document.createElement('p');
      price.className = 'yin-art-panel__price';
      price.textContent = work.priceLabel;
      const buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'yin-art-panel__buy';
      buy.dataset.testid = 'yin-art-buy-' + work.id;
      buy.textContent = t('YIN_ART_BUY');
      buy.addEventListener('click', () => {
        const result = requestYinArtPurchase(work.id);
        this.statusEl.hidden = false;
        this.statusEl.textContent =
          result.reason === 'payment-not-open'
            ? t('YIN_ART_PAYMENT_NOT_OPEN')
            : t('YIN_ART_UNKNOWN');
      });
      const copy = document.createElement('div');
      copy.append(name, note, price, buy);
      li.append(img, copy);
      this.listEl.append(li);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.yin-art-panel{position:fixed;z-index:18;left:50%;bottom:max(96px,env(safe-area-inset-bottom,0px) + 72px);width:min(360px,calc(100vw - 40px));max-height:min(70vh,560px);overflow:auto;transform:translate(-50%,10px);padding:16px;box-sizing:border-box;color:#2c1f14;background:',
      GLASS_FILL,
      ';',
      GLASS_BLUR_CSS,
      ';border:',
      GLASS_BORDER,
      ';border-radius:',
      GLASS_RADIUS,
      ';box-shadow:',
      GLASS_SHADOW,
      ';opacity:0;pointer-events:none;transition:opacity ',
      String(FADE_MS),
      'ms ease,transform ',
      String(FADE_MS),
      'ms ease;}',
      '.yin-art-panel.is-visible{opacity:1;transform:translate(-50%,0);pointer-events:auto;}',
      '.yin-art-panel__title{margin:0 0 4px;font-weight:600;}',
      '.yin-art-panel__blurb{margin:0 0 10px;font-size:0.82rem;line-height:1.4;}',
      '.yin-art-panel__list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;}',
      '.yin-art-panel__row{display:flex;gap:10px;align-items:flex-start;}',
      '.yin-art-panel__img{width:72px;height:72px;object-fit:contain;flex-shrink:0;}',
      '.yin-art-panel__name{margin:0;font-weight:600;font-size:0.9rem;}',
      '.yin-art-panel__note,.yin-art-panel__price,.yin-art-panel__status{margin:2px 0 0;font-size:0.78rem;line-height:1.4;}',
      '.yin-art-panel__buy,.yin-art-panel__close{margin-top:6px;border:1px solid rgba(139,115,85,0.35);background:transparent;border-radius:999px;padding:4px 10px;color:inherit;cursor:pointer;}'
    ].join('');
    document.head.appendChild(style);
  }
}
