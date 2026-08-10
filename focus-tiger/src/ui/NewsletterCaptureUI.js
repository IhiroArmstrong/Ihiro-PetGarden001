/**
 * Stay in touch · optional email capture card (Idle ⋯ / drawer).
 * Not an account — submit goes to NewsletterProvider; local stores flags only.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  hasSubmittedNewsletter,
  isPlausibleNewsletterEmail,
  markNewsletterSubmitted
} from '../core/newsletter/newsletterCaptureGate.js';
import { getNewsletterProvider } from '../core/newsletter/newsletterProvider.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'newsletter-capture-card-styles-v1';
const FADE_MS = 220;

export class NewsletterCaptureUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onSubmitted]
   * @param {Storage | null} [handlers.storage]
   * @param {import('../core/newsletter/newsletterProvider.js').NewsletterProvider | null} [handlers.provider]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._open = false;
    this._busy = false;
    this._success = false;

    this.root = document.createElement('div');
    this.root.id = 'newsletter-capture-card';
    this.root.className = 'newsletter-capture';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'newsletter-capture-title');
    this.root.dataset.testid = 'newsletter-capture-card';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'newsletter-capture-title';
    this.titleEl.className = 'newsletter-capture__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'newsletter-capture__blurb';

    this.optionalEl = document.createElement('p');
    this.optionalEl.className = 'newsletter-capture__optional';

    this.formEl = document.createElement('div');
    this.formEl.className = 'newsletter-capture__form';

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.inputMode = 'email';
    this.emailInput.className = 'newsletter-capture__email';
    this.emailInput.dataset.testid = 'newsletter-capture-email';

    this.submitBtn = document.createElement('button');
    this.submitBtn.type = 'button';
    this.submitBtn.className =
      'newsletter-capture__btn newsletter-capture__btn--primary';
    this.submitBtn.dataset.testid = 'newsletter-capture-submit';
    this.submitBtn.addEventListener('click', () => void this._onSubmit());

    this.formEl.append(this.emailInput, this.submitBtn);

    this.feedbackEl = document.createElement('p');
    this.feedbackEl.className = 'newsletter-capture__feedback';
    this.feedbackEl.dataset.testid = 'newsletter-capture-feedback';
    this.feedbackEl.hidden = true;

    this.actions = document.createElement('div');
    this.actions.className = 'newsletter-capture__actions';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'newsletter-capture__btn newsletter-capture__btn--ghost';
    this.closeBtn.dataset.testid = 'newsletter-capture-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions.append(this.closeBtn);
    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.optionalEl,
      this.formEl,
      this.feedbackEl,
      this.actions
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
      if (event.key === 'Enter' && event.target === this.emailInput) {
        event.preventDefault();
        void this._onSubmit();
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
    this._refresh();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (hasSubmittedNewsletter({ storage: this._storage })) {
      // Menu should already be non-interactive; defensive no-op.
      return;
    }
    if (this._open) return;
    this._open = true;
    this._success = false;
    this._busy = false;
    this.emailInput.value = '';
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refresh();
    this.emailInput.focus({ preventScroll: true });
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

  _provider() {
    return this.handlers.provider ?? getNewsletterProvider();
  }

  async _onSubmit() {
    if (this._busy || this._success) return;
    const email = String(this.emailInput.value || '').trim();
    if (!isPlausibleNewsletterEmail(email)) {
      this._setFeedback(t('NEWSLETTER_EMAIL_INVALID'), 'error');
      return;
    }
    const provider = this._provider();
    if (!provider) {
      this._setFeedback(t('NEWSLETTER_ERROR_GENERIC'), 'error');
      return;
    }

    this._busy = true;
    this.submitBtn.disabled = true;
    this.emailInput.disabled = true;
    this._setFeedback(t('NEWSLETTER_SUBMIT_PENDING'), 'pending');

    try {
      const result = await provider.subscribe(email);
      if (!result?.ok) {
        this._setFeedback(t('NEWSLETTER_ERROR_GENERIC'), 'error');
        this._busy = false;
        this.submitBtn.disabled = false;
        this.emailInput.disabled = false;
        return;
      }
      markNewsletterSubmitted(this._storage);
      this._success = true;
      this._setFeedback(t('NEWSLETTER_FEEDBACK_OK'), 'ok');
      this.formEl.hidden = true;
      this.handlers.onSubmitted?.();
    } catch {
      this._setFeedback(t('NEWSLETTER_ERROR_GENERIC'), 'error');
      this._busy = false;
      this.submitBtn.disabled = false;
      this.emailInput.disabled = false;
    }
  }

  /**
   * @param {string} text
   * @param {'ok' | 'error' | 'pending'} kind
   */
  _setFeedback(text, kind) {
    this.feedbackEl.hidden = !text;
    this.feedbackEl.textContent = text || '';
    this.feedbackEl.dataset.kind = kind;
  }

  _refresh() {
    this.titleEl.textContent = t('NEWSLETTER_CARD_TITLE');
    this.blurbEl.textContent = t('NEWSLETTER_CARD_BLURB');
    this.optionalEl.textContent = t('NEWSLETTER_CARD_OPTIONAL');
    this.emailInput.placeholder = t('NEWSLETTER_EMAIL_PLACEHOLDER');
    this.submitBtn.textContent = t('NEWSLETTER_SUBMIT_CTA');
    this.closeBtn.textContent = t('NEWSLETTER_CLOSE');
    if (this._success) {
      this.formEl.hidden = true;
      this._setFeedback(t('NEWSLETTER_FEEDBACK_OK'), 'ok');
    } else {
      this.formEl.hidden = false;
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .newsletter-capture {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(360px, calc(100vw - 40px));
        max-height: min(70vh, 520px);
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
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: none;
      }
      .newsletter-capture.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .newsletter-capture__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .newsletter-capture__blurb {
        margin: 0 0 8px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
      }
      .newsletter-capture__optional {
        margin: 0 0 12px;
        font-size: 0.8rem;
        line-height: 1.4;
        opacity: 0.75;
      }
      .newsletter-capture__form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0 0 12px;
      }
      .newsletter-capture__email {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        border-radius: 12px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font: inherit;
      }
      .newsletter-capture__feedback {
        margin: 0 0 12px;
        font-size: 0.86rem;
        line-height: 1.4;
      }
      .newsletter-capture__feedback[data-kind='ok'] {
        color: #2f5d3a;
      }
      .newsletter-capture__feedback[data-kind='error'] {
        color: #8a3b2c;
      }
      .newsletter-capture__feedback[data-kind='pending'] {
        opacity: 0.8;
      }
      .newsletter-capture__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .newsletter-capture__btn {
        appearance: none;
        border: none;
        cursor: pointer;
        font: inherit;
        padding: 8px 14px;
        border-radius: 999px;
      }
      .newsletter-capture__btn:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .newsletter-capture__btn--primary {
        background: #2c1f14;
        color: #f7f1e6;
      }
      .newsletter-capture__btn--ghost {
        background: transparent;
        color: inherit;
        opacity: 0.85;
      }
    `;
    document.head.appendChild(style);
  }
}
