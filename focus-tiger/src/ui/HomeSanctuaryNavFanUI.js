/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Corner fan: round Home · Calendar · Collection icons.
 * Compass FAB sits at the bottom-right corner (left of the language globe
 * on wide). The fan hinges on that FAB.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { markHomeSanctuaryNavSeen } from '../core/homeSanctuaryNavGate.js';
import { pushOverlayEscapeLayer } from '../core/overlayEscapeStack.js';
import { SANCTUARY_NAV_COMPASS_SVG } from './sanctuaryNavCompassIcon.js';

const STYLE_ID = 'home-sanctuary-nav-fan-styles-v2';
const COMPASS_FAB_PX = Math.round(44 * 1.5);
const HELP_IN_CLUSTER_PX = 40;
const CLUSTER_BOTTOM_EXPR = '36px + 88px + 20px';
const CLUSTER_PAD_BOTTOM_PX = 8;

const FAN_ICON = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2 4 11h2.2v7.2h4.3v-4.4h3v4.4h4.3V11H20L12 4.2z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3.5h2V6h6V3.5h2V6H19a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V3.5zM5 11v8h14v-8H5z"/></svg>',
  collection: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.2c2.8 2.2 4.6 3.4 4.6 6.1 0 2.6-2 4.7-4.6 4.7S7.4 11.9 7.4 9.3c0-2.7 1.8-3.9 4.6-6.1zM6.2 16.2h11.6c.7 1.2.4 2.6-.8 3.2-1.5.8-3.4 1.1-5 1.1s-3.5-.3-5-1.1c-1.2-.6-1.5-2-.8-3.2z"/></svg>'
};

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
      const disc = document.createElement('span');
      disc.className = 'home-sanctuary-nav-fan__disc';
      disc.setAttribute('aria-hidden', 'true');
      disc.innerHTML = FAN_ICON[dest];
      const label = document.createElement('span');
      label.className = 'home-sanctuary-nav-fan__label';
      btn.append(disc, label);
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this._choose(dest);
      });
      this.items[dest] = btn;
      this.root.appendChild(btn);
    }
    this._layoutArc();

    this.fab = document.createElement('button');
    this.fab.type = 'button';
    this.fab.id = 'ft-sanctuary-nav-compass-fab';
    this.fab.className = 'ft-sanctuary-nav-compass-fab';
    this.fab.dataset.testid = 'ft-sanctuary-nav-compass-fab';
    this.fab.innerHTML = SANCTUARY_NAV_COMPASS_SVG;
    this.fab.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.open();
    });

    mountRoot.append(this.backdrop, this.root, this.fab);

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
    window.addEventListener('resize', this._onResize = () => this._placeCorner());
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

    void opts;
    this._placeCorner();

    this.backdrop.hidden = false;
    this.root.hidden = false;
    requestAnimationFrame(() => {
      this.backdrop.classList.add('is-visible');
      this.root.classList.add('is-visible');
    });

    this._popEscapeLayer?.();
    this._popEscapeLayer = pushOverlayEscapeLayer({
      id: 'home-sanctuary-nav-fan',
      dismiss: () => this.close()
    });
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
    window.removeEventListener('resize', this._onResize);
    this.backdrop.remove();
    this.root.remove();
    this.fab.remove();
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
      if (dest === 'home') {
        this._ackHome();
        this.handlers.onHome?.();
      }
      else if (dest === 'calendar') {
        this.handlers.onCalendar?.();
        HomeSanctuaryNavFanUI.highlightPracticeCalendar();
      } else if (dest === 'collection') this.handlers.onCollection?.();
    });
  }

  /** @returns {void} */
  _refreshLabels() {
    this.root.setAttribute('aria-label', t('SANCTUARY_NAV_FAN_ARIA'));
    if (this.fab) {
      this.fab.setAttribute('aria-label', t('SANCTUARY_NAV_ARIA'));
    }
    const labels = {
      home: t('SANCTUARY_NAV_HOME'),
      calendar: t('SANCTUARY_NAV_CALENDAR'),
      collection: t('SANCTUARY_NAV_COLLECTION')
    };
    for (const dest of Object.keys(labels)) {
      const btn = this.items[dest];
      const label = btn.querySelector('.home-sanctuary-nav-fan__label');
      if (label) label.textContent = labels[dest];
      btn.setAttribute('aria-label', labels[dest]);
    }
  }

  /**
   * Hinge sits on the compass FAB (bottom-right, left of the globe on wide).
   * @returns {void}
   */
  _placeCorner() {
    const fab = this.fab || document.getElementById('ft-sanctuary-nav-compass-fab');
    const rect = fab?.getBoundingClientRect?.();
    const shown = fab ? getComputedStyle(fab) : null;
    const visible = Boolean(
      rect &&
        rect.width >= 8 &&
        rect.height >= 8 &&
        shown &&
        shown.display !== 'none' &&
        shown.visibility !== 'hidden'
    );
    const x = visible ? rect.left + rect.width / 2 : window.innerWidth - 28;
    const y = visible ? rect.top + rect.height / 2 : window.innerHeight - 28;
    const cx = Math.min(window.innerWidth - 24, Math.max(24, x));
    const cy = Math.min(window.innerHeight - 20, Math.max(96, y));
    this.root.style.setProperty('--fan-anchor-x', `${cx}px`);
    this.root.style.setProperty('--fan-anchor-y', `${cy}px`);
    this.root.dataset.fanAnchor = 'corner';
    this._layoutArc();
  }

  /** @returns {void} */
  _layoutArc() {
    const spots = {
      home: { deg: 135, r: 132 },
      calendar: { deg: 172, r: 108 },
      collection: { deg: 100, r: 108 }
    };
    for (const dest of Object.keys(spots)) {
      const spot = spots[dest];
      const rad = (spot.deg * Math.PI) / 180;
      const btn = this.items[dest];
      btn.style.left = `${Math.cos(rad) * spot.r}px`;
      btn.style.top = `${-Math.sin(rad) * spot.r}px`;
    }
  }

  /** @returns {void} */
  _ackHome() {
    const ball =
      document.getElementById('ft-sanctuary-nav-compass-fab') ||
      document.getElementById('ft-wide-home-sanctuary-nav') ||
      document.getElementById('ft-narrow-home-sanctuary-nav');
    if (!ball) return;
    ball.classList.remove('is-home-ack');
    void ball.offsetWidth;
    ball.classList.add('is-home-ack');
    window.setTimeout(() => ball.classList.remove('is-home-ack'), 700);
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
        width: 72px;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: #2c1f14;
        font: 600 11px/1.15 var(--ft-font-ui, system-ui, sans-serif);
        cursor: pointer;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        transform: translate(-50%, -50%) scale(0.55);
        opacity: 0;
        transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease;
      }
      .home-sanctuary-nav-fan.is-visible .home-sanctuary-nav-fan__item {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      .home-sanctuary-nav-fan__item[data-dest="calendar"] { transition-delay: 40ms; }
      .home-sanctuary-nav-fan__item[data-dest="collection"] { transition-delay: 70ms; }
      .home-sanctuary-nav-fan__item:active .home-sanctuary-nav-fan__disc {
        transform: scale(0.96);
      }
      .home-sanctuary-nav-fan__disc {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 32% 28%, #fffdf8, #f4ecdf 58%, #e6d7c2);
        border: 1px solid rgba(139, 115, 85, 0.28);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 10px 18px rgba(44, 31, 20, 0.16);
        color: #4a3a28;
      }
      .home-sanctuary-nav-fan__disc svg { width: 26px; height: 26px; display: block; }
      .home-sanctuary-nav-fan__label {
        max-width: 76px;
        text-align: center;
        text-shadow: 0 1px 0 rgba(255, 252, 245, 0.95);
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
      #ft-wide-home-sanctuary-nav.is-home-ack,
      #ft-narrow-home-sanctuary-nav.is-home-ack {
        animation: ft-home-ack 640ms ease;
      }
      @keyframes ft-home-ack {
        0% { transform: scale(1); }
        40% { transform: scale(1.08); }
        100% { transform: scale(1); }
      }
      @keyframes ft-home-sanctuary-nav-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.82); }
      }
      .ft-sanctuary-nav-compass-fab {
        position: fixed;
        right: calc(16px + ${COMPASS_FAB_PX}px + 12px);
        bottom: calc(
          ${CLUSTER_BOTTOM_EXPR} + ${CLUSTER_PAD_BOTTOM_PX}px +
            (${HELP_IN_CLUSTER_PX}px - ${COMPASS_FAB_PX}px) / 2
        );
        z-index: 16;
        width: ${COMPASS_FAB_PX}px;
        height: ${COMPASS_FAB_PX}px;
        padding: 0;
        border: 1.5px solid rgba(139, 115, 85, 0.42);
        border-radius: 50%;
        background: rgba(255, 252, 245, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: rgba(74, 58, 40, 0.95);
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 2px 10px rgba(44, 31, 20, 0.12);
        display: none;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      }
      body.ft-wide-home-ctas .ft-sanctuary-nav-compass-fab,
      body.ft-narrow-shell.ft-narrow-park.ft-narrow-idle .ft-sanctuary-nav-compass-fab {
        display: flex;
      }
      @media (max-width: 479px) {
        .ft-sanctuary-nav-compass-fab {
          right: 16px;
        }
      }
      .ft-sanctuary-nav-compass-fab .ft-sanctuary-nav-compass {
        width: 78%;
        height: 78%;
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
