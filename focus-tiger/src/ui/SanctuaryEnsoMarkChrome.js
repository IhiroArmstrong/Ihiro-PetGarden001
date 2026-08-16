/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle / Focusing chrome: Sanctuary Enso mark at the page bottom-left.
 * Entitled (lifetime ∪ subscription) only — never tip-only.
 * Decorative (pointer-events: none) — does not open shop.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  ENSO_CORNER_BOTTOM_WIDE_PX,
  ENSO_CORNER_GAP_ABOVE_BALLS_PX,
  ENSO_CORNER_LEFT_NARROW_PX,
  ENSO_CORNER_LEFT_WIDE_PX,
  ENSO_CORNER_SIZE_NARROW_PX,
  ENSO_CORNER_SIZE_WIDE_PX,
  ENSO_HOME_BALLS_BOTTOM_PX,
  ENSO_HOME_SIT_PX,
  ENSO_NARROW_MQ_MAX_PX,
  ENSO_OPACITY_FOCUSING,
  ENSO_OPACITY_IDLE,
  SANCTUARY_ENSO_MARK_SRC,
  sanctuaryEnsoOpacity,
  shouldShowSanctuaryEnsoMark
} from '../core/sanctuaryEnsoMark.js';
import { onEntitlementChange } from '../core/entitlement/entitlementGate.js';

const STYLE_ID = 'yin-sanctuary-enso-mark-chrome-v2';

export class SanctuaryEnsoMarkChrome {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._visibleAllowed = true;
    this._focusing = false;

    this.root = document.createElement('div');
    this.root.id = 'yin-sanctuary-enso-mark';
    this.root.className = 'yin-sanctuary-enso-mark';
    this.root.hidden = true;
    this.root.dataset.testid = 'yin-sanctuary-enso-mark';
    this.root.setAttribute('role', 'img');
    this.root.setAttribute('aria-hidden', 'true');

    this.img = document.createElement('img');
    this.img.className = 'yin-sanctuary-enso-mark__img';
    this.img.src = SANCTUARY_ENSO_MARK_SRC;
    this.img.alt = '';
    this.img.decoding = 'async';
    this.img.draggable = false;

    this.root.appendChild(this.img);
    mountRoot.appendChild(this.root);

    this._injectStyles();

    this._unsubLocale = onLocaleChange(() => this.refresh());
    this._unsubEntitlement = onEntitlementChange(() => this.refresh());

    this.refresh();
  }

  /**
   * Idle chrome may park during overlays; Focusing keeps mark but fades.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this._visibleAllowed = Boolean(visible);
    this.refresh();
  }

  /**
   * @param {boolean} focusing
   */
  setFocusing(focusing) {
    this._focusing = Boolean(focusing);
    this.root.classList.toggle('is-focusing', this._focusing);
    this._applyOpacity();
  }

  refresh() {
    const entitled = shouldShowSanctuaryEnsoMark({ storage: this._storage });
    const show = this._visibleAllowed && entitled;
    this.root.hidden = !show;
    this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) {
      this.root.setAttribute('aria-label', t('SANCTUARY_ENSO_MARK_ARIA'));
    }
    this._applyOpacity();
  }

  destroy() {
    this._unsubLocale?.();
    this._unsubEntitlement?.();
    this.root.remove();
  }

  _applyOpacity() {
    const op = sanctuaryEnsoOpacity(this._focusing, false);
    this.root.style.opacity = String(op);
    this.root.dataset.opacityMode = this._focusing ? 'focusing' : 'idle';
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-sanctuary-enso-mark {
        position: fixed;
        left: max(${ENSO_CORNER_LEFT_WIDE_PX}px, env(safe-area-inset-left, 0px));
        bottom: max(${ENSO_CORNER_BOTTOM_WIDE_PX}px, env(safe-area-inset-bottom, 0px));
        width: ${ENSO_CORNER_SIZE_WIDE_PX}px;
        height: ${ENSO_CORNER_SIZE_WIDE_PX}px;
        /* Identity chrome with kindness badges(11); below heatmap(12) / dock(16) / ?(22) */
        z-index: 11;
        pointer-events: none;
        opacity: ${ENSO_OPACITY_IDLE};
        transition: opacity 180ms ease;
        line-height: 0;
        user-select: none;
        -webkit-user-select: none;
      }
      @media (max-width: ${ENSO_NARROW_MQ_MAX_PX}px) {
        .yin-sanctuary-enso-mark {
          left: max(${ENSO_CORNER_LEFT_NARROW_PX}px, env(safe-area-inset-left, 0px));
          bottom: calc(max(${ENSO_HOME_BALLS_BOTTOM_PX}px, env(safe-area-inset-bottom, 0px)) + ${ENSO_HOME_SIT_PX}px + ${ENSO_CORNER_GAP_ABOVE_BALLS_PX}px);
          width: ${ENSO_CORNER_SIZE_NARROW_PX}px;
          height: ${ENSO_CORNER_SIZE_NARROW_PX}px;
        }
      }
      .yin-sanctuary-enso-mark.is-focusing {
        opacity: ${ENSO_OPACITY_FOCUSING};
      }
      .yin-sanctuary-enso-mark__img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        pointer-events: none;
        filter: drop-shadow(0 1px 2px rgba(40, 28, 16, 0.22));
      }
    `;
    document.head.appendChild(style);
  }
}
