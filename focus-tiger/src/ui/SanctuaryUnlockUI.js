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
  readSanctuaryEntitlement
} from '../core/sanctuaryEntitlementGate.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'yin-sanctuary-card-styles-v1';
const FADE_MS = 220;

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

    this.restoreBtn = document.createElement('button');
    this.restoreBtn.type = 'button';
    this.restoreBtn.className =
      'yin-sanctuary__btn yin-sanctuary__btn--ghost';
    this.restoreBtn.dataset.testid = 'yin-sanctuary-restore';
    this.restoreBtn.addEventListener('click', () => {
      void this._restore();
    });

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
      this.actions,
      this.restoreTitle,
      this.restoreHint,
      this.emailInput,
      this.restoreBtn
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

  async _startCheckout() {
    if (this._busy) return;
    this._busy = true;
    this.buyBtn.disabled = true;
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
        window.location.assign(url);
        return;
      }
      this.statusEl.textContent = t('SANCTUARY_ERROR_GENERIC');
    } catch {
      this.statusEl.textContent = t('SANCTUARY_ERROR_GENERIC');
    } finally {
      this._busy = false;
      this.buyBtn.disabled = false;
      this._refreshTexts();
    }
  }

  async _restore() {
    if (this._busy) return;
    this._busy = true;
    this.restoreBtn.disabled = true;
    try {
      const email = this.emailInput.value.trim();
      const res = await postCloudJson('/api/verify-sanctuary', {
        body: JSON.stringify({ email })
      });
      const unlocked =
        res &&
        typeof res === 'object' &&
        /** @type {{ unlocked?: unknown }} */ (res).unlocked === true;
      if (unlocked) {
        markSanctuaryFromPayment(this._storage);
        this.statusEl.textContent = t('SANCTUARY_STATUS_YES');
      } else {
        this.statusEl.textContent = t('SANCTUARY_RESTORE_MISS');
      }
    } catch {
      this.statusEl.textContent = t('SANCTUARY_ERROR_GENERIC');
    } finally {
      this._busy = false;
      this.restoreBtn.disabled = false;
      this._refreshTexts();
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
    this.restoreBtn.textContent = t('SANCTUARY_RESTORE_CTA');
    this.emailInput.placeholder = t('SANCTUARY_EMAIL_PLACEHOLDER');
    const unlocked = isSanctuaryUnlocked({ storage: this._storage });
    const via = readSanctuaryEntitlement(this._storage).unlockedVia;
    this.statusEl.textContent = unlocked
      ? via === 'preview'
        ? t('SANCTUARY_STATUS_PREVIEW')
        : t('SANCTUARY_STATUS_YES')
      : t('SANCTUARY_STATUS_NO');
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
      .yin-sanctuary__email {
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
