/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle micro-entry for Transition Moment — faint arc icon near heatmap cluster.
 */

import { t, onLocaleChange } from '../locales/i18n.js';

const STYLE_ID = 'transition-moment-trigger-styles-v1';
const ROOT_ID = 'transition-moment-trigger';

/**
 * @param {HTMLElement | null} mountRoot
 * @param {object} [handlers]
 * @param {() => boolean} [handlers.canShow]
 * @param {() => void} [handlers.onActivate]
 */
export class TransitionMomentTriggerUI {
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;

    this.btn = document.createElement('button');
    this.btn.type = 'button';
    this.btn.id = ROOT_ID;
    this.btn.className = 'transition-moment-trigger';
    this.btn.hidden = true;
    this.btn.dataset.testid = ROOT_ID;
    this.btn.setAttribute('aria-haspopup', 'dialog');
    this.btn.setAttribute('aria-controls', 'transition-moment-overlay');

    this.icon = document.createElement('span');
    this.icon.className = 'transition-moment-trigger__icon';
    this.icon.setAttribute('aria-hidden', 'true');
    this.btn.appendChild(this.icon);

    this.tipEl = document.createElement('span');
    this.tipEl.className = 'transition-moment-trigger__tip';
    this.tipEl.setAttribute('role', 'tooltip');
    this.btn.appendChild(this.tipEl);

    this._injectStyles();
    this._refreshLabel();
    this._unsubLocale = onLocaleChange(() => this._refreshLabel());

    this.btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (this.handlers.canShow && !this.handlers.canShow()) {
        this.sync();
        return;
      }
      this.handlers.onActivate?.();
    });

    (mountRoot || document.body).appendChild(this.btn);
  }

  /** @returns {void} */
  _refreshLabel() {
    const label = t('TRANSITION_MOMENT_TRIGGER_LABEL');
    this.btn.setAttribute('aria-label', label);
    this.tipEl.textContent = label;
  }

  /** @returns {void} */
  sync() {
    const show = this.handlers.canShow ? this.handlers.canShow() === true : false;
    this.btn.hidden = !show;
    this.btn.disabled = !show;
  }

  destroy() {
    this._unsubLocale?.();
    this.btn.remove();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .transition-moment-trigger {
        position: absolute;
        left: calc(16px + 168px);
        bottom: calc(36px + 88px + 28px);
        z-index: 12;
        width: 36px;
        height: 36px;
        margin: 0;
        padding: 0;
        border: 1px solid rgba(139, 115, 85, 0.14);
        border-radius: 50%;
        background: rgba(255, 252, 245, 0.52);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: rgba(90, 72, 52, 0.72);
        cursor: pointer;
        opacity: 0.72;
        transition: opacity 160ms ease, transform 120ms ease, box-shadow 160ms ease;
        pointer-events: auto;
        box-shadow: 0 2px 10px rgba(44, 31, 20, 0.05);
      }
      .transition-moment-trigger:hover,
      .transition-moment-trigger:focus-visible {
        opacity: 1;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(44, 31, 20, 0.08);
      }
      .transition-moment-trigger:focus-visible {
        outline: 2px solid rgba(196, 165, 116, 0.55);
        outline-offset: 2px;
      }
      .transition-moment-trigger__icon {
        display: block;
        width: 18px;
        height: 18px;
        margin: 9px auto;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        opacity: 0.85;
      }
      .transition-moment-trigger__tip {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 8px);
        transform: translateX(-50%);
        padding: 4px 10px;
        border-radius: 8px;
        background: rgba(44, 31, 20, 0.82);
        color: #fff9f0;
        font-size: 0.72rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 140ms ease;
      }
      .transition-moment-trigger:hover .transition-moment-trigger__tip,
      .transition-moment-trigger:focus-visible .transition-moment-trigger__tip {
        opacity: 1;
      }
      @media (max-width: 479px) {
        .transition-moment-trigger {
          top: calc(12px + 72px + 10px);
          left: calc(12px + 148px);
          bottom: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
