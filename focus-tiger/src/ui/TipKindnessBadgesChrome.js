/**
 * Idle chrome: practice / kindness / Sanctuary badges beside Yin.
 * Display-only; Ambient / emotion must not read tip for unlocks.
 * Priority: Sanctuary prestigious (if unlocked) → else tip/free yin badges.
 * Click a badge → download the full-res PNG.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  syncTipBadgesFromPractice,
  readTipStatus
} from '../core/tipJarGate.js';
import {
  getTipKindnessBadgeById,
  tipKindnessBadgeSrc
} from '../core/tipKindnessBadges.js';
import {
  isSanctuaryUnlocked,
  syncSanctuaryBadgesFromPractice,
  readSanctuaryEntitlement
} from '../core/sanctuaryEntitlementGate.js';
import {
  getSanctuaryBadgeById,
  sanctuaryBadgeSrc
} from '../core/sanctuaryBadges.js';

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
    const sanctuaryOn = isSanctuaryUnlocked({ storage: this._storage });
    if (sanctuaryOn) {
      syncSanctuaryBadgesFromPractice(this._storage);
    } else {
      syncTipBadgesFromPractice(this._storage);
    }

    /** @type {{ kind: 'sanctuary' | 'tip', ids: string[] }} */
    let pack;
    if (sanctuaryOn) {
      pack = {
        kind: 'sanctuary',
        ids: readSanctuaryEntitlement(this._storage).badgeIds
      };
      this.labelEl.textContent = t('SANCTUARY_BADGES_BESIDE_LABEL');
      this.hintEl.textContent = t('SANCTUARY_BADGES_DOWNLOAD_HINT');
      this.root.dataset.badgeKind = 'sanctuary';
    } else {
      const status = readTipStatus(this._storage);
      pack = { kind: 'tip', ids: status.badgeIds };
      this.labelEl.textContent = status.tipped
        ? t('TIP_BADGES_BESIDE_LABEL')
        : t('PRACTICE_BADGES_BESIDE_LABEL');
      this.hintEl.textContent = t('TIP_BADGES_DOWNLOAD_HINT');
      this.root.dataset.badgeKind = status.tipped ? 'tip' : 'practice';
    }

    this.row.replaceChildren();
    for (const id of pack.ids) {
      const meta =
        pack.kind === 'sanctuary'
          ? getSanctuaryBadgeById(id)
          : getTipKindnessBadgeById(id);
      if (!meta) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yin-tip-kindness-badges__btn';
      btn.dataset.badgeId = id;
      btn.dataset.testid = `yin-tip-badge-${id}`;
      btn.title =
        pack.kind === 'sanctuary'
          ? t('SANCTUARY_BADGES_DOWNLOAD_ONE')
          : t('TIP_BADGES_DOWNLOAD_ONE');
      btn.setAttribute('aria-label', btn.title);

      const img = document.createElement('img');
      img.className = 'yin-tip-kindness-badges__img';
      img.src =
        pack.kind === 'sanctuary'
          ? sanctuaryBadgeSrc(meta.file)
          : tipKindnessBadgeSrc(meta.file);
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;

      btn.appendChild(img);
      const file = meta.file;
      const kind = pack.kind;
      btn.addEventListener('click', () => {
        this._download(file, kind);
      });
      this.row.appendChild(btn);
    }

    const show =
      this._visibleAllowed && pack.ids.length > 0;
    this.root.hidden = !show;
  }

  /**
   * @param {string} file
   * @param {'sanctuary' | 'tip'} kind
   */
  _download(file, kind) {
    const a = document.createElement('a');
    a.href =
      kind === 'sanctuary'
        ? sanctuaryBadgeSrc(file)
        : tipKindnessBadgeSrc(file);
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
