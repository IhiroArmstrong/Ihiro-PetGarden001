/**
 * Immersive Presence UI — in-app fullscreen companion + optional Document PiP probe.
 *
 * During Focusing: opt-in chrome to enter a quieter stage (timer + Yin + Rise).
 * Document PiP (when available): experimental floating window with live frame mirror.
 * Does not replace Companion Mode (Here & Now / Offline / Flow).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  canEnterImmersivePresence,
  exitElementFullscreen,
  formatMmSs,
  isDocumentFullscreen,
  requestElementFullscreen,
  supportsDocumentPictureInPicture,
  supportsElementFullscreen
} from '../core/immersivePresenceSupport.js';

const ROOT_ID = 'immersive-presence';
const STYLE_ID = 'immersive-presence-styles-v1';
const BODY_CLASS = 'ft-immersive-presence';
const PIP_FRAME_MS = 320;

/**
 * @param {HTMLElement} container typically `#ui-overlay`
 * @param {object} [handlers]
 * @param {() => { isFocusing: boolean, completionPending?: boolean }} [handlers.getGateState]
 * @param {() => number} [handlers.getElapsedSeconds]
 * @param {() => string | null} [handlers.getSpriteFrameSrc]
 * @param {(mode: 'immersive' | 'pip' | 'exit') => void} [handlers.onModeChange]
 */
