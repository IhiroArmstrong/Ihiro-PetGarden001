/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Five Moments Compass card — ⋯ / drawer + first-run +「?」次要链.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  FIVE_MOMENT_IDS,
  FIVE_MOMENT_LABEL_KEYS,
  markFiveMomentsCompassSeen
} from '../core/fiveMomentsCompassGate.js';
import { SELECTABLE_OFFICIAL_SITTING_TEMPLATE_IDS } from '../core/ritualRecipe/officialSittingTemplateSelection.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
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
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'five-moments-compass-styles-v4';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

/** @type {Readonly<Record<string, string>>} */
const SITTING_TEMPLATE_LABEL_KEYS = Object.freeze({
  'official.default': 'RITUAL_SITTING_TEMPLATE_DEFAULT',
  'official.deep': 'RITUAL_SITTING_TEMPLATE_DEEP',
  'official.adhd': 'RITUAL_SITTING_TEMPLATE_ADHD',
  'official.evening': 'RITUAL_SITTING_TEMPLATE_EVENING'
});

export class FiveMomentsCompassUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(momentId: string) => void} [handlers.onMomentSelect]
   * @param {(templateId: string) => void} [handlers.onSittingTemplateSelect]
   * @param {() => string | null} [handlers.getActiveSittingTemplateId]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;
    /** @type {boolean} */
    this._firstRun = false;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'five-moments-compass-backdrop',
      testId: 'five-moments-compass-backdrop',
      zIndex: Z.OVERLAY_DIM,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this._dismiss(this._firstRun)
    });

    this.root = document.createElement('div');
    this.root.id = 'five-moments-compass';
    this.root.className = 'five-moments-compass';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'five-moments-compass-title');
    this.root.dataset.testid = 'five-moments-compass';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'five-moments-compass-title';
    this.titleEl.className = 'five-moments-compass__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'five-moments-compass__blurb';

    this.chainEl = document.createElement('ol');
    this.chainEl.className = 'five-moments-compass__chain';
    this.chainEl.setAttribute('aria-label', 'Five moments');

    this.sittingTemplatesSection = document.createElement('div');
    this.sittingTemplatesSection.className =
      'five-moments-compass__sitting-templates';
    this.sittingTemplatesSection.dataset.testid =
      'five-moments-sitting-templates';
    this.sittingTemplatesLegend = document.createElement('p');
    this.sittingTemplatesLegend.className =
      'five-moments-compass__sitting-templates-label';
    this.sittingTemplatesList = document.createElement('div');
    this.sittingTemplatesList.className =
      'five-moments-compass__sitting-templates-list';
    this.sittingTemplatesList.setAttribute('role', 'listbox');
    this.sittingTemplatesSection.append(
      this.sittingTemplatesLegend,
      this.sittingTemplatesList
    );

    this.actions = document.createElement('div');
    this.actions.className = 'five-moments-compass__actions';

    this.skipBtn = document.createElement('button');
    this.skipBtn.type = 'button';
    this.skipBtn.className =
      'five-moments-compass__btn five-moments-compass__btn--ghost';
    this.skipBtn.dataset.testid = 'five-moments-compass-skip';
    this.skipBtn.addEventListener('click', () => this._dismiss(true));

    this.primaryBtn = document.createElement('button');
    this.primaryBtn.type = 'button';
    this.primaryBtn.className =
      'five-moments-compass__btn five-moments-compass__btn--primary';
    this.primaryBtn.dataset.testid = 'five-moments-compass-got-it';
    this.primaryBtn.addEventListener('click', () => this._dismiss(true));

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'five-moments-compass__btn five-moments-compass__btn--ghost';
    this.closeBtn.dataset.testid = 'five-moments-compass-close';
    this.closeBtn.addEventListener('click', () => this._dismiss(false));

    this.actions.append(this.skipBtn, this.primaryBtn, this.closeBtn);
    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.chainEl,
      this.sittingTemplatesSection,
      this.actions
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this._dismiss(this._firstRun);
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onDocPointer = (event) => {
      if (!this._open) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      this._dismiss(this._firstRun);
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

  refreshSittingTemplates() {
    this._refreshSittingTemplates();
  }

  /**
   * @param {{ firstRun?: boolean, markSeenOnOpen?: boolean }} [opts]
   */
  open(opts = {}) {
    const firstRun = Boolean(opts.firstRun);
    if (this._open) {
      this._firstRun = firstRun;
      this._syncActionVisibility();
      this._refreshTexts();
      this._refreshSittingTemplates();
      return;
    }
    this._firstRun = firstRun;
    if (opts.markSeenOnOpen) {
      markFiveMomentsCompassSeen(this._storage);
    }
    this._open = true;
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._syncActionVisibility();
    this._refreshTexts();
    this._refreshSittingTemplates();
    const focusBtn = firstRun ? this.primaryBtn : this.closeBtn;
    focusBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    this._dismiss(false);
  }

  /**
   * @param {boolean} markSeen
   */
  _dismiss(markSeen) {
    if (!this._open) return;
    if (markSeen || this._firstRun) {
      markFiveMomentsCompassSeen(this._storage);
    }
    this._open = false;
    this._firstRun = false;
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
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this.backdrop.remove();
    this.root.remove();
  }

  _syncActionVisibility() {
    const first = this._firstRun;
    this.skipBtn.hidden = !first;
    this.primaryBtn.hidden = !first;
    this.closeBtn.hidden = first;
  }

  _refreshTexts() {
    this.titleEl.textContent = t('FIVE_MOMENTS_CARD_TITLE');
    this.blurbEl.textContent = t('FIVE_MOMENTS_CARD_BLURB');
    this.skipBtn.textContent = t('FIVE_MOMENTS_SKIP');
    this.primaryBtn.textContent = t('FIVE_MOMENTS_GOT_IT');
    this.closeBtn.textContent = t('FIVE_MOMENTS_CLOSE');
    this.chainEl.setAttribute('aria-label', t('FIVE_MOMENTS_MENU_LABEL'));
    this.chainEl.innerHTML = '';
    const canJump = typeof this.handlers.onMomentSelect === 'function';
    for (const id of FIVE_MOMENT_IDS) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'five-moments-compass__moment';
      btn.dataset.moment = id;
      btn.dataset.testid = `five-moments-${id}`;
      btn.textContent = t(FIVE_MOMENT_LABEL_KEYS[id]);
      btn.disabled = !canJump;
      btn.addEventListener('click', () => {
        this.handlers.onMomentSelect?.(id);
      });
      li.appendChild(btn);
      this.chainEl.appendChild(li);
    }
    this._refreshSittingTemplates();
  }

  _refreshSittingTemplates() {
    const canSelect =
      !this._firstRun &&
      typeof this.handlers.onSittingTemplateSelect === 'function';
    this.sittingTemplatesSection.hidden = !canSelect;
    if (!canSelect) return;

    this.sittingTemplatesLegend.textContent = t('RITUAL_SITTING_STYLE_LABEL');
    const activeId = this.handlers.getActiveSittingTemplateId?.() ?? null;
    this.sittingTemplatesList.innerHTML = '';

    for (const templateId of SELECTABLE_OFFICIAL_SITTING_TEMPLATE_IDS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'five-moments-compass__sitting-template';
      btn.dataset.templateId = templateId;
      btn.dataset.testid = `sitting-template-${templateId.replace(/\./g, '-')}`;
      btn.setAttribute('role', 'option');
      btn.setAttribute(
        'aria-selected',
        activeId === templateId ? 'true' : 'false'
      );
      if (activeId === templateId) {
        btn.classList.add('is-selected');
      }
      const labelKey = SITTING_TEMPLATE_LABEL_KEYS[templateId];
      btn.textContent = labelKey ? t(labelKey) : templateId;
      btn.addEventListener('click', () => {
        if (activeId === templateId) return;
        this.handlers.onSittingTemplateSelect?.(templateId);
        this._refreshSittingTemplates();
      });
      this.sittingTemplatesList.appendChild(btn);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    document.getElementById('five-moments-compass-styles-v1')?.remove();
    document.getElementById('five-moments-compass-styles-v2')?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .five-moments-compass {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: ${Z.GLASS_CARD};
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
      .five-moments-compass.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .five-moments-compass__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .five-moments-compass__blurb {
        margin: 0 0 14px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
        white-space: pre-line;
      }
      .five-moments-compass__chain {
        list-style: none;
        margin: 0 0 16px;
        padding: 0;
        display: flex;
        flex-wrap: nowrap;
        gap: 4px;
        justify-content: space-between;
        overflow-x: auto;
      }
      .five-moments-compass__chain li {
        margin: 0;
        flex: 1 1 0;
        min-width: 0;
      }
      .five-moments-compass__moment {
        display: block;
        width: 100%;
        margin: 0;
        padding: 5px 4px;
        font: inherit;
        font-size: 0.72rem;
        letter-spacing: 0.01em;
        white-space: nowrap;
        border-radius: 999px;
        background: ${GLASS_FILL_STRONG};
        border: ${GLASS_BORDER};
        color: inherit;
        cursor: pointer;
        transition: transform 120ms ease;
      }
      .five-moments-compass__moment:active:not(:disabled) {
        transform: scale(0.97);
      }
      .five-moments-compass__moment:disabled {
        cursor: default;
        opacity: 0.85;
      }
      .five-moments-compass__sitting-templates {
        margin: 0 0 14px;
      }
      .five-moments-compass__sitting-templates[hidden] {
        display: none !important;
      }
      .five-moments-compass__sitting-templates-label {
        margin: 0 0 8px;
        font-size: 0.82rem;
        font-weight: 600;
        opacity: 0.9;
      }
      .five-moments-compass__sitting-templates-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .five-moments-compass__sitting-template {
        display: block;
        width: 100%;
        margin: 0;
        padding: 8px 10px;
        text-align: left;
        font: inherit;
        font-size: 0.84rem;
        border-radius: 12px;
        background: ${GLASS_FILL_STRONG};
        border: ${GLASS_BORDER};
        color: inherit;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease;
      }
      .five-moments-compass__sitting-template.is-selected {
        box-shadow: inset 0 0 0 1.5px rgba(196, 165, 116, 0.85);
      }
      .five-moments-compass__sitting-template:active {
        transform: scale(0.98);
      }
      .five-moments-compass__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
      }
      .five-moments-compass__btn {
        appearance: none;
        border: none;
        cursor: pointer;
        font: inherit;
        font-size: 0.88rem;
        padding: 8px 14px;
        border-radius: 999px;
        transition: transform 120ms ease;
      }
      .five-moments-compass__btn:active {
        transform: translateY(1px) scale(0.98);
      }
      .five-moments-compass__btn--primary {
        background: #c4a574;
        color: #2c1f14;
      }
      .five-moments-compass__btn--ghost {
        background: transparent;
        color: #2c1f14;
        border: ${GLASS_BORDER};
      }
      .five-moments-compass__btn[hidden] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}
