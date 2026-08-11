/**
 * Yin's Sanctuary · Lifetime unlock card (Idle ⋯ / drawer).
 * Content unlock UI — zero coupling with tip jar (uses cloudApiClient only).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { postCloudJson } from '../core/cloudApiClient.js';
import {
  confirmSanctuaryReturnQuery,
  isSanctuaryUnlocked,
  markSanctuaryFromPayment,
  readSanctuaryEntitlement,
  syncSanctuaryBadgesFromPractice
} from '../core/sanctuaryEntitlementGate.js';
import {
  getSanctuaryBadgeById,
  sanctuaryBadgeSrc
} from '../core/sanctuaryBadges.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import { getMonetizationFunnelStore } from '../core/monetizationIntentFunnel.js';

const STYLE_ID = 'yin-sanctuary-card-styles-v1';
const FADE_MS = 220;
const CHECKOUT_ARM_MS = 450;

/** Display price (USD). Stripe Lifetime Price ID lives on the Worker. */
export const SANCTUARY_LIFETIME_PRICE_USD = '89.99';

export class SanctuaryUnlockUI {
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
    this._focusTimer = null;
    /** @type {number} */
    this._checkoutArmedAt = 0;

    this.root = document.createElement('div');
    this.root.id = 'yin-sanctuary-card';
    this.root.className = 'yin-sanctuary';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'yin-sanctuary-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'yin-sanctuary-title';
    this.titleEl.className = 'yin-sanctuary__title';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'yin-sanctuary__status';
    this.statusEl.dataset.testid = 'yin-sanctuary-status';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'yin-sanctuary__blurb';

    this.benefits = document.createElement('ul');
    this.benefits.className = 'yin-sanctuary__benefits';
    this.benefitEls = [0, 1, 2].map(() => {
      const li = document.createElement('li');
      this.benefits.appendChild(li);
      return li;
    });

    this.priceEl = document.createElement('p');
    this.priceEl.className = 'yin-sanctuary__price';

    this.badgesNote = document.createElement('p');
    this.badgesNote.className = 'yin-sanctuary__badges-note';
    this.badgesNote.dataset.testid = 'yin-sanctuary-badges-note';

    this.badgesRow = document.createElement('div');
    this.badgesRow.className = 'yin-sanctuary__badges';
    this.badgesRow.dataset.testid = 'yin-sanctuary-badges';

    this.buyBtn = document.createElement('button');
    this.buyBtn.type = 'button';
    this.buyBtn.className =
      'yin-sanctuary__btn yin-sanctuary__btn--primary';
    this.buyBtn.dataset.testid = 'yin-sanctuary-buy';
    this.buyBtn.addEventListener('click', () => {
      void this._startCheckout();
    });

    this.restoreTitle = document.createElement('p');
    this.restoreTitle.className = 'yin-sanctuary__restore-title';

    this.restoreHint = document.createElement('p');
    this.restoreHint.className = 'yin-sanctuary__restore-hint';

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.className = 'yin-sanctuary__email';
    this.emailInput.dataset.testid = 'yin-sanctuary-email';

    this.sendCodeBtn = document.createElement('button');
    this.sendCodeBtn.type = 'button';
    this.sendCodeBtn.className =
      'yin-sanctuary__btn yin-sanctuary__btn--ghost';
    this.sendCodeBtn.dataset.testid = 'yin-sanctuary-send-code';
    this.sendCodeBtn.addEventListener('click', () => {
      void this._sendRestoreCode();
    });

    this.codeInput = document.createElement('input');
    this.codeInput.type = 'text';
    this.codeInput.inputMode = 'numeric';
    this.codeInput.autocomplete = 'one-time-code';
    this.codeInput.maxLength = 6;
    this.codeInput.className = 'yin-sanctuary__code';
    this.codeInput.dataset.testid = 'yin-sanctuary-code';