export class ImmersivePresenceUI {
  constructor(container, handlers = {}) {
    this.container = container;
    this.handlers = handlers;

    /** @type {boolean} */
    this._focusing = false;
    /** @type {boolean} */
    this._immersive = false;
    /** @type {boolean} */
    this._pipOpen = false;
    /** @type {Window | null} */
    this._pipWindow = null;
    /** @type {ReturnType<typeof setInterval> | null} */
    this._pipTimer = null;
    /** @type {HTMLImageElement | null} */
    this._pipImg = null;
    /** @type {HTMLElement | null} */
    this._pipTime = null;

    this.root = document.createElement('div');
    this.root.id = ROOT_ID;
    this.root.className = 'immersive-presence';
    this.root.hidden = true;
    this.root.dataset.testid = ROOT_ID;
    this.root.setAttribute('role', 'group');

    this.enterBtn = document.createElement('button');
    this.enterBtn.type = 'button';
    this.enterBtn.className = 'immersive-presence__btn immersive-presence__btn--enter';
    this.enterBtn.dataset.testid = 'immersive-presence-enter';

    this.exitBtn = document.createElement('button');
    this.exitBtn.type = 'button';
    this.exitBtn.className = 'immersive-presence__btn immersive-presence__btn--exit';
    this.exitBtn.dataset.testid = 'immersive-presence-exit';
    this.exitBtn.hidden = true;

    this.pipBtn = document.createElement('button');
    this.pipBtn.type = 'button';
    this.pipBtn.className = 'immersive-presence__btn immersive-presence__btn--pip';
    this.pipBtn.dataset.testid = 'immersive-presence-pip';

    this.pipCloseBtn = document.createElement('button');
    this.pipCloseBtn.type = 'button';
    this.pipCloseBtn.className =
      'immersive-presence__btn immersive-presence__btn--pip-close';
    this.pipCloseBtn.dataset.testid = 'immersive-presence-pip-close';
    this.pipCloseBtn.hidden = true;

    this.root.append(
      this.enterBtn,
      this.exitBtn,
      this.pipBtn,
      this.pipCloseBtn
    );
    container.appendChild(this.root);

    this._injectStyles();
    this._syncCopy();
    this._unsubLocale = onLocaleChange(() => this._syncCopy());

    this.enterBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      void this.enterImmersive();
    });
    this.exitBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      void this.exitImmersive();
    });
    this.pipBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      void this.enterDocumentPip();
    });
    this.pipCloseBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.closeDocumentPip();
    });

    this._onKeyDown = (ev) => {
      if (ev.key === 'Escape' && this._immersive && !this._pipOpen) {
        void this.exitImmersive();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onFullscreenChange = () => {
      // Browser chrome exit does not force leave product immersive.
      this._syncChrome();
    };
    document.addEventListener('fullscreenchange', this._onFullscreenChange);
    document.addEventListener(
      'webkitfullscreenchange',
      this._onFullscreenChange
    );

    this._syncChrome();
  }

  /**
   * @param {boolean} focusing
   */
  setFocusing(focusing) {
    this._focusing = Boolean(focusing);
    if (!this._focusing) {
      void this.exitImmersive({ skipFullscreen: false });
      this.closeDocumentPip();
    }
    this._syncChrome();
  }

  /** @returns {boolean} */
  isImmersive() {
    return this._immersive;
  }

  /** @returns {boolean} */
  isPipOpen() {
    return this._pipOpen;
  }

  /**
   * @param {{ skipFullscreen?: boolean }} [opts]
   */
  async enterImmersive(opts = {}) {
    const gate = this.handlers.getGateState?.() ?? {
      isFocusing: this._focusing
    };
    if (!canEnterImmersivePresence(gate)) return;

    this._immersive = true;
    document.body.classList.add(BODY_CLASS);
    this._syncChrome();
    this.handlers.onModeChange?.('immersive');

    if (!opts.skipFullscreen && supportsElementFullscreen()) {
      try {
        await requestElementFullscreen(document.documentElement);
      } catch {
        // Permission / iOS — CSS immersive still counts.
      }
    }
  }

  /**
   * @param {{ skipFullscreen?: boolean }} [opts]
   */
  async exitImmersive(opts = {}) {
    const was = this._immersive;
    this._immersive = false;
    document.body.classList.remove(BODY_CLASS);
    this._syncChrome();
    if (was) this.handlers.onModeChange?.('exit');

    if (!opts.skipFullscreen && isDocumentFullscreen()) {
      await exitElementFullscreen();
    }
  }

  async enterDocumentPip() {
    const gate = this.handlers.getGateState?.() ?? {
      isFocusing: this._focusing
    };
    if (!canEnterImmersivePresence(gate)) return;
    if (!supportsDocumentPictureInPicture()) return;
    if (this._pipOpen) return;

    let pipWindow;
    try {
      pipWindow = await documentPictureInPicture.requestWindow({
        width: 240,
        height: 300,
        preferInitialWindowPlacement: true
      });
    } catch {
      return;
    }

    this._pipWindow = pipWindow;
    this._pipOpen = true;

    const doc = pipWindow.document;
    doc.head.innerHTML = '';
    const style = doc.createElement('style');
    style.textContent = PIP_DOCUMENT_CSS;
    doc.head.appendChild(style);

    const wrap = doc.createElement('div');
    wrap.className = 'pip-companion';
    const img = doc.createElement('img');
    img.className = 'pip-companion__img';
    img.alt = '';
    img.draggable = false;
    const time = doc.createElement('div');
    time.className = 'pip-companion__time';
    time.textContent = '00:00';
    const label = doc.createElement('div');
    label.className = 'pip-companion__label';
    label.textContent = t('IMMERSIVE_PIP_LABEL');
    wrap.append(img, time, label);
    doc.body.appendChild(wrap);

    this._pipImg = img;
    this._pipTime = time;
    this._refreshPipFrame();
    this._clearPipTimer();
    this._pipTimer = setInterval(() => this._refreshPipFrame(), PIP_FRAME_MS);

    pipWindow.addEventListener('pagehide', () => {
      this._onPipClosedBySystem();
    });

    // Enter in-page immersive quietly so main chrome stays out of the way.
    if (!this._immersive) {
      await this.enterImmersive({ skipFullscreen: true });
    }
    this._syncChrome();
    this.handlers.onModeChange?.('pip');
  }

  closeDocumentPip() {
    if (this._pipWindow && !this._pipWindow.closed) {
      try {
        this._pipWindow.close();
      } catch {
        // ignore
      }
    }
    this._onPipClosedBySystem();
  }

  destroy() {
    this.closeDocumentPip();
    void this.exitImmersive();
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('fullscreenchange', this._onFullscreenChange);
    document.removeEventListener(
      'webkitfullscreenchange',
      this._onFullscreenChange
    );
    this._unsubLocale?.();
    this.root.remove();
  }

  _onPipClosedBySystem() {
    this._clearPipTimer();
    this._pipWindow = null;
    this._pipImg = null;
    this._pipTime = null;
    const was = this._pipOpen;
    this._pipOpen = false;
    this._syncChrome();
    if (was) this.handlers.onModeChange?.('exit');
  }

  _clearPipTimer() {
    if (this._pipTimer != null) {
      clearInterval(this._pipTimer);
      this._pipTimer = null;
    }
  }

  _refreshPipFrame() {
    if (!this._pipOpen) return;
    const secs = Number(this.handlers.getElapsedSeconds?.() ?? 0);
    if (this._pipTime) {
      this._pipTime.textContent = formatMmSs(secs);
    }
    const src = this.handlers.getSpriteFrameSrc?.();
    if (this._pipImg && src && this._pipImg.getAttribute('src') !== src) {
      this._pipImg.src = src;
    }
  }

  _syncCopy() {
    this.enterBtn.textContent = t('IMMERSIVE_ENTER');
    this.enterBtn.setAttribute('aria-label', t('IMMERSIVE_ENTER_ARIA'));
    this.exitBtn.textContent = t('IMMERSIVE_EXIT');
    this.exitBtn.setAttribute('aria-label', t('IMMERSIVE_EXIT_ARIA'));
    this.pipBtn.textContent = t('IMMERSIVE_PIP_ENTER');
    this.pipBtn.setAttribute('aria-label', t('IMMERSIVE_PIP_ENTER_ARIA'));
    this.pipBtn.title = t('IMMERSIVE_PIP_HINT');
    this.pipCloseBtn.textContent = t('IMMERSIVE_PIP_EXIT');
    this.pipCloseBtn.setAttribute('aria-label', t('IMMERSIVE_PIP_EXIT_ARIA'));
    this.root.setAttribute('aria-label', t('IMMERSIVE_GROUP_ARIA'));
  }

  _syncChrome() {
    const gate = this.handlers.getGateState?.() ?? {
      isFocusing: this._focusing
    };
    const allowed = canEnterImmersivePresence({
      isFocusing: this._focusing,
      completionPending: gate.completionPending
    });
    const pipSupported = supportsDocumentPictureInPicture();

    this.root.hidden = !allowed;
    this.enterBtn.hidden = !allowed || this._immersive;
    this.exitBtn.hidden = !allowed || !this._immersive || this._pipOpen;
    this.pipBtn.hidden = !allowed || !pipSupported || this._pipOpen;
    this.pipCloseBtn.hidden = !allowed || !this._pipOpen;

    this.root.dataset.immersive = this._immersive ? '1' : '0';
    this.root.dataset.pip = this._pipOpen ? '1' : '0';
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .immersive-presence {
        position: absolute;
        left: 50%;
        bottom: calc(32px + 52px + env(safe-area-inset-bottom, 0px));
        transform: translateX(-50%);
        z-index: 16;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        max-width: min(92vw, 420px);
        pointer-events: auto;
      }
      .immersive-presence__btn {
        pointer-events: auto;
        border: 1px solid rgba(139, 115, 85, 0.18);
        border-radius: 999px;
        padding: 8px 14px;
        font: 600 0.82rem/1.2 var(--font-family, "Nunito", system-ui, sans-serif);
        letter-spacing: 0.01em;
        color: rgba(44, 31, 20, 0.78);
        background: rgba(255, 252, 245, 0.72);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 4px 14px rgba(44, 31, 20, 0.06);
        cursor: pointer;
      }
      .immersive-presence__btn:hover {
        filter: brightness(1.03);
      }
      .immersive-presence__btn--pip {
        color: rgba(74, 58, 40, 0.7);
        font-weight: 550;
        border-style: dashed;
      }
      body.ft-narrow-shell .immersive-presence {
        bottom: calc(88px + env(safe-area-inset-bottom, 0px));
      }

      /* Quiet stage: hide secondary chrome; keep timer, Rise, mute, Recover. */
      body.ft-immersive-presence #yin-support-fab,
      body.ft-immersive-presence #yin-tip-kindness-badges,
      body.ft-immersive-presence #yin-support-backdrop,
      body.ft-immersive-presence #yin-support-modal,
      body.ft-immersive-presence #yin-tip-jar-card,
      body.ft-immersive-presence #yin-sanctuary-card,
      body.ft-immersive-presence .language-pref,
      body.ft-immersive-presence .onboarding-hint-help,
      body.ft-immersive-presence .ft-hint-discovery-dot,
      body.ft-immersive-presence .ft-hint-catalog-chip,
      body.ft-immersive-presence #onboarding-privacy-sheet,
      body.ft-immersive-presence #onboarding-wellness-first,
      body.ft-immersive-presence .onboarding-app-purpose,
      body.ft-immersive-presence #weekly-practice-heatmap,
      body.ft-immersive-presence #flower-blow-welcome-bubble,
      body.ft-immersive-presence #moment-whisper,
      body.ft-immersive-presence #five-moments-compass,
      body.ft-immersive-presence #journey-log,
      body.ft-immersive-presence #zen-cinema-card,
      body.ft-immersive-presence #daily-zen-quote-card,
      body.ft-immersive-presence #mustard-seed-seal-card,
      body.ft-immersive-presence #digital-wallpapers-card,
      body.ft-immersive-presence .wide-idle-more,
      body.ft-immersive-presence #wide-idle-more-menu,
      body.ft-immersive-presence .in-app-reminder-banner,
      body.ft-immersive-presence #in-app-reminder-banner,
      body.ft-immersive-presence .ambient-soundscape__focus-chrome,
      body.ft-immersive-presence .ambient-soundscape__nudge,
      body.ft-immersive-presence #emotion-debug-panel,
      body.ft-immersive-presence #dev-lab-panel {
        display: none !important;
      }

      body.ft-immersive-presence #focus-hud .ft-hud__time {
        opacity: 0.95;
        font-size: 1.35rem;
      }
      body.ft-immersive-presence #focus-hud .ft-hud__streak,
      body.ft-immersive-presence #focus-hud .ft-hud__bar,
      body.ft-immersive-presence #focus-hud .ft-hud__detail {
        opacity: 0.28;
      }
      body.ft-immersive-presence #focus-hud .ft-hud:hover .ft-hud__streak,
      body.ft-immersive-presence #focus-hud .ft-hud:focus-within .ft-hud__streak,
      body.ft-immersive-presence #focus-hud .ft-hud:hover .ft-hud__bar,
      body.ft-immersive-presence #focus-hud .ft-hud:focus-within .ft-hud__bar {
        opacity: 0.85;
      }
    `;
    document.head.appendChild(style);
  }
}

export { formatMmSs };

const PIP_DOCUMENT_CSS = `
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #e8e6e1;
    font-family: "Nunito", system-ui, sans-serif;
    color: #2c1f14;
  }
  .pip-companion {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 10px 10px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .pip-companion__img {
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
  }
  .pip-companion__time {
    font-variant-numeric: tabular-nums;
    font-size: 1.35rem;
    font-weight: 650;
    letter-spacing: 0.02em;
    opacity: 0.9;
  }
  .pip-companion__label {
    font-size: 0.68rem;
    font-weight: 500;
    opacity: 0.55;
    text-align: center;
    max-width: 90%;
  }
`;
