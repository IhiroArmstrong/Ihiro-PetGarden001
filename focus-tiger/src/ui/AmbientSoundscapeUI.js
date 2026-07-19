/**
 * 背景音入口：与 Sit with Yin 同系朱红立体按钮 + 可选曲目面板。
 * 进入应用后右下角**始终可见**；未 FOCUSING 时点击不展开，仅提示需先进入专注模式。
 * 首次真正进入专注时可出现一次可忽略轻提示（localStorage 记忆）。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  AMBIENT_TRACK_OFF,
  AMBIENT_TRACKS
} from '../audio/AmbientSoundscapeController.js';

const NUDGE_STORAGE_KEY = 'focus-tiger.ambient-nudge.seen.v1';
const BLOCKED_TIP_MS = 4200;

function hasSeenNudge() {
  try {
    return localStorage.getItem(NUDGE_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

function markNudgeSeen() {
  try {
    localStorage.setItem(NUDGE_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export class AmbientSoundscapeUI {
  /**
   * @param {HTMLElement} overlayRoot
   * @param {import('../audio/AmbientSoundscapeController.js').AmbientSoundscapeController} controller
   * @param {object} [handlers]
   * @param {() => void} [handlers.onBlockedTip]
   * @param {() => void} [handlers.onPanelOpened]
   * @param {() => void} [handlers.onTrackChosen]
   */
  constructor(overlayRoot, controller, handlers = {}) {
    this.controller = controller;
    this.handlers = handlers;
    this._expanded = false;
    /** 计时是否已开始（可打开曲目面板） */
    this._sessionActive = false;
    this._nudgeVisible = false;
    this._blockedTipTimer = null;

    this.root = document.createElement('div');
    this.root.id = 'ambient-soundscape';
    this.root.className = 'ambient-soundscape';
    // 进入应用即可见；未专注时点击会提示
    this.root.hidden = false;

    this.nudgeEl = document.createElement('p');
    this.nudgeEl.className = 'ambient-soundscape__nudge';
    this.nudgeEl.hidden = true;
    this.nudgeEl.setAttribute('role', 'button');
    this.nudgeEl.tabIndex = 0;
    this.nudgeEl.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._dismissNudgeOrBlockedTip();
    });
    this.nudgeEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this._dismissNudgeOrBlockedTip();
      }
    });

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.type = 'button';
    this.toggleBtn.className = 'ambient-soundscape__fab';
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.toggleBtn.addEventListener('click', () => {
      if (!this._sessionActive) {
        this._showBlockedTip();
        return;
      }
      this._dismissNudge();
      this._expanded = !this._expanded;
      this._renderPanel();
      if (this._expanded) this.handlers.onPanelOpened?.();
    });

    this.panel = document.createElement('div');
    this.panel.className = 'ambient-soundscape__panel';
    this.panel.hidden = true;

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'ambient-soundscape__title';

    this.trackRow = document.createElement('div');
    this.trackRow.className = 'ambient-soundscape__tracks';
    this.trackRow.setAttribute('role', 'radiogroup');

    this.volumeLabel = document.createElement('label');
    this.volumeLabel.className = 'ambient-soundscape__volume';
    this.volumeInput = document.createElement('input');
    this.volumeInput.type = 'range';
    this.volumeInput.min = '0';
    this.volumeInput.max = '100';
    this.volumeInput.value = String(Math.round(controller.getVolume() * 100));
    this.volumeInput.addEventListener('input', () => {
      if (!this._sessionActive) return;
      controller.setVolume(Number(this.volumeInput.value) / 100);
      this._refreshFab();
    });
    this.volumeLabel.appendChild(this.volumeInput);

    this.panel.append(this.titleEl, this.trackRow, this.volumeLabel);
    this.root.append(this.nudgeEl, this.panel, this.toggleBtn);
    overlayRoot.appendChild(this.root);

    this._unsubLocale = onLocaleChange(() => this._renderPanel());
    this._injectStyles();
    this._renderPanel();
    this.setSessionActive(false);
  }

  /**
   * @param {boolean} focusing 计时是否进行中
   */
  setSessionActive(focusing) {
    this._sessionActive = Boolean(focusing);
    this.root.hidden = false;
    this.root.classList.toggle('is-armed', this._sessionActive);
    this.root.classList.toggle('is-gated', !this._sessionActive);

    if (!this._sessionActive) {
      this._expanded = false;
      this.panel.hidden = true;
      this.toggleBtn.setAttribute('aria-expanded', 'false');
      this._hideNudge();
    } else {
      this._clearBlockedTip();
      // 首次 FOCUSING 旁白改由 OnboardingHintsUI（ambient-soundscape）锚定 Sound FAB；
      // 此处不再叠一层 AMBIENT_NUDGE，避免双提示、且与漫画气泡样式统一。
    }
    this._refreshFab();
  }

  /** @returns {boolean} FAB 是否挂在页面上（现为始终 true，除非 dispose） */
  isVisible() {
    return !this.root.hidden;
  }

  /** @returns {boolean} 是否已允许打开曲目面板 */
  isSessionActive() {
    return this._sessionActive;
  }

  /** Ambient 面板是否展开 */
  isPanelOpen() {
    return Boolean(this._expanded && this._sessionActive && !this.panel.hidden);
  }

  _showBlockedTip() {
    this._expanded = false;
    this.panel.hidden = true;
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this._nudgeVisible = false;
    this.nudgeEl.hidden = false;
    this.nudgeEl.classList.add('is-blocked-tip');
    this.nudgeEl.textContent = t('HINT_AMBIENT_GATED');
    this.handlers.onBlockedTip?.();
    window.clearTimeout(this._blockedTipTimer);
    this._blockedTipTimer = window.setTimeout(() => {
      this._clearBlockedTip();
    }, BLOCKED_TIP_MS);
  }

  _clearBlockedTip() {
    window.clearTimeout(this._blockedTipTimer);
    this._blockedTipTimer = null;
    if (this.nudgeEl.classList.contains('is-blocked-tip')) {
      this.nudgeEl.classList.remove('is-blocked-tip');
      this.nudgeEl.hidden = true;
      this.nudgeEl.textContent = '';
    }
  }

  _maybeShowNudge() {
    if (hasSeenNudge()) return;
    if (this.controller.getTrackId() !== AMBIENT_TRACK_OFF) {
      markNudgeSeen();
      return;
    }
    this._clearBlockedTip();
    this._nudgeVisible = true;
    this.nudgeEl.hidden = false;
    this.nudgeEl.classList.remove('is-blocked-tip');
    this.nudgeEl.textContent = t('AMBIENT_NUDGE');
  }

  _hideNudge() {
    this._nudgeVisible = false;
    if (!this.nudgeEl.classList.contains('is-blocked-tip')) {
      this.nudgeEl.hidden = true;
    }
  }

  _dismissNudge() {
    if (!this._nudgeVisible && hasSeenNudge()) return;
    this._hideNudge();
    markNudgeSeen();
  }

  /** 点击 Sound 旁气泡：立刻关掉（含 gated 阻塞提示）。 */
  _dismissNudgeOrBlockedTip() {
    if (this.nudgeEl.classList.contains('is-blocked-tip')) {
      this._clearBlockedTip();
      return;
    }
    this._dismissNudge();
  }

  _renderPanel() {
    this.titleEl.textContent = t('AMBIENT_TITLE');
    this.toggleBtn.setAttribute('aria-label', t('AMBIENT_TOGGLE_ARIA'));
    if (this._nudgeVisible) {
      this.nudgeEl.textContent = t('AMBIENT_NUDGE');
    } else if (this.nudgeEl.classList.contains('is-blocked-tip') && !this.nudgeEl.hidden) {
      this.nudgeEl.textContent = t('HINT_AMBIENT_GATED');
    }

    this.trackRow.replaceChildren();
    const options = [
      { id: AMBIENT_TRACK_OFF, labelKey: 'AMBIENT_TRACK_OFF' },
      ...AMBIENT_TRACKS.map((tr) => ({
        id: tr.id,
        labelKey: tr.labelKey
      }))
    ];

    for (const opt of options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ambient-soundscape__track';
      btn.setAttribute('role', 'radio');
      const selected = this.controller.getTrackId() === opt.id;
      btn.setAttribute('aria-checked', selected ? 'true' : 'false');
      if (selected) btn.classList.add('is-selected');
      btn.textContent = t(opt.labelKey);
      btn.addEventListener('click', () => {
        if (!this._sessionActive) {
          this._showBlockedTip();
          return;
        }
        this._dismissNudge();
        void this.controller.setTrack(opt.id).then(() => this._renderPanel());
        this.handlers.onTrackChosen?.();
      });
      this.trackRow.appendChild(btn);
    }

    this.panel.hidden = !this._expanded || !this._sessionActive;
    this.toggleBtn.setAttribute(
      'aria-expanded',
      this._expanded && this._sessionActive ? 'true' : 'false'
    );
    this._refreshFab();
  }

  _refreshFab() {
    const on =
      this._sessionActive && this.controller.getTrackId() !== AMBIENT_TRACK_OFF;
    this.toggleBtn.classList.toggle('is-active', on);
    this.toggleBtn.classList.toggle('is-gated', !this._sessionActive);
    const label = t('AMBIENT_FAB_LABEL');
    this.toggleBtn.textContent = on ? `♫  ${label}` : `♪  ${label}`;
  }

  dispose() {
    this._unsubLocale();
    window.clearTimeout(this._blockedTipTimer);
  }

  _injectStyles() {
    if (document.getElementById('ambient-soundscape-styles')) return;
    const style = document.createElement('style');
    style.id = 'ambient-soundscape-styles';
    style.textContent = `
      .ambient-soundscape {
        position: fixed;
        right: 16px;
        bottom: 28px;
        z-index: 22;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        font-family: 'Noto Sans SC', system-ui, sans-serif;
      }
      .ambient-soundscape[hidden] {
        display: none !important;
      }
      .ambient-soundscape__fab {
        padding: 12px 22px;
        min-height: 48px;
        border: 1px solid rgba(255, 220, 200, 0.28);
        border-radius: 24px;
        background: linear-gradient(180deg, #a53a3a 0%, #8b2e2e 42%, #6f2424 100%);
        color: #fff;
        font-size: 16px;
        line-height: 1.2;
        letter-spacing: 0.02em;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.28) inset,
          0 -2px 0 rgba(0, 0, 0, 0.18) inset,
          0 2px 0 #5a1e1e,
          0 8px 18px rgba(44, 31, 20, 0.28);
        opacity: 1;
        transition: transform 120ms ease, box-shadow 160ms ease, filter 160ms ease, opacity 160ms ease;
      }
      .ambient-soundscape__fab.is-gated {
        opacity: 0.72;
      }
      .ambient-soundscape__fab:hover {
        filter: brightness(1.05);
      }
      .ambient-soundscape__fab:active {
        transform: translateY(2px) scale(0.985);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.18) inset,
          0 -1px 0 rgba(0, 0, 0, 0.2) inset,
          0 1px 0 #5a1e1e,
          0 3px 8px rgba(44, 31, 20, 0.22);
      }
      .ambient-soundscape__fab.is-active {
        background: linear-gradient(180deg, #8f3232 0%, #6e2424 45%, #5a1e1e 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.22) inset,
          0 -2px 0 rgba(0, 0, 0, 0.2) inset,
          0 2px 0 #4a1818,
          0 8px 18px rgba(44, 31, 20, 0.28),
          0 0 0 2px rgba(240, 192, 96, 0.55);
        opacity: 1;
      }
      .ambient-soundscape__nudge {
        position: relative;
        margin: 0;
        max-width: min(260px, calc(100vw - 48px));
        padding: 9px 14px;
        border-radius: 16px 16px 4px 16px;
        background: linear-gradient(165deg, #eef6f1 0%, #dceae2 100%);
        border: 1.5px solid rgba(92, 122, 108, 0.45);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.65) inset,
          0 6px 16px rgba(40, 64, 52, 0.14);
        color: #3a5348;
        font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Songti SC", "Noto Serif SC", Georgia, serif;
        font-size: 12.5px;
        font-style: italic;
        font-weight: 500;
        line-height: 1.45;
        text-align: left;
        cursor: pointer;
        filter: drop-shadow(0 2px 4px rgba(40, 64, 52, 0.08));
      }
      .ambient-soundscape__nudge::after {
        content: "";
        position: absolute;
        right: 28px;
        bottom: -8px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 8px 7px 0 7px;
        border-color: #dceae2 transparent transparent transparent;
        filter: drop-shadow(0 1px 0 rgba(92, 122, 108, 0.35));
      }
      .ambient-soundscape__nudge.is-blocked-tip {
        text-align: left;
        border-color: rgba(92, 122, 108, 0.45);
        background: linear-gradient(165deg, #eef6f1 0%, #dceae2 100%);
      }
      .ambient-soundscape__nudge[hidden] {
        display: none !important;
      }
      .ambient-soundscape__panel {
        width: min(240px, calc(100vw - 40px));
        padding: 12px;
        border-radius: 14px;
        background: rgba(255, 252, 245, 0.96);
        border: 1px solid rgba(139, 115, 85, 0.22);
        box-shadow: 0 10px 28px rgba(44, 31, 20, 0.1);
      }
      .ambient-soundscape__panel[hidden] {
        display: none !important;
      }
      .ambient-soundscape__title {
        margin: 0 0 8px;
        font-size: 12px;
        letter-spacing: 0.04em;
        color: rgba(44, 31, 20, 0.7);
      }
      .ambient-soundscape__tracks {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ambient-soundscape__track {
        text-align: left;
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.55);
        color: #2c1f14;
        font-size: 13px;
        cursor: pointer;
      }
      .ambient-soundscape__track.is-selected {
        border-color: rgba(139, 46, 46, 0.4);
        background: rgba(139, 46, 46, 0.1);
      }
      .ambient-soundscape__volume {
        display: block;
        margin-top: 10px;
      }
      .ambient-soundscape__volume input {
        width: 100%;
        accent-color: #8b2e2e;
      }
    `;
    document.head.appendChild(style);
  }
}
