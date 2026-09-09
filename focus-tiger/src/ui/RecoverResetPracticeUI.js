/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Reset micro-practices during Focusing — Feel the Ground / Take a Breath / Look Around.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { homeClearanceBottomCss } from './homeChromeClearance.js';
import { shouldIgnoreOutsideDismissTarget } from './outsideDismissGuard.js';
import '../components/breath-pacer/breath-pacer.js';
import { RESET_ROUTES } from './RecoverResetOfferUI.js';

const ROOT_ID = 'recover-reset-practice';
const STYLE_ID = 'recover-reset-practice-styles-v1';
const FADE_MS = 320;
const LOOK_STEP_MS = 9_000;
const CONFIDE_OFFER_MS = 6_000;

/** @typedef {import('./RecoverResetOfferUI.js').ResetRoute} ResetRoute */

/** @type {readonly { key: string, durationMs: number }[]} */
const GROUND_PHASES = Object.freeze([
  { key: 'RESET_GROUND_INTRO', durationMs: 7_000 },
  { key: 'RESET_GROUND_FEET', durationMs: 7_000 },
  { key: 'RESET_GROUND_SEAT', durationMs: 7_000 },
  { key: 'RESET_GROUND_HERE', durationMs: 6_000 }
]);

/** @type {readonly string[]} */
const LOOK_STEPS = Object.freeze([
  'RESET_LOOK_INTRO',
  'RESET_LOOK_SEE',
  'RESET_LOOK_TOUCH',
  'RESET_LOOK_HEAR',
  'RESET_LOOK_SMELL',
  'RESET_LOOK_ONE'
]);

