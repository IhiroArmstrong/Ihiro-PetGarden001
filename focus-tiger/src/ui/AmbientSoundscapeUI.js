/**
 * 专注中可见的背景音入口：与 Sit with Yin 同系朱红立体按钮 + 可选曲目面板。
 * 首次进入专注时给一次可忽略轻提示（localStorage 记忆，不重复打扰）。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  AMBIENT_TRACK_OFF,
  AMBIENT_TRACKS
} from '../audio/AmbientSoundscapeController.js';

const NUDGE_STORAGE_KEY = 'focus-tiger.ambient-nudge.seen.v1';

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
   */
  constructor(overlayRoot, controller) {
    this.controller = controller;
    this._expanded = false;
    this._sessionVisible = false;
    this._nudgeVisible = false;

    this.root = document.createElement('div');
    this.root.id = 'ambient-soundscape';
    this.root.className = 'ambient-soundscape';
    this.root.hidden = true;

    this.nudgeEl = document.createElement('p');
    this.nudgeEl.className = 'ambient-soundscape__nudge';
    this.nudgeEl.hidden = true;

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.type = 'button';
    this.toggleBtn.className = 'ambient-soundscape__fab';
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.toggleBtn.addEventListener('click', () => {
      this._dismissNudge();
      this._expanded = !this._expanded;
      this._renderPanel();
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
      controller.setVolume(Number(this.volumeInput.value) / 100);
      this._refreshFab();
    });
    this.volumeLabel.appendChild(this.volumeInput);

    this.panel.append(this.titleEl, this.trackRow, this.volumeLabel);
    this.root.append(this.nudgeEl, this.panel, this.toggleBtn);
    overlayRoot.appendChild(this.root);

    this._unsubLocale = onLocaleChange(() => this._renderPanel());
    this._renderPanel();
    this._injectStyles();
  }

  /** @param {boolean} focusing */
  setSessionActive(focusing) {
    this._sessionVisible = Boolean(focusing);
    this.root.hidden = !this._sessionVisible;
    if (!this._sessionVisible) {
      this._expanded = false;
      this.panel.hidden = true;
      this.toggleBtn.setAttribute('aria-expanded', 'false');
      this._hideNudge();
    } else {
      this._maybeShowNudge();
    }
    this._refreshFab();
  }

  _maybeShowNudge() {
    if (hasSeenNudge()) return;
    if (this.controller.getTrackId() !== AMBIENT_TRACK_OFF) {
      markNudgeSeen();
      return;
    }
    this._nudgeVisible = true;
    this.nudgeEl.hidden = false;
    this.nudgeEl.textContent = t('AMBIENT_NUDGE');
  }

  _hideNudge() {
    this._nudgeVisible = false;
    this.nudgeEl.hidden = true;
  }

  _dismissNudge() {
    if (!this._nudgeVisible && hasSeenNudge()) return;
    this._hideNudge();
    markNudgeSeen();
  }

  _renderPanel() {
    this.titleEl.textContent = t('AMBIENT_TITLE');
    this.toggleBtn.setAttribute('aria-label', t('AMBIENT_TOGGLE_ARIA'));
    if (this._nudgeVisible) {
      this.nudgeEl.textContent = t('AMBIENT_NUDGE');
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
        this._dismissNudge();
        void this.controller.setTrack(opt.id).then(() => this._renderPanel());
      });
      this.trackRow.appendChild(btn);
    }

    this.panel.hidden = !this._expanded;
    this.toggleBtn.setAttribute(
      'aria-expanded',
      this._expanded ? 'true' : 'false'
    );
    this._refreshFab();
  }

  _refreshFab() {
    const on = this.controller.getTrackId() !== AMBIENT_TRACK_OFF;
    this.toggleBtn.classList.toggle('is-active', on);
    const label = t('AMBIENT_FAB_LABEL');
    this.toggleBtn.textContent = on ? `♫  ${label}` : `♪  ${label}`;
  }

  dispose() {
    this._unsubLocale();
  }

  _injectStyles() {
    if (document.getElementById('ambient-soundscape-styles')) return;
    const style = document.createElement('style');
    style.id = 'ambient-soundscape-styles';
    style.textContent = `
      .ambient-soundscape {
        position: absolute;
        right: 16px;
        bottom: 28px;
        z-index: 12;
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
      /* 与 #btn-focus（Sit with Yin）同系：朱红立体 pill */
      .ambient-soundscape__fab {
        padding: 12px 22px;
        min-height: 48px;
        border: none;
        border-radius: 24px;
        background: #8b2e2e;
        color: #fff;
        font-size: 16px;
        line-height: 1.2;
        letter-spacing: 0.02em;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(44, 31, 20, 0.15);
        opacity: 1;
        transition: transform 120ms ease, box-shadow 160ms ease, background 160ms ease;
      }
      .ambient-soundscape__fab:hover {
        box-shadow: 0 6px 16px rgba(44, 31, 20, 0.22);
      }
      .ambient-soundscape__fab:active {
        transform: scale(0.97);
      }
      .ambient-soundscape__fab.is-active {
        background: #6e2424;
        box-shadow:
          0 4px 12px rgba(44, 31, 20, 0.18),
          0 0 0 2px rgba(240, 192, 96, 0.55);
      }
      .ambient-soundscape__nudge {
        margin: 0;
        max-width: min(220px, calc(100vw - 48px));
        padding: 8px 12px;
        border-radius: 12px;
        background: rgba(255, 252, 245, 0.96);
        border: 1px solid rgba(139, 115, 85, 0.22);
        box-shadow: 0 6px 18px rgba(44, 31, 20, 0.1);
        color: #4a3a28;
        font-size: 12px;
        line-height: 1.45;
        text-align: right;
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
