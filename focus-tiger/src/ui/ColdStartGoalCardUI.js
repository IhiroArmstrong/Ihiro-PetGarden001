/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Cold-start goal card — 1 question, 4 options, first-run only.
 * Brief: docs/task-briefs/task-cold-start-goal-onboarding.md
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  COLD_START_GOAL_CHOICES,
  markColdStartGoalSeen,
  setColdStartGoalSessionChoice
} from '../core/coldStartGoalGate.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';

const STYLE_ID = 'cold-start-goal-card-styles-v1';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

const CHOICE_LABEL_KEYS = Object.freeze({
  focus: 'COLD_START_GOAL_FOCUS',
  calm: 'COLD_START_GOAL_CALM',
  'study-work': 'COLD_START_GOAL_STUDY',
  browse: 'COLD_START_GOAL_BROWSE'
});

export class ColdStartGoalCardUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {(choice: string) => void} [handlers.onChoice]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {Storage | null} [handlers.storage]
   * @param {Storage | null} [handlers.sessionStorage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._sessionStorage =
      handlers.sessionStorage ??
      (typeof sessionStorage !== 'undefined' ? sessionStorage : null);
    this._open = false;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'cold-start-goal-backdrop',
      testId: 'cold-start-goal-backdrop',
      zIndex: 17,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this._dismissWithChoice('browse')
    });

    this.root = document.createElement('div');
    this.root.id = 'cold-start-goal-card';
    this.root.className = 'cold-start-goal-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'cold-start-goal-title');
    this.root.dataset.testid = 'cold-start-goal-card';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'cold-start-goal-title';
    this.titleEl.className = 'cold-start-goal-card__title';

    this.optionsEl = document.createElement('div');
    this.optionsEl.className = 'cold-start-goal-card__options';
    this.optionsEl.setAttribute('role', 'listbox');
    this.optionsEl.setAttribute(
      'aria-label',
      t('COLD_START_GOAL_OPTIONS_ARIA')
    );

    this.root.append(this.titleEl, this.optionsEl);
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this._dismissWithChoice('browse');
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onDocPointer = (event) => {
      if (!this._open) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      this._dismissWithChoice('browse');
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

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
    const firstBtn = this.optionsEl.querySelector('button');
    firstBtn?.focus({ preventScroll: true });
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

  /**
   * @param {string} choice
   */
  _dismissWithChoice(choice) {
    if (!this._open) return;
    markColdStartGoalSeen(this._storage);
    setColdStartGoalSessionChoice(this._sessionStorage, choice);
    this.close();
    this.handlers.onChoice?.(choice);
  }

  destroy() {
    this._unsubLocale?.();
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this.backdrop.remove();
    this.root.remove();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('COLD_START_GOAL_TITLE');
    this.optionsEl.setAttribute('aria-label', t('COLD_START_GOAL_OPTIONS_ARIA'));
    this.optionsEl.innerHTML = '';
    const canChoose = typeof this.handlers.onChoice === 'function';
    for (const id of COLD_START_GOAL_CHOICES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cold-start-goal-card__option';
      btn.dataset.choice = id;
      btn.dataset.testid = `cold-start-goal-${id}`;
      btn.setAttribute('role', 'option');
      btn.textContent = t(CHOICE_LABEL_KEYS[id]);
      btn.disabled = !canChoose;
      btn.addEventListener('click', () => this._dismissWithChoice(id));
      this.optionsEl.appendChild(btn);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cold-start-goal-card {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(400px, calc(100vw - 32px));
        max-height: min(70vh, 520px);
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
      .cold-start-goal-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .cold-start-goal-card__title {
        margin: 0 0 14px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        line-height: 1.35;
      }
      .cold-start-goal-card__options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cold-start-goal-card__option {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid rgba(44, 31, 20, 0.14);
        border-radius: 12px;
        background: rgba(255, 252, 246, 0.72);
        color: inherit;
        font: inherit;
        font-size: 0.95rem;
        text-align: left;
        cursor: pointer;
        transition: background 140ms ease, border-color 140ms ease;
      }
      .cold-start-goal-card__option:hover:not(:disabled),
      .cold-start-goal-card__option:focus-visible {
        background: rgba(255, 252, 246, 0.95);
        border-color: rgba(44, 31, 20, 0.28);
        outline: none;
      }
      .cold-start-goal-card__option:disabled {
        opacity: 0.55;
        cursor: default;
      }
    `;
    document.head.appendChild(style);
  }
}
