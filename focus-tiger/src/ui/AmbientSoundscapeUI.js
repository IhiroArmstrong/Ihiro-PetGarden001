/**
 * 背景音入口：显眼「打开/关闭音乐」一键开关 + 可选曲目面板。
 * 进入应用即可见、随时可点；默认开播 Mer-Ka-Ba（见 AmbientSoundscapeController）。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  AMBIENT_TRACK_OFF,
  AMBIENT_TRACKS
} from '../audio/AmbientSoundscapeController.js';

/** 与 `localStateKeys.js` 白名单同步；新增 key 时两边一起改。 */
export const AMBIENT_NUDGE_STORAGE_KEY = 'focus-tiger.ambient-nudge.seen.v1';

function hasSeenNudge() {
  try {
    return localStorage.getItem(AMBIENT_NUDGE_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

function markNudgeSeen() {
  try {
    localStorage.setItem(AMBIENT_NUDGE_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export class AmbientSoundscapeUI {
  /**
   * @param {HTMLElement} overlayRoot
   * @param {import('../audio/AmbientSoundscapeController.js').AmbientSoundscapeController} controller
   * @param {object} [handlers]
   * @param {() => void} [handlers.onPanelOpened]
   * @param {() => void} [handlers.onTrackChosen]
   * @param {() => void} [handlers.onToggleMusic]
   */
  constructor(overlayRoot, controller, handlers = {}) {
    this.controller = controller;
    this.handlers = handlers;
    this._expanded = false;
    /** 计时是否进行中（仅影响 presence 记账侧；UI 不再门闩） */
    this._sessionActive = false;
    this._nudgeVisible = false;

    this.root = document.createElement('div');
    this.root.id = 'ambient-soundscape';
    this.root.className = 'ambient-soundscape';
    this.root.hidden = false;

    this.nudgeEl = document.createElement('p');
    this.nudgeEl.className = 'ambient-soundscape__nudge';
    this.nudgeEl.hidden = true;
    this.nudgeEl.setAttribute('role', 'button');
    this.nudgeEl.tabIndex = 0;
    this.nudgeEl.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._dismissNudge();
    });
    this.nudgeEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this._dismissNudge();
      }
    });

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.type = 'button';
    this.toggleBtn.className = 'ambient-soundscape__fab';
    this.toggleBtn.addEventListener('click', () => {
      this._dismissNudge();
      void this.controller.toggleEnabled().then(() => {
        this._renderPanel();
        this.handlers.onToggleMusic?.();
      });
    });

    this.tracksBtn = document.createElement('button');
    this.tracksBtn.type = 'button';
    this.tracksBtn.className = 'ambient-soundscape__tracks-btn';
    this.tracksBtn.setAttribute('aria-expanded', 'false');
    this.tracksBtn.addEventListener('click', () => {
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
      controller.setVolume(Number(this.volumeInput.value) / 100);
      this._refreshFab();
    });
    this.volumeLabel.appendChild(this.volumeInput);

    this.panel.append(this.titleEl, this.trackRow, this.volumeLabel);
    this.root.append(this.nudgeEl, this.panel, this.toggleBtn, this.tracksBtn);
    overlayRoot.appendChild(this.root);

    this._unsubLocale = onLocaleChange(() => this._renderPanel());
    this._injectStyles();
    this._renderPanel();
  }

  /**
   * @param {boolean} focusing 计时是否进行中（presence 侧；UI 始终可开关音乐）
   */
  setSessionActive(focusing) {
    this._sessionActive = Boolean(focusing);
    this.root.hidden = false;
    this.root.classList.toggle('is-armed', this._sessionActive);
    this.root.classList.remove('is-gated');
    if (this._sessionActive) {
      // 首次 FOCUSING 旁白改由 OnboardingHintsUI（ambient-soundscape）锚定；
      // 此处不再叠一层 AMBIENT_NUDGE。
    }
    this._refreshFab();
  }

  /** @returns {boolean} FAB 是否挂在页面上（现为始终 true，除非 dispose） */
  isVisible() {
    return !this.root.hidden;
  }

  /** @returns {boolean} 是否已开始专注会话（presence） */
  isSessionActive() {
    return this._sessionActive;
  }

  /** Ambient 曲目面板是否展开 */
  isPanelOpen() {
    return Boolean(this._expanded && !this.panel.hidden);
  }

  /** App 就绪后：尝试默认开播，并刷新按钮文案 */
  async bootDefaultMusic() {
    await this.controller.startPreferredTrack();
    this._renderPanel();
    this._maybeShowDefaultOnNudge();
  }

  _maybeShowDefaultOnNudge() {
    if (hasSeenNudge()) return;
    if (!this.controller.wantsEnabled()) {
      markNudgeSeen();
      return;
    }
    this._nudgeVisible = true;
    this.nudgeEl.hidden = false;
    this.nudgeEl.textContent = t('AMBIENT_DEFAULT_ON_NUDGE');
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
    this.tracksBtn.setAttribute('aria-label', t('AMBIENT_TRACKS_ARIA'));
    this.tracksBtn.textContent = t('AMBIENT_TRACKS_LABEL');
    if (this._nudgeVisible) {
      this.nudgeEl.textContent = t('AMBIENT_DEFAULT_ON_NUDGE');
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
      const selected =
        opt.id === AMBIENT_TRACK_OFF
          ? !this.controller.wantsEnabled()
          : this.controller.wantsEnabled() &&
            (this.controller.getTrackId() === opt.id ||
              (this.controller.getTrackId() === AMBIENT_TRACK_OFF &&
                this.controller.getPreferredTrackId() === opt.id));
      btn.setAttribute('aria-checked', selected ? 'true' : 'false');
      if (selected) btn.classList.add('is-selected');
      btn.textContent = t(opt.labelKey);
      btn.addEventListener('click', () => {
        this._dismissNudge();
        void this.controller.setTrack(opt.id).then(() => {
          this._renderPanel();
          this.handlers.onTrackChosen?.();
        });
      });
      this.trackRow.appendChild(btn);
    }

    this.panel.hidden = !this._expanded;
    this.tracksBtn.setAttribute(
      'aria-expanded',
      this._expanded ? 'true' : 'false'
    );
    this._refreshFab();
  }

  _refreshFab() {
    const on = this.controller.wantsEnabled();
    this.toggleBtn.classList.toggle('is-active', on);
    this.toggleBtn.classList.remove('is-gated');
    const label = on ? t('AMBIENT_MUSIC_OFF') : t('AMBIENT_MUSIC_ON');
    this.toggleBtn.textContent = on ? `♫  ${label}` : `♪  ${label}`;
    this.toggleBtn.setAttribute(
      'aria-label',
      on ? t('AMBIENT_MUSIC_OFF_ARIA') : t('AMBIENT_MUSIC_ON_ARIA')
    );
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
        padding: 14px 26px;
        min-height: 52px;
        min-width: 148px;
        border: 1px solid rgba(255, 230, 210, 0.45);
        border-radius: 26px;
        background: linear-gradient(
          180deg,
          var(--color-cta-top, #c47a4e) 0%,
          var(--color-accent, #b5623a) 48%,
          var(--color-cta-bottom, #8f4a2c) 100%
        );
        color: #fff;
        font-size: 17px;
        font-weight: 600;
        line-height: 1.2;
        letter-spacing: 0.03em;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.28) inset,
          0 -2px 0 rgba(80, 40, 20, 0.18) inset,
          0 2px 0 var(--color-cta-edge, #7a3f24),
          0 10px 22px rgba(44, 31, 20, 0.28);
        opacity: 1;
        transition: transform 120ms ease, box-shadow 160ms ease, filter 160ms ease, opacity 160ms ease;
      }
      .ambient-soundscape__fab:hover {
        filter: brightness(1.06);
      }
      .ambient-soundscape__fab:active {
        transform: translateY(2px) scale(0.985);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.18) inset,
          0 -1px 0 rgba(80, 40, 20, 0.2) inset,
          0 1px 0 var(--color-cta-edge, #7a3f24),
          0 3px 8px rgba(44, 31, 20, 0.18);
      }
      .ambient-soundscape__fab.is-active {
        background: linear-gradient(180deg, #a86a42 0%, #8f4a2c 45%, #6e3a24 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.22) inset,
          0 -2px 0 rgba(80, 40, 20, 0.2) inset,
          0 2px 0 #5a3018,
          0 10px 22px rgba(44, 31, 20, 0.3),
          0 0 0 2px rgba(240, 192, 96, 0.65);
        opacity: 1;
      }
      .ambient-soundscape__tracks-btn {
        padding: 6px 12px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        border-radius: 14px;
        background: rgba(255, 252, 245, 0.92);
        color: #5a4636;
        font-size: 12px;
        letter-spacing: 0.02em;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(44, 31, 20, 0.08);
      }
      .ambient-soundscape__tracks-btn:hover {
        background: #fff;
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
        accent-color: var(--color-accent, #b5623a);
      }
    `;
    document.head.appendChild(style);
  }
}
