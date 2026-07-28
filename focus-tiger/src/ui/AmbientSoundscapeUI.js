/**
 * 背景音 UI：
 * - 右上米色 **音符钮**（窄屏 Idle 由 ActionBar ♪ 代理）→ 与菜单 / 抽屉 **Sound** 同效：打开曲目/音量面板
 * - 右下蒲团橙 Sound FAB 仅作遗留 DOM（宽屏永久藏起，避免与右上音符重复）
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  AMBIENT_TRACK_OFF,
  AMBIENT_TRACKS
} from '../audio/AmbientSoundscapeController.js';

/** 与 `localStateKeys.js` 白名单同步；新增 key 时两边一起改。 */
export const AMBIENT_NUDGE_STORAGE_KEY = 'focus-tiger.ambient-nudge.seen.v1';
const BLOCKED_TIP_MS = 4200;

const MUSIC_ICON_ON = `<svg class="ambient-soundscape__icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>`;

const MUSIC_ICON_MUTE = `<svg class="ambient-soundscape__icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/><path d="M4 4 L20 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

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
    this._sessionActive = false;
    this._nudgeVisible = false;
    this._blockedTipTimer = null;
    /** Narrow drawer forced the Soundscape panel open while Idle. */
    this._narrowForcedPanel = false;

    this.root = document.createElement('div');
    this.root.id = 'ambient-soundscape';
    this.root.className = 'ambient-soundscape is-gated';

    this.muteBtn = document.createElement('button');
    this.muteBtn.type = 'button';
    this.muteBtn.className = 'ambient-soundscape__mute';
    this.muteBtn.addEventListener('click', () => {
      this._dismissNudge();
      this.openSoundPanelFromNote();
    });

    this.focusChrome = document.createElement('div');
    this.focusChrome.className = 'ambient-soundscape__focus-chrome';

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

    this.soundBtn = document.createElement('button');
    this.soundBtn.type = 'button';
    this.soundBtn.className = 'ambient-soundscape__fab';
    this.soundBtn.setAttribute('aria-expanded', 'false');
    this.soundBtn.addEventListener('click', () => {
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
      if (!this._sessionActive && !this._narrowForcedPanel) return;
      controller.setVolume(Number(this.volumeInput.value) / 100);
      this._refreshMuteBtn();
    });
    this.volumeLabel.appendChild(this.volumeInput);

    this.panel.append(this.titleEl, this.trackRow, this.volumeLabel);
    this.focusChrome.append(this.nudgeEl, this.panel, this.soundBtn);
    this.root.append(this.muteBtn, this.focusChrome);
    overlayRoot.appendChild(this.root);

    this._onDocPointer = (event) => {
      if (!this._expanded) return;
      if (!this._sessionActive && !this._narrowForcedPanel) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      this._expanded = false;
      this._narrowForcedPanel = false;
      document.body.classList.remove('ft-narrow-stage-sound', 'ft-wide-stage-sound');
      this._renderPanel();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._unsubLocale = onLocaleChange(() => this._renderPanel());
    this._injectStyles();
    this._renderPanel();
    this.setSessionActive(false);
  }

  /**
   * @param {boolean} focusing 计时是否进行中（Sound 可展开曲目面板）
   */
  setSessionActive(focusing) {
    this._sessionActive = Boolean(focusing);
    this.root.classList.toggle('is-armed', this._sessionActive);
    this.root.classList.toggle('is-gated', !this._sessionActive);

    if (!this._sessionActive) {
      this._expanded = false;
      this.panel.hidden = true;
      this.soundBtn.setAttribute('aria-expanded', 'false');
      this._hideNudge();
    } else {
      this._clearBlockedTip();
    }
    this._refreshMuteBtn();
    this._renderPanel();
  }

  isVisible() {
    return !this.root.hidden;
  }

  isSessionActive() {
    return this._sessionActive;
  }

  isPanelOpen() {
    return Boolean(
      this._expanded &&
        !this.panel.hidden &&
        (this._sessionActive || this._narrowForcedPanel)
    );
  }

  async bootDefaultMusic() {
    // Opt-in：开局不同步自动播放；只刷新钮态
    await this.controller.startPreferredTrack();
    this._renderPanel();
  }

  /**
   * Legacy helper — prefer {@link openSoundPanelFromNote} / menu Sound.
   * Kept for tests that still exercise direct preference toggle.
   */
  async toggleMuteFromUi() {
    await this._onMuteClick();
  }

  /**
   * Top-right note (and ActionBar ♪ proxy) — same effect as menu / drawer Sound.
   * Stages the Soundscape panel on-canvas; never gated tip-only.
   */
  openSoundPanelFromNote() {
    this._stageSoundPanelHost();
    this.activateSoundFromNarrow();
  }

  /**
   * Narrow drawer / wide ⋯ 「Sound」— open the Soundscape track panel immediately
   * (same selection box). Hide FAB; do not show gated tip-only.
   * Caller may also stage body classes; {@link openSoundPanelFromNote} stages itself.
   */
  activateSoundFromNarrow() {
    this._clearBlockedTip();
    this._narrowForcedPanel = true;
    this._dismissNudge();
    this._expanded = true;
    this._renderPanel();
    this.panel.hidden = false;
    this.handlers.onPanelOpened?.();
  }

  /** Ensure focus-chrome + panel are positioned on-canvas (narrow / wide / Focusing). */
  _stageSoundPanelHost() {
    const body = document.body;
    if (body.classList.contains('ft-narrow-shell')) {
      body.classList.remove(
        'ft-narrow-stage-companion',
        'ft-narrow-stage-reminder'
      );
      body.classList.add('ft-narrow-stage-sound');
      return;
    }
    body.classList.remove(
      'ft-wide-stage-companion',
      'ft-wide-stage-reminder'
    );
    body.classList.add('ft-wide-stage-sound');
  }

  /** Whether ambient preference wants music on (for ActionBar ♪ slash). */
  wantsMusicOn() {
    return this.controller.wantsEnabled();
  }

  async _onMuteClick() {
    const ctrl = this.controller;
    if (
      ctrl.needsGestureUnlock() &&
      ctrl.wantsEnabled() &&
      !ctrl.isAudiblePlaying()
    ) {
      await ctrl.unmute();
      this._renderPanel();
      this.handlers.onToggleMusic?.();
      return;
    }
    await ctrl.toggleFromUi();
    this._renderPanel();
    this.handlers.onToggleMusic?.();
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

  _showBlockedTip() {
    this._expanded = false;
    this.panel.hidden = true;
    this.soundBtn.setAttribute('aria-expanded', 'false');
    this._nudgeVisible = false;
    this.nudgeEl.hidden = false;
    this.nudgeEl.classList.add('is-blocked-tip');
    this.nudgeEl.textContent = t('HINT_AMBIENT_GATED');
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

  /** Narrow shell clearStage — dismiss gated tip / collapse forced Idle panel. */
  clearNarrowSoundStage() {
    this._narrowForcedPanel = false;
    this._clearBlockedTip();
    document.body.classList.remove('ft-narrow-stage-sound', 'ft-wide-stage-sound');
    if (this._expanded && !this._sessionActive) {
      this._expanded = false;
      this._renderPanel();
    }
  }

  _dismissNudgeOrBlockedTip() {
    if (this.nudgeEl.classList.contains('is-blocked-tip')) {
      this._clearBlockedTip();
      return;
    }
    this._dismissNudge();
  }

  _renderPanel() {
    this.titleEl.textContent = t('AMBIENT_TITLE');
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
        if (!this._sessionActive && !this._narrowForcedPanel) return;
        this._dismissNudge();
        void this.controller.setTrack(opt.id).then(() => {
          this._renderPanel();
          this.handlers.onTrackChosen?.();
        });
      });
      this.trackRow.appendChild(btn);
    }

    this.panel.hidden =
      !this._expanded || !(this._sessionActive || this._narrowForcedPanel);
    this.soundBtn.setAttribute(
      'aria-expanded',
      this._expanded && (this._sessionActive || this._narrowForcedPanel)
        ? 'true'
        : 'false'
    );
    this._refreshMuteBtn();
    this._refreshSoundFab();
  }

  _refreshMuteBtn() {
    const ctrl = this.controller;
    const audible = ctrl.isAudiblePlaying();
    const showSlash = audible || ctrl.wantsEnabled();
    this.muteBtn.innerHTML = showSlash ? MUSIC_ICON_MUTE : MUSIC_ICON_ON;
    this.muteBtn.classList.toggle('is-muted', showSlash);
    // Opens Soundscape (same as Sound) — aria mirrors FAB label, not mute toggle
    this.muteBtn.setAttribute('aria-label', t('AMBIENT_TOGGLE_ARIA'));
    this.muteBtn.setAttribute(
      'aria-expanded',
      this.isPanelOpen() ? 'true' : 'false'
    );
    this.muteBtn.removeAttribute('aria-pressed');
  }

  _refreshSoundFab() {
    const on =
      this._sessionActive &&
      this.controller.wantsEnabled() &&
      this.controller.isAudiblePlaying();
    this.soundBtn.classList.toggle('is-active', on);
    const label = t('AMBIENT_FAB_LABEL');
    this.soundBtn.textContent = on ? `♫  ${label}` : `♪  ${label}`;
    this.soundBtn.setAttribute('aria-label', t('AMBIENT_TOGGLE_ARIA'));
  }

  dispose() {
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this._unsubLocale();
  }

  _injectStyles() {
    let style = document.getElementById('ambient-soundscape-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ambient-soundscape-styles';
      document.head.appendChild(style);
    }
    style.textContent = `
      .ambient-soundscape {
        position: fixed;
        inset: 0;
        z-index: 22;
        pointer-events: none;
        font-family: 'Noto Sans SC', system-ui, sans-serif;
      }
      .ambient-soundscape__mute {
        position: fixed;
        top: 14px;
        right: 14px;
        z-index: 24;
        pointer-events: auto;
        width: 44px;
        height: 44px;
        padding: 0;
        border: 1px solid rgba(139, 115, 85, 0.22);
        border-radius: 50%;
        background: linear-gradient(
          165deg,
          rgba(255, 252, 245, 0.98) 0%,
          rgba(245, 235, 220, 0.96) 100%
        );
        color: rgba(92, 72, 52, 0.82);
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 4px 14px rgba(44, 31, 20, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 120ms ease, box-shadow 160ms ease, color 160ms ease;
      }
      .ambient-soundscape__mute:hover {
        color: rgba(72, 54, 38, 0.92);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 6px 16px rgba(44, 31, 20, 0.14);
      }
      .ambient-soundscape__mute:active {
        transform: scale(0.96);
      }
      .ambient-soundscape__mute.is-muted {
        color: rgba(120, 92, 68, 0.55);
      }
      .ambient-soundscape__icon-svg {
        width: 22px;
        height: 22px;
        display: block;
      }
      .ambient-soundscape__focus-chrome {
        position: fixed;
        right: 16px;
        bottom: 28px;
        z-index: 23;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        pointer-events: none;
      }
      /* 窄屏：略缩 mute / Sound，给 HUD 与 dock 胶囊让出边距（勿上移 FAB，以免撞 Sit） */
      @media (max-width: 479px) {
        .ambient-soundscape__mute {
          top: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
        }
        .ambient-soundscape__icon-svg {
          width: 20px;
          height: 20px;
        }
        .ambient-soundscape__focus-chrome {
          right: 12px;
          bottom: 24px;
        }
        .ambient-soundscape__fab {
          padding: 10px 14px;
          min-height: 44px;
          font-size: 14px;
        }
      }
      .ambient-soundscape.is-gated .ambient-soundscape__fab {
        opacity: 0.72;
      }
      /* Wide: keep only top-right note — never show duplicate Sound FAB */
      @media (min-width: 480px) {
        .ambient-soundscape__fab {
          position: fixed !important;
          left: -10000px !important;
          top: 0 !important;
          width: 1px !important;
          height: 1px !important;
          margin: 0 !important;
          padding: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -1 !important;
        }
        /* Focusing / Idle: stage panel from top-right note (no FAB) */
        body.ft-wide-stage-sound .ambient-soundscape__focus-chrome {
          position: fixed !important;
          left: 50% !important;
          right: auto !important;
          top: auto !important;
          bottom: max(100px, env(safe-area-inset-bottom, 0px)) !important;
          transform: translateX(-50%) !important;
          width: min(300px, calc(100vw - 48px)) !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          z-index: 32 !important;
          align-items: stretch !important;
        }
        body.ft-wide-stage-sound .ambient-soundscape__panel {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }
        body.ft-wide-stage-sound .ambient-soundscape__nudge {
          display: none !important;
        }
      }
      .ambient-soundscape__fab {
        pointer-events: auto;
        padding: 12px 22px;
        min-height: 48px;
        border: 1px solid rgba(255, 230, 210, 0.35);
        border-radius: 24px;
        background: linear-gradient(
          180deg,
          var(--color-cta-top, #c47a4e) 0%,
          var(--color-accent, #b5623a) 48%,
          var(--color-cta-bottom, #8f4a2c) 100%
        );
        color: #fff;
        font-size: 16px;
        line-height: 1.2;
        letter-spacing: 0.02em;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.28) inset,
          0 -2px 0 rgba(80, 40, 20, 0.18) inset,
          0 2px 0 var(--color-cta-edge, #7a3f24),
          0 8px 18px rgba(44, 31, 20, 0.2);
        transition: transform 120ms ease, box-shadow 160ms ease, filter 160ms ease;
      }
      .ambient-soundscape__fab:hover {
        filter: brightness(1.05);
      }
      .ambient-soundscape__fab:active {
        transform: translateY(2px) scale(0.985);
      }
      .ambient-soundscape__fab.is-active {
        background: linear-gradient(180deg, #a86a42 0%, #8f4a2c 45%, #6e3a24 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.22) inset,
          0 -2px 0 rgba(80, 40, 20, 0.2) inset,
          0 2px 0 #5a3018,
          0 8px 18px rgba(44, 31, 20, 0.28),
          0 0 0 2px rgba(240, 192, 96, 0.55);
        opacity: 1;
      }
      .ambient-soundscape__nudge.is-blocked-tip {
        border-color: rgba(139, 115, 85, 0.35);
        background: linear-gradient(
          165deg,
          rgba(255, 255, 255, 0.96) 0%,
          #f8f1e4 100%
        );
        color: rgba(74, 58, 40, 0.78);
      }
      .ambient-soundscape__nudge {
        position: relative;
        margin: 0;
        pointer-events: auto;
        max-width: min(260px, calc(100vw - 48px));
        padding: 9px 14px;
        border-radius: 16px 16px 4px 16px;
        background: linear-gradient(165deg, #eef6f1 0%, #dceae2 100%);
        border: 1.5px solid rgba(92, 122, 108, 0.45);
        box-shadow: 0 6px 16px rgba(40, 64, 52, 0.14);
        color: #3a5348;
        font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Songti SC", "Noto Serif SC", Georgia, serif;
        font-size: 12.5px;
        font-style: italic;
        font-weight: 500;
        line-height: 1.45;
        text-align: left;
        cursor: pointer;
      }
      .ambient-soundscape__nudge[hidden] {
        display: none !important;
      }
      .ambient-soundscape__panel {
        pointer-events: auto;
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
  }
}
