/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle Document PiP companion — opt-in Chromium float with Yin breathing.
 *
 * Unsupported browsers never mount the control (no copy, no error).
 * The float is a view clone of the current sprite frame; it holds no session.
 */

import { markDocumentPictureInPictureUnavailable } from '../core/immersivePresenceSupport.js';
import {
  markIdleCompanionPipUsed,
  shouldMountIdleCompanionPipEntry,
  shouldShowIdleCompanionPipEntry,
  shouldShowDocumentPictureInPictureEntry
} from '../core/idleCompanionPipGate.js';
import { t, onLocaleChange } from '../locales/i18n.js';

const ROOT_ID = 'idle-companion-pip';
const STYLE_ID = 'idle-companion-pip-styles-v1';
const PIP_FRAME_MS = 200;

const PIP_ICON = `<svg class="idle-companion-pip__icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.5 5.25A1.75 1.75 0 0 1 6.25 3.5h11.5A1.75 1.75 0 0 1 19.5 5.25v7.5a.75.75 0 0 1-1.5 0v-7.5a.25.25 0 0 0-.25-.25H6.25a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25H12a.75.75 0 0 1 0 1.5H6.25A1.75 1.75 0 0 1 4.5 16.75v-11.5zm9.25 8A1.25 1.25 0 0 1 15 12h4.75A1.25 1.25 0 0 1 21 13.25v5.5A1.25 1.25 0 0 1 19.75 20H15a1.25 1.25 0 0 1-1.25-1.25v-5.5z"/></svg>`;

/**
 * @param {HTMLElement | null} cluster typically `#weekly-practice-heatmap-cluster`
 * @param {object} [handlers]
 * @param {() => boolean} [handlers.getIsIdle]
 * @param {() => string | null} [handlers.getSpriteFrameSrc]
 */
