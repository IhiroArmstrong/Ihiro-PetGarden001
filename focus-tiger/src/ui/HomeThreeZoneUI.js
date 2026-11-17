/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * H2 wide Idle three-zone skeleton: progress cluster under HUD, memories rail.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { shouldShowConfideEarChrome } from '../core/confide/confideUserVisibilityGate.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'ft-home-three-zone-styles-v1';
const ROOT_ID = 'ft-home-zone-memories';
const SLOT_ID = 'ft-home-memorabilia-slot';

const GROUP_ROWS = Object.freeze([
  {
    id: 'inspiration',
    group: 'MENU_GROUP_INSPIRATION',
    testId: 'ft-home-preview-inspiration'
  },
  {
    id: 'records',
    group: 'MENU_GROUP_RECORDS',
    testId: 'ft-home-preview-records'
  },
  {
    id: 'practice',
    group: 'MENU_GROUP_PRACTICE',
    testId: 'ft-home-preview-practice'
  }
]);

/**
 * @param {object} [options]
 * @param {{
 *   openMenuGroup?: (groupKey: string) => void,
 *   proxyMenuItem?: (key: string) => void
 * }} [options.wide]
 */
export class HomeThreeZoneUI {
  constructor(options = {}) {
    this.wide = options.wide || null;
    this._unsubLocale = null;
    this._clusterTries = 0;
    this.root = null;
    this.headingEl = null;
    this.confideBtn = null;
    this.slotEl = null;
    if (typeof document === 'undefined') return;
    this._injectStyles();
    this._build();
    this._unsubLocale = onLocaleChange(() => {
      this._refreshLabels();
      this.sync();
    });
    this.sync();
  }

  /** @returns {void} */
  sync() {
    const park =
      typeof document !== 'undefined' &&
      document.body.classList.contains('ft-wide-park-secondary');
    const wide =
      typeof window !== 'undefined' && Number.isFinite(window.innerWidth)
        ? window.innerWidth >= 480
        : park;
    const arrival = document.getElementById('arrival-practice');
    const arrivalOpen = Boolean(arrival && !arrival.hidden);
    const show = park && wide && !arrivalOpen;
    document.body.classList.toggle('ft-home-three-zone', show);
    if (this.root) this.root.hidden = !show;
    const cluster = document.getElementById('weekly-practice-heatmap-cluster');
    if (show && !cluster && this._clusterTries < 30) {
      this._clusterTries += 1;
      requestAnimationFrame(() => this.sync());
    } else if (cluster) {
      this._clusterTries = 0;
    }
    this._paintProgressLabel(show);
    this._syncConfideRow();
    this._refreshLabels();
  }

  /** @returns {void} */
  destroy() {
    this._unsubLocale?.();
    this._unsubLocale = null;
    this.root?.remove();
    this.root = null;
    document.getElementById(STYLE_ID)?.remove();
    document.body.classList.remove('ft-home-three-zone');
    const cluster = document.getElementById('weekly-practice-heatmap-cluster');
    if (cluster) cluster.removeAttribute('data-zone-label');
  }

  /** @returns {void} */
  _build() {
    this.root = document.createElement('aside');
    this.root.id = ROOT_ID;
    this.root.className = 'ft-home-zone-memories';
    this.root.hidden = true;
    this.root.dataset.testid = ROOT_ID;
    this.root.setAttribute('aria-labelledby', 'ft-home-zone-memories-heading');

    this.headingEl = document.createElement('p');
    this.headingEl.id = 'ft-home-zone-memories-heading';
    this.headingEl.className = 'ft-home-zone-memories__heading';

    this.slotEl = document.createElement('div');
    this.slotEl.id = SLOT_ID;
    this.slotEl.className = 'ft-home-zone-memories__slot';
    this.slotEl.hidden = true;
    this.slotEl.dataset.testid = SLOT_ID;

    const list = document.createElement('div');
    list.className = 'ft-home-zone-memories__list';

    this.confideBtn = this._makeRowButton({
      testId: 'ft-home-preview-confide',
      onClick: () => this.wide?.proxyMenuItem?.('confide')
    });
    list.appendChild(this.confideBtn);

    for (const row of GROUP_ROWS) {
      const btn = this._makeRowButton({
        testId: row.testId,
        onClick: () => this.wide?.openMenuGroup?.(row.group)
      });
      btn.dataset.group = row.group;
      btn.dataset.preview = row.id;
      list.appendChild(btn);
    }

    this.root.append(this.headingEl, this.slotEl, list);
    document.body.appendChild(this.root);
  }