    this.restoreBtn = document.createElement('button');
    this.restoreBtn.type = 'button';
    this.restoreBtn.className =
      'yin-sanctuary__btn yin-sanctuary__btn--ghost';
    this.restoreBtn.dataset.testid = 'yin-sanctuary-restore';
    this.restoreBtn.addEventListener('click', () => {
      void this._restore();
    });

    this.restoreRow = document.createElement('div');
    this.restoreRow.className = 'yin-sanctuary__restore-row';
    this.restoreRow.append(this.sendCodeBtn, this.restoreBtn);

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'yin-sanctuary__btn yin-sanctuary__btn--ghost';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions = document.createElement('div');
    this.actions.className = 'yin-sanctuary__actions';
    this.actions.append(this.closeBtn, this.buyBtn);

    this.root.append(
      this.titleEl,
      this.statusEl,
      this.blurbEl,
      this.benefits,
      this.priceEl,
      this.badgesNote,
      this.badgesRow,
      this.actions,
      this.restoreTitle,
      this.restoreHint,
      this.emailInput,
      this.codeInput,
      this.restoreRow
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
      if (Date.now() < this._checkoutArmedAt) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      this.close();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._refreshTexts();
  }

  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this._checkoutArmedAt = Date.now() + CHECKOUT_ARM_MS;
    this.root.hidden = false;
    this.root.tabIndex = -1;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refreshTexts();
    this.handlers.onBadgesChanged?.();
    if (this._focusTimer != null) window.clearTimeout(this._focusTimer);
    this._focusTimer = window.setTimeout(() => {
      this._focusTimer = null;
      if (this._open) this.root.focus({ preventScroll: true });
    }, 0);
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._checkoutArmedAt = 0;
    if (this._focusTimer != null) {
      window.clearTimeout(this._focusTimer);
      this._focusTimer = null;
    }
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

  /** Public entry for Support modal / other chrome — same Stripe Lifetime path. */
  startCheckout() {
    return this._startCheckout();
  }

  async _startCheckout() {
    if (this._busy) return;
    if (Date.now() < this._checkoutArmedAt) return;
    this._busy = true;
    this.buyBtn.disabled = true;
    let checkoutError = false;
    try {
      const email = this.emailInput.value.trim();
      const body = email ? { email } : {};
      const res = await postCloudJson('/api/create-sanctuary-checkout-session', {
        body: JSON.stringify(body)
      });
      const url =
        res && typeof res === 'object'
          ? /** @type {{ url?: unknown }} */ (res).url
          : null;
      if (typeof url === 'string' && url) {
        getMonetizationFunnelStore().checkoutStart('sanctuary', 'sanctuary-card');
        window.location.assign(url);
        return;
      }
      checkoutError = true;
      this.statusEl.textContent = t('SANCTUARY_ERROR_GENERIC');
    } catch {
      checkoutError = true;
      this.statusEl.textContent = t('SANCTUARY_ERROR_GENERIC');
    } finally {
      this._busy = false;
      this.buyBtn.disabled = false;
      if (checkoutError) {
        if (!this._open) this.open();
        this.statusEl.textContent = t('SANCTUARY_ERROR_GENERIC');
      } else {
        this._refreshTexts();
      }
    }
  }

  async _sendRestoreCode() {
    if (this._busy) return;
    const email = this.emailInput.value.trim();
    if (!email) {
      this.statusEl.textContent = t('SANCTUARY_EMAIL_REQUIRED');
      return;
    }
    this._busy = true;
    this.sendCodeBtn.disabled = true;
    this.restoreBtn.disabled = true;
    try {
      await postCloudJson('/api/restore/request-otp', {
        body: JSON.stringify({ email, purpose: 'sanctuary' })
      });
      this.statusEl.textContent = t('SANCTUARY_RESTORE_CODE_SENT');
    } catch (err) {
      const status = /** @type {any} */ (err)?.status;
      this.statusEl.textContent =
        status === 429
          ? t('SANCTUARY_RESTORE_RATE')
          : t('SANCTUARY_ERROR_GENERIC');
    } finally {
      this._busy = false;
      this.sendCodeBtn.disabled = false;
      this.restoreBtn.disabled = false;
    }
  }

