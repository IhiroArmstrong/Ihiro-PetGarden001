/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Membership · subscription unlock card (Idle ⋯ / drawer / Support).
 * Patches unified entitlement cache after server confirm — no parallel gate.
 *
 * Views: active (subscribed) · subscribe (purchase) · restore (cross-device OTP).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { getCloudApiBaseUrl, postCloudJson, openCheckoutUrl } from '../core/cloudApiClient.js';
import {
  isMembershipActiveLocally,
  markMembershipFromPayment,
  MEMBERSHIP_PLAN_ID,
  MEMBERSHIP_PRICE_DISPLAY
} from '../core/membershipCheckout.js';
import { persistMembershipDeviceCredentialFromBody } from '../core/membershipDeviceCredential.js';
import { createMembershipPortalSession } from '../core/entitlement/cloudEntitlementProvider.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import { getMonetizationFunnelStore } from '../core/monetizationIntentFunnel.js';

const STYLE_ID = 'yin-membership-card-styles-v2';
const FADE_MS = 220;
/** Ignore Buy/Subscribe for this long after open (blocks same-gesture activation). */
const CHECKOUT_ARM_MS = 450;

/** @typedef {'active' | 'subscribe' | 'restore'} MembershipCardView */

export class MembershipUnlockUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onEntitlementChanged]
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
    /** @type {MembershipCardView} */
    this._view = 'subscribe';

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'yin-membership-backdrop';
    this.backdrop.className = 'yin-membership-backdrop';
    this.backdrop.hidden = true;
    this.backdrop.addEventListener('click', () => this.close());

    this.root = document.createElement('div');
    this.root.id = 'yin-membership-card';
    this.root.className = 'yin-membership';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'yin-membership-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'yin-membership-title';
    this.titleEl.className = 'yin-membership__title';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'yin-membership__status';
    this.statusEl.dataset.testid = 'yin-membership-status';

    this.planEl = document.createElement('p');
    this.planEl.className = 'yin-membership__plan';
    this.planEl.dataset.testid = 'yin-membership-plan';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'yin-membership__blurb';

    this.benefits = document.createElement('ul');
    this.benefits.className = 'yin-membership__benefits';
    this.benefitEls = [0, 1, 2].map(() => {
      const li = document.createElement('li');
      this.benefits.appendChild(li);
      return li;
    });

    this.priceEl = document.createElement('p');
    this.priceEl.className = 'yin-membership__price';

    this.buyBtn = document.createElement('button');
    this.buyBtn.type = 'button';
    this.buyBtn.className =
      'yin-membership__btn yin-membership__btn--primary';
    this.buyBtn.dataset.testid = 'yin-membership-buy';
    this.buyBtn.addEventListener('click', () => {
      void this._startCheckout();
    });

    this.manageBtn = document.createElement('button');
    this.manageBtn.type = 'button';
    this.manageBtn.className =
      'yin-membership__btn yin-membership__btn--ghost';
    this.manageBtn.dataset.testid = 'yin-membership-manage';
    this.manageBtn.addEventListener('click', () => {
      void this._openPortal();
    });

    this.restoreLinkBtn = document.createElement('button');
    this.restoreLinkBtn.type = 'button';
    this.restoreLinkBtn.className = 'yin-membership__restore-link';
    this.restoreLinkBtn.dataset.testid = 'yin-membership-restore-link';
    this.restoreLinkBtn.addEventListener('click', () => {
      this._view = 'restore';
      this._refreshTexts();
    });

    this.restoreTitle = document.createElement('p');
    this.restoreTitle.className = 'yin-membership__restore-title';

    this.restoreHint = document.createElement('p');
    this.restoreHint.className = 'yin-membership__restore-hint';

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.className = 'yin-membership__email';
    this.emailInput.dataset.testid = 'yin-membership-email';

    this.sendCodeBtn = document.createElement('button');
    this.sendCodeBtn.type = 'button';
    this.sendCodeBtn.className =
      'yin-membership__btn yin-membership__btn--ghost';
    this.sendCodeBtn.dataset.testid = 'yin-membership-send-code';
    this.sendCodeBtn.addEventListener('click', () => {
      void this._sendRestoreCode();
    });

    this.codeInput = document.createElement('input');
    this.codeInput.type = 'text';
    this.codeInput.inputMode = 'numeric';
    this.codeInput.autocomplete = 'one-time-code';
    this.codeInput.maxLength = 6;
    this.codeInput.className = 'yin-membership__code';
    this.codeInput.dataset.testid = 'yin-membership-code';

    this.restoreBtn = document.createElement('button');
    this.restoreBtn.type = 'button';
    this.restoreBtn.className =
      'yin-membership__btn yin-membership__btn--ghost';
    this.restoreBtn.dataset.testid = 'yin-membership-restore';
    this.restoreBtn.addEventListener('click', () => {
      void this._restore();
    });

    this.restoreBackBtn = document.createElement('button');
    this.restoreBackBtn.type = 'button';
    this.restoreBackBtn.className =
      'yin-membership__btn yin-membership__btn--ghost';
    this.restoreBackBtn.dataset.testid = 'yin-membership-restore-back';
    this.restoreBackBtn.addEventListener('click', () => {
      this._view = isMembershipActiveLocally({ storage: this._storage })
        ? 'active'
        : 'subscribe';
      this._refreshTexts();
    });

    this.restoreRow = document.createElement('div');
    this.restoreRow.className = 'yin-membership__restore-row';
    this.restoreRow.append(this.sendCodeBtn, this.restoreBtn);

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'yin-membership__btn yin-membership__btn--ghost';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions = document.createElement('div');
    this.actions.className = 'yin-membership__actions';

    this.subscribeSection = document.createElement('div');
    this.subscribeSection.className = 'yin-membership__section';
    this.subscribeSection.dataset.testid = 'yin-membership-subscribe-section';
    this.subscribeSection.append(
      this.blurbEl,
      this.benefits,
      this.priceEl,
      this.restoreLinkBtn
    );

    this.activeSection = document.createElement('div');
    this.activeSection.className = 'yin-membership__section';
    this.activeSection.dataset.testid = 'yin-membership-active-section';
    this.activeSection.append(this.planEl);

    this.restoreSection = document.createElement('div');
    this.restoreSection.className = 'yin-membership__section';
    this.restoreSection.dataset.testid = 'yin-membership-restore-section';
    this.restoreSection.append(
      this.restoreTitle,
      this.restoreHint,
      this.emailInput,
      this.codeInput,
      this.restoreRow,
      this.restoreBackBtn
    );

    this.actions.append(this.closeBtn, this.manageBtn, this.buyBtn);

    this.root.append(
      this.titleEl,
      this.statusEl,
      this.activeSection,
      this.subscribeSection,
      this.restoreSection,
      this.actions
    );
    mountRoot.append(this.backdrop, this.root);

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
      if (this.root.contains(target) || this.backdrop.contains(target)) return;
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
    this._view = isMembershipActiveLocally({ storage: this._storage })
      ? 'active'
      : 'subscribe';
    this.backdrop.hidden = false;
    this.root.hidden = false;
    this.root.tabIndex = -1;
    this.backdrop.getBoundingClientRect();
    this.root.getBoundingClientRect();
    this.backdrop.classList.add('is-visible');
    this.root.classList.add('is-visible');
    this._refreshTexts();
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
    this.backdrop.classList.remove('is-visible');
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) {
        this.root.hidden = true;
        this.backdrop.hidden = true;
      }
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

  /** Public entry for Support modal / other chrome. */
  startCheckout() {
    return this._startCheckout();
  }

  async _startCheckout() {
    if (this._busy) return;
    if (Date.now() < this._checkoutArmedAt) return;
    if (!getCloudApiBaseUrl()) {
      if (!this._open) this.open();
      this.statusEl.textContent = t('MEMBERSHIP_CLOUD_OFFLINE');
      return;
    }
    this._busy = true;
    this.buyBtn.disabled = true;
    this.manageBtn.disabled = true;
    let checkoutError = false;
    try {
      const email = this.emailInput.value.trim();
      const body = email ? { email } : {};
      const res = await postCloudJson('/api/create-membership-checkout-session', {
        body: JSON.stringify(body)
      });
      const url =
        res && typeof res === 'object'
          ? /** @type {{ url?: unknown }} */ (res).url
          : null;
      if (typeof url === 'string' && url) {
        getMonetizationFunnelStore().checkoutStart(
          'membership',
          'membership-card'
        );
        await openCheckoutUrl(url);
        return;
      }
      checkoutError = true;
      this.statusEl.textContent = t('MEMBERSHIP_ERROR_GENERIC');
    } catch {
      checkoutError = true;
      this.statusEl.textContent = t('MEMBERSHIP_ERROR_GENERIC');
    } finally {
      this._busy = false;
      this.buyBtn.disabled = false;
      this.manageBtn.disabled = false;
      if (checkoutError) {
        if (!this._open) this.open();
        this.statusEl.textContent = t('MEMBERSHIP_ERROR_GENERIC');
      } else {
        this._refreshTexts();
      }
    }
  }

  async _openPortal() {
    if (this._busy) return;
    if (!getCloudApiBaseUrl()) {
      this.statusEl.textContent = t('MEMBERSHIP_CLOUD_OFFLINE');
      return;
    }
    this._busy = true;
    this.manageBtn.disabled = true;
    this.buyBtn.disabled = true;
    try {
      const { url } = await createMembershipPortalSession({
        storage: this._storage
      });
      await openCheckoutUrl(url);
    } catch (err) {
      const code = /** @type {any} */ (err)?.code;
      if (code === 'credential_missing') {
        this._view = 'restore';
        this.statusEl.textContent = t('MEMBERSHIP_MANAGE_NEED_RESTORE');
        this._refreshTexts();
      } else {
        this.statusEl.textContent = t('MEMBERSHIP_ERROR_GENERIC');
      }
    } finally {
      this._busy = false;
      this.manageBtn.disabled = false;
      this.buyBtn.disabled = false;
    }
  }

  async _sendRestoreCode() {
    if (this._busy) return;
    if (!getCloudApiBaseUrl()) {
      this.statusEl.textContent = t('MEMBERSHIP_CLOUD_OFFLINE');
      return;
    }
    const email = this.emailInput.value.trim();
    if (!email) {
      this.statusEl.textContent = t('MEMBERSHIP_EMAIL_REQUIRED');
      return;
    }
    this._busy = true;
    this.sendCodeBtn.disabled = true;
    this.restoreBtn.disabled = true;
    try {
      await postCloudJson('/api/restore/request-otp', {
        body: JSON.stringify({ email, purpose: 'membership' })
      });
      this.statusEl.textContent = t('MEMBERSHIP_RESTORE_CODE_SENT');
    } catch (err) {
      const status = /** @type {any} */ (err)?.status;
      this.statusEl.textContent =
        status === 429
          ? t('MEMBERSHIP_RESTORE_RATE')
          : t('MEMBERSHIP_ERROR_GENERIC');
    } finally {
      this._busy = false;
      this.sendCodeBtn.disabled = false;
      this.restoreBtn.disabled = false;
    }
  }

  async _restore() {
    if (this._busy) return;
    if (!getCloudApiBaseUrl()) {
      this.statusEl.textContent = t('MEMBERSHIP_CLOUD_OFFLINE');
      return;
    }
    const email = this.emailInput.value.trim();
    const code = this.codeInput.value.trim();
    if (!email) {
      this.statusEl.textContent = t('MEMBERSHIP_EMAIL_REQUIRED');
      return;
    }
    if (!code) {
      this.statusEl.textContent = t('MEMBERSHIP_RESTORE_CODE_REQUIRED');
      return;
    }
    this._busy = true;
    this.sendCodeBtn.disabled = true;
    this.restoreBtn.disabled = true;
    try {
      const res = await postCloudJson('/api/verify-membership', {
        body: JSON.stringify({ email, code })
      });
      const active =
        res &&
        typeof res === 'object' &&
        (/** @type {{ active?: unknown, unlocked?: unknown }} */ (res).active ===
          true ||
          /** @type {{ unlocked?: unknown }} */ (res).unlocked === true);
      const periodEndsAt =
        res &&
        typeof res === 'object' &&
        typeof /** @type {{ periodEndsAt?: unknown }} */ (res).periodEndsAt ===
          'string'
          ? /** @type {{ periodEndsAt: string }} */ (res).periodEndsAt
          : '';
      const planId =
        res &&
        typeof res === 'object' &&
        typeof /** @type {{ planId?: unknown }} */ (res).planId === 'string'
          ? /** @type {{ planId: string }} */ (res).planId
          : MEMBERSHIP_PLAN_ID;
      if (active && periodEndsAt) {
        markMembershipFromPayment(this._storage, { periodEndsAt, planId });
        persistMembershipDeviceCredentialFromBody(this._storage, res);
        this.codeInput.value = '';
        this._view = 'active';
        this.statusEl.textContent = t('MEMBERSHIP_STATUS_YES');
        this.handlers.onEntitlementChanged?.();
        this._refreshTexts();
      } else {
        this.statusEl.textContent = t('MEMBERSHIP_RESTORE_MISS');
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
        this.statusEl.textContent = t('MEMBERSHIP_RESTORE_RATE');
      } else if (
        status === 401 ||
        codeName === 'invalid_or_expired_code' ||
        codeName === 'otp_required'
      ) {
        this.statusEl.textContent = t('MEMBERSHIP_RESTORE_CODE_BAD');
      } else {
        this.statusEl.textContent = t('MEMBERSHIP_ERROR_GENERIC');
      }
    } finally {
      this._busy = false;
      this.sendCodeBtn.disabled = false;
      this.restoreBtn.disabled = false;
    }
  }

  _applyView() {
    const view = this._view;
    const active = view === 'active';
    const subscribe = view === 'subscribe';
    const restore = view === 'restore';

    this.activeSection.hidden = !active;
    this.subscribeSection.hidden = !subscribe;
    this.restoreSection.hidden = !restore;

    this.buyBtn.hidden = !subscribe;
    this.manageBtn.hidden = !active;
    this.restoreLinkBtn.hidden = !subscribe;

    this.root.classList.toggle('yin-membership--active', active);
    this.root.classList.toggle('yin-membership--subscribe', subscribe);
    this.root.classList.toggle('yin-membership--restore', restore);
  }

  _refreshTexts() {
    const active = isMembershipActiveLocally({ storage: this._storage });
    if (this._open && this._view === 'subscribe' && active) {
      this._view = 'active';
    }

    if (this._view === 'active') {
      this.titleEl.textContent = t('MEMBERSHIP_ACTIVE_TITLE');
      this.statusEl.textContent = t('MEMBERSHIP_STATUS_YES');
      this.planEl.textContent = t('MEMBERSHIP_ACTIVE_PLAN').replaceAll(
        '{price}',
        MEMBERSHIP_PRICE_DISPLAY
      );
      this.closeBtn.textContent = t('MEMBERSHIP_ACTIVE_CLOSE');
      this.manageBtn.textContent = t('MEMBERSHIP_MANAGE_CTA');
      this.root.setAttribute('aria-label', t('MEMBERSHIP_ACTIVE_TITLE'));
    } else if (this._view === 'restore') {
      this.titleEl.textContent = t('MEMBERSHIP_RESTORE_TITLE');
      this.restoreTitle.textContent = t('MEMBERSHIP_RESTORE_TITLE');
      this.restoreHint.textContent = t('MEMBERSHIP_RESTORE_HINT');
      this.sendCodeBtn.textContent = t('MEMBERSHIP_RESTORE_SEND_CODE');
      this.restoreBtn.textContent = t('MEMBERSHIP_RESTORE_CTA');
      this.restoreBackBtn.textContent = t('MEMBERSHIP_RESTORE_BACK');
      this.emailInput.placeholder = t('MEMBERSHIP_EMAIL_PLACEHOLDER');
      this.codeInput.placeholder = t('MEMBERSHIP_RESTORE_CODE_PLACEHOLDER');
      this.root.setAttribute('aria-label', t('MEMBERSHIP_RESTORE_TITLE'));
    } else {
      this.titleEl.textContent = t('MEMBERSHIP_CARD_TITLE');
      this.blurbEl.textContent = t('MEMBERSHIP_CARD_BLURB');
      this.benefitEls[0].textContent = t('MEMBERSHIP_BENEFIT_1');
      this.benefitEls[1].textContent = t('MEMBERSHIP_BENEFIT_2');
      this.benefitEls[2].textContent = t('MEMBERSHIP_BENEFIT_3');
      this.priceEl.textContent = t('MEMBERSHIP_PRICE').replaceAll(
        '{price}',
        MEMBERSHIP_PRICE_DISPLAY
      );
      this.buyBtn.textContent = t('MEMBERSHIP_BUY_CTA');
      this.closeBtn.textContent = t('MEMBERSHIP_CLOSE');
      this.restoreLinkBtn.textContent = t('MEMBERSHIP_RESTORE_LINK');
      this.statusEl.textContent = t('MEMBERSHIP_STATUS_NO');
      this.root.setAttribute('aria-label', t('MEMBERSHIP_CARD_TITLE'));
    }

    this._applyView();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    document.getElementById('yin-membership-card-styles-v1')?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-membership-backdrop {
        position: fixed;
        inset: 0;
        z-index: 17;
        background: rgba(44, 31, 20, 0.14);
        ${GLASS_BLUR_CSS};
        opacity: 0;
        pointer-events: auto;
        transition: opacity ${FADE_MS}ms ease;
      }
      .yin-membership-backdrop.is-visible {
        opacity: 1;
      }
      .yin-membership-backdrop[hidden] {
        display: none !important;
      }
      .yin-membership {
        position: fixed;
        left: 50%;
        top: 50%;
        z-index: 18;
        width: min(380px, calc(100vw - 40px));
        max-height: min(78vh, 520px);
        overflow-y: auto;
        transform: translate(-50%, calc(-50% + 10px));
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
      .yin-membership.is-visible {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      .yin-membership--active .yin-membership__actions {
        margin-bottom: 0;
      }
      .yin-membership__title {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
      }
      .yin-membership__status,
      .yin-membership__plan,
      .yin-membership__blurb,
      .yin-membership__price,
      .yin-membership__restore-title,
      .yin-membership__restore-hint {
        margin: 0 0 8px;
        font-size: 13px;
        line-height: 1.5;
        color: #5c4330;
      }
      .yin-membership__plan {
        color: #3d2e22;
      }
      .yin-membership__benefits {
        margin: 0 0 10px;
        padding-left: 1.1em;
        font-size: 13px;
        line-height: 1.45;
        color: #3d2e22;
      }
      .yin-membership__restore-link {
        appearance: none;
        display: block;
        width: 100%;
        margin: 4px 0 0;
        padding: 0;
        border: 0;
        background: transparent;
        font-size: 12px;
        line-height: 1.45;
        color: #6b5340;
        text-align: left;
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
      }
      .yin-membership__restore-link:hover {
        color: #3d2e22;
      }
      .yin-membership__actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        flex-wrap: wrap;
        margin: 12px 0 0;
      }
      .yin-membership__email,
      .yin-membership__code {
        width: 100%;
        box-sizing: border-box;
        margin: 0 0 8px;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid rgba(80, 55, 35, 0.22);
        background: rgba(255, 252, 246, 0.72);
        font-size: 13px;
        color: #2c1f14;
      }
      .yin-membership__restore-row {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        flex-wrap: wrap;
        margin: 0 0 8px;
      }
      .yin-membership__btn {
        appearance: none;
        border: 1px solid rgba(80, 55, 35, 0.28);
        border-radius: 999px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        color: #2c1f14;
        background: rgba(255, 252, 246, 0.85);
      }
      .yin-membership__btn--primary {
        background: rgba(214, 178, 110, 0.92);
        border-color: rgba(140, 100, 40, 0.35);
      }
      .yin-membership__btn--ghost {
        background: transparent;
      }
      .yin-membership__btn:disabled {
        opacity: 0.55;
        cursor: default;
      }
    `;
    document.head.appendChild(style);
  }
}
