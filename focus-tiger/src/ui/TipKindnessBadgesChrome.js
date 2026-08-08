/**
 * Idle chrome: kindness badges beside Yin after Buy Yin a Tea.
 * Display-only; Ambient / emotion must not read tip for unlocks.
 * Click a badge → download the full-res PNG.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  ensureTipBadgesAwarded,
  hasTipped,
  readTipStatus
} from '../core/tipJarGate.js';
import {
  getTipKindnessBadgeById,
  tipKindnessBadgeSrc
} from '../core/tipKindnessBadges.js';

const STYLE_ID = 'yin-tip-kindness-badges-chrome-v1';

export class TipKindnessBadgesChrome {
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
    this._visibleAllowed = true;

    this.root = document.createElement('div');
    this.root.id = 'yin-tip-kindness-badges';
    this.root.className = 'yin-tip-kindness-badges';
    this.root.hidden = true;
    this.root.dataset.testid = 'yin-tip-kindness-badges';
    this.root.setAttribute('role', 'group');

    this.labelEl = document.createElement('p');
    this.labelEl.className = 'yin-tip-kindness-badges__label';

    this.row = document.createElement('div');
    this.row.className = 'yin-tip-kindness-badges__row';

    this.hintEl = document.createElement('p');
    this.hintEl.className = 'yin-tip-kindness-badges__hint';

    this.root.append(this.labelEl, this.row, this.hintEl);
    mountRoot.appendChild(this.root);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this.refresh());
    this.refresh();
  }

  /**
   * Idle chrome may hide during Focusing / overlays.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this._visibleAllowed = Boolean(visible);
    this.refresh();
  }

  refresh() {
    ensureTipBadgesAwarded(this._storage);
    const tipped = hasTipped({ storage: this._storage });
    const status = readTipStatus(this._storage);
    const ids = tipped ? status.badgeIds : [];

    this.labelEl.textContent = t('TIP_BADGES_BESIDE_LABEL');
    this.hintEl.textContent = t('TIP_BADGES_DOWNLOAD_HINT');

    this.row.replaceChildren();
    for (const id of ids) {
      const meta = getTipKindnessBadgeById(id);
      if (!meta) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yin-tip-kindness-badges__btn';
      btn.dataset.badgeId = id;
      btn.dataset.testid = `yin-tip-badge-${id}`;
      btn.title = t('TIP_BADGES_DOWNLOAD_ONE');
      btn.setAttribute('aria-label', t('TIP_BADGES_DOWNLOAD_ONE'));

      const img = document.createElement('img');
      img.className = 'yin-tip-kindness-badges__img';
      img.src = tipKindnessBadgeSrc(meta.file);
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;

      btn.appendChild(img);
      btn.addEventListener('click', () => {
        this._download(meta.file);
      });
      this.row.appendChild(btn);
    }

    const show =
      this._visibleAllowed && tipped && ids.length > 0;
    this.root.hidden = !show;
  }

  /**
   * @param {string} file
   */
  _download(file) {
    const a = document.createElement('a');
    a.href = tipKindnessBadgeSrc(file);
    a.download = file;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  destroy() {
    this._unsubLocale?.();
    this.root.remove();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-tip-kindness-badges {
        position: fixed;
        z-index: 11;
        left: max(10px, env(safe-area-inset-left, 0px));
        bottom: max(96px, calc(18vh + env(safe-area-inset-bottom, 0px)));
        max-width: min(220px, 42vw);
        padding: 8px 10px;
        border-radius: 14px;
        border: 1px solid rgba(139, 115, 85, 0.18);
        background: rgba(255, 252, 245, 0.42);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 4px 14px rgba(44, 31, 20, 0.08);
        pointer-events: auto;
        color: #4a3426;
      }
      .yin-tip-kindness-badges__label {
        margin: 0 0 6px;
        font-size: 11px;
        font-weight: 650;
        letter-spacing: 0.02em;
        color: rgba(92, 72, 52, 0.82);
      }
      .yin-tip-kindness-badges__row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .yin-tip-kindness-badges__btn {
        appearance: none;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        line-height: 0;
      }
      .yin-tip-kindness-badges__btn:hover {
        transform: scale(1.06);
      }
      .yin-tip-kindness-badges__img {
        width: 40px;
        height: 40px;
        object-fit: contain;
        border-radius: 50%;
        display: block;
        background: rgba(255, 252, 245, 0.55);
        box-shadow: 0 1px 0 rgba(255,255,255,.5) inset;
      }
      .yin-tip-kindness-badges__hint {
        margin: 6px 0 0;
        font-size: 10px;
        line-height: 1.35;
        color: rgba(92, 72, 52, 0.65);
      }
      @media (max-width: 479px) {
        .yin-tip-kindness-badges {
          max-width: min(160px, 46vw);
          bottom: max(88px, calc(16vh + env(safe-area-inset-bottom, 0px)));
          padding: 6px 8px;
        }
        .yin-tip-kindness-badges__img {
          width: 32px;
          height: 32px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
