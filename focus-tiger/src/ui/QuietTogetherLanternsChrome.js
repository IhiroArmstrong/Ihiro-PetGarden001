/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle / Arrive background lanterns — pointer-events none.
 * Hidden while Focusing. Honest blank when count is 0 or cloud is down.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  QUIET_TOGETHER_PREF_EVENT,
  isQuietTogetherEnabled
} from '../core/quietTogetherPreference.js';
import {
  QUIET_TOGETHER_SITTING_EVENT,
  getLanternSittingSnapshot,
  isLanternPresenceClientEnabled
} from '../core/quietTogetherPresence.js';

const STYLE_ID = 'quiet-together-lanterns-chrome-v1';
const MAX_DOTS = 8;

export class QuietTogetherLanternsChrome {
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
    this._focusing = false;
    this._visibleAllowed = true;
    this._sitting = null;

    this.root = document.createElement('div');
    this.root.id = 'quiet-together-lanterns';
    this.root.className = 'quiet-together-lanterns';
    this.root.hidden = true;
    this.root.dataset.testid = 'quiet-together-lanterns';
    this.root.setAttribute('aria-live', 'polite');

    this.dots = document.createElement('div');
    this.dots.className = 'quiet-together-lanterns__dots';
    this.caption = document.createElement('p');
    this.caption.className = 'quiet-together-lanterns__caption';

    this.root.append(this.dots, this.caption);
    mountRoot.appendChild(this.root);
    this._injectStyles();

    this._unsubLocale = onLocaleChange(() => this.refresh());
    this._onPref = () => this.refresh();
    this._onSitting = (event) => {
      const sitting = event?.detail?.sitting;
      if (typeof sitting === 'number') this.setSitting(sitting);
      else this.refresh();
    };
    globalThis.addEventListener?.(QUIET_TOGETHER_PREF_EVENT, this._onPref);
    globalThis.addEventListener?.(QUIET_TOGETHER_SITTING_EVENT, this._onSitting);

    this.refresh();
  }

  /**
   * @param {boolean} visible
   */
  setVisible(visible) {
    this._visibleAllowed = Boolean(visible);
    this.refresh();
  }

  /**
   * First cut does not draw inside Focusing.
   * @param {boolean} focusing
   */
  setFocusing(focusing) {
    this._focusing = Boolean(focusing);
    this.root.classList.toggle('is-focusing', this._focusing);
    this.refresh();
  }

  /**
   * @param {number | null} sitting
   */
  setSitting(sitting) {
    const next =
      sitting == null || !Number.isFinite(sitting)
        ? null
        : Math.max(0, Math.floor(sitting));
    if (next === this._sitting) return;
    this._sitting = next;
    this.refresh();
  }

  refresh() {
    const enabled =
      isQuietTogetherEnabled(this._storage) &&
      isLanternPresenceClientEnabled({
        storage: this._storage,
        search:
          typeof globalThis.location?.search === 'string'
            ? globalThis.location.search
            : ''
      });
    const sitting =
      this._sitting == null ? getLanternSittingSnapshot() : this._sitting;
    const show =
      this._visibleAllowed &&
      enabled &&
      !this._focusing &&
      sitting != null &&
      sitting > 0;

    this.root.hidden = !show;
    this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (!show) {
      this.caption.textContent = '';
      this.dots.replaceChildren();
      return;
    }

    const n = Math.min(sitting, MAX_DOTS);
    if (this.dots.childElementCount !== n) {
      this.dots.replaceChildren();
      for (let i = 0; i < n; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'quiet-together-lanterns__dot';
        this.dots.appendChild(dot);
      }
    }
    this.caption.textContent =
      sitting === 1
        ? t('QUIET_TOGETHER_LANTERNS_ONE')
        : t('QUIET_TOGETHER_LANTERNS_MANY').replace('{n}', String(sitting));
    this.root.setAttribute(
      'aria-label',
      sitting === 1
        ? t('QUIET_TOGETHER_LANTERNS_ARIA_ONE')
        : t('QUIET_TOGETHER_LANTERNS_ARIA_MANY').replace('{n}', String(sitting))
    );
  }

  destroy() {
    this._unsubLocale?.();
    globalThis.removeEventListener?.(QUIET_TOGETHER_PREF_EVENT, this._onPref);
    globalThis.removeEventListener?.(QUIET_TOGETHER_SITTING_EVENT, this._onSitting);
    this.root.remove();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .quiet-together-lanterns {
        position: fixed;
        left: 18px;
        bottom: 22%;
        z-index: 2;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        max-width: 42vw;
        opacity: 0.82;
        transition: opacity 280ms ease;
      }
      .quiet-together-lanterns.is-focusing,
      .quiet-together-lanterns[hidden] {
        opacity: 0;
      }
      .quiet-together-lanterns__dots {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .quiet-together-lanterns__dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #ffe9b8, #d4a24a 70%);
        box-shadow: 0 0 8px rgba(232, 196, 110, 0.55);
      }
      .quiet-together-lanterns__caption {
        margin: 0;
        font-size: 11px;
        letter-spacing: 0.02em;
        color: rgba(236, 228, 208, 0.72);
        text-shadow: 0 1px 2px rgba(20, 16, 10, 0.45);
      }
      @media (max-width: 430px) {
        .quiet-together-lanterns {
          left: 12px;
          bottom: 28%;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
