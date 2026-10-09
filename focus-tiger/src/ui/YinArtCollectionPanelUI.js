/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Yin's Art Collection — separate from #yin-coin-panel and tea.
 * Buy opens Checkout. Owned appears only after the server confirms payment
 * or a sign-in code for this browser session.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  YIN_ART_WORKS,
  clearYinArtNotice,
  formatYinArtOwnedDate,
  formatYinArtPrice,
  readYinArtNotice,
  readYinArtSession,
  subscribeYinArtOwnership,
  visibleYinArtOwnership
} from '../core/yinArtCollection.js';
import {
  beginYinArtCheckout,
  requestYinArtSignInCode,
  signOutYinArt,
  verifyYinArtSignIn
} from '../core/yinArtCollectionCheckout.js';
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

const NOTICE_KEYS = {
  opening: 'YIN_ART_OPENING',
  pending: 'YIN_ART_PENDING',
  failed: 'YIN_ART_FAILED',
  cancel: 'YIN_ART_CANCEL',
  unavailable: 'YIN_ART_UNAVAILABLE',
  unknown: 'YIN_ART_UNKNOWN',
  success: 'YIN_ART_SUCCESS'
};

export class YinArtCollectionPanelUI {
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._detailId = '';
    this._busy = false;

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

    this.detailEl = document.createElement('div');
    this.detailEl.className = 'yin-art-panel__detail';
    this.detailEl.hidden = true;
    this.detailEl.dataset.testid = 'yin-art-detail';

    this.listEl = document.createElement('ul');
    this.listEl.className = 'yin-art-panel__list';
    this.listEl.dataset.testid = 'yin-art-list';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'yin-art-panel__status';
    this.statusEl.dataset.testid = 'yin-art-payment-note';
    this.statusEl.hidden = true;

