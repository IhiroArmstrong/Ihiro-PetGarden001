/**
 * Founder Supporter Pack · glass card (Idle ⋯ / drawer).
 * Badge + memorial copy only. Purchase → Stripe Checkout; restore by email.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  FOUNDER_PACK_PRICE_USD,
  consumeSupporterReturnQuery,
  getCloudApiBaseUrl,
  isSupporter,
  markSupporterFromEmailRestore,
  postCloudJson,
  readSupporterStatus
} from '../core/supporterGate.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'supporter-pack-card-styles-v1';
const FADE_MS = 220;

/** Simple static badge (no asset pipeline). */
const BADGE_SVG = `<svg class="supporter-pack__badge-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle cx="32" cy="32" r="28" fill="rgba(212,165,116,.35)" stroke="rgba(139,115,85,.55)" stroke-width="2"/>
  <path d="M32 14l4.2 8.5 9.4 1.4-6.8 6.6 1.6 9.3L32 35.6l-8.4 4.4 1.6-9.3-6.8-6.6 9.4-1.4z" fill="rgba(90,62,40,.85)"/>
</svg>`;

export class SupporterPackUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._open = false;
    this._busy = false;

    this.root = document.createElement('div');
    this.root.id = 'supporter-pack-card';
    this.root.className = 'supporter-pack';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'supporter-pack-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'supporter-pack-title';
    this.titleEl.className = 'supporter-pack__title';

    this.badgeWrap = document.createElement('div');
    this.badgeWrap.className = 'supporter-pack__badge';
    this.badgeWrap.innerHTML = BADGE_SVG;

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'supporter-pack__status';
    this.statusEl.dataset.testid = 'supporter-pack-status';

    this.memorialEl = document.createElement('p');
    this.memorialEl.className = 'supporter-pack__memorial';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'supporter-pack__blurb';

    this.priceEl = document.createElement('p');
    this.priceEl.className = 'supporter-pack__price';

    this.buyBtn = document.createElement('button');
    this.buyBtn.type = 'button';
    this.buyBtn.className =
      'supporter-pack__btn supporter-pack__btn--primary';
    this.buyBtn.dataset.testid = 'supporter-pack-buy';
    this.buyBtn.addEventListener('click', () => this._onBuy());

    this.restoreTitle = document.createElement('p');
    this.restoreTitle.className = 'supporter-pack__restore-title';

    this.restoreHint = document.createElement('p');
    this.restoreHint.className = 'supporter-pack__restore-hint';

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.className = 'supporter-pack__email';
    this.emailInput.dataset.testid = 'supporter-pack-email';
    this.emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._onRestore();
      }
    });

    this.restoreBtn = document.createElement('button');
    this.restoreBtn.type = 'button';
    this.restoreBtn.className = 'supporter-pack__btn supporter-pack__btn--ghost';
    this.restoreBtn.dataset.testid = 'supporter-pack-restore';
    this.restoreBtn.addEventListener('click', () => this._onRestore());

    this.feedbackEl = document.createElement('p');
    this.feedbackEl.className = 'supporter-pack__feedback';
    this.feedbackEl.dataset.testid = 'supporter-pack-feedback';
    this.feedbackEl.hidden = true;

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'supporter-pack__btn supporter-pack__btn--ghost';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions = document.createElement('div');
    this.actions.className = 'supporter-pack__actions';
    this.actions.append(this.closeBtn, this.buyBtn);

    this.restoreRow = document.createElement('div');
    this.restoreRow.className = 'supporter-pack__restore-row';
    this.restoreRow.append(this.emailInput, this.restoreBtn);

    this.root.append(
      this.titleEl,
      this.badgeWrap,
      this.statusEl,
      this.memorialEl,
      this.blurbEl,
      this.priceEl,
      this.actions,
      this.restoreTitle,
      this.restoreHint,
      this.restoreRow,
      this.feedbackEl
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
    this._unsubLocale = onLocaleChange(() => this._refresh());

    // Success / cancel return from Stripe Checkout (optimistic local write).
    const ret = consumeSupporterReturnQuery({ storage: this._storage });
    if (ret.outcome === 'success') {
      this._setFeedback(t('SUPPORTER_FEEDBACK_THANKS'), false);
    } else if (ret.outcome === 'cancel') {
      this._setFeedback(t('SUPPORTER_FEEDBACK_CANCEL'), false);
    }

    this._refresh();
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
    this._refresh();
    this.buyBtn.focus({ preventScroll: true });
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

  _cloudReady() {
    return Boolean(getCloudApiBaseUrl());
  }

  _setFeedback(text, isError) {
    if (!text) {
      this.feedbackEl.hidden = true;
      this.feedbackEl.textContent = '';
      return;
    }
    this.feedbackEl.hidden = false;
    this.feedbackEl.textContent = text;
    this.feedbackEl.classList.toggle('is-error', Boolean(isError));
  }

  _refresh() {
    const supporter = isSupporter({ storage: this._storage });
    const status = readSupporterStatus(this._storage);
    const cloudOk = this._cloudReady();

    this.titleEl.textContent = t('SUPPORTER_CARD_TITLE');
    this.memorialEl.textContent = t('SUPPORTER_MEMORIAL');
    this.blurbEl.textContent = t('SUPPORTER_CARD_BLURB');
    this.priceEl.textContent = t('SUPPORTER_PRICE').replaceAll(
      '{price}',
      FOUNDER_PACK_PRICE_USD
    );
    this.restoreTitle.textContent = t('SUPPORTER_RESTORE_TITLE');
    this.restoreHint.textContent = t('SUPPORTER_RESTORE_HINT');
    this.emailInput.placeholder = t('SUPPORTER_EMAIL_PLACEHOLDER');
    this.restoreBtn.textContent = t('SUPPORTER_RESTORE_CTA');
    this.closeBtn.textContent = t('SUPPORTER_CLOSE');
    this.buyBtn.textContent = supporter
      ? t('SUPPORTER_ALREADY')
      : t('SUPPORTER_BUY_CTA');

    this.statusEl.textContent = supporter
      ? t('SUPPORTER_STATUS_YES')
      : t('SUPPORTER_STATUS_NO');
    this.statusEl.classList.toggle('is-yes', supporter);
    this.badgeWrap.classList.toggle('is-active', supporter);

    this.buyBtn.disabled = this._busy || supporter || !cloudOk;
    this.restoreBtn.disabled = this._busy || !cloudOk;
    this.emailInput.disabled = this._busy || !cloudOk;

    if (!cloudOk) {
      this._setFeedback(t('SUPPORTER_CLOUD_OFFLINE'), true);
    } else if (
      this.feedbackEl.classList.contains('is-error') &&
      this.feedbackEl.textContent === t('SUPPORTER_CLOUD_OFFLINE')
    ) {
      this._setFeedback('', false);
    }

    if (supporter && status.email) {
      this.emailInput.value = status.email;
    }

    this.root.setAttribute(
      'aria-label',
      supporter ? t('SUPPORTER_STATUS_YES') : t('SUPPORTER_CARD_TITLE')
    );
  }

  async _onBuy() {
    if (this._busy || isSupporter({ storage: this._storage })) return;
    if (!this._cloudReady()) {
      this._setFeedback(t('SUPPORTER_CLOUD_OFFLINE'), true);
      return;
    }
    this._busy = true;
    this._refresh();
    this._setFeedback(t('SUPPORTER_BUY_PENDING'), false);
    try {
      const email = String(this.emailInput.value || '').trim();
      const body = email ? JSON.stringify({ email }) : '{}';
      const data = await postCloudJson('/api/create-checkout-session', {
        body
      });
      const url =
        data && typeof data === 'object' && typeof data.url === 'string'
          ? data.url
          : '';
      if (!url) throw new Error('missing_checkout_url');
      window.location.assign(url);
    } catch (err) {
      const msg =
        err instanceof Error && err.message === 'cloud_api_unconfigured'
          ? t('SUPPORTER_CLOUD_OFFLINE')
          : t('SUPPORTER_BUY_ERROR');
      this._setFeedback(msg, true);
      this._busy = false;
      this._refresh();
    }
  }

  async _onRestore() {
    if (this._busy) return;
    if (!this._cloudReady()) {
      this._setFeedback(t('SUPPORTER_CLOUD_OFFLINE'), true);
      return;
    }
    const email = String(this.emailInput.value || '').trim();
    if (!email) {
      this._setFeedback(t('SUPPORTER_EMAIL_REQUIRED'), true);
      return;
    }
    this._busy = true;
    this._refresh();
    this._setFeedback(t('SUPPORTER_RESTORE_PENDING'), false);
    try {
      const data = await postCloudJson('/api/verify-supporter', {
        body: JSON.stringify({ email })
      });
      const ok =
        data &&
        typeof data === 'object' &&
        /** @type {{ supporter?: unknown }} */ (data).supporter === true;
      if (!ok) {
        this._setFeedback(t('SUPPORTER_RESTORE_MISS'), true);
        this._busy = false;
        this._refresh();
        return;
      }
      const purchasedAt =
        data &&
        typeof data === 'object' &&
        typeof /** @type {{ purchasedAt?: unknown }} */ (data).purchasedAt ===
          'string'
          ? /** @type {{ purchasedAt: string }} */ (data).purchasedAt
          : null;
      markSupporterFromEmailRestore(this._storage, { email, purchasedAt });
      this._setFeedback(t('SUPPORTER_RESTORE_OK'), false);
    } catch (err) {
      const status = /** @type {any} */ (err)?.status;
      const msg =
        status === 429
          ? t('SUPPORTER_RESTORE_RATE')
          : t('SUPPORTER_RESTORE_ERROR');
      this._setFeedback(msg, true);
    }
    this._busy = false;
    this._refresh();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .supporter-pack {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(380px, calc(100vw - 40px));
        max-height: min(78vh, 640px);
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
      .supporter-pack.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .supporter-pack__title {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
      }
      .supporter-pack__badge {
        display: flex;
        justify-content: center;
        margin: 0 0 8px;
        opacity: 0.45;
        filter: grayscale(0.35);
        transition: opacity 180ms ease, filter 180ms ease;
      }
      .supporter-pack__badge.is-active {
        opacity: 1;
        filter: none;
      }
      .supporter-pack__badge-svg {
        width: 56px;
        height: 56px;
      }
      .supporter-pack__status {
        margin: 0 0 8px;
        font-size: 13px;
        font-weight: 600;
        color: #5c4330;
        text-align: center;
      }
      .supporter-pack__status.is-yes {
        color: #6b4e2e;
      }
      .supporter-pack__memorial {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.5;
        color: #4a3a28;
        text-align: center;
        font-style: italic;
      }
      .supporter-pack__blurb,
      .supporter-pack__price,
      .supporter-pack__restore-title,
      .supporter-pack__restore-hint {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(92,67,48,.9);
      }
      .supporter-pack__price {
        font-weight: 600;
        color: #4a3a28;
      }
      .supporter-pack__restore-title {
        margin-top: 12px;
        font-weight: 600;
        color: #4a3a28;
      }
      .supporter-pack__actions,
      .supporter-pack__restore-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .supporter-pack__restore-row {
        margin-bottom: 8px;
      }
      .supporter-pack__email {
        flex: 1;
        min-width: 0;
        padding: 8px 10px;
        font-size: 13px;
        border-radius: 12px;
        border: 1px solid rgba(139,115,85,.28);
        background: rgba(255,252,245,.7);
        color: #2c1f14;
      }
      .supporter-pack__btn {
        padding: 8px 14px;
        font-size: 13px;
        border-radius: 16px;
        cursor: pointer;
        border: 1px solid rgba(139,115,85,.28);
        background: ${GLASS_FILL_STRONG};
        color: #4a3a28;
        box-shadow: 0 1px 0 rgba(255,255,255,.7) inset;
        white-space: nowrap;
      }
      .supporter-pack__btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .supporter-pack__btn--primary {
        background: rgba(212,165,116,.35);
        border-color: rgba(139,115,85,.35);
        font-weight: 600;
        margin-left: auto;
      }
      .supporter-pack__btn--ghost {
        background: rgba(255,252,245,.55);
      }
      .supporter-pack__feedback {
        margin: 4px 0 0;
        font-size: 12px;
        line-height: 1.4;
        color: #5c4330;
      }
      .supporter-pack__feedback.is-error {
        color: #8a3b2a;
      }
    `;
    document.head.appendChild(style);
  }
}
