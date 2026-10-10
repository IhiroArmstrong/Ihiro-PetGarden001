/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Growth Journey detail — a quiet lower card opened from the home line.
 * Read-only. No percentages, no ninety-day count.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { growthJourneyDetailModel } from '../core/growthJourneyDetail.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';

const STYLE_ID = 'growth-journey-detail-styles-v1';
const FADE_MS = 220;

export class GrowthJourneyDetailUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => unknown} [handlers.getEligibleMinutes]
   * @param {() => unknown} [handlers.getLifetimeMinutes]
   * @param {() => unknown} [handlers.getStageFloor]
   * @param {() => Iterable<unknown>} [handlers.getPracticeDates]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._hideTimer = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'growth-journey-detail-backdrop',
      testId: 'growth-journey-detail-backdrop',
      zIndex: 17,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'growth-journey-detail';
    this.root.className = 'growth-journey-detail';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'growth-journey-detail-title');
    this.root.dataset.testid = 'growth-journey-detail';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'growth-journey-detail-title';
    this.titleEl.className = 'growth-journey-detail__title';

    this.track = document.createElement('div');
    this.track.className = 'growth-journey-detail__track';
    this.track.dataset.testid = 'growth-journey-detail-track';

    this.line = document.createElement('span');
    this.line.className = 'growth-journey-detail__line';
    this.line.setAttribute('aria-hidden', 'true');

    this.dot = document.createElement('span');
    this.dot.className = 'growth-journey-detail__dot';
    this.dot.setAttribute('aria-hidden', 'true');

    this.hereEl = document.createElement('p');
    this.hereEl.className = 'growth-journey-detail__here';
    this.hereEl.dataset.testid = 'growth-journey-detail-here';

    this.nextEl = document.createElement('p');
    this.nextEl.className = 'growth-journey-detail__next';
    this.nextEl.dataset.testid = 'growth-journey-detail-next';

    this.lifetimeEl = document.createElement('p');
    this.lifetimeEl.className = 'growth-journey-detail__lifetime';
    this.lifetimeEl.dataset.testid = 'growth-journey-detail-lifetime';

    this.rhythmEl = document.createElement('div');
    this.rhythmEl.className = 'growth-journey-detail__rhythm';
    this.rhythmEl.dataset.testid = 'growth-journey-detail-rhythm';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'growth-journey-detail__close';
    this.closeBtn.dataset.testid = 'growth-journey-detail-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.line.appendChild(this.dot);
    this.track.appendChild(this.line);
    this.root.append(
      this.titleEl,
      this.track,
      this.hereEl,
      this.nextEl,
      this.lifetimeEl,
      this.rhythmEl,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key !== 'Escape') return;
      event.preventDefault();
      this.close();
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._open) this._refresh();
    });
    this._refresh();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) {
      this._refresh();
      return;
    }
    this._open = true;
    if (this._hideTimer != null) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refresh();
    this.closeBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.classList.remove('is-visible');
    hideOverlayBackdrop(this.backdrop, { fadeMs: FADE_MS });
    this._hideTimer = setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  _refresh() {
    const model = growthJourneyDetailModel({
      eligibleMinutes: this.handlers.getEligibleMinutes?.() ?? 0,
      lifetimeMinutes: this.handlers.getLifetimeMinutes?.() ?? 0,
      floor: this.handlers.getStageFloor?.() ?? null,
      practiceDates: this.handlers.getPracticeDates?.() ?? [],
      translate: t
    });
    this.titleEl.textContent = t('GROWTH_JOURNEY_DETAIL_TITLE');
    this.closeBtn.textContent = t('GROWTH_JOURNEY_CLOSE');
    this.hereEl.textContent = model.here;
    this.nextEl.textContent = model.nextStep;
    this.nextEl.hidden = model.nextStep === '';
    this.lifetimeEl.textContent = model.lifetimeText;
    this.dot.style.left = `${model.position * 100}%`;

    this.track.querySelectorAll('.growth-journey-detail__stage').forEach((node) => {
      node.remove();
    });
    const count = Math.max(1, model.stages.length - 1);
    model.stages.forEach((stage, index) => {
      const label = document.createElement('span');
      label.className = 'growth-journey-detail__stage';
      if (index === 0) label.classList.add('is-first');
      if (index === model.stages.length - 1) label.classList.add('is-last');
      label.dataset.stage = stage.id;
      label.textContent = stage.label;
      label.style.left = `${(index / count) * 100}%`;
      this.track.appendChild(label);
    });

    this.rhythmEl.replaceChildren();
    for (const mark of model.rhythm) {
      const item = document.createElement('span');
      item.className = 'growth-journey-detail__mark';
      item.dataset.kind = mark.kind;
      if (mark.kind === 'paused') {
        const paused = document.createElement('span');
        paused.className = 'growth-journey-detail__paused';
        paused.textContent = t('GROWTH_JOURNEY_PAUSED');
        item.appendChild(paused);
      } else {
        const dot = document.createElement('span');
        dot.className = 'growth-journey-detail__day';
        dot.dataset.kind = mark.kind;
        item.appendChild(dot);
        if (mark.kind === 'returned') {
          const returned = document.createElement('span');
          returned.className = 'growth-journey-detail__returned';
          returned.textContent = t('GROWTH_JOURNEY_RETURNED');
          item.appendChild(returned);
        }
      }
      this.rhythmEl.appendChild(item);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .growth-journey-detail {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(360px, calc(100vw - 40px));
        max-height: min(52vh, 420px);
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
      .growth-journey-detail.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .growth-journey-detail__title {
        margin: 0 0 12px;
        font-size: 1.02rem;
        font-weight: 600;
      }
      .growth-journey-detail__track {
        position: relative;
        height: 46px;
        margin: 0 8px 8px;
      }
      .growth-journey-detail__line {
        position: absolute;
        left: 0;
        right: 0;
        top: 28px;
        height: 1px;
        background: rgba(44, 31, 20, 0.35);
      }
      .growth-journey-detail__dot {
        position: absolute;
        top: 50%;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #2c1f14;
        transform: translate(-50%, -50%);
      }
      .growth-journey-detail__stage {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        font-size: 11px;
        line-height: 1.2;
        white-space: nowrap;
        color: rgba(44, 31, 20, 0.72);
      }
      .growth-journey-detail__stage.is-first {
        transform: none;
      }
      .growth-journey-detail__stage.is-last {
        transform: translateX(-100%);
      }
      .growth-journey-detail__here,
      .growth-journey-detail__next,
      .growth-journey-detail__lifetime {
        margin: 0 0 8px;
        font-size: 0.88rem;
        line-height: 1.4;
      }
      .growth-journey-detail__next {
        opacity: 0.84;
      }
      .growth-journey-detail__rhythm {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 0;
        margin: 0 0 12px;
        min-height: 12px;
      }
      .growth-journey-detail__mark {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .growth-journey-detail__mark + .growth-journey-detail__mark::before {
        content: "·";
        margin: 0 6px;
        color: rgba(44, 31, 20, 0.35);
      }
      .growth-journey-detail__day {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(44, 31, 20, 0.55);
      }
      .growth-journey-detail__paused,
      .growth-journey-detail__returned {
        font-size: 11px;
        line-height: 1.2;
        color: rgba(44, 31, 20, 0.62);
      }
      .growth-journey-detail__close {
        appearance: none;
        border: 0;
        background: transparent;
        padding: 0;
        font: inherit;
        font-size: 0.86rem;
        color: rgba(44, 31, 20, 0.72);
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
}
