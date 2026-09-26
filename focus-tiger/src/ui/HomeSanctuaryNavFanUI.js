/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Radial fan: Home · Calendar · Collection.
 * Anchors to compass chrome or ⋯ menu button.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { markHomeSanctuaryNavSeen } from '../core/homeSanctuaryNavGate.js';
import { pushOverlayEscapeStack } from '../core/overlayEscapeStack.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'home-sanctuary-nav-fan-styles-v1';
const HEATMAP_HIGHLIGHT_CLASS = 'is-sanctuary-nav-highlight';
const HEATMAP_HIGHLIGHT_MS = 2200;

/** @typedef {'home' | 'calendar' | 'collection'} SanctuaryNavDest */

export class HomeSanctuaryNavFanUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {{
   *   storage?: Storage | null,
   *   onHome?: () => void,
   *   onCalendar?: () => void,
   *   onCollection?: () => void,
   *   onOpen?: () => void,
   *   onClose?: () => void
   * }} [handlers]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;
    /** @type {(() => void) | null} */
    this._popEscapeLayer = null;

    this.backdrop = document.createElement('button');
    this.backdrop.type = 'button';
    this.backdrop.className = 'home-sanctuary-nav-fan__backdrop';
    this.backdrop.id = 'home-sanctuary-nav-fan-backdrop';
    this.backdrop.hidden = true;
    this.backdrop.setAttribute('aria-label', t('SANCTUARY_NAV_DISMISS_ARIA'));

    this.root = document.createElement('div');
    this.root.id = 'home-sanctuary-nav-fan';
    this.root.className = 'home-sanctuary-nav-fan';
    this.root.hidden = true;
    this.root.setAttribute('role', 'menu');
    this.root.dataset.testid = 'home-sanctuary-nav-fan';

    /** @type {Record<SanctuaryNavDest, HTMLButtonElement>} */
    this.items = {};
    for (const dest of /** @type {SanctuaryNavDest[]} */ ([
      'home',
      'calendar',
      'collection'
    ])) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'home-sanctuary-nav-fan__item';
      btn.dataset.dest = dest;
      btn.dataset.testid = `home-sanctuary-nav-${dest}`;
      btn.setAttribute('role', 'menuitem');
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this._choose(dest);
      });
      this.items[dest] = btn;
      this.root.appendChild(btn);
    }

    mountRoot.append(this.backdrop, this.root);

    this.backdrop.addEventListener('click', () => this.close());
    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeyDown, true);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshLabels());
    this._refreshLabels();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  /**
   * @param {{ anchorEl?: HTMLElement | null }} [opts]
   * @returns {void}
   */
  open(opts = {}) {
    if (this._open) return;
    this._open = true;
    markHomeSanctuaryNavSeen(this._storage);
    this.handlers.onOpen?.();

    const anchor = opts.anchorEl;
    const rect = anchor?.getBoundingClientRect?.();
    const cx = rect
      ? rect.left + rect.width / 2
      : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.78;

    this.root.style.setProperty('--fan-anchor-x', `${cx}px`);
    this.root.style.setProperty('--fan-anchor-y', `${cy}px`);

    this.backdrop.hidden = false;
    this.root.hidden = false;
    requestAnimationFrame(() => {
      this.backdrop.classList.add('is-visible');
      this.root.classList.add('is-visible');
    });

    this._popEscapeLayer?.();
    this._popEscapeLayer = pushOverlayEscapeLayer(() => this.close());
  }

  /** @returns {void} */
  close() {
    if (!this._open) return;
    this._open = false;
    this.backdrop.classList.remove('is-visible');
    this.root.classList.remove('is-visible');
    const hide = () => {
      this.backdrop.hidden = true;
      this.root.hidden = true;
    };
    setTimeout(hide, 180);
    this._popEscapeLayer?.();
    this._popEscapeLayer = null;
    this.handlers.onClose?.();
  }

  destroy() {
    this.close();
    this._unsubLocale?.();
    document.removeEventListener('keydown', this._onKeyDown, true);
    this.backdrop.remove();
    this.root.remove();
  }

  /**
   * Default calendar hop — scroll heatmap + brief highlight.
   * @returns {void}
   */
  static highlightPracticeCalendar() {
    const cluster = document.getElementById('weekly-practice-heatmap-cluster');
    if (!cluster) return;
    cluster.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    cluster.classList.add(HEATMAP_HIGHLIGHT_CLASS);
    window.setTimeout(() => {
      cluster.classList.remove(HEATMAP_HIGHLIGHT_CLASS);
    }, HEATMAP_HIGHLIGHT_MS);
  }

  /**
   * @param {SanctuaryNavDest} dest
   * @returns {void}
   */
  _choose(dest) {
    this.close();
    requestAnimationFrame(() => {
      if (dest === 'home') this.handlers.onHome?.();
      else if (dest === 'calendar') {
        this.handlers.onCalendar?.();
        HomeSanctuaryNavFanUI.highlightPracticeCalendar();
      } else if (dest === 'collection') this.handlers.onCollection?.();
    });
  }

  /** @returns {void} */
  _refreshLabels() {
    this.root.setAttribute('aria-label', t('SANCTUARY_NAV_FAN_ARIA'));
    this.items.home.textContent = t('SANCTUARY_NAV_HOME');
    this.items.home.setAttribute('aria-label', t('SANCTUARY_NAV_HOME'));
    this.items.calendar.textContent = t('SANCTUARY_NAV_CALENDAR');
    this.items.calendar.setAttribute('aria-label', t('SANCTUARY_NAV_CALENDAR'));
    this.items.collection.textContent = t('SANCTUARY_NAV_COLLECTION');
    this.items.collection.setAttribute('aria-label', t('SANCTUARY_NAV_COLLECTION'));
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .home-sanctuary-nav-fan__backdrop {
        position: fixed;
        inset: 0;
        z-index: 35;
        margin: 0;
        padding: 0;
        border: 0;
        background: rgba(44, 31, 20, 0.12);
        cursor: pointer;
        opacity: 0;
        transition: opacity 180ms ease;
      }
      .home-sanctuary-nav-fan__backdrop.is-visible {
        opacity: 1;
      }
      .home-sanctuary-nav-fan__backdrop[hidden] {
        display: none !important;
      }
      .home-sanctuary-nav-fan {
        position: fixed;
        left: var(--fan-anchor-x, 50%);
        top: var(--fan-anchor-y, 78%);
        z-index: 36;
        width: 0;
        height: 0;
        pointer-events: none;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.92);
        transition: opacity 200ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .home-sanctuary-nav-fan.is-visible {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      .home-sanctuary-nav-fan[hidden] {
        display: none !important;
      }
      .home-sanctuary-nav-fan__item {
        position: absolute;
        pointer-events: auto;
        min-width: 88px;
        padding: 10px 14px;
        border-radius: ${GLASS_RADIUS};
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL};
        backdrop-filter: ${GLASS_BLUR_CSS};
        -webkit-backdrop-filter: ${GLASS_BLUR_CSS};
        box-shadow: ${GLASS_SHADOW};
        color: rgba(74, 58, 40, 0.92);
        font-size: 0.78rem;
        font-weight: 650;
        letter-spacing: 0.01em;
        cursor: pointer;
        white-space: nowrap;
        transform: translate(-50%, -50%);
        transition: transform 120ms ease, filter 120ms ease;
      }
      .home-sanctuary-nav-fan__item:hover {
        filter: brightness(1.03);
      }
      .home-sanctuary-nav-fan__item:active {
        transform: translate(-50%, -50%) scale(0.96);
      }
      .home-sanctuary-nav-fan__item[data-dest="home"] {
        left: 0;
        top: -92px;
      }
      .home-sanctuary-nav-fan__item[data-dest="calendar"] {
        left: -96px;
        top: -36px;
      }
      .home-sanctuary-nav-fan__item[data-dest="collection"] {
        left: 96px;
        top: -36px;
      }
      #weekly-practice-heatmap-cluster.${HEATMAP_HIGHLIGHT_CLASS} {
        outline: 2px solid rgba(74, 143, 212, 0.55);
        outline-offset: 4px;
        border-radius: 12px;
        transition: outline-color 220ms ease;
      }
      .ft-wide-home-ctas__btn.is-asset,
      .ft-narrow-home-ctas__btn.is-asset {
        position: relative;
      }
      .ft-home-sanctuary-nav-pulse {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #4a8fd4;
        box-shadow: 0 0 0 2px rgba(255, 252, 245, 0.95);
        pointer-events: none;
        animation: ft-home-sanctuary-nav-pulse 1.45s ease-in-out infinite;
      }
      @keyframes ft-home-sanctuary-nav-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.82); }
      }
      .ft-sanctuary-nav-compass {
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }
}