  /**
   * @param {{ testId: string, onClick: () => void }} spec
   * @returns {HTMLButtonElement}
   */
  _makeRowButton(spec) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ft-home-zone-memories__row';
    btn.dataset.testid = spec.testId;
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      spec.onClick();
    });
    return btn;
  }

  /** @returns {void} */
  _refreshLabels() {
    if (this.headingEl) {
      this.headingEl.textContent = t('HOME_ZONE_MEMORIES');
    }
    const cluster = document.getElementById('weekly-practice-heatmap-cluster');
    if (cluster) cluster.setAttribute('data-zone-label', t('HOME_ZONE_PROGRESS'));
    if (this.confideBtn) {
      this.confideBtn.textContent = t('CONFIDE_MENU_LABEL');
    }
    this.root?.querySelectorAll('[data-group]').forEach((btn) => {
      const key = btn.getAttribute('data-group');
      if (key) btn.textContent = t(key);
    });
  }

  /**
   * @param {boolean} show
   * @returns {void}
   */
  _paintProgressLabel(show) {
    const cluster = document.getElementById('weekly-practice-heatmap-cluster');
    if (!cluster) return;
    if (show) cluster.setAttribute('data-zone-label', t('HOME_ZONE_PROGRESS'));
    else cluster.removeAttribute('data-zone-label');
  }

  /** @returns {void} */
  _syncConfideRow() {
    if (!this.confideBtn) return;
    const search =
      typeof window !== 'undefined' ? window.location.search || '' : '';
    const show = shouldShowConfideEarChrome({ search, stage: 'idle' });
    this.confideBtn.hidden = !show;
  }

  /** @returns {void} */
  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @media (min-width: 480px) {
        body.ft-home-three-zone #weekly-practice-heatmap-cluster {
          /* Keep original left-bottom so #onboarding-hint-help stays clickable. */
        }
        body.ft-home-three-zone #weekly-practice-heatmap-cluster::before {
          content: attr(data-zone-label);
          display: block;
          margin: 0 0 4px;
          font-size: 0.68rem;
          font-weight: 650;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(74, 58, 40, 0.52);
          pointer-events: none;
        }
        body.ft-home-three-zone #confide-ear-chrome {
          display: none !important;
        }
      }
      .ft-home-zone-memories {
        position: fixed;
        right: max(16px, env(safe-area-inset-right, 0px));
        top: 50%;
        transform: translateY(-50%);
        z-index: ${Z.CLUSTER};
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: min(220px, calc(100vw - 48px));
        max-height: min(56vh, 420px);
        padding: 12px 10px 10px;
        border-radius: 18px;
        background: rgba(255, 252, 245, 0.42);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(139, 115, 85, 0.1);
        box-shadow: 0 4px 18px rgba(44, 31, 20, 0.05);
        pointer-events: auto;
      }
      .ft-home-zone-memories[hidden] {
        display: none !important;
      }
      body.ft-wide-more-open .ft-home-zone-memories,
      body.ft-wide-more-radial-open .ft-home-zone-memories {
        display: none !important;
      }
      .ft-home-zone-memories__heading {
        margin: 0 6px 2px;
        font-size: 0.68rem;
        font-weight: 650;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(74, 58, 40, 0.52);
      }
      .ft-home-zone-memories__slot[hidden] {
        display: none !important;
      }
      .ft-home-zone-memories__list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ft-home-zone-memories__row {
        box-sizing: border-box;
        width: 100%;
        min-height: 40px;
        margin: 0;
        padding: 8px 10px;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: rgba(74, 58, 40, 0.92);
        font: inherit;
        font-size: 0.92rem;
        text-align: left;
        cursor: pointer;
      }
      .ft-home-zone-memories__row:hover,
      .ft-home-zone-memories__row:focus-visible {
        background: rgba(255, 252, 245, 0.55);
      }
      .ft-home-zone-memories__row:active:not(:disabled) {
        transform: scale(0.98);
      }
      .ft-home-zone-memories__row[hidden] {
        display: none !important;
      }
      @media (max-width: 479px) {
        .ft-home-zone-memories {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
