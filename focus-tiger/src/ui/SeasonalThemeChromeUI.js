/**
 * Seasonal Theme chrome — soft winter wash + one-shot observational line.
 * Does not block Sit / Arrival. pointer-events: none on wash; whisper is dismissible.
 */

import { getLocale, onLocaleChange } from '../locales/i18n.js';
import { homeClearanceTopCss } from './homeChromeClearance.js';
import {
  pickChristmasLineForDay,
  seasonalLineText
} from '../core/seasonal/christmasCorpus.js';
import {
  markSeasonalWhisperShown,
  shouldShowSeasonalWhisper
} from '../core/seasonal/seasonalWhisperGate.js';
import { computeSeasonWindow } from '../core/seasonal/resolveActiveSeasonalTheme.js';
import { getSeason } from '../core/seasonal/seasonalCalendar.js';

const WASH_ID = 'seasonal-theme-wash';
const WASH_STYLE_ID = 'seasonal-theme-wash-styles-v1';
const WHISPER_ID = 'seasonal-theme-whisper';
const WHISPER_STYLE_ID = 'seasonal-theme-whisper-styles-v1';
const HOLD_MS = 4200;

export class SeasonalThemeChromeUI {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.appEl `#app`
   * @param {HTMLElement} opts.overlayEl `#ui-overlay`
   * @param {Storage | null} [opts.storage]
   */
  constructor({ appEl, overlayEl, storage = null }) {
    this.appEl = appEl;
    this.overlayEl = overlayEl;
    this.storage =
      storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    /** @type {HTMLElement | null} */
    this._wash = null;
    /** @type {HTMLElement | null} */
    this._whisper = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {string | null} */
    this._activeSeasonId = null;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._whisper && this._whisper.dataset.lineId) {
        /* locale change mid-whisper: leave text; next day picks again */
      }
    });
  }

  /**
   * @param {import('../core/seasonal/resolveActiveSeasonalTheme.js').ActiveSeasonalTheme | null} active
   * @param {{ now?: Date, busy?: boolean }} [opts]
   */
  sync(active, opts = {}) {
    const busy = Boolean(opts.busy);
    const now = opts.now || new Date();

    if (!active) {
      this.clear();
      return;
    }

    this._activeSeasonId = active.seasonId;
    this.appEl?.setAttribute('data-seasonal-theme', active.seasonId);
    document.documentElement.dataset.seasonalTheme = active.seasonId;
    this._ensureWash(active.assets?.background || 'winter-quiet-wash');

    if (busy) return;

    const season = getSeason(active.seasonId);
    const window = season ? computeSeasonWindow(season, now) : null;
    const dayIso = window?.todayIso || active.anchorDateIso;
    if (
      !shouldShowSeasonalWhisper(this.storage, active.seasonId, dayIso)
    ) {
      return;
    }

    if (active.assets?.copyPoolId === 'christmas') {
      const line = pickChristmasLineForDay(dayIso);
      if (!line) return;
      this._showWhisper(seasonalLineText(line, getLocale()), line.id);
      markSeasonalWhisperShown(this.storage, active.seasonId, dayIso);
    }
  }

  clear() {
    this._activeSeasonId = null;
    this.appEl?.removeAttribute('data-seasonal-theme');
    delete document.documentElement.dataset.seasonalTheme;
    if (this._wash) {
      this._wash.remove();
      this._wash = null;
    }
    this.hideWhisper({ immediate: true });
  }

  /**
   * @param {string} backgroundKey
   */
  _ensureWash(backgroundKey) {
    if (!this.appEl) return;
    if (!this._wash) {
      const el = document.createElement('div');
      el.id = WASH_ID;
      el.className = 'seasonal-theme-wash';
      el.dataset.testid = 'seasonal-theme-wash';
      el.setAttribute('aria-hidden', 'true');
      this.appEl.appendChild(el);
      this._wash = el;
    }
    this._wash.dataset.background = backgroundKey;
    this._wash.classList.add('is-visible');
  }

  /**
   * @param {string} text
   * @param {string} lineId
   */
  _showWhisper(text, lineId) {
    if (!this.overlayEl || !text) return;
    this.hideWhisper({ immediate: true });

    const root = document.createElement('button');
    root.type = 'button';
    root.id = WHISPER_ID;
    root.className = 'seasonal-theme-whisper';
    root.dataset.testid = 'seasonal-theme-whisper';
    root.dataset.lineId = lineId;
    root.setAttribute('aria-live', 'polite');
    root.textContent = text;
    root.style.top = homeClearanceTopCss();
    root.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hideWhisper();
    });
    this.overlayEl.appendChild(root);
    this._whisper = root;
    root.getBoundingClientRect();
    root.classList.add('is-visible');
    this._holdTimer = window.setTimeout(() => this.hideWhisper(), HOLD_MS);
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  hideWhisper(opts = {}) {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
    const el = this._whisper;
    this._whisper = null;
    if (!el) return;
    if (opts.immediate) {
      el.remove();
      return;
    }
    el.classList.remove('is-visible');
    window.setTimeout(() => el.remove(), 360);
  }

  dispose() {
    this._unsubLocale?.();
    this.clear();
  }

  _injectStyles() {
    if (typeof document === 'undefined') return;
    if (!document.getElementById(WASH_STYLE_ID)) {
      const s = document.createElement('style');
      s.id = WASH_STYLE_ID;
      s.textContent = `
        .seasonal-theme-wash {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.9s ease;
          background:
            radial-gradient(ellipse 80% 55% at 50% 18%, rgba(255, 248, 235, 0.22), transparent 70%),
            radial-gradient(ellipse 70% 50% at 50% 100%, rgba(180, 205, 220, 0.14), transparent 65%);
        }
        .seasonal-theme-wash.is-visible { opacity: 1; }
        .seasonal-theme-wash[data-background="winter-quiet-wash"] {
          background:
            radial-gradient(ellipse 85% 50% at 50% 12%, rgba(255, 250, 240, 0.28), transparent 68%),
            radial-gradient(ellipse 75% 45% at 50% 100%, rgba(170, 195, 215, 0.16), transparent 62%);
        }
      `;
      document.head.appendChild(s);
    }
    if (!document.getElementById(WHISPER_STYLE_ID)) {
      const s = document.createElement('style');
      s.id = WHISPER_STYLE_ID;
      s.textContent = `
        .seasonal-theme-whisper {
          position: fixed;
          left: 50%;
          transform: translateX(-50%) translateY(-6px);
          z-index: 17;
          max-width: min(88vw, 340px);
          margin: 0;
          padding: 10px 14px;
          border: none;
          border-radius: 14px;
          background: rgba(255, 252, 247, 0.82);
          color: #3a3228;
          font: 400 13px/1.45 Georgia, 'Times New Roman', serif;
          letter-spacing: 0.01em;
          box-shadow: 0 6px 20px rgba(40, 50, 60, 0.08);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.35s ease, transform 0.35s ease;
          pointer-events: auto;
        }
        .seasonal-theme-whisper.is-visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `;
      document.head.appendChild(s);
    }
  }
}