  async _restore() {
    if (this._busy) return;
    const email = this.emailInput.value.trim();
    const code = this.codeInput.value.trim();
    if (!email) {
      this.statusEl.textContent = t('SANCTUARY_EMAIL_REQUIRED');
      return;
    }
    if (!code) {
      this.statusEl.textContent = t('SANCTUARY_RESTORE_CODE_REQUIRED');
      return;
    }
    this._busy = true;
    this.sendCodeBtn.disabled = true;
    this.restoreBtn.disabled = true;
    try {
      const res = await postCloudJson('/api/verify-sanctuary', {
        body: JSON.stringify({ email, code })
      });
      const unlocked =
        res &&
        typeof res === 'object' &&
        /** @type {{ unlocked?: unknown }} */ (res).unlocked === true;
      if (unlocked) {
        markSanctuaryFromPayment(this._storage);
        this.statusEl.textContent = t('SANCTUARY_STATUS_YES');
        this.codeInput.value = '';
        this.handlers.onBadgesChanged?.();
      } else {
        this.statusEl.textContent = t('SANCTUARY_RESTORE_MISS');
      }
    } catch (err) {
      const status = /** @type {any} */ (err)?.status;
      const codeName =
        err &&
        typeof err === 'object' &&
        /** @type {any} */ (err).body &&
        typeof /** @type {any} */ (err).body.error === 'string'
          ? /** @type {any} */ (err).body.error
          : '';
      if (status === 429) {
        this.statusEl.textContent = t('SANCTUARY_RESTORE_RATE');
      } else if (
        status === 401 ||
        codeName === 'invalid_or_expired_code' ||
        codeName === 'otp_required'
      ) {
        this.statusEl.textContent = t('SANCTUARY_RESTORE_CODE_BAD');
      } else {
        this.statusEl.textContent = t('SANCTUARY_ERROR_GENERIC');
      }
    } finally {
      this._busy = false;
      this.sendCodeBtn.disabled = false;
      this.restoreBtn.disabled = false;
    }
  }

  /**
   * @param {string[]} badgeIds
   */
  _renderBadges(badgeIds) {
    this.badgesRow.replaceChildren();
    if (!badgeIds.length) {
      this.badgesNote.hidden = true;
      this.badgesRow.hidden = true;
      return;
    }
    this.badgesNote.hidden = false;
    this.badgesRow.hidden = false;
    this.badgesNote.textContent = t('SANCTUARY_BADGES_CARD_NOTE');
    for (const id of badgeIds) {
      const meta = getSanctuaryBadgeById(id);
      if (!meta) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yin-sanctuary__badge-btn';
      btn.dataset.badgeId = id;
      btn.dataset.testid = `yin-sanctuary-badge-${id}`;
      btn.title = t('SANCTUARY_BADGES_DOWNLOAD_ONE');
      btn.setAttribute('aria-label', t('SANCTUARY_BADGES_DOWNLOAD_ONE'));
      const img = document.createElement('img');
      img.src = sanctuaryBadgeSrc(meta.file);
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      btn.appendChild(img);
      btn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = sanctuaryBadgeSrc(meta.file);
        a.download = meta.file;
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
      this.badgesRow.appendChild(btn);
    }
  }