    this.signInEl = document.createElement('div');
    this.signInEl.className = 'yin-art-panel__signin';
    this.signInHint = document.createElement('p');
    this.signInHint.className = 'yin-art-panel__note';
    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.dataset.testid = 'yin-art-signin-email';
    this.sendBtn = document.createElement('button');
    this.sendBtn.type = 'button';
    this.sendBtn.dataset.testid = 'yin-art-signin-send';
    this.sendBtn.addEventListener('click', () => this._sendCode());
    this.codeInput = document.createElement('input');
    this.codeInput.type = 'text';
    this.codeInput.inputMode = 'numeric';
    this.codeInput.autocomplete = 'one-time-code';
    this.codeInput.dataset.testid = 'yin-art-signin-code';
    this.signInBtn = document.createElement('button');
    this.signInBtn.type = 'button';
    this.signInBtn.dataset.testid = 'yin-art-signin-submit';
    this.signInBtn.addEventListener('click', () => this._signIn());
    this.signOutBtn = document.createElement('button');
    this.signOutBtn.type = 'button';
    this.signOutBtn.dataset.testid = 'yin-art-signout';
    this.signOutBtn.addEventListener('click', () => {
      signOutYinArt(this._session());
      this._showNotice('signed-out');
    });
    this.signInEl.append(
      this.signInHint,
      this.emailInput,
      this.sendBtn,
      this.codeInput,
      this.signInBtn,
      this.signOutBtn
    );

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'yin-art-panel__close';
    this.closeBtn.dataset.testid = 'yin-art-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.detailEl,
      this.listEl,
      this.statusEl,
      this.signInEl,
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
    this._unsubOwn = subscribeYinArtOwnership(() => this._render());
    this._render();
  }

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

  _local() {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  }

  _session() {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  }

  _showStatus(text) {
    this.statusEl.hidden = !text;
    this.statusEl.textContent = text || '';
  }

  _showNotice(kind) {
    const key = NOTICE_KEYS[kind];
    this._showStatus(key ? t(key) : '');
  }

  _render() {
    this.titleEl.textContent = t('YIN_ART_TITLE');
    this.blurbEl.textContent = t('YIN_ART_BLURB');
    this.closeBtn.textContent = t('YIN_COIN_CLOSE');
    this.signInHint.textContent = t('YIN_ART_SIGNIN_HINT');
    this.emailInput.placeholder = t('YIN_ART_SIGNIN_EMAIL');
    this.sendBtn.textContent = t('YIN_ART_SIGNIN_SEND');
    this.codeInput.placeholder = t('YIN_ART_SIGNIN_CODE');
    this.signInBtn.textContent = t('YIN_ART_SIGNIN_SUBMIT');
    this.signOutBtn.textContent = t('YIN_ART_SIGNOUT');

    const session = readYinArtSession(this._session());
    const owned = visibleYinArtOwnership(this._local(), this._session());
    const signedIn = Boolean(session);
    this.emailInput.hidden = signedIn;
    this.sendBtn.hidden = signedIn;
    this.codeInput.hidden = signedIn;
    this.signInBtn.hidden = signedIn;
    this.signOutBtn.hidden = !signedIn;
    if (signedIn) {
      this.signInHint.textContent = `${t('YIN_ART_SIGNED_IN')} · ${session.email}`;
    }

    const notice = readYinArtNotice(this._session());
    if (notice && NOTICE_KEYS[notice.kind] && this.statusEl.hidden) {
      this._showNotice(notice.kind);
    }

    this._renderDetail(owned);
    this.listEl.replaceChildren();
    for (const work of YIN_ART_WORKS) {
      const li = document.createElement('li');
      li.className = 'yin-art-panel__row';
      li.dataset.art = work.id;
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'yin-art-panel__open';
      open.dataset.testid = 'yin-art-open-' + work.id;
      const img = document.createElement('img');
      img.className = 'yin-art-panel__img';
      img.src = work.src;
      img.alt = '';
      img.width = 72;
      img.height = 72;
      const name = document.createElement('p');
      name.className = 'yin-art-panel__name';
      name.textContent = t(work.nameKey);
      const price = document.createElement('p');
      price.className = 'yin-art-panel__price';
      const piece = owned[work.id];
      price.textContent = piece
        ? `${t('YIN_ART_OWNED')} · ${this._date(piece.ownedAt)}`
        : formatYinArtPrice(work.unitAmount);
      if (piece) price.dataset.testid = 'yin-art-owned-' + work.id;
      open.append(img, name, price);
      open.addEventListener('click', () => {
        this._detailId = work.id;
        this._render();
      });
      li.append(open);
      this.listEl.append(li);
    }
  }

  _date(iso) {
    const locale =
      typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en';
    return formatYinArtOwnedDate(iso, locale);
  }

  _renderDetail(owned) {
    const work = YIN_ART_WORKS.find((item) => item.id === this._detailId);
    this.detailEl.replaceChildren();
    if (!work) {
      this.detailEl.hidden = true;
      return;
    }
    this.detailEl.hidden = false;
    const img = document.createElement('img');
    img.className = 'yin-art-panel__detail-img';
    img.src = work.src;
    img.alt = t(work.nameKey);
    const name = document.createElement('p');
    name.className = 'yin-art-panel__name';
    name.textContent = t(work.nameKey);
    const note = document.createElement('p');
    note.className = 'yin-art-panel__note';
    note.textContent = t(work.noteKey);
    const price = document.createElement('p');
    price.className = 'yin-art-panel__price';
    const piece = owned[work.id];
    price.textContent = piece
      ? `${t('YIN_ART_OWNED')} · ${this._date(piece.ownedAt)}`
      : formatYinArtPrice(work.unitAmount);
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'yin-art-panel__close';
    back.dataset.testid = 'yin-art-detail-back';
    back.textContent = t('YIN_ART_DETAIL_BACK');
    back.addEventListener('click', () => {
      this._detailId = '';
      this._render();
    });
    this.detailEl.append(img, name, note, price, back);
    if (!piece) {
      const buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'yin-art-panel__buy';
      buy.dataset.testid = 'yin-art-buy-' + work.id;
      buy.textContent = t('YIN_ART_BUY');
      buy.disabled = this._busy;
      buy.addEventListener('click', () => this._buy(work.id));
      this.detailEl.append(buy);
    }
  }

  async _buy(artId) {
    if (this._busy) return;
    this._busy = true;
    clearYinArtNotice(this._session());
    this._showNotice('opening');
    this._render();
    const result = await beginYinArtCheckout({ artId });
    this._busy = false;
    if (result.phase === 'failed') {
      this._showNotice(result.reason === 'unknown' ? 'unknown' : 'unavailable');
    }
    this._render();
  }

  async _sendCode() {
    if (this._busy) return;
    this._busy = true;
    this._showStatus(t('YIN_ART_SIGNIN_SENDING'));
    try {
      await requestYinArtSignInCode({ email: this.emailInput.value });
      this._showStatus(t('YIN_ART_SIGNIN_SENT'));
    } catch {
      this._showStatus(t('YIN_ART_SIGNIN_FAILED'));
    } finally {
      this._busy = false;
    }
  }

  async _signIn() {
    if (this._busy) return;
    this._busy = true;
    this._showStatus(t('YIN_ART_SIGNIN_CHECKING'));
    const result = await verifyYinArtSignIn({
      email: this.emailInput.value,
      code: this.codeInput.value,
      localStorage: this._local(),
      sessionStorage: this._session()
    });
    this._busy = false;
    if (!result.ok) {
      this._showStatus(t('YIN_ART_SIGNIN_FAILED'));
      return;
    }
    clearYinArtNotice(this._session());
    this._showStatus(t('YIN_ART_SIGNED_IN'));
    this._render();
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
      '.yin-art-panel__row{display:flex;}',
      '.yin-art-panel__open{display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:0;background:transparent;color:inherit;cursor:pointer;padding:0;}',
      '.yin-art-panel__img{width:72px;height:72px;object-fit:contain;flex-shrink:0;}',
      '.yin-art-panel__detail-img{width:100%;max-height:180px;object-fit:contain;}',
      '.yin-art-panel__name{margin:0;font-weight:600;font-size:0.9rem;}',
      '.yin-art-panel__note,.yin-art-panel__price,.yin-art-panel__status{margin:2px 0 0;font-size:0.78rem;line-height:1.4;}',
      '.yin-art-panel__buy,.yin-art-panel__close,.yin-art-panel__signin button{margin-top:6px;border:1px solid rgba(139,115,85,0.35);background:transparent;border-radius:999px;padding:4px 10px;color:inherit;cursor:pointer;}',
      '.yin-art-panel__signin{margin-top:12px;display:flex;flex-direction:column;gap:6px;}',
      '.yin-art-panel__signin input{border:1px solid rgba(139,115,85,0.35);border-radius:8px;padding:6px 8px;background:transparent;color:inherit;}'
    ].join('');
    document.head.appendChild(style);
  }
}
