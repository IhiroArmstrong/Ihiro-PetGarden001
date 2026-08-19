/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Support Yin · top-right entry + cards (Sanctuary + Membership + Buy a Tea).
 * Pay rows were removed from Idle ⋯ / drawer; this FAB is the unified entry.
 * Checkout reuses TipJarUI / SanctuaryUnlockUI / MembershipUnlockUI cards
 * (Support CTA opens the card; user confirms Buy/Unlock/Subscribe there).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { isDesktopShellRuntime } from '../core/desktopShell.js';
import { TIP_JAR_PRICE_USD } from '../core/tipJarGate.js';
import { MEMBERSHIP_PRICE_DISPLAY } from '../core/membershipCheckout.js';
import { SANCTUARY_LIFETIME_PRICE_USD } from './SanctuaryUnlockUI.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import { getMonetizationFunnelStore } from '../core/monetizationIntentFunnel.js';

const STYLE_ID = 'yin-support-modal-styles-v5';
const FADE_MS = 220;

const ICON_SRC = '/ui/support/support-yin-icon.png';
const SANCTUARY_PREVIEW_SRC = '/ui/support/sanctuary-preview.png';
/** Closed-eye meditation Yin (ingested from root membership icon). */
const MEMBERSHIP_PREVIEW_SRC = '/ui/support/membership-meditation-preview.png';
const TEA_PREVIEW_SRC = '/ui/support/tea-drinking-preview.png';
/** Shared warm paper behind card art (matches tea card field). */
const CARD_IMG_PAPER = '#e8dfd2';

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
   * @param {() => void | Promise<void>} [handlers.onJoinMembership]
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
      ctaVariant: 'beige',
      badgeKey: 'SUPPORT_SANCTUARY_BADGE',
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
    this.sanctuaryBadge = sanctuary.badgeEl;

    const membership = this._buildCard({
      testId: 'yin-support-membership-card',
      imgSrc: MEMBERSHIP_PREVIEW_SRC,
      imgAltKey: 'SUPPORT_MEMBERSHIP_IMG_ALT',
      titleKey: 'SUPPORT_MEMBERSHIP_TITLE',
      blurbKey: 'SUPPORT_MEMBERSHIP_BLURB',
      benefitKeys: [
        'MEMBERSHIP_BENEFIT_1',
        'MEMBERSHIP_BENEFIT_2',
        'MEMBERSHIP_BENEFIT_3'
      ],
      priceKey: 'SUPPORT_MEMBERSHIP_PRICE',
      priceValue: MEMBERSHIP_PRICE_DISPLAY,
      ctaKey: 'SUPPORT_MEMBERSHIP_CTA',
      ctaTestId: 'yin-support-membership-cta',
      ctaVariant: 'beige',
      onCta: () => {
        void this._runCheckout('membership');
      }
    });
    this.membershipCard = membership.card;
    this.membershipTitle = membership.titleEl;
    this.membershipBlurb = membership.blurbEl;
    this.membershipBenefits = membership.benefitEls;
    this.membershipPrice = membership.priceEl;
    this.membershipCta = membership.ctaBtn;
    this.membershipImg = membership.imgEl;

    const tea = this._buildCard({
      testId: 'yin-support-tea-card',
      imgSrc: TEA_PREVIEW_SRC,
      imgAltKey: 'SUPPORT_TEA_IMG_ALT',
      titleKey: 'SUPPORT_TEA_TITLE',
      blurbKey: 'SUPPORT_TEA_BLURB',
      benefitKeys: [
        'SUPPORT_TEA_BENEFIT_1',
        'SUPPORT_TEA_BENEFIT_2',
        'SUPPORT_TEA_BENEFIT_3'
      ],
      priceKey: 'SUPPORT_TEA_PRICE',
      priceValue: TIP_JAR_PRICE_USD,
      ctaKey: 'SUPPORT_TEA_CTA',
      ctaTestId: 'yin-support-tea-cta',
      ctaVariant: 'beige',
      onCta: () => {
        void this._runCheckout('tea');
      }
    });
    this.teaCard = tea.card;
    this.teaTitle = tea.titleEl;
    this.teaBlurb = tea.blurbEl;
    this.teaBenefits = tea.benefitEls;
    this.teaPrice = tea.priceEl;
    this.teaCta = tea.ctaBtn;
    this.teaImg = tea.imgEl;

    this.grid.append(this.sanctuaryCard, this.membershipCard, this.teaCard);

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'yin-support-modal__close';
    this.closeBtn.dataset.testid = 'yin-support-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.desktopRamNote = document.createElement('p');
    this.desktopRamNote.id = 'yin-support-desktop-ram';
    this.desktopRamNote.className = 'yin-support-modal__desktop-ram';
    this.desktopRamNote.dataset.testid = 'yin-support-desktop-ram';
    this.desktopRamNote.hidden = true;

    this.root.append(
      this.titleEl,
      this.subtitleEl,
      this.grid,
      this.desktopRamNote,
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
   * @param {'beige' | 'cushion' | 'ghost' | 'primary'} [opts.ctaVariant]
   * @param {string} [opts.badgeKey]
   */
  _buildCard(opts) {
    const card = document.createElement('article');
    card.className = 'yin-support-card';
    card.dataset.testid = opts.testId;

    /** @type {HTMLElement | null} */
    let badgeEl = null;
    if (opts.badgeKey) {
      badgeEl = document.createElement('span');
      badgeEl.className = 'yin-support-card__badge';
      badgeEl.dataset.testid = 'yin-support-sanctuary-badge';
      badgeEl.dataset.key = opts.badgeKey;
      card.appendChild(badgeEl);
    }

    const artEl = document.createElement('div');
    artEl.className = 'yin-support-card__art';

    const imgEl = document.createElement('img');
    imgEl.className = 'yin-support-card__img';
    imgEl.src = opts.imgSrc;
    imgEl.alt = '';
    imgEl.decoding = 'async';
    imgEl.draggable = false;
    imgEl.dataset.altKey = opts.imgAltKey;
    artEl.appendChild(imgEl);

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
    const variant =
      opts.ctaVariant === 'beige' ||
      opts.ctaVariant === 'cushion' ||
      opts.ctaVariant === 'ghost'
        ? opts.ctaVariant
        : 'primary';
    ctaBtn.className = `yin-support-card__cta yin-support-card__cta--${variant}`;
    ctaBtn.dataset.testid = opts.ctaTestId;
    ctaBtn.dataset.key = opts.ctaKey;
    ctaBtn.addEventListener('click', opts.onCta);

    card.append(artEl, titleEl, blurbEl, benefits, priceEl, ctaBtn);
    return { card, imgEl, titleEl, blurbEl, benefitEls, priceEl, ctaBtn, badgeEl };
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
    getMonetizationFunnelStore().supportOpen('fab');
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
   * @param {'sanctuary' | 'membership' | 'tea'} kind
   */
  async _runCheckout(kind) {
    if (this._busy) return;
    this._busy = true;
    this.sanctuaryCta.disabled = true;
    this.membershipCta.disabled = true;
    this.teaCta.disabled = true;
    try {
      getMonetizationFunnelStore().supportCta(kind, 'support-modal');
      this.close();
      if (kind === 'sanctuary') {
        await this.handlers.onUnlockSanctuary?.();
      } else if (kind === 'membership') {
        await this.handlers.onJoinMembership?.();
      } else {
        await this.handlers.onBuyTea?.();
      }
    } finally {
      this._busy = false;
      this.sanctuaryCta.disabled = false;
      this.membershipCta.disabled = false;
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
    if (this.sanctuaryBadge) {
      this.sanctuaryBadge.textContent = t(this.sanctuaryBadge.dataset.key);
    }
    this.sanctuaryBenefits.forEach((el) => {
      el.textContent = t(el.dataset.key);
    });
    this.sanctuaryPrice.textContent = formatSupportPrice(
      t('SUPPORT_SANCTUARY_PRICE'),
      SANCTUARY_LIFETIME_PRICE_USD
    );
    this.sanctuaryCta.textContent = t('SUPPORT_SANCTUARY_CTA');

    this.membershipImg.alt = t('SUPPORT_MEMBERSHIP_IMG_ALT');
    this.membershipTitle.textContent = t('SUPPORT_MEMBERSHIP_TITLE');
    this.membershipBlurb.textContent = t('SUPPORT_MEMBERSHIP_BLURB');
    this.membershipBenefits.forEach((el) => {
      el.textContent = t(el.dataset.key);
    });
    this.membershipPrice.textContent = formatSupportPrice(
      t('SUPPORT_MEMBERSHIP_PRICE'),
      MEMBERSHIP_PRICE_DISPLAY
    );
    this.membershipCta.textContent = t('SUPPORT_MEMBERSHIP_CTA');

    this.teaImg.alt = t('SUPPORT_TEA_IMG_ALT');
    this.teaTitle.textContent = t('SUPPORT_TEA_TITLE');
    this.teaBlurb.textContent = t('SUPPORT_TEA_BLURB');
    this.teaBenefits.forEach((el) => {
      el.textContent = t(el.dataset.key);
    });
    this.teaPrice.textContent = formatSupportPrice(
      t('SUPPORT_TEA_PRICE'),
      TIP_JAR_PRICE_USD
    );
    this.teaCta.textContent = t('SUPPORT_TEA_CTA');

    const showDesktopRam = isDesktopShellRuntime();
    this.desktopRamNote.hidden = !showDesktopRam;
    this.desktopRamNote.textContent = t('SUPPORT_DESKTOP_RAM_NOTE');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-support-fab {
        position: fixed;
        top: 14px;
        /* Mute is 66px @ right:14 → leave ~12px gap */
        right: 92px;
        z-index: 24;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        max-width: min(240px, calc(100vw - 130px));
        /* Align chrome with ambient mute: soft glass, stronger blur */
        padding: 8px 14px 8px 8px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.18);
        background: rgba(255, 252, 245, 0.55);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.55) inset,
          0 3px 12px rgba(44, 31, 20, 0.07);
        color: rgba(92, 72, 52, 0.78);
        cursor: pointer;
        font: inherit;
        pointer-events: auto;
        transition: transform 120ms ease, box-shadow 160ms ease, color 160ms ease, background 180ms ease, opacity 180ms ease;
      }
      .yin-support-fab:hover {
        color: rgba(72, 54, 38, 0.92);
        background: rgba(255, 252, 245, 0.72);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 6px 16px rgba(44, 31, 20, 0.14);
      }
      .yin-support-fab:active {
        transform: scale(0.96);
      }
      .yin-support-fab__img {
        /* ~+50% vs prior 36px; soft ghost circle like mute glyph weight */
        width: 54px;
        height: 54px;
        border-radius: 50%;
        object-fit: cover;
        flex: 0 0 auto;
        opacity: 0.88;
        background: rgba(255, 252, 245, 0.45);
      }
      .yin-support-fab__label {
        font-size: 13px;
        font-weight: 600;
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
        padding: 18px 18px 10px;
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
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
      }
      .yin-support-modal__desktop-ram {
        margin: 12px 0 0;
        font-size: 12px;
        line-height: 1.45;
        color: #5c4330;
      }
      .yin-support-modal__desktop-ram[hidden] {
        display: none;
      }
      .yin-support-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border-radius: 16px;
        border: 1px solid rgba(139, 115, 85, 0.2);
        background: ${GLASS_FILL};
      }
      .yin-support-card__badge {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.82);
        color: rgba(92, 72, 52, 0.78);
        font-size: 10px;
        font-weight: 650;
        letter-spacing: 0.04em;
        text-transform: none;
        pointer-events: none;
      }
      .yin-support-card__art {
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 12px;
        overflow: hidden;
        /* All three preview PNGs bake this paper; CSS remains a fallback. */
        background: ${CARD_IMG_PAPER};
      }
      .yin-support-card__img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        background: transparent;
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
      .yin-support-card__cta {
        appearance: none;
        margin-top: 4px;
        padding: 10px 14px;
        border-radius: 999px;
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }
      /* Unused fallback (Sit CTA family). Support modal CTAs all use beige. */
      .yin-support-card__cta--cushion,
      .yin-support-card__cta--primary {
        border: 1px solid rgba(255, 230, 210, 0.38);
        background: linear-gradient(
          180deg,
          var(--color-cta-top, #c47a4e) 0%,
          var(--color-accent, #b5623a) 48%,
          var(--color-cta-bottom, #8f4a2c) 100%
        );
        color: #fff;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.32) inset,
          0 2px 0 var(--color-cta-edge, #7a3f24),
          0 3px 8px rgba(44, 31, 20, 0.14);
      }
      .yin-support-card__cta--cushion:hover,
      .yin-support-card__cta--primary:hover {
        filter: brightness(1.04);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.36) inset,
          0 2px 0 var(--color-cta-edge, #7a3f24),
          0 4px 10px rgba(44, 31, 20, 0.16);
      }
      /* All three cards · beige 3D (Unlock Sanctuary / Join Membership / Support Us) */
      .yin-support-card__cta--beige,
      .yin-support-card__cta--ghost {
        border: 1px solid rgba(139, 115, 85, 0.36);
        color: var(--color-ink, #2c1f14);
        background: linear-gradient(
          180deg,
          rgba(255, 252, 245, 0.92) 0%,
          #ede0c4 100%
        );
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 2px 0 rgba(165, 130, 85, 0.22),
          0 3px 8px rgba(44, 31, 20, 0.08);
      }
      .yin-support-card__cta--beige:hover,
      .yin-support-card__cta--ghost:hover {
        background: linear-gradient(180deg, #fffcf4 0%, #ede0c4 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.92) inset,
          0 2px 0 rgba(165, 130, 85, 0.28),
          0 4px 10px rgba(44, 31, 20, 0.12);
      }
      .yin-support-card__cta--beige:active,
      .yin-support-card__cta--ghost:active,
      .yin-support-card__cta--cushion:active,
      .yin-support-card__cta--primary:active {
        transform: translateY(1px) scale(0.98);
      }
      .yin-support-card__cta:disabled {
        opacity: 0.55;
        cursor: default;
        filter: none;
      }
      .yin-support-modal__close {
        appearance: none;
        display: block;
        width: auto;
        margin: 10px auto 2px;
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: rgba(92, 72, 52, 0.72);
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        text-decoration: underline;
        text-underline-offset: 3px;
        cursor: pointer;
      }
      .yin-support-modal__close:hover {
        color: rgba(72, 54, 38, 0.92);
        background: rgba(255, 252, 245, 0.28);
      }
      @media (max-width: 640px) {
        .yin-support-fab {
          top: 10px;
          /* Narrow mute is 40px @ right:10 */
          right: 58px;
          padding: 5px 10px 5px 5px;
          gap: 6px;
        }
        .yin-support-fab__img {
          width: 36px;
          height: 36px;
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
