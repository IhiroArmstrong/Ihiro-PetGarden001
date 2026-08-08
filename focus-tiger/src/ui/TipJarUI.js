/**
 * Buy Yin a Tea · Tip Jar · glass card (Idle ⋯ / drawer).
 * Badge + memorial copy only. Purchase → Stripe Checkout; restore by email.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  TIP_JAR_PRICE_USD,
  consumeTipReturnQuery,
  ensureTipBadgesAwarded,
  getCloudApiBaseUrl,
  hasTipped,
  markTipFromEmailRestore,
  postCloudJson,
  readTipStatus
} from '../core/tipJarGate.js';
import {
  getTipKindnessBadgeById,
  tipKindnessBadgeSrc
} from '../core/tipKindnessBadges.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'yin-tip-jar-card-styles-v2';
const FADE_MS = 220;

export class TipJarUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onBadgesChanged]
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
    this.root.id = 'yin-tip-jar-card';
    this.root.className = 'yin-tip-jar';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'yin-tip-jar-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'yin-tip-jar-title';
    this.titleEl.className = 'yin-tip-jar__title';

    this.badgeWrap = document.createElement('div');
    this.badgeWrap.className = 'yin-tip-jar__badge';
    this.badgeWrap.dataset.testid = 'yin-tip-jar-badges';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'yin-tip-jar__status';
    this.statusEl.dataset.testid = 'yin-tip-jar-status';

    this.memorialEl = document.createElement('p');
    this.memorialEl.className = 'yin-tip-jar__memorial';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'yin-tip-jar__blurb';

    this.priceEl = document.createElement('p');
    this.priceEl.className = 'yin-tip-jar__price';

    this.buyBtn = document.createElement('button');
    this.buyBtn.type = 'button';
    this.buyBtn.className =
      'yin-tip-jar__btn yin-tip-jar__btn--primary';
    this.buyBtn.dataset.testid = 'yin-tip-jar-buy';
    this.buyBtn.addEventListener('click', () => this._onBuy());

    this.restoreTitle = document.createElement('p');
    this.restoreTitle.className = 'yin-tip-jar__restore-title';

    this.restoreHint = document.createElement('p');
    this.restoreHint.className = 'yin-tip-jar__restore-hint';

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.className = 'yin-tip-jar__email';
    this.emailInput.dataset.testid = 'yin-tip-jar-email';
    this.emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._onRestore();
      }
    });

    this.restoreBtn = document.createElement('button');
    this.restoreBtn.type = 'button';
    this.restoreBtn.className = 'yin-tip-jar__btn yin-tip-jar__btn--ghost';
    this.restoreBtn.dataset.testid = 'yin-tip-jar-restore';
    this.restoreBtn.addEventListener('click', () => this._onRestore());

    this.feedbackEl = document.createElement('p');
    this.feedbackEl.className = 'yin-tip-jar__feedback';
    this.feedbackEl.dataset.testid = 'yin-tip-jar-feedback';
    this.feedbackEl.hidden = true;

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'yin-tip-jar__btn yin-tip-jar__btn--ghost';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions = document.createElement('div');
    this.actions.className = 'yin-tip-jar__actions';
    this.actions.append(this.closeBtn, this.buyBtn);

    this.restoreRow = document.createElement('div');
    this.restoreRow.className = 'yin-tip-jar__restore-row';
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
    const ret = consumeTipReturnQuery({ storage: this._storage });
    if (ret.outcome === 'success') {
      this._setFeedback(t('TIP_FEEDBACK_THANKS'), false);
      this.handlers.onBadgesChanged?.();
    } else if (ret.outcome === 'cancel') {
      this._setFeedback(t('TIP_FEEDBACK_CANCEL'), false);
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

  /**
   * @param {string[]} badgeIds
   */
  _renderBadges(badgeIds) {
    this.badgeWrap.replaceChildren();
    if (!badgeIds.length) {
      const empty = document.createElement('p');
      empty.className = 'yin-tip-jar__badge-empty';
      empty.textContent = t('TIP_BADGES_EMPTY');
      this.badgeWrap.appendChild(empty);
      return;
    }
    const row = document.createElement('div');
    row.className = 'yin-tip-jar__badge-row';
    for (const id of badgeIds) {
      const meta = getTipKindnessBadgeById(id);
      if (!meta) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yin-tip-jar__badge-btn';
      btn.title = t('TIP_BADGES_DOWNLOAD_ONE');
      btn.setAttribute('aria-label', t('TIP_BADGES_DOWNLOAD_ONE'));
      const img = document.createElement('img');
      img.className = 'yin-tip-jar__badge-img';
      img.src = tipKindnessBadgeSrc(meta.file);
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      btn.appendChild(img);
      btn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = tipKindnessBadgeSrc(meta.file);
        a.download = meta.file;
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
      row.appendChild(btn);
    }
    const note = document.createElement('p');
    note.className = 'yin-tip-jar__badge-note';
    note.textContent = t('TIP_BADGES_CARD_NOTE');
    this.badgeWrap.append(row, note);
  }

  _refresh() {
    const backfill = ensureTipBadgesAwarded(this._storage);
    if (backfill.newlyAddedIds.length) {
      this.handlers.onBadgesChanged?.();
    }
    const tipped = hasTipped({ storage: this._storage });
    const status = readTipStatus(this._storage);
    const cloudOk = this._cloudReady();

    this.titleEl.textContent = t('TIP_CARD_TITLE');
    this.memorialEl.textContent = t('TIP_MEMORIAL');
    this.blurbEl.textContent = t('TIP_CARD_BLURB');
    this.priceEl.textContent = t('TIP_PRICE').replaceAll(
      '{price}',
      TIP_JAR_PRICE_USD
    );
    this.restoreTitle.textContent = t('TIP_RESTORE_TITLE');
    this.restoreHint.textContent = t('TIP_RESTORE_HINT');
    this.emailInput.placeholder = t('TIP_EMAIL_PLACEHOLDER');
    this.restoreBtn.textContent = t('TIP_RESTORE_CTA');
    this.closeBtn.textContent = t('TIP_CLOSE');
    this.buyBtn.textContent = tipped
      ? t('TIP_ALREADY')
      : t('TIP_BUY_CTA');

    this.statusEl.textContent = tipped
      ? t('TIP_STATUS_YES')
      : t('TIP_STATUS_NO');
    this.statusEl.classList.toggle('is-yes', tipped);
    this.badgeWrap.classList.toggle('is-active', tipped);
    this._renderBadges(tipped ? status.badgeIds : []);

    // Tips may repeat; do not permanently disable after first tip.
    this.buyBtn.disabled = this._busy || !cloudOk;
    this.restoreBtn.disabled = this._busy || !cloudOk;
    this.emailInput.disabled = this._busy || !cloudOk;

    if (!cloudOk) {
      this._setFeedback(t('TIP_CLOUD_OFFLINE'), true);
    } else if (
      this.feedbackEl.classList.contains('is-error') &&
      this.feedbackEl.textContent === t('TIP_CLOUD_OFFLINE')
    ) {
      this._setFeedback('', false);
    }

    if (tipped && status.email) {
      this.emailInput.value = status.email;
    }

    this.root.setAttribute(
      'aria-label',
      tipped ? t('TIP_STATUS_YES') : t('TIP_CARD_TITLE')
    );
  }

  /** Public entry for Support modal / other chrome — same Stripe path as Buy CTA. */
  startCheckout() {
    return this._onBuy();
  }

  async _onBuy() {
    if (this._busy) return;
    if (!this._cloudReady()) {
      this._setFeedback(t('TIP_CLOUD_OFFLINE'), true);
      return;
    }
    this._busy = true;
    this._refresh();
    this._setFeedback(t('TIP_BUY_PENDING'), false);
    try {
      const email = String(this.emailInput.value || '').trim();
      const body = email ? JSON.stringify({ email }) : '{}';
      const data = await postCloudJson('/api/create-tip-checkout-session', {
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
          ? t('TIP_CLOUD_OFFLINE')
          : t('TIP_BUY_ERROR');
      this._setFeedback(msg, true);
      this._busy = false;
      this._refresh();
    }
  }

  async _onRestore() {
    if (this._busy) return;
    if (!this._cloudReady()) {
      this._setFeedback(t('TIP_CLOUD_OFFLINE'), true);
      return;
    }
    const email = String(this.emailInput.value || '').trim();
    if (!email) {
      this._setFeedback(t('TIP_EMAIL_REQUIRED'), true);
      return;
    }
    this._busy = true;
    this._refresh();
    this._setFeedback(t('TIP_RESTORE_PENDING'), false);
    try {
      const data = await postCloudJson('/api/verify-tip', {
        body: JSON.stringify({ email })
      });
      const ok =
        data &&
        typeof data === 'object' &&
        /** @type {{ tipped?: unknown }} */ (data).tipped === true;
      if (!ok) {
        this._setFeedback(t('TIP_RESTORE_MISS'), true);
        this._busy = false;
        this._refresh();
        return;
      }
      const lastTippedAt =
        data &&
        typeof data === 'object' &&
        typeof /** @type {{ lastTippedAt?: unknown }} */ (data).lastTippedAt ===
          'string'
          ? /** @type {{ lastTippedAt: string }} */ (data).lastTippedAt
          : null;
      const tipCount =
        data &&
        typeof data === 'object' &&
        typeof /** @type {{ tipCount?: unknown }} */ (data).tipCount === 'number'
          ? /** @type {{ tipCount: number }} */ (data).tipCount
          : 1;
      markTipFromEmailRestore(this._storage, {
        email,
        lastTippedAt,
        tipCount
      });
      this._setFeedback(t('TIP_RESTORE_OK'), false);
      this.handlers.onBadgesChanged?.();
    } catch (err) {
      const status = /** @type {any} */ (err)?.status;
      const msg =
        status === 429
          ? t('TIP_RESTORE_RATE')
          : t('TIP_RESTORE_ERROR');
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
      .yin-tip-jar {
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
      .yin-tip-jar.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .yin-tip-jar__title {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
      }
      .yin-tip-jar__badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        margin: 0 0 8px;
        opacity: 0.55;
        transition: opacity 180ms ease;
      }
      .yin-tip-jar__badge.is-active {
        opacity: 1;
      }
      .yin-tip-jar__badge-empty {
        margin: 0;
        font-size: 12px;
        color: rgba(92, 67, 48, 0.72);
        text-align: center;
      }
      .yin-tip-jar__badge-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }
      .yin-tip-jar__badge-btn {
        appearance: none;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        line-height: 0;
      }
      .yin-tip-jar__badge-img {
        width: 52px;
        height: 52px;
        object-fit: contain;
        border-radius: 50%;
        display: block;
        background: rgba(255, 252, 245, 0.7);
      }
      .yin-tip-jar__badge-note {
        margin: 0;
        font-size: 11px;
        line-height: 1.4;
        color: rgba(92, 67, 48, 0.72);
        text-align: center;
      }
      .yin-tip-jar__status {
        margin: 0 0 8px;
        font-size: 13px;
        font-weight: 600;
        color: #5c4330;
        text-align: center;
      }
      .yin-tip-jar__status.is-yes {
        color: #6b4e2e;
      }
      .yin-tip-jar__memorial {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.5;
        color: #4a3a28;
        text-align: center;
        font-style: italic;
      }
      .yin-tip-jar__blurb,
      .yin-tip-jar__price,
      .yin-tip-jar__restore-title,
      .yin-tip-jar__restore-hint {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(92,67,48,.9);
      }
      .yin-tip-jar__price {
        font-weight: 600;
        color: #4a3a28;
      }
      .yin-tip-jar__restore-title {
        margin-top: 12px;
        font-weight: 600;
        color: #4a3a28;
      }
      .yin-tip-jar__actions,
      .yin-tip-jar__restore-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .yin-tip-jar__restore-row {
        margin-bottom: 8px;
      }
      .yin-tip-jar__email {
        flex: 1;
        min-width: 0;
        padding: 8px 10px;
        font-size: 13px;
        border-radius: 12px;
        border: 1px solid rgba(139,115,85,.28);
        background: rgba(255,252,245,.7);
        color: #2c1f14;
      }
      .yin-tip-jar__btn {
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
      .yin-tip-jar__btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .yin-tip-jar__btn--primary {
        background: rgba(212,165,116,.35);
        border-color: rgba(139,115,85,.35);
        font-weight: 600;
        margin-left: auto;
      }
      .yin-tip-jar__btn--ghost {
        background: rgba(255,252,245,.55);
      }
      .yin-tip-jar__feedback {
        margin: 4px 0 0;
        font-size: 12px;
        line-height: 1.4;
        color: #5c4330;
      }
      .yin-tip-jar__feedback.is-error {
        color: #8a3b2a;
      }
    `;
    document.head.appendChild(style);
  }
}
