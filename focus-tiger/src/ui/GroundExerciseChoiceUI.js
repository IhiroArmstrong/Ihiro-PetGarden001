/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle menu → Ground exercise choice layer (Feel the Ground / Look Around).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';
import { RESET_ROUTES } from './resetPracticeRoutes.js';

/** @typedef {import('./resetPracticeRoutes.js').ResetRoute} ResetRoute */

const STYLE_ID = 'ground-exercise-choice-styles-v1';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

/** @type {readonly { route: ResetRoute, labelKey: string, emoji: string }[]} */
const CHOICES = Object.freeze([
  { route: RESET_ROUTES.GROUND, labelKey: 'GROUND_EXERCISE_FEEL_LABEL', emoji: '🪨' },
  { route: RESET_ROUTES.LOOK, labelKey: 'GROUND_EXERCISE_LOOK_LABEL', emoji: '👀' }
]);

export class GroundExerciseChoiceUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {(route: ResetRoute) => void} [handlers.onSelect]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'ground-exercise-choice-backdrop',
      testId: 'ground-exercise-choice-backdrop',
      zIndex: 17,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'ground-exercise-choice';
    this.root.className = 'ground-exercise-choice';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'ground-exercise-choice-title');
    this.root.dataset.testid = 'ground-exercise-choice';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'ground-exercise-choice-title';
    this.titleEl.className = 'ground-exercise-choice__title';

    this.actions = document.createElement('div');
    this.actions.className = 'ground-exercise-choice__actions';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'ground-exercise-choice__btn ground-exercise-choice__btn--ghost';
    this.closeBtn.dataset.testid = 'ground-exercise-choice-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions.appendChild(this.closeBtn);
    this.root.append(this.titleEl, this.actions);
    mountRoot.appendChild(this.root);

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

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) {
      this._refreshTexts();
      return;
    }
    this._open = true;
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refreshTexts();
    const firstChoice = this.actions.querySelector(
      '.ground-exercise-choice__btn--choice'
    );
    (firstChoice || this.closeBtn).focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    hideOverlayBackdrop(this.backdrop);
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  destroy() {
    this._unsubLocale?.();
    document.removeEventListener('keydown', this._onKeyDown);
    this.backdrop.remove();
    this.root.remove();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('GROUND_EXERCISE_MENU_LABEL');
    this.closeBtn.textContent = t('GROUND_EXERCISE_CLOSE');

    this.actions
      .querySelectorAll('.ground-exercise-choice__btn--choice')
      .forEach((btn) => btn.remove());

    const insertBefore = this.closeBtn;
    for (const choice of CHOICES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'ground-exercise-choice__btn ground-exercise-choice__btn--choice';
      btn.dataset.route = choice.route;
      btn.dataset.testid = `ground-exercise-${choice.route}`;
      btn.innerHTML = `<span class="ground-exercise-choice__emoji" aria-hidden="true">${choice.emoji}</span><span class="ground-exercise-choice__label">${t(choice.labelKey)}</span>`;
      btn.addEventListener('click', () => {
        this.handlers.onSelect?.(choice.route);
      });
      this.actions.insertBefore(btn, insertBefore);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ground-exercise-choice {
        position: fixed;
        left: 50%;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 18vh);
        transform: translateX(-50%) translateY(12px);
        width: min(92vw, 360px);
        z-index: 18;
        opacity: 0;
        pointer-events: none;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .ground-exercise-choice.is-visible {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0);
      }
      .ground-exercise-choice__title {
        margin: 0 0 12px;
        text-align: center;
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--ft-text-primary, #2c2418);
      }
      .ground-exercise-choice__actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL_STRONG};
        border: ${GLASS_BORDER};
        box-shadow: ${GLASS_SHADOW};
        backdrop-filter: ${GLASS_BLUR_CSS};
      }
      .ground-exercise-choice__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        min-height: 48px;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        cursor: pointer;
      }
      .ground-exercise-choice__btn--choice {
        background: rgba(255, 252, 245, 0.92);
        color: var(--ft-text-primary, #2c2418);
      }
      .ground-exercise-choice__btn--choice:active {
        transform: scale(0.98);
      }
      .ground-exercise-choice__btn--ghost {
        background: transparent;
        color: var(--ft-text-muted, #6b5f52);
      }
      .ground-exercise-choice__emoji {
        font-size: 1.2rem;
        line-height: 1;
      }
    `;
    document.head.appendChild(style);
  }
}
