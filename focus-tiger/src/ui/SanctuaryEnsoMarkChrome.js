/**
 * Idle / Focusing chrome: Sanctuary Enso mark on Yin's cushion face.
 * Entitled (lifetime ∪ subscription) only — never tip-only.
 * Click does not open shop (Brief).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  ENSO_OPACITY_FOCUSING,
  ENSO_OPACITY_HOVER,
  ENSO_OPACITY_IDLE,
  SANCTUARY_ENSO_MARK_SRC,
  layoutSanctuaryEnsoMark,
  sanctuaryEnsoOpacity,
  shouldShowSanctuaryEnsoMark
} from '../core/sanctuaryEnsoMark.js';
import { onEntitlementChange } from '../core/entitlement/entitlementGate.js';

const STYLE_ID = 'yin-sanctuary-enso-mark-chrome-v1';

export class SanctuaryEnsoMarkChrome {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   * @param {() => ({ left: number, top: number, width: number, height: number, naturalWidth?: number, naturalHeight?: number } | null)} [handlers.getDisplayRect]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._visibleAllowed = true;
    this._focusing = false;
    this._hover = false;
    this._stageObserver = null;

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
    this._onPointerEnter = () => {
      this._hover = true;
      this._applyOpacity();
    };
    this._onPointerLeave = () => {
      this._hover = false;
      this._applyOpacity();
    };
    this.root.addEventListener('pointerenter', this._onPointerEnter);
    this.root.addEventListener('pointerleave', this._onPointerLeave);
    // Click must not open shop (Brief) — swallow activation.
    this.root.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    this._unsubLocale = onLocaleChange(() => this.refresh());
    this._unsubEntitlement = onEntitlementChange(() => this.refresh());
    this._onResize = () => this.syncLayout();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._onResize);
      window.addEventListener('orientationchange', this._onResize);
    }

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
      this._observeStage();
      this.syncLayout();
    } else {
      this._disconnectStage();
    }
    this._applyOpacity();
  }

  syncLayout() {
    if (this.root.hidden) return;
    const getRect = this.handlers.getDisplayRect;
    const rect = typeof getRect === 'function' ? getRect() : null;
    const box = layoutSanctuaryEnsoMark(rect);
    if (!box) {
      // Fallback: viewport cushion band if sprite rect not ready yet.
      const vw =
        typeof window !== 'undefined' ? window.innerWidth || 375 : 375;
      const vh =
        typeof window !== 'undefined' ? window.innerHeight || 667 : 667;
      const size = Math.max(44, Math.min(vw, vh) * 0.14);
      this.root.style.left = `${vw / 2 - size / 2}px`;
      this.root.style.top = `${vh * 0.72 - size / 2}px`;
      this.root.style.width = `${size}px`;
      this.root.style.height = `${size}px`;
      return;
    }
    this.root.style.left = `${box.left}px`;
    this.root.style.top = `${box.top}px`;
    this.root.style.width = `${box.size}px`;
    this.root.style.height = `${box.size}px`;
  }

  destroy() {
    this._disconnectStage();
    this._unsubLocale?.();
    this._unsubEntitlement?.();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('orientationchange', this._onResize);
    }
    this.root.removeEventListener('pointerenter', this._onPointerEnter);
    this.root.removeEventListener('pointerleave', this._onPointerLeave);
    this.root.remove();
  }

  _applyOpacity() {
    const op = sanctuaryEnsoOpacity(this._focusing, this._hover);
    this.root.style.opacity = String(op);
    this.root.dataset.opacityMode = this._focusing
      ? 'focusing'
      : this._hover
        ? 'hover'
        : 'idle';
  }

  _observeStage() {
    if (this._stageObserver || typeof ResizeObserver === 'undefined') return;
    const stage = document.getElementById('sprite-stage');
    if (!stage) return;
    this._stageObserver = new ResizeObserver(() => this.syncLayout());
    this._stageObserver.observe(stage);
  }

  _disconnectStage() {
    this._stageObserver?.disconnect();
    this._stageObserver = null;
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-sanctuary-enso-mark {
        position: fixed;
        /* Above sprite-overlay(3), below #ui-overlay(10); with LightProgression FX(4) */
        z-index: 4;
        pointer-events: auto;
        opacity: ${ENSO_OPACITY_IDLE};
        transition: opacity 180ms ease;
        line-height: 0;
        /* Click does not open shop — still allow hover brighten on wide */
        cursor: default;
        user-select: none;
        -webkit-user-select: none;
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
      @media (hover: hover) and (pointer: fine) {
        .yin-sanctuary-enso-mark:not(.is-focusing):hover {
          opacity: ${ENSO_OPACITY_HOVER};
        }
      }
    `;
    document.head.appendChild(style);
  }
}