export class RecoverResetPracticeUI {
  /**
   * @param {HTMLElement} container
   * @param {object} deps
   * @param {() => boolean} deps.requestSlot
   * @param {() => void} deps.releaseSlot
   * @param {() => void} [deps.onClose]
   * @param {() => void} [deps.onOpenConfide]
   */
  constructor(container, { requestSlot, releaseSlot, onClose, onOpenConfide }) {
    this.container = container;
    this.requestSlot = requestSlot;
    this.releaseSlot = releaseSlot;
    this.onClose = onClose;
    this.onOpenConfide = onOpenConfide;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._phaseTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    this._visible = false;
    /** @type {ResetRoute | null} */
    this._activeRoute = null;
    this._groundPhaseIndex = 0;
    this._lookStepIndex = 0;
    this._boundOutsideDismiss = this._handleOutsideDismiss.bind(this);
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._visible && this.root) this._refreshVisibleCopy();
    });
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
  }

  resetSession() {
    this.hide({ immediate: true });
  }

  /**
   * @param {ResetRoute} route
   * @returns {boolean}
   */
  show(route) {
    if (route === RESET_ROUTES.STEADY) return false;
    if (this._visible) this.hide({ immediate: true });
    if (!this.requestSlot()) return false;

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'recover-reset-practice';
    root.dataset.testid = ROOT_ID;
    root.dataset.route = route;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-live', 'polite');

    const panel = document.createElement('div');
    panel.className = 'recover-reset-practice__panel';
    root.appendChild(panel);

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'recover-reset-practice__dismiss';
    dismiss.dataset.testid = 'recover-reset-practice-dismiss';
    dismiss.setAttribute('aria-label', t('RESET_DISMISS') || 'Close');
    dismiss.textContent = '✕';
    dismiss.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this._finishPractice(false);
    });
    root.appendChild(dismiss);

    root.style.bottom = homeClearanceBottomCss();
    root.style.top = 'auto';

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._activeRoute = route;

    document.addEventListener('pointerdown', this._boundOutsideDismiss, true);
    root.getBoundingClientRect();
    root.classList.add('is-visible');

    if (route === RESET_ROUTES.GROUND) {
      this._groundPhaseIndex = 0;
      this._startGroundPractice(panel);
    } else if (route === RESET_ROUTES.BREATH || route === RESET_ROUTES.OVERWHELMED) {
      this._startBreathPractice(panel, route === RESET_ROUTES.OVERWHELMED);
    } else if (route === RESET_ROUTES.LOOK) {
      this._lookStepIndex = 0;
      this._startLookPractice(panel);
    }
    return true;
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  hide(opts = {}) {
    this._clearPhaseTimer();
    if (this._fadeTimer) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = null;
    }
    document.removeEventListener('pointerdown', this._boundOutsideDismiss, true);

    const root = this.root;
    this.root = null;
    const wasVisible = this._visible;
    this._visible = false;
    this._activeRoute = null;
    if (wasVisible) this.releaseSlot();
    if (!root) return;
    if (opts.immediate) {
      root.remove();
      return;
    }
    root.classList.remove('is-visible');
    this._fadeTimer = window.setTimeout(() => {
      root.remove();
    }, FADE_MS + 40);
  }

  destroy() {
    this._unsubLocale?.();
    this.hide({ immediate: true });
  }

  /**
   * @param {boolean} showConfideOffer
   */
  _finishPractice(showConfideOffer) {
    if (showConfideOffer) {
      this._showConfideOfferStrip();
      return;
    }
    this.hide();
    this.onClose?.();
  }

  _showConfideOfferStrip() {
    const root = this.root;
    const panel = root?.querySelector('.recover-reset-practice__panel');
    if (!root || !panel) {
      this.hide();
      this.onClose?.();
      return;
    }
    panel.innerHTML = '';
    const copy = document.createElement('p');
    copy.className = 'recover-reset-practice__copy';
    copy.textContent = t('RESET_OVERWHELMED_CONFIDE_OFFER');
    panel.appendChild(copy);

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'recover-reset-practice__confide-link';
    link.dataset.testid = 'recover-reset-confide-link';
    link.textContent = t('RESET_OVERWHELMED_CONFIDE_LINK');
    link.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide();
      this.onClose?.();
      this.onOpenConfide?.();
    });
    panel.appendChild(link);

    this._phaseTimer = window.setTimeout(() => {
      this._finishPractice(false);
    }, CONFIDE_OFFER_MS);
  }

  /**
   * @param {HTMLElement} panel
   */
  _startGroundPractice(panel) {
    const renderPhase = () => {
      if (!this.root || this._activeRoute !== RESET_ROUTES.GROUND) return;
      const phase = GROUND_PHASES[this._groundPhaseIndex];
      if (!phase) {
        panel.innerHTML = `<p class="recover-reset-practice__copy">${t('RESET_GROUND_OUTRO')}</p>`;
        this._phaseTimer = window.setTimeout(() => this._finishPractice(false), 2_500);
        return;
      }
      panel.innerHTML = `<p class="recover-reset-practice__copy">${t(phase.key)}</p>`;
      this._phaseTimer = window.setTimeout(() => {
        this._groundPhaseIndex += 1;
        renderPhase();
      }, phase.durationMs);
    };
    renderPhase();
  }

  /**
   * @param {HTMLElement} panel
   * @param {boolean} overwhelmed
   */
  _startBreathPractice(panel, overwhelmed) {
    panel.innerHTML = `
      <p class="recover-reset-practice__copy recover-reset-practice__intro">${t('RESET_BREATH_INTRO')}</p>
      <div class="recover-reset-practice__breath-host"></div>
    `;
    const host = panel.querySelector('.recover-reset-practice__breath-host');
    if (!host) {
      this._finishPractice(false);
      return;
    }
    const pacer = document.createElement('breath-pacer');
    pacer.setAttribute('preset', 'natural');
    pacer.setAttribute('cycles', '2');
    pacer.setAttribute('compact', '');
    host.appendChild(pacer);

    const onDone = () => {
      pacer.removeEventListener('breath-complete-done', onDone);
      pacer.removeEventListener('breath-dismissed', onDismiss);
      this._finishPractice(overwhelmed);
    };
    const onDismiss = () => {
      pacer.removeEventListener('breath-complete-done', onDone);
      pacer.removeEventListener('breath-dismissed', onDismiss);
      this._finishPractice(overwhelmed);
    };
    pacer.addEventListener('breath-complete-done', onDone);
    pacer.addEventListener('breath-dismissed', onDismiss);
  }

  /**
   * @param {HTMLElement} panel
   */
  _startLookPractice(panel) {
    const renderStep = () => {
      if (!this.root || this._activeRoute !== RESET_ROUTES.LOOK) return;
      const key = LOOK_STEPS[this._lookStepIndex];
      if (!key) {
        panel.innerHTML = `<p class="recover-reset-practice__copy">${t('RESET_LOOK_OUTRO')}</p>`;
        this._phaseTimer = window.setTimeout(() => this._finishPractice(false), 2_500);
        return;
      }
      const isLast = this._lookStepIndex >= LOOK_STEPS.length - 1;
      panel.innerHTML = `
        <p class="recover-reset-practice__copy">${t(key)}</p>
        ${isLast ? '' : `<button type="button" class="recover-reset-practice__next" data-testid="recover-reset-look-next">${t('RESET_LOOK_NEXT')}</button>`}
      `;
      const nextBtn = panel.querySelector('.recover-reset-practice__next');
      nextBtn?.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this._advanceLookStep(renderStep);
      });
      if (!isLast) {
        this._phaseTimer = window.setTimeout(
          () => this._advanceLookStep(renderStep),
          LOOK_STEP_MS
        );
      } else {
        this._phaseTimer = window.setTimeout(() => this._finishPractice(false), LOOK_STEP_MS);
      }
    };
    renderStep();
  }

  /**
   * @param {() => void} renderStep
   */
  _advanceLookStep(renderStep) {
    this._clearPhaseTimer();
    this._lookStepIndex += 1;
    renderStep();
  }

  _refreshVisibleCopy() {
    if (!this.root || !this._activeRoute) return;
    const panel = this.root.querySelector('.recover-reset-practice__panel');
    if (!panel) return;
    if (this._activeRoute === RESET_ROUTES.GROUND) {
      const phase = GROUND_PHASES[this._groundPhaseIndex];
      if (phase) {
        const copy = panel.querySelector('.recover-reset-practice__copy');
        if (copy) copy.textContent = t(phase.key);
      }
    } else if (this._activeRoute === RESET_ROUTES.LOOK) {
      const key = LOOK_STEPS[this._lookStepIndex];
      const copy = panel.querySelector('.recover-reset-practice__copy');
      if (copy && key) copy.textContent = t(key);
    }
  }

  _clearPhaseTimer() {
    if (this._phaseTimer) {
      clearTimeout(this._phaseTimer);
      this._phaseTimer = null;
    }
  }

  /** @param {PointerEvent} ev */
  _handleOutsideDismiss(ev) {
    if (!this._visible || !this.root) return;
    const target = ev.target;
    if (!(target instanceof Node)) return;
    if (this.root.contains(target)) return;
    if (shouldIgnoreOutsideDismissTarget(target)) return;
    this._finishPractice(false);
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .recover-reset-practice {
        position: absolute;
        left: 50%;
        bottom: 72px;
        top: auto;
        z-index: 17;
        width: min(400px, calc(100vw - 28px));
        margin: 0;
        padding: 0;
        opacity: 0;
        transform: translate(-50%, 14px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
      }
      .recover-reset-practice.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .recover-reset-practice__panel {
        padding: 14px 16px 16px;
        border: 1px solid rgba(196, 165, 116, 0.3);
        border-radius: 18px;
        background: rgba(255, 252, 245, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #3a2e22;
        box-shadow: 0 10px 28px rgba(58, 46, 34, 0.1);
      }
      .recover-reset-practice__copy {
        margin: 0;
        font-size: 0.88rem;
        line-height: 1.5;
        text-align: center;
        letter-spacing: 0.01em;
      }
      .recover-reset-practice__intro {
        margin-bottom: 10px;
      }
      .recover-reset-practice__breath-host {
        margin-top: 4px;
      }
      .recover-reset-practice__next,
      .recover-reset-practice__confide-link {
        display: block;
        margin: 12px auto 0;
        padding: 8px 16px;
        border: 1px solid rgba(196, 165, 116, 0.35);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.65);
        color: #3a2e22;
        font: inherit;
        font-size: 0.8rem;
        cursor: pointer;
      }
      .recover-reset-practice__next:active,
      .recover-reset-practice__confide-link:active {
        transform: translateY(1px);
      }
      .recover-reset-practice__dismiss {
        position: absolute;
        top: 4px;
        right: 6px;
        z-index: 18;
        border: 0;
        background: transparent;
        color: rgba(58, 46, 34, 0.5);
        font-size: 17px;
        cursor: pointer;
        padding: 4px 6px;
        line-height: 1;
      }
      .recover-reset-practice__dismiss:active {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }
}
