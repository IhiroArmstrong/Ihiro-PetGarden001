/**
 * Support Yin · top-right entry + dual-card modal (Sanctuary + Buy a Tea).
 * Menu tip/sanctuary rows stay; this is a friendlier unified entry.
 * Checkout reuses TipJarUI / SanctuaryUnlockUI startCheckout().
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { TIP_JAR_PRICE_USD } from '../core/tipJarGate.js';
import { SANCTUARY_LIFETIME_PRICE_USD } from './SanctuaryUnlockUI.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'yin-support-modal-styles-v1';
const FADE_MS = 220;

const ICON_SRC = '/ui/support/support-yin-icon.png';
const SANCTUARY_PREVIEW_SRC = '/ui/support/sanctuary-preview.png';
const TEA_PREVIEW_SRC = '/ui/support/tea-drinking-preview.png';

/**
 * @param {string} template
 * @param {string} price
 */
export function formatSupportPrice(template, price) {
  return String(template || '').replaceAll('{price}', String(price));
}

export class SupportYinModalUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => void | Promise<void>} [handlers.onUnlockSanctuary]
   * @param {() => void | Promise<void>} [handlers.onBuyTea]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._busy = false;

    this.fab = document.createElement('button');
    this.fab.type = 'button';
    this.fab.id = 'yin-support-fab';
    this.fab.className = 'yin-support-fab';
    this.fab.dataset.testid = 'yin-support-fab';
    this.fab.setAttribute('aria-haspopup', 'dialog');
    this.fab.setAttribute('aria-controls', 'yin-support-modal');

    this.fabImg = document.createElement('img');
    this.fabImg.className = 'yin-support-fab__img';
    this.fabImg.src = ICON_SRC;
    this.fabImg.alt = '';
    this.fabImg.decoding = 'async';
    this.fabImg.draggable = false;

    this.fabLabel = document.createElement('span');
    this.fabLabel.className = 'yin-support-fab__label';
    this.fabLabel.dataset.testid = 'yin-support-fab-label';

    this.fab.append(this.fabImg, this.fabLabel);
    this.fab.addEventListener('click', () => {
      if (this._open) this.close();
      else this.open();
    });

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'yin-support-backdrop';
    this.backdrop.className = 'yin-support-backdrop';
    this.backdrop.hidden = true;
    this.backdrop.addEventListener('click', () => this.close());

    this.root = document.createElement('div');
    this.root.id = 'yin-support-modal';
    this.root.className = 'yin-support-modal';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'yin-support-modal-title');

    this.titleEl = document.createElement('h2');
    this.titleEl.id = 'yin-support-modal-title';
    this.titleEl.className = 'yin-support-modal__title';

    this.subtitleEl = document.createElement('p');
    this.subtitleEl.className = 'yin-support-modal__subtitle';

    this.grid = document.createElement('div');
    this.grid.className = 'yin-support-modal__grid';

    const sanctuary = this._buildCard({
      testId: 'yin-support-sanctuary-card',
      imgSrc: SANCTUARY_PREVIEW_SRC,
      imgAltKey: 'SUPPORT_SANCTUARY_IMG_ALT',
      titleKey: 'SUPPORT_SANCTUARY_TITLE',
      blurbKey: 'SUPPORT_SANCTUARY_BLURB',
      benefitKeys: [
        'SANCTUARY_BENEFIT_1',
        'SANCTUARY_BENEFIT_2',
        'SANCTUARY_BENEFIT_3'
      ],
      priceKey: 'SUPPORT_SANCTUARY_PRICE',
      priceValue: SANCTUARY_LIFETIME_PRICE_USD,
      ctaKey: 'SUPPORT_SANCTUARY_CTA',
      ctaTestId: 'yin-support-sanctuary-cta',
      onCta: () => {
        void this._runCheckout('sanctuary');
      }
    });
    this.sanctuaryCard = sanctuary.card;
    this.sanctuaryTitle = sanctuary.titleEl;
    this.sanctuaryBlurb = sanctuary.blurbEl;
    this.sanctuaryBenefits = sanctuary.benefitEls;
    this.sanctuaryPrice = sanctuary.priceEl;
    this.sanctuaryCta = sanctuary.ctaBtn;
    this.sanctuaryImg = sanctuary.imgEl;

    const tea = this._buildCard({
      testId: 'yin-support-tea-card',
      imgSrc: TEA_PREVIEW_SRC,
      imgAltKey: 'SUPPORT_TEA_IMG_ALT',
      titleKey: 'SUPPORT_TEA_TITLE',
      blurbKey: 'SUPPORT_TEA_BLURB',
      benefitKeys: [],
      priceKey: 'SUPPORT_TEA_PRICE',
      priceValue: TIP_JAR_PRICE_USD,
      ctaKey: 'SUPPORT_TEA_CTA',
      ctaTestId: 'yin-support-tea-cta',
      onCta: () => {
        void this._runCheckout('tea');
      }
    });
    this.teaCard = tea.card;
    this.teaTitle = tea.titleEl;
    this.teaBlurb = tea.blurbEl;
    this.teaPrice = tea.priceEl;
    this.teaCta = tea.ctaBtn;
    this.teaImg = tea.imgEl;

    this.grid.append(this.sanctuaryCard, this.teaCard);

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'yin-support-modal__close';
    this.closeBtn.dataset.testid = 'yin-support-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.root.append(
      this.titleEl,
      this.subtitleEl,
      this.grid,
      this.closeBtn
    );

    mountRoot.append(this.fab, this.backdrop, this.root);

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
   * @param {object} opts
   */
  _buildCard(opts) {
    const card = document.createElement('article');
    card.className = 'yin-support-card';
    card.dataset.testid = opts.testId;

    const imgEl = document.createElement('img');
    imgEl.className = 'yin-support-card__img';
    imgEl.src = opts.imgSrc;
    imgEl.alt = '';
    imgEl.decoding = 'async';
    imgEl.draggable = false;
    imgEl.dataset.altKey = opts.imgAltKey;

    const titleEl = document.createElement('h3');
    titleEl.className = 'yin-support-card__title';
    titleEl.dataset.key = opts.titleKey;

    const blurbEl = document.createElement('p');
    blurbEl.className = 'yin-support-card__blurb';
    blurbEl.dataset.key = opts.blurbKey;

    const benefits = document.createElement('ul');
    benefits.className = 'yin-support-card__benefits';
    const benefitEls = opts.benefitKeys.map((key) => {
      const li = document.createElement('li');
      li.dataset.key = key;
      benefits.appendChild(li);
      return li;
    });
    if (benefitEls.length === 0) benefits.hidden = true;

    const priceEl = document.createElement('p');
    priceEl.className = 'yin-support-card__price';
    priceEl.dataset.priceKey = opts.priceKey;
    priceEl.dataset.priceValue = opts.priceValue;

    const ctaBtn = document.createElement('button');
    ctaBtn.type = 'button';
    ctaBtn.className = 'yin-support-card__cta';
    ctaBtn.dataset.testid = opts.ctaTestId;
    ctaBtn.dataset.key = opts.ctaKey;
    ctaBtn.addEventListener('click', opts.onCta);

    card.append(imgEl, titleEl, blurbEl, benefits, priceEl, ctaBtn);
    return { card, imgEl, titleEl, blurbEl, benefitEls, priceEl, ctaBtn };
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.backdrop.hidden = false;
    this.root.hidden = false;
    this.backdrop.getBoundingClientRect();
    this.root.getBoundingClientRect();
    this.backdrop.classList.add('is-visible');
    this.root.classList.add('is-visible');
    this.fab.setAttribute('aria-expanded', 'true');
    this._refreshTexts();
    this.closeBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.backdrop.classList.remove('is-visible');
    this.root.classList.remove('is-visible');
    this.fab.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => {
      if (!this._open) {
        this.backdrop.hidden = true;
        this.root.hidden = true;
      }
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  /**
   * Idle chrome can hide the FAB during Focusing / overlays.
   * @param {boolean} visible
   */
  setFabVisible(visible) {
    this.fab.hidden = !visible;
    if (!visible && this._open) this.close();
  }

  destroy() {
    this._unsubLocale?.();
    document.removeEventListener('keydown', this._onKeyDown);
    this.fab.remove();
    this.backdrop.remove();
    this.root.remove();
  }

  /**
   * @param {'sanctuary' | 'tea'} kind
   */
  async _runCheckout(kind) {
    if (this._busy) return;
    this._busy = true;
    this.sanctuaryCta.disabled = true;
    this.teaCta.disabled = true;
    try {
      this.close();
      if (kind === 'sanctuary') {
        await this.handlers.onUnlockSanctuary?.();
      } else {
        await this.handlers.onBuyTea?.();
      }
    } finally {
      this._busy = false;
      this.sanctuaryCta.disabled = false;
      this.teaCta.disabled = false;
    }
  }

  _refreshTexts() {
    this.fabLabel.textContent = t('SUPPORT_FAB_LABEL');
    this.fab.setAttribute('aria-label', t('SUPPORT_FAB_ARIA'));
    this.fabImg.alt = t('SUPPORT_FAB_ARIA');

    this.titleEl.textContent = t('SUPPORT_MODAL_TITLE');
    this.subtitleEl.textContent = t('SUPPORT_MODAL_SUBTITLE');
    this.closeBtn.textContent = t('SUPPORT_MODAL_CLOSE');

    this.sanctuaryImg.alt = t('SUPPORT_SANCTUARY_IMG_ALT');
    this.sanctuaryTitle.textContent = t('SUPPORT_SANCTUARY_TITLE');
    this.sanctuaryBlurb.textContent = t('SUPPORT_SANCTUARY_BLURB');
    this.sanctuaryBenefits.forEach((el) => {
      el.textContent = t(el.dataset.key);
    });
    this.sanctuaryPrice.textContent = formatSupportPrice(
      t('SUPPORT_SANCTUARY_PRICE'),
      SANCTUARY_LIFETIME_PRICE_USD
    );
    this.sanctuaryCta.textContent = t('SUPPORT_SANCTUARY_CTA');

    this.teaImg.alt = t('SUPPORT_TEA_IMG_ALT');
    this.teaTitle.textContent = t('SUPPORT_TEA_TITLE');
    this.teaBlurb.textContent = t('SUPPORT_TEA_BLURB');
    this.teaPrice.textContent = formatSupportPrice(
      t('SUPPORT_TEA_PRICE'),
      TIP_JAR_PRICE_USD
    );
    this.teaCta.textContent = t('SUPPORT_TEA_CTA');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-support-fab {
        position: fixed;
        top: 14px;
        right: 92px;
        z-index: 24;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        max-width: min(200px, calc(100vw - 120px));
        padding: 6px 12px 6px 6px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        background: rgba(255, 252, 245, 0.72);
        ${GLASS_BLUR_CSS}
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 8px 22px rgba(90, 62, 40, 0.12);
        color: rgba(72, 54, 38, 0.92);
        cursor: pointer;
        font: inherit;
        pointer-events: auto;
      }
      .yin-support-fab:hover {
        background: rgba(255, 252, 245, 0.9);
      }
      .yin-support-fab:active {
        transform: scale(0.97);
      }
      .yin-support-fab__img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        flex: 0 0 auto;
        background: rgba(255, 252, 245, 0.9);
      }
      .yin-support-fab__label {
        font-size: 13px;
        font-weight: 650;
        letter-spacing: 0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .yin-support-backdrop {
        position: fixed;
        inset: 0;
        z-index: 25;
        background: rgba(48, 34, 22, 0.28);
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease;
        pointer-events: auto;
      }
      .yin-support-backdrop.is-visible {
        opacity: 1;
      }
      .yin-support-modal {
        position: fixed;
        z-index: 26;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -46%) scale(0.98);
        width: min(720px, calc(100vw - 28px));
        max-height: min(86vh, 720px);
        overflow: auto;
        padding: 18px 18px 14px;
        border-radius: ${GLASS_RADIUS};
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        ${GLASS_BLUR_CSS}
        box-shadow: ${GLASS_SHADOW};
        color: #3d2e22;
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
      }
      .yin-support-modal.is-visible {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      .yin-support-modal__title {
        margin: 0 0 4px;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.01em;
      }
      .yin-support-modal__subtitle {
        margin: 0 0 14px;
        font-size: 13px;
        line-height: 1.45;
        color: #5c4330;
      }
      .yin-support-modal__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .yin-support-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border-radius: 16px;
        border: 1px solid rgba(139, 115, 85, 0.2);
        background: ${GLASS_FILL};
      }
      .yin-support-card__img {
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: 12px;
        background: #f4efe6;
      }
      .yin-support-card__title {
        margin: 2px 0 0;
        font-size: 15px;
        font-weight: 700;
      }
      .yin-support-card__blurb {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.45;
        color: #5c4330;
        flex: 1 1 auto;
      }
      .yin-support-card__benefits {
        margin: 0;
        padding-left: 1.1em;
        font-size: 12px;
        line-height: 1.4;
        color: #5c4330;
      }
      .yin-support-card__price {
        margin: 2px 0 0;
        font-size: 13px;
        font-weight: 650;
        color: #4a3426;
      }
      .yin-support-card__cta,
      .yin-support-modal__close {
        appearance: none;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        font: inherit;
        cursor: pointer;
      }
      .yin-support-card__cta {
        margin-top: 4px;
        padding: 10px 14px;
        background: rgba(212, 165, 116, 0.42);
        color: #3d2e22;
        font-weight: 650;
      }
      .yin-support-card__cta:hover {
        background: rgba(212, 165, 116, 0.58);
      }
      .yin-support-card__cta:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .yin-support-modal__close {
        display: block;
        width: 100%;
        margin-top: 12px;
        padding: 9px 12px;
        background: rgba(255, 252, 245, 0.45);
        color: #5c4330;
      }
      @media (max-width: 640px) {
        .yin-support-fab {
          top: 10px;
          right: 58px;
          padding: 5px 10px 5px 5px;
          gap: 6px;
        }
        .yin-support-fab__img {
          width: 30px;
          height: 30px;
        }
        .yin-support-fab__label {
          font-size: 12px;
        }
        .yin-support-modal__grid {
          grid-template-columns: 1fr;
        }
        .yin-support-modal {
          width: min(420px, calc(100vw - 20px));
          max-height: min(90vh, 780px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
