/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Non-modal portrait hint. Does not cover Sit / ? / Sound.
 * z-index 16 — under menus and the help chip (Z_INDEX.md).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  readLandscapeSuggestDismissed,
  shouldShowLandscapeSuggest,
  writeLandscapeSuggestDismissed
} from '../core/landscapeSuggestGate.js';

export class LandscapeSuggestUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {{ storage?: Storage | null }} [opts]
   */
  constructor(mountRoot, opts = {}) {
    this._storage = opts.storage ?? null;
    this.root = document.createElement('div');
    this.root.id = 'ft-landscape-suggest';
    this.root.className = 'ft-landscape-suggest';
    this.root.hidden = true;
    this.root.dataset.testid = 'landscape-suggest';

    this.body = document.createElement('p');
    this.body.className = 'ft-landscape-suggest__body';

    this.dismissBtn = document.createElement('button');
    this.dismissBtn.type = 'button';
    this.dismissBtn.className = 'ft-landscape-suggest__dismiss';
    this.dismissBtn.dataset.testid = 'landscape-suggest-dismiss';
    this.dismissBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      writeLandscapeSuggestDismissed(this._storage);
      this.root.hidden = true;
      this.root.setAttribute('aria-hidden', 'true');
    });

    this.root.append(this.body, this.dismissBtn);
    mountRoot.appendChild(this.root);
    this._unsub = onLocaleChange(() => this._refreshCopy());
    this._injectStyles();
    this._refreshCopy();
  }

  /**
   * @param {{ narrow: boolean, portrait: boolean }} media
   */
  sync(media) {
    const show = shouldShowLandscapeSuggest({
      narrow: media.narrow,
      portrait: media.portrait,
      dismissed: readLandscapeSuggestDismissed(this._storage)
    });
    this.root.hidden = !show;
    this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) this._refreshCopy();
  }

  destroy() {
    this._unsub?.();
    this.root.remove();
  }

  _refreshCopy() {
    this.body.textContent = t('HINT_LANDSCAPE_SUGGEST_BODY');
    this.dismissBtn.textContent = t('HINT_LANDSCAPE_SUGGEST_DISMISS');
  }

  _injectStyles() {
    if (document.getElementById('ft-landscape-suggest-styles')) return;
    const style = document.createElement('style');
    style.id = 'ft-landscape-suggest-styles';
    style.textContent = `
      .ft-landscape-suggest {
        position: fixed;
        top: 64px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 16;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: min(92vw, 420px);
        margin: 0;
        padding: 10px 12px;
        pointer-events: auto;
        background: #e8dfd2;
        color: #2c1f14;
        border-radius: 12px;
        box-shadow: 0 6px 18px rgba(44, 31, 20, 0.12);
      }
      .ft-landscape-suggest[hidden] { display: none; }
      .ft-landscape-suggest__body {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
      }
      .ft-landscape-suggest__dismiss {
        flex: none;
        border: 0;
        border-radius: 8px;
        padding: 6px 10px;
        background: #f7f1e8;
        color: inherit;
        cursor: pointer;
      }
      .ft-landscape-suggest__dismiss:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }
}
