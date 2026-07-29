/**
 * Language preference panel — opened from ⋯ / narrow drawer (proxy: language).
 * Only `ready` locales appear (审完再露).
 */

import { t, onLocaleChange, getLocale, setLocale } from '../locales/i18n.js';
import { listPickerLocales } from '../locales/localePreference.js';

const STYLE_ID = 'language-preference-styles';

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
    mountRoot.appendChild(this.root);

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
    this.handlers.onClose?.();
  }

  isOpen() {
    return this._expanded;
  }

  destroy() {
    this._unsubLocale?.();
    this.root.remove();
  }

  _render() {
    this.titleEl.textContent = t('LANGUAGE_SETTING_TITLE');
    this.closeBtn.textContent = t('LANGUAGE_CLOSE');
    this.closeBtn.setAttribute('aria-label', t('LANGUAGE_CLOSE'));
    this.listEl.setAttribute('aria-label', t('LANGUAGE_SETTING_TITLE'));

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
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .language-pref {
        position: fixed;
        left: 50%;
        bottom: max(96px, calc(env(safe-area-inset-bottom, 0px) + 88px));
        transform: translateX(-50%);
        z-index: 18;
        width: min(92vw, 320px);
        pointer-events: auto;
      }
      .language-pref__panel {
        padding: 14px 16px 12px;
        border-radius: 14px;
        background: rgba(255, 248, 240, 0.96);
        box-shadow: 0 10px 28px rgba(44, 31, 20, 0.18);
        border: 1px solid rgba(120, 90, 60, 0.18);
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
        background: rgba(255, 250, 240, 0.95);
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
    document.head.appendChild(style);
  }
}