export class IdleCompanionPipUI {
  constructor(cluster, handlers = {}) {
    this.handlers = handlers;
    this.cluster = cluster;
    /** @type {boolean} */
    this._supported = shouldMountIdleCompanionPipEntry();
    /** @type {boolean} */
    this._pipOpen = false;
    /** @type {Window | null} */
    this._pipWindow = null;
    /** @type {ReturnType<typeof setInterval> | null} */
    this._pipTimer = null;
    /** @type {HTMLImageElement | null} */
    this._pipImg = null;

    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {HTMLButtonElement | null} */
    this.enterBtn = null;
    /** @type {HTMLElement | null} */
    this.liveEl = null;
    this._unsubLocale = null;

    if (!this._supported || !cluster) return;

    this._injectStyles();
    this.root = document.createElement('div');
    this.root.id = ROOT_ID;
    this.root.className = 'idle-companion-pip';
    this.root.hidden = true;
    this.root.dataset.testid = ROOT_ID;

    this.enterBtn = document.createElement('button');
    this.enterBtn.type = 'button';
    this.enterBtn.className = 'idle-companion-pip__btn';
    this.enterBtn.dataset.testid = 'idle-companion-pip-enter';
    this.enterBtn.innerHTML = PIP_ICON;
    this.enterBtn.setAttribute('aria-pressed', 'false');
    this.enterBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (this._pipOpen) {
        this.closeDocumentPip();
        return;
      }
      void this.enterDocumentPip();
    });

    this.liveEl = document.createElement('span');
    this.liveEl.className = 'idle-companion-pip__live';
    this.liveEl.setAttribute('aria-live', 'polite');
    this.liveEl.setAttribute('aria-atomic', 'true');

    this.root.append(this.enterBtn, this.liveEl);
    cluster.appendChild(this.root);

    this._syncCopy();
    this._unsubLocale = onLocaleChange(() => this._syncCopy());
    this.syncVisibility();
  }

  /**
   * Recompute Idle × feature-detect visibility. Closing Idle closes the float.
   * @returns {void}
   */
  syncVisibility() {
    if (!this.root) return;
    const isIdle = Boolean(this.handlers.getIsIdle?.());
    const pipOk = shouldShowDocumentPictureInPictureEntry();
    const show = shouldShowIdleCompanionPipEntry({
      documentPipSupported: pipOk,
      isIdle
    });
    this.root.hidden = !show;
    if (!show && this._pipOpen) {
      this.closeDocumentPip();
    }
  }

  /** After async PiP probe (Electron shell). */
  refreshPipEntry() {
    this.syncVisibility();
  }

  /** @returns {boolean} */
  isPipOpen() {
    return this._pipOpen;
  }

  async enterDocumentPip() {
    if (!this._supported || this._pipOpen) return;
    if (!shouldShowDocumentPictureInPictureEntry()) return;
    if (
      !shouldShowIdleCompanionPipEntry({
        documentPipSupported: true,
        isIdle: Boolean(this.handlers.getIsIdle?.())
      })
    ) {
      return;
    }

    let pipWindow;
    try {
      pipWindow = await documentPictureInPicture.requestWindow({
        width: 220,
        height: 280,
        preferInitialWindowPlacement: true
      });
    } catch {
      markDocumentPictureInPictureUnavailable();
      this.syncVisibility();
      return;
    }

    this._pipWindow = pipWindow;
    this._pipOpen = true;
    markIdleCompanionPipUsed();

    const doc = pipWindow.document;
    doc.head.innerHTML = '';
    const style = doc.createElement('style');
    style.textContent = PIP_DOCUMENT_CSS;
    doc.head.appendChild(style);

    const wrap = doc.createElement('div');
    wrap.className = 'pip-idle-companion';
    const img = doc.createElement('img');
    img.className = 'pip-idle-companion__img';
    img.alt = '';
    img.draggable = false;
    wrap.append(img);
    doc.body.appendChild(wrap);

    this._pipImg = img;
    this._refreshPipFrame();
    this._clearPipTimer();
    this._pipTimer = setInterval(() => this._refreshPipFrame(), PIP_FRAME_MS);

    pipWindow.addEventListener('pagehide', () => {
      this._onPipClosedBySystem();
    });

    this._syncOpenChrome();
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
    this._unsubLocale?.();
    this.root?.remove();
    this.root = null;
    this.enterBtn = null;
    this.liveEl = null;
  }

  _onPipClosedBySystem() {
    this._clearPipTimer();
    this._pipWindow = null;
    this._pipImg = null;
    const was = this._pipOpen;
    this._pipOpen = false;
    this._syncOpenChrome();
    if (was && this.liveEl) {
      this.liveEl.textContent = t('IDLE_COMPANION_PIP_LIVE_CLOSE');
    }
  }

  _clearPipTimer() {
    if (this._pipTimer != null) {
      clearInterval(this._pipTimer);
      this._pipTimer = null;
    }
  }

  _refreshPipFrame() {
    if (!this._pipOpen) return;
    const src = this.handlers.getSpriteFrameSrc?.();
    if (this._pipImg && src && this._pipImg.getAttribute('src') !== src) {
      this._pipImg.src = src;
    }
  }

  _syncCopy() {
    if (!this.enterBtn) return;
    const open = this._pipOpen;
    this.enterBtn.setAttribute(
      'aria-label',
      t(open ? 'IDLE_COMPANION_PIP_CLOSE_ARIA' : 'IDLE_COMPANION_PIP_ENTER_ARIA')
    );
    this.enterBtn.title = t('IDLE_COMPANION_PIP_HINT');
  }

  _syncOpenChrome() {
    if (!this.enterBtn || !this.root) return;
    this.enterBtn.classList.toggle('is-open', this._pipOpen);
    this.enterBtn.setAttribute('aria-pressed', this._pipOpen ? 'true' : 'false');
    this.root.dataset.pip = this._pipOpen ? '1' : '0';
    this._syncCopy();
    if (this._pipOpen && this.liveEl) {
      this.liveEl.textContent = t('IDLE_COMPANION_PIP_LIVE_OPEN');
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .idle-companion-pip {
        position: relative;
        z-index: 1;
        flex: 0 0 auto;
        pointer-events: auto;
      }
      .idle-companion-pip[hidden] {
        display: none !important;
      }
      .idle-companion-pip__btn {
        pointer-events: auto;
        width: 40px;
        height: 40px;
        padding: 0;
        border: 1px solid rgba(139, 115, 85, 0.14);
        border-radius: 50%;
        background: rgba(255, 252, 245, 0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: rgba(74, 58, 40, 0.7);
        cursor: pointer;
        box-shadow: none;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 120ms ease, color 160ms ease, opacity 160ms ease, box-shadow 160ms ease;
        opacity: 0.85;
      }
      .idle-companion-pip__btn:hover {
        color: rgba(72, 54, 38, 0.92);
        opacity: 1;
        box-shadow: 0 2px 10px rgba(44, 31, 20, 0.08);
      }
      .idle-companion-pip__btn:active {
        transform: scale(0.96);
      }
      .idle-companion-pip__btn.is-open {
        color: rgba(139, 90, 46, 0.95);
        opacity: 1;
        box-shadow: 0 0 0 2px rgba(196, 122, 78, 0.22);
      }
      .idle-companion-pip__icon-svg {
        width: 20px;
        height: 20px;
        display: block;
      }
      .idle-companion-pip__live {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
    document.head.appendChild(style);
  }
}

const PIP_DOCUMENT_CSS = `
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #e8e6e1;
  }
  .pip-idle-companion {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
  }
  .pip-idle-companion__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
  }
`;
