/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Language preference panel — opened from ⋯ / narrow drawer (proxy: language)
 * or the wide Idle bottom-right globe FAB.
 * Only `ready` locales appear (审完再露).
 */

import { t, onLocaleChange, getLocale, setLocale } from '../locales/i18n.js';
import { listPickerLocales } from '../locales/localePreference.js';

const STYLE_ID = 'language-preference-styles-v5';

/** Base 44 → +50% (user: enlarge globe). */
const FAB_PX = Math.round(44 * 1.5);
const FAB_ICON_PX = Math.round(22 * 1.5);
/**
 * Wide Idle「?」lives in the heatmap cluster (40px), not the dock.
 * Cluster bottom = 36+88+20; pad-bottom = 8 — then center-align FAB with ?.
 * @see WeeklyPracticeHeatmap.js · OnboardingHintsUI `.weekly-practice-heatmap-cluster .onboarding-hint-help`
 */
const HELP_IN_CLUSTER_PX = 40;
const CLUSTER_BOTTOM_EXPR = '36px + 88px + 20px';
const CLUSTER_PAD_BOTTOM_PX = 8;

/** Popular “language / locale” affordance — globe with meridians (not a flag). */
const GLOBE_ICON = `<svg class="language-pref__fab-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 12h18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 3c2.4 2.8 3.6 5.7 3.6 9s-1.2 6.2-3.6 9c-2.4-2.8-3.6-5.7-3.6-9S9.6 5.8 12 3z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;

export class LanguagePreferenceUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onOpen]
   * @param {(locale: string) => void} [handlers.onLocaleChosen]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._expanded = false;
    this._fabVisible = false;

    this.fab = document.createElement('button');
    this.fab.type = 'button';
    this.fab.id = 'language-preference-fab';
    this.fab.className = 'language-pref__fab';
    this.fab.hidden = true;
    this.fab.innerHTML = GLOBE_ICON;
    this.fab.setAttribute('aria-haspopup', 'dialog');
    this.fab.setAttribute('aria-controls', 'language-preference-panel');
    this.fab.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._expanded) this.closePanel();
      else this.openPanel();
    });

    this.root = document.createElement('div');
    this.root.id = 'language-preference';
    this.root.className = 'language-pref';
    this.root.hidden = true;

    this.panel = document.createElement('div');
    this.panel.className = 'language-pref__panel';
    this.panel.id = 'language-preference-panel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-labelledby', 'language-preference-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'language-preference-title';
    this.titleEl.className = 'language-pref__title';

    this.listEl = document.createElement('div');
    this.listEl.className = 'language-pref__list';
    this.listEl.setAttribute('role', 'radiogroup');
    this.listEl.setAttribute('aria-labelledby', 'language-preference-title');

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'language-pref__close';
    this.closeBtn.id = 'language-preference-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.panel.append(this.titleEl, this.listEl, this.closeBtn);
    this.root.appendChild(this.panel);
    mountRoot.append(this.fab, this.root);

    this._onDocPointer = (event) => {
      if (!this._expanded) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target) || this.fab.contains(target)) return;
      this.closePanel();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._render());
    this._render();
  }

  openPanel() {
    this._expanded = true;
    this.root.hidden = false;
    this._render();
    this.handlers.onOpen?.();
  }

  closePanel() {
    if (!this._expanded) return;
    this._expanded = false;
    this.root.hidden = true;
    this._render();
    this.handlers.onClose?.();
  }

  isOpen() {
    return this._expanded;
  }

  /**
   * Wide Idle bottom-right globe — hide on Focusing / non-Idle.
   * Narrow (≤479) hides via CSS; Language stays in the drawer.
   * @param {boolean} visible
   */
  setFabVisible(visible) {
    const next = visible === true;
    if (this._fabVisible === next) {
      this.fab.hidden = !next;
      return;
    }
    this._fabVisible = next;
    this.fab.hidden = !next;
  }

  /**
   * True when the Idle globe is intended on-screen (wide only; CSS hides ≤479).
   * Used by onboarding mint sync — do not treat narrow drawer Language as FAB.
   */
  isFabVisible() {
    if (!this._fabVisible || this.fab.hidden) return false;
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(min-width: 480px)').matches;
    }
    return true;
  }

  destroy() {
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this._unsubLocale?.();
    this.fab.remove();
    this.root.remove();
  }

  _render() {
    this.titleEl.textContent = t('LANGUAGE_SETTING_TITLE');
    this.closeBtn.textContent = t('LANGUAGE_CLOSE');
    this.closeBtn.setAttribute('aria-label', t('LANGUAGE_CLOSE'));
    this.listEl.setAttribute('aria-label', t('LANGUAGE_SETTING_TITLE'));
    this.fab.setAttribute('aria-label', t('LANGUAGE_FAB_ARIA'));
    this.fab.setAttribute('aria-expanded', this._expanded ? 'true' : 'false');
    this.fab.classList.toggle('is-open', this._expanded);

    const current = getLocale();
    const options = listPickerLocales();
    this.listEl.innerHTML = '';

    for (const opt of options) {
      const label = document.createElement('label');
      label.className = 'language-pref__option';
      label.dataset.locale = opt.id;

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'ft-language-preference';
      input.value = opt.id;
      input.id = `language-preference-${opt.id}`;
      input.checked = opt.id === current;
      input.addEventListener('change', () => {
        if (!input.checked) return;
        setLocale(opt.id, { persist: true });
        this.handlers.onLocaleChosen?.(opt.id);
        this._render();
      });

      const span = document.createElement('span');
      span.className = 'language-pref__option-label';
      span.textContent = opt.nativeLabel;

      label.append(input, span);
      this.listEl.appendChild(label);
    }
  }

  _injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      .language-pref__fab {
        position: fixed;
        right: 16px;
        /* 与左下热力簇内「?」中心平齐（非三球带） */
        bottom: calc(
          ${CLUSTER_BOTTOM_EXPR} + ${CLUSTER_PAD_BOTTOM_PX}px +
            (${HELP_IN_CLUSTER_PX}px - ${FAB_PX}px) / 2
        );
        z-index: 16;
        width: ${FAB_PX}px;
        height: ${FAB_PX}px;
        padding: 0;
        border-radius: 50%;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.72);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: rgba(74, 58, 40, 0.82);
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.7) inset,
          0 2px 8px rgba(44, 31, 20, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.92;
        transition: transform 120ms ease, opacity 160ms ease, background 160ms ease, color 160ms ease;
        pointer-events: auto;
      }
      .language-pref__fab:hover {
        opacity: 1;
        color: rgba(74, 58, 40, 0.95);
        background: rgba(255, 252, 245, 0.88);
      }
      .language-pref__fab:active {
        transform: scale(0.96);
      }
      .language-pref__fab.is-open {
        opacity: 1;
        color: rgba(74, 58, 40, 0.92);
        background: rgba(255, 252, 245, 0.72);
        box-shadow: 0 2px 10px rgba(44, 31, 20, 0.08);
      }
      .language-pref__fab[hidden] {
        display: none !important;
      }
      .language-pref__fab-icon {
        width: ${FAB_ICON_PX}px;
        height: ${FAB_ICON_PX}px;
        display: block;
      }
      /* 窄屏底栏已挤；Language 仍在抽屉 / ⋯ */
      @media (max-width: 479px) {
        .language-pref__fab {
          display: none !important;
        }
      }
      .language-pref {
        position: fixed;
        right: 14px;
        left: auto;
        /* Above FAB (aligned with left ? cluster) + gap */
        bottom: calc(
          ${CLUSTER_BOTTOM_EXPR} + ${CLUSTER_PAD_BOTTOM_PX}px +
            (${HELP_IN_CLUSTER_PX}px - ${FAB_PX}px) / 2 + ${FAB_PX}px + 12px
        );
        transform: none;
        z-index: 18;
        width: min(92vw, 300px);
        pointer-events: auto;
      }
      @media (max-width: 479px) {
        .language-pref {
          left: 50%;
          right: auto;
          transform: translateX(-50%);
          width: min(92vw, 320px);
        }
      }
      .language-pref__panel {
        padding: 14px 16px 12px;
        border-radius: 18px;
        background: rgba(255, 252, 245, 0.62);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 4px 18px rgba(44, 31, 20, 0.06);
        border: 1px solid rgba(139, 115, 85, 0.14);
        color: #3a2a1c;
        font-family: Georgia, "Times New Roman", serif;
      }
      .language-pref__title {
        margin: 0 0 10px;
        font-size: 15px;
        font-weight: 600;
      }
      .language-pref__list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 10px;
      }
      .language-pref__option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.55);
        cursor: pointer;
        font-size: 15px;
      }
      .language-pref__option:has(input:checked) {
        outline: 2px solid rgba(180, 120, 60, 0.45);
        background: rgba(255, 252, 245, 0.78);
      }
      .language-pref__option input {
        margin: 0;
      }
      .language-pref__close {
        display: block;
        width: 100%;
        margin-top: 2px;
        padding: 8px 10px;
        border: none;
        border-radius: 10px;
        background: rgba(90, 70, 50, 0.1);
        color: #3a2a1c;
        font: inherit;
        font-size: 14px;
        cursor: pointer;
      }
    `;
  }
}