  _refreshTexts() {
    this.titleEl.textContent = t('SANCTUARY_CARD_TITLE');
    this.blurbEl.textContent = t('SANCTUARY_CARD_BLURB');
    this.benefitEls[0].textContent = t('SANCTUARY_BENEFIT_1');
    this.benefitEls[1].textContent = t('SANCTUARY_BENEFIT_2');
    this.benefitEls[2].textContent = t('SANCTUARY_BENEFIT_3');
    this.priceEl.textContent = t('SANCTUARY_PRICE').replaceAll(
      '{price}',
      SANCTUARY_LIFETIME_PRICE_USD
    );
    this.buyBtn.textContent = isSanctuaryUnlocked({ storage: this._storage })
      ? t('SANCTUARY_ALREADY')
      : t('SANCTUARY_BUY_CTA');
    this.closeBtn.textContent = t('SANCTUARY_CLOSE');
    this.restoreTitle.textContent = t('SANCTUARY_RESTORE_TITLE');
    this.restoreHint.textContent = t('SANCTUARY_RESTORE_HINT');
    this.sendCodeBtn.textContent = t('SANCTUARY_RESTORE_SEND_CODE');
    this.restoreBtn.textContent = t('SANCTUARY_RESTORE_CTA');
    this.emailInput.placeholder = t('SANCTUARY_EMAIL_PLACEHOLDER');
    this.codeInput.placeholder = t('SANCTUARY_RESTORE_CODE_PLACEHOLDER');
    const unlocked = isSanctuaryUnlocked({ storage: this._storage });
    if (unlocked) {
      syncSanctuaryBadgesFromPractice(this._storage);
    }
    const ent = readSanctuaryEntitlement(this._storage);
    const via = ent.unlockedVia;
    this.statusEl.textContent = unlocked
      ? via === 'preview'
        ? t('SANCTUARY_STATUS_PREVIEW')
        : t('SANCTUARY_STATUS_YES')
      : t('SANCTUARY_STATUS_NO');
    this._renderBadges(unlocked ? ent.badgeIds : []);
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-sanctuary {
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
      .yin-sanctuary.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .yin-sanctuary__title {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
      }
      .yin-sanctuary__status,
      .yin-sanctuary__blurb,
      .yin-sanctuary__price,
      .yin-sanctuary__restore-title,
      .yin-sanctuary__restore-hint {
        margin: 0 0 8px;
        font-size: 13px;
        line-height: 1.5;
        color: #5c4330;
      }
      .yin-sanctuary__benefits {
        margin: 0 0 10px;
        padding-left: 1.1em;
        font-size: 13px;
        line-height: 1.45;
        color: #3d2e22;
      }
      .yin-sanctuary__badges-note {
        margin: 0 0 6px;
        font-size: 12px;
        line-height: 1.4;
        color: #5c4330;
      }
      .yin-sanctuary__badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 0 0 12px;
      }
      .yin-sanctuary__badge-btn {
        appearance: none;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        line-height: 0;
      }
      .yin-sanctuary__badge-btn img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        border-radius: 50%;
        display: block;
        background: rgba(255, 252, 245, 0.55);
      }
      .yin-sanctuary__email,
      .yin-sanctuary__code {
        display: block;
        width: 100%;
        box-sizing: border-box;
        margin: 0 0 8px;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid rgba(139,115,85,.22);
        background: rgba(255,252,245,.7);
        font: inherit;
        color: #3d2e22;
      }
      .yin-sanctuary__restore-row {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        flex-wrap: wrap;
        margin: 0 0 4px;
      }
      .yin-sanctuary__actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin: 0 0 12px;
      }
      .yin-sanctuary__btn {
        margin: 0 0 8px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid rgba(139,115,85,.22);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        color: #3d2e22;
        background: rgba(255,252,245,.7);
      }
      .yin-sanctuary__btn--primary {
        background: ${GLASS_FILL_STRONG};
        border-color: rgba(120, 90, 55, 0.35);
      }
      .yin-sanctuary__btn--ghost {
        background: transparent;
      }
      .yin-sanctuary__btn:disabled {
        opacity: 0.55;
        cursor: default;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Boot: confirm Sanctuary return query once (server-confirmed only).
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 */
export async function bootSanctuaryReturnConfirm(opts = {}) {
  return confirmSanctuaryReturnQuery({
    storage: opts.storage,
    postJson: postCloudJson
  });
}
