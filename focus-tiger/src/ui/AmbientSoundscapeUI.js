/**
 * 背景音 UI：
 * - 右上米色 **音符钮**（窄屏 Idle 由 ActionBar ♪ 代理）→ 与菜单 / 抽屉 **Sound** 同效：打开曲目/音量面板
 * - 右下蒲团橙 Sound FAB 仅作遗留 DOM（宽屏永久藏起，避免与右上音符重复）
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  AMBIENT_TRACK_OFF,
  AMBIENT_TRACKS,
  resolveAmbientPanelSelectedTrackId,
  shouldStartPreferredFromNoteClick
} from '../audio/AmbientSoundscapeController.js';
import {
  listAmbientBuiltInTracksForPanel,
  canPlayAmbientTrack
} from '../audio/ambientEntitlement.js';
import {
  getSharedUserAmbientLibrary,
  mergeAmbientPanelTracks
} from '../audio/UserAmbientLibrary.js';
import { syncSecondaryMenuHintDot } from '../core/idleChromeOrchestration.js';
import { onEntitlementChange } from '../core/entitlement/entitlementGate.js';

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
   * @param {(trackId: string) => void} [handlers.onLockedDeepTrack]
   * @param {import('../audio/SessionCueController.js').SessionCueController | null} [handlers.sessionCues]
   */
  constructor(overlayRoot, controller, handlers = {}) {
    this.controller = controller;
    this.handlers = handlers;
    this.sessionCues = handlers.sessionCues || null;
    this._expanded = false;
    this._sessionActive = false;
    this._nudgeVisible = false;
    this._blockedTipTimer = null;
    /** Narrow drawer forced the Soundscape panel open while Idle. */
    this._narrowForcedPanel = false;

    /** @type {{ id: string, label: string, addedAt: number }[]} */
    this._userTracks = [];
    this._userLibrary =
      handlers.userLibrary ||
      controller._userLibrary ||
      getSharedUserAmbientLibrary();

    this.root = document.createElement('div');
    this.root.id = 'ambient-soundscape';
    this.root.className = 'ambient-soundscape is-gated';

    this.muteBtn = document.createElement('button');
    this.muteBtn.type = 'button';
    this.muteBtn.className = 'ambient-soundscape__mute';
    this._muteIcon = document.createElement('span');
    this._muteIcon.className = 'ambient-soundscape__mute-icon';
    this._muteIcon.setAttribute('aria-hidden', 'true');
    this.muteBtn.appendChild(this._muteIcon);
    this.muteBtn.addEventListener('click', () => {
      this._dismissNudge();
      this.openSoundPanelFromNote();
    });
    // Desktop: brief hover opens the track list without mute (change track mid-play).
    // Delay so a real click's pointerenter does not steal mute / resume semantics.
    this._hoverOpenTimer = null;
    this.muteBtn.addEventListener('pointerenter', (event) => {
      this._onNotePointerEnter(event);
    });
    this.muteBtn.addEventListener('pointerleave', () => {
      this._clearHoverOpenTimer();
    });
    this.muteBtn.addEventListener('pointerdown', () => {
      this._clearHoverOpenTimer();
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

    this.uploadHintEl = document.createElement('p');
    this.uploadHintEl.className = 'ambient-soundscape__upload-hint';
    this.uploadHintEl.id = 'ambient-upload-local-hint';

    this.uploadErrEl = document.createElement('p');
    this.uploadErrEl.className = 'ambient-soundscape__upload-err';
    this.uploadErrEl.id = 'ambient-upload-error';
    this.uploadErrEl.hidden = true;

    this.uploadRow = document.createElement('div');
    this.uploadRow.className = 'ambient-soundscape__upload-row';

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a';
    this.fileInput.id = 'ambient-upload-input';
    this.fileInput.className = 'ambient-soundscape__file-input';
    this.fileInput.hidden = true;
    this.fileInput.addEventListener('change', () => {
      void this._onUploadPicked();
    });

    this.uploadBtn = document.createElement('button');
    this.uploadBtn.type = 'button';
    this.uploadBtn.className = 'ambient-soundscape__upload-btn';
    this.uploadBtn.id = 'ambient-upload-btn';
    this.uploadBtn.addEventListener('click', () => {
      if (!this._sessionActive && !this._narrowForcedPanel) return;
      this.uploadErrEl.hidden = true;
      this.fileInput.click();
    });
    this.uploadRow.append(this.uploadBtn, this.fileInput);

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

    this.cueToggleLabel = document.createElement('label');
    this.cueToggleLabel.className = 'ambient-soundscape__session-cues';
    this.cueToggleInput = document.createElement('input');
    this.cueToggleInput.type = 'checkbox';
    this.cueToggleInput.className = 'ambient-soundscape__session-cues-input';
    this.cueToggleInput.id = 'ambient-session-cues-toggle';
    this.cueToggleInput.checked = this.sessionCues
      ? this.sessionCues.isEnabled()
      : true;
    this.cueToggleInput.addEventListener('change', () => {
      this.sessionCues?.setEnabled(this.cueToggleInput.checked);
    });
    this.cueToggleText = document.createElement('span');
    this.cueToggleText.className = 'ambient-soundscape__session-cues-text';
    this.cueToggleHint = document.createElement('span');
    this.cueToggleHint.className = 'ambient-soundscape__field-hint';
    this.cueToggleHint.id = 'ambient-session-cues-hint';
    const cueTextWrap = document.createElement('span');
    cueTextWrap.className = 'ambient-soundscape__field-copy';
    cueTextWrap.append(this.cueToggleText, this.cueToggleHint);
    this.cueToggleInput.setAttribute(
      'aria-describedby',
      this.cueToggleHint.id
    );
    this.cueToggleLabel.append(this.cueToggleInput, cueTextWrap);

    this.intervalRhythmLabel = document.createElement('label');
    this.intervalRhythmLabel.className = 'ambient-soundscape__interval-rhythm';
    this.intervalRhythmText = document.createElement('span');
    this.intervalRhythmText.className = 'ambient-soundscape__interval-rhythm-text';
    this.intervalRhythmSelect = document.createElement('select');
    this.intervalRhythmSelect.className = 'ambient-soundscape__interval-rhythm-select';
    this.intervalRhythmSelect.id = 'ambient-session-interval-rhythm';
    this.intervalRhythmSelect.addEventListener('change', () => {
      const ms = Number(this.intervalRhythmSelect.value);
      this.sessionCues?.setIntervalMs(ms);
    });
    this.intervalRhythmHint = document.createElement('span');
    this.intervalRhythmHint.className = 'ambient-soundscape__field-hint';
    this.intervalRhythmHint.id = 'ambient-session-interval-hint';
    this.intervalRhythmSelect.setAttribute(
      'aria-describedby',
      this.intervalRhythmHint.id
    );
    this.intervalRhythmLabel.append(
      this.intervalRhythmText,
      this.intervalRhythmSelect,
      this.intervalRhythmHint
    );

    this.awarenessToggleLabel = document.createElement('label');
    this.awarenessToggleLabel.className = 'ambient-soundscape__awareness-card';
    this.awarenessToggleInput = document.createElement('input');
    this.awarenessToggleInput.type = 'checkbox';
    this.awarenessToggleInput.className =
      'ambient-soundscape__awareness-card-input';
    this.awarenessToggleInput.id = 'ambient-focus-awareness-toggle';
    this.awarenessToggleInput.checked = this.sessionCues
      ? this.sessionCues.isAwarenessCardEnabled()
      : true;
    this.awarenessToggleInput.addEventListener('change', () => {
      this.sessionCues?.setAwarenessCardEnabled(
        this.awarenessToggleInput.checked
      );
    });
    this.awarenessToggleText = document.createElement('span');
    this.awarenessToggleText.className =
      'ambient-soundscape__awareness-card-text';
    this.awarenessToggleHint = document.createElement('span');
    this.awarenessToggleHint.className = 'ambient-soundscape__field-hint';
    this.awarenessToggleHint.id = 'ambient-focus-awareness-hint';
    const awarenessTextWrap = document.createElement('span');
    awarenessTextWrap.className = 'ambient-soundscape__field-copy';
    awarenessTextWrap.append(
      this.awarenessToggleText,
      this.awarenessToggleHint
    );
    this.awarenessToggleInput.setAttribute(
      'aria-describedby',
      this.awarenessToggleHint.id
    );
    this.awarenessToggleLabel.append(
      this.awarenessToggleInput,
      awarenessTextWrap
    );

    this.panel.append(
      this.titleEl,
      this.uploadHintEl,
      this.uploadRow,
      this.uploadErrEl,
      this.trackRow,
      this.volumeLabel,
      this.cueToggleLabel,
      this.intervalRhythmLabel,
      this.awarenessToggleLabel
    );
    this.focusChrome.append(this.nudgeEl, this.panel, this.soundBtn);
    this.root.append(this.muteBtn, this.focusChrome);
    overlayRoot.appendChild(this.root);

    this._onDocPointer = (event) => {
      if (!this._expanded) return;
      if (!this._sessionActive && !this._narrowForcedPanel) return;
      const target = /** @type {Element | null} */ (
        event.target instanceof Element
          ? event.target
          : event.target?.parentElement
      );
      if (!target) return;
      // Note chrome is inside root; ActionBar ♪ is outside — do not dismiss on
      // note pointerdown or click→mute / open races with a false close.
      if (this.root.contains(target)) return;
      if (target.closest?.('#ft-narrow-mute-btn, .ambient-soundscape__mute')) {
        return;
      }
      this._expanded = false;
      this._narrowForcedPanel = false;
      document.body.classList.remove('ft-narrow-stage-sound', 'ft-wide-stage-sound');
      this._renderPanel();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._unsubLocale = onLocaleChange(() => this._renderPanel());
    this._unsubEntitlement = onEntitlementChange(() => {
      this._onEntitlementChanged();
    });
    this._injectStyles();
    this._renderPanel();
    this.setSessionActive(false);
  }

  _onEntitlementChanged() {
    const playing = this.controller.getTrackId?.() || AMBIENT_TRACK_OFF;
    if (
      playing !== AMBIENT_TRACK_OFF &&
      !canPlayAmbientTrack(playing, {
        builtInTracks: AMBIENT_TRACKS,
        storage:
          typeof localStorage !== 'undefined' ? localStorage : null
      })
    ) {
      this.controller.mute();
    }
    this._renderPanel();
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

  /** Re-paint panel after deep audition start/end (external controller path). */
  renderAfterAudition() {
    this._refreshMuteBtn();
    this._renderPanel();
  }

  isPanelOpen() {
    return Boolean(
      this._expanded &&
        !this.panel.hidden &&
        (this._sessionActive || this._narrowForcedPanel)
    );
  }

  async bootDefaultMusic() {
    // Opt-in：开局不同步自动播放；只刷新钮态 + 用户曲清单
    await this._refreshUserTracks();
    await this.controller.startPreferredTrack();
    this._renderPanel();
  }

  async _refreshUserTracks() {
    try {
      this._userTracks = await this._userLibrary.listMeta();
    } catch {
      this._userTracks = [];
    }
  }

  async _onUploadPicked() {
    const file = this.fileInput.files?.[0];
    this.fileInput.value = '';
    if (!file) return;
    this.uploadErrEl.hidden = true;
    const result = await this._userLibrary.addFromFile(file);
    if (!result.ok) {
      this.uploadErrEl.textContent = t(result.errorKey);
      this.uploadErrEl.hidden = false;
      return;
    }
    await this._refreshUserTracks();
    await this.controller.setTrack(result.track.id);
    this._renderPanel();
    this.handlers.onTrackChosen?.();
  }

  /**
   * @param {string} id
   * @param {Event} event
   */
  async _onDeleteUserTrack(id, event) {
    event.preventDefault();
    event.stopPropagation();
    await this._userLibrary.remove(id);
    await this.controller.onUserTrackRemoved(id);
    await this._refreshUserTracks();
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
   * Top-right note (and ActionBar ♪ proxy):
   * - audible + panel open → mute/stop (explicit)
   * - audible + panel closed → open panel only (change track; do not mute)
   * - panel already open (silent) + remembered/resume → start preferred (Rise / mute)
   * - panel already open (silent) + no preferred → close
   * - otherwise → open Soundscape track panel (+ start preferred after mute / Rise)
   */
  openSoundPanelFromNote() {
    void this._onNoteClick();
  }

  /**
   * Desktop hover on the note: open the track list without muting or resuming.
   * Touch / pen use click semantics. Real mouse is allowed even when DevTools /
   * Safari Responsive Design reports `(hover: none)` for a 375 viewport.
   * @param {{ fromMouse?: boolean }} [opts]
   */
  openSoundPanelFromHover(opts = {}) {
    const fromMouse = opts.fromMouse === true;
    if (!fromMouse && !this._canHoverOpenPanel()) return;
    if (this.isPanelOpen()) return;
    this._openPanelOnly();
  }

  /**
   * @param {PointerEvent} event
   */
  _onNotePointerEnter(event) {
    // Only real mouse — not touch emulation of enter.
    if (event.pointerType && event.pointerType !== 'mouse') return;
    this._clearHoverOpenTimer();
    this._hoverOpenTimer = window.setTimeout(() => {
      this._hoverOpenTimer = null;
      this.openSoundPanelFromHover({ fromMouse: true });
    }, 180);
  }

  _clearHoverOpenTimer() {
    if (this._hoverOpenTimer != null) {
      window.clearTimeout(this._hoverOpenTimer);
      this._hoverOpenTimer = null;
    }
  }

  /** @returns {boolean} */
  _canHoverOpenPanel() {
    try {
      return Boolean(
        typeof window !== 'undefined' &&
          window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches
      );
    } catch {
      return false;
    }
  }

  /** Open Soundscape without toggling mute / resume. */
  _openPanelOnly() {
    this._dismissNudge();
    this._stageSoundPanelHost();
    this.activateSoundFromNarrow();
  }

  /**
   * @returns {Promise<void>}
   */
  async _onNoteClick() {
    const ctrl = this.controller;
    if (ctrl.isAudiblePlaying()) {
      // Playing + list already open → click means mute. Playing + list closed →
      // open list so the user can change tracks without stopping audio.
      if (!this.isPanelOpen()) {
        this._openPanelOnly();
        return;
      }
      ctrl.mute();
      this._expanded = false;
      this._narrowForcedPanel = false;
      document.body.classList.remove(
        'ft-narrow-stage-sound',
        'ft-wide-stage-sound'
      );
      this._renderPanel();
      this.handlers.onToggleMusic?.();
      return;
    }
    // Silent: after Rise or note-mute, start preferred — do not only toggle panel.
    const startPreferred = shouldStartPreferredFromNoteClick(ctrl);
    if (this.isPanelOpen()) {
      if (startPreferred) {
        ctrl.consumeResumePreferredOnOpen();
        await ctrl.unmute();
        this._renderPanel();
        this.handlers.onToggleMusic?.();
        return;
      }
      this._expanded = false;
      this._narrowForcedPanel = false;
      document.body.classList.remove(
        'ft-narrow-stage-sound',
        'ft-wide-stage-sound'
      );
      this._renderPanel();
      return;
    }
    this._openPanelOnly();
    if (startPreferred) {
      ctrl.consumeResumePreferredOnOpen();
      await ctrl.unmute();
      this._renderPanel();
      this.handlers.onToggleMusic?.();
    }
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
    void this._refreshUserTracks().then(() => {
      this._renderPanel();
      this.panel.hidden = false;
      this.handlers.onPanelOpened?.();
    });
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

  /** Panel track / play-pause when Focusing or Idle-staged Soundscape. */
  _canInteractWithPanelTracks() {
    return Boolean(this._sessionActive || this._narrowForcedPanel);
  }

  /**
   * Per-row play/pause: pause if this track is audible; else setTrack (plays).
   * @param {string} trackId
   * @param {boolean} playingThis
   */
  async _onTrackPlayPause(trackId, playingThis) {
    if (playingThis) {
      this.controller.mute();
    } else {
      await this.controller.setTrack(trackId);
    }
    this._renderPanel();
    this.handlers.onToggleMusic?.();
    this.handlers.onTrackChosen?.();
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
    this.uploadHintEl.textContent = t('AMBIENT_UPLOAD_LOCAL_HINT');
    this.uploadBtn.textContent = t('AMBIENT_UPLOAD_BTN');
    this.cueToggleText.textContent = t('SESSION_CUES_TOGGLE');
    this.cueToggleLabel.title = t('SESSION_CUES_TOGGLE_HINT');
    this.cueToggleHint.textContent = t('SESSION_CUES_TOGGLE_HINT');
    this.cueToggleInput.setAttribute('aria-label', t('SESSION_CUES_TOGGLE'));
    if (this.sessionCues) {
      this.cueToggleInput.checked = this.sessionCues.isEnabled();
    }

    this.intervalRhythmText.textContent = t('SESSION_INTERVAL_RHYTHM');
    this.intervalRhythmLabel.title = t('SESSION_INTERVAL_RHYTHM_HINT');
    this.intervalRhythmHint.textContent = t('SESSION_INTERVAL_RHYTHM_HINT');
    this.intervalRhythmSelect.setAttribute(
      'aria-label',
      t('SESSION_INTERVAL_RHYTHM')
    );
    const intervalOptions = [
      { ms: 0, key: 'SESSION_INTERVAL_OFF' },
      { ms: 180_000, key: 'SESSION_INTERVAL_3MIN' },
      { ms: 300_000, key: 'SESSION_INTERVAL_5MIN' }
    ];
    this.intervalRhythmSelect.replaceChildren();
    for (const opt of intervalOptions) {
      const el = document.createElement('option');
      el.value = String(opt.ms);
      el.textContent = t(opt.key);
      this.intervalRhythmSelect.appendChild(el);
    }
    if (this.sessionCues) {
      this.intervalRhythmSelect.value = String(this.sessionCues.getIntervalMs());
    }

    this.awarenessToggleText.textContent = t('SESSION_AWARENESS_CARD_TOGGLE');
    this.awarenessToggleLabel.title = t('SESSION_AWARENESS_CARD_TOGGLE_HINT');
    this.awarenessToggleHint.textContent = t(
      'SESSION_AWARENESS_CARD_TOGGLE_HINT'
    );
    this.awarenessToggleInput.setAttribute(
      'aria-label',
      t('SESSION_AWARENESS_CARD_TOGGLE')
    );
    if (this.sessionCues) {
      this.awarenessToggleInput.checked =
        this.sessionCues.isAwarenessCardEnabled();
    }
    if (this._nudgeVisible) {
      this.nudgeEl.textContent = t('AMBIENT_DEFAULT_ON_NUDGE');
    }

    this.trackRow.replaceChildren();
    const builtIns = listAmbientBuiltInTracksForPanel({
      tracks: AMBIENT_TRACKS,
      storage: typeof localStorage !== 'undefined' ? localStorage : null
    });
    const merged = mergeAmbientPanelTracks(this._userTracks, builtIns);
    const options = [
      { id: AMBIENT_TRACK_OFF, labelKey: 'AMBIENT_TRACK_OFF', kind: 'off' },
      ...merged.userTracks.map((tr) => ({
        id: tr.id,
        label: tr.label,
        kind: 'user'
      })),
      ...merged.builtInTracks.map((tr) => ({
        id: tr.id,
        labelKey: tr.labelKey,
        kind: 'builtin',
        locked: Boolean(tr.locked)
      }))
    ];

    const selectedId = resolveAmbientPanelSelectedTrackId(this.controller);
    const audibleId = this.controller.isAudiblePlaying()
      ? this.controller.getTrackId()
      : AMBIENT_TRACK_OFF;
    for (const opt of options) {
      const row = document.createElement('div');
      row.className = 'ambient-soundscape__track-row';
      if (opt.locked) row.classList.add('is-locked');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ambient-soundscape__track';
      btn.setAttribute('role', 'radio');
      btn.dataset.trackId = opt.id;
      if (opt.kind === 'user') {
        btn.dataset.userTrack = '1';
      }
      if (opt.locked) {
        // Clickable audition / upsell (not HTML disabled — disabled swallows clicks).
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-locked');
        btn.title = t('AMBIENT_AUDITION_ROW_HINT');
        btn.dataset.locked = '1';
        btn.dataset.testid = 'ambient-track-locked';
      }
      const selected = opt.id === selectedId;
      btn.setAttribute('aria-checked', selected ? 'true' : 'false');
      if (selected) btn.classList.add('is-selected');
      btn.textContent =
        opt.kind === 'user' ? opt.label : t(opt.labelKey);
      btn.addEventListener('click', () => {
        if (opt.locked) {
          if (!this._canInteractWithPanelTracks()) return;
          this._dismissNudge();
          this.handlers.onLockedDeepTrack?.(opt.id);
          return;
        }
        if (!this._canInteractWithPanelTracks()) return;
        this._dismissNudge();
        void this.controller.setTrack(opt.id).then(() => {
          this._renderPanel();
          this.handlers.onTrackChosen?.();
        });
      });
      row.appendChild(btn);

      if (opt.kind !== 'off') {
        const playingThis = audibleId === opt.id;
        const playPause = document.createElement('button');
        playPause.type = 'button';
        playPause.className = 'ambient-soundscape__track-play';
        if (playingThis) playPause.classList.add('is-playing');
        playPause.dataset.playTrackId = opt.id;
        if (opt.locked) {
          playPause.setAttribute('aria-disabled', 'true');
          playPause.classList.add('is-locked');
          playPause.title = t('AMBIENT_AUDITION_ROW_HINT');
          playPause.dataset.testid = 'ambient-track-locked-play';
        }
        playPause.setAttribute(
          'aria-label',
          playingThis
            ? t('AMBIENT_TRACK_PAUSE_ARIA')
            : t('AMBIENT_TRACK_PLAY_ARIA')
        );
        playPause.textContent = playingThis ? '❚❚' : '▶';
        playPause.addEventListener('click', (event) => {
          event.stopPropagation();
          if (opt.locked) {
            if (!this._canInteractWithPanelTracks()) return;
            this._dismissNudge();
            this.handlers.onLockedDeepTrack?.(opt.id);
            return;
          }
          if (!this._canInteractWithPanelTracks()) return;
          this._dismissNudge();
          void this._onTrackPlayPause(opt.id, playingThis);
        });
        row.appendChild(playPause);
      }

      if (opt.kind === 'user') {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'ambient-soundscape__track-delete';
        del.dataset.deleteTrackId = opt.id;
        del.setAttribute('aria-label', t('AMBIENT_UPLOAD_DELETE_ARIA'));
        del.textContent = '×';
        del.addEventListener('click', (event) => {
          if (!this._canInteractWithPanelTracks()) return;
          void this._onDeleteUserTrack(opt.id, event);
        });
        row.appendChild(del);
      }

      this.trackRow.appendChild(row);
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

  /**
   * Mint pulse on the note (CSS ::after + span — survives icon refresh).
   * @param {boolean} show
   */
  syncHintDot(show) {
    const on = Boolean(show);
    this.muteBtn.classList.toggle('has-hint-mint', on);
    syncSecondaryMenuHintDot(this.muteBtn, on);
  }

  _refreshMuteBtn() {
    const ctrl = this.controller;
    const audible = ctrl.isAudiblePlaying();
    const showSlash = audible || ctrl.wantsEnabled();
    if (!this._muteIcon) {
      this._muteIcon = document.createElement('span');
      this._muteIcon.className = 'ambient-soundscape__mute-icon';
      this._muteIcon.setAttribute('aria-hidden', 'true');
      this.muteBtn.prepend(this._muteIcon);
    }
    this._muteIcon.innerHTML = showSlash ? MUSIC_ICON_MUTE : MUSIC_ICON_ON;
    this.muteBtn.classList.toggle('is-muted', showSlash);
    // 未播放时幽灵化，避免冷启动首屏抢视线
    this.muteBtn.classList.toggle('is-ghost', !audible);
    // Opens Soundscape (same as Sound) — aria mirrors FAB label, not mute toggle
    this.muteBtn.setAttribute('aria-label', t('AMBIENT_TOGGLE_ARIA'));
    // Residual after mint done: native title. Unread mint hover owns tip copy
    // (OnboardingHintsUI strips title while pulse is active).
    this.muteBtn.setAttribute('title', t('AMBIENT_NOTE_HOVER'));
    this.muteBtn.setAttribute(
      'aria-expanded',
      this.isPanelOpen() ? 'true' : 'false'
    );
    this.muteBtn.removeAttribute('aria-pressed');
    this.handlers.onMuteChromePainted?.();
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
    this._clearHoverOpenTimer();
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this._unsubLocale?.();
    this._unsubEntitlement?.();
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
        /* +50% vs prior 44px hit target — music note readability */
        width: 66px;
        height: 66px;
        padding: 0;
        border: 1px solid rgba(139, 115, 85, 0.18);
        border-radius: 50%;
        background: rgba(255, 252, 245, 0.55);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: rgba(92, 72, 52, 0.72);
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.55) inset,
          0 3px 12px rgba(44, 31, 20, 0.07);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 120ms ease, box-shadow 160ms ease, color 160ms ease, opacity 180ms ease, background 180ms ease;
      }
      .ambient-soundscape__mute.is-ghost {
        opacity: 0.58;
        background: rgba(255, 252, 245, 0.32);
        border-color: rgba(139, 115, 85, 0.12);
        box-shadow: none;
      }
      .ambient-soundscape__mute.is-ghost:hover {
        opacity: 0.9;
        background: rgba(255, 252, 245, 0.55);
      }
      .ambient-soundscape__mute-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
      /* Same mint as ⋯ / drawer — larger + dual paint (class ::after + span) for Safari */
      .ambient-soundscape__mute.has-hint-mint::after {
        content: '';
        position: absolute;
        top: 2px;
        right: 2px;
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: #6db3a0;
        box-shadow:
          0 0 0 2px rgba(255, 252, 245, 0.98),
          0 0 0 3px rgba(109, 179, 160, 0.35);
        pointer-events: none;
        z-index: 2;
        animation: ft-ambient-mute-hint-pulse 1.6s ease-in-out infinite;
      }
      .ambient-soundscape__mute > .ft-secondary-menu-hint-dot {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: #6db3a0;
        box-shadow:
          0 0 0 2px rgba(255, 252, 245, 0.98),
          0 0 0 3px rgba(109, 179, 160, 0.35);
        pointer-events: none;
        z-index: 3;
        animation: ft-ambient-mute-hint-pulse 1.6s ease-in-out infinite;
      }
      /* Prefer ::after; hide duplicate span when both present */
      .ambient-soundscape__mute.has-hint-mint > .ft-secondary-menu-hint-dot {
        opacity: 0;
      }
      @keyframes ft-ambient-mute-hint-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.55; transform: scale(0.85); }
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
        /* +50% vs prior 22px glyph */
        width: 33px;
        height: 33px;
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
          /* Narrow keeps original size — +50% note is wide-only */
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
        /* Focusing / Idle: stage panel from top-right note (no FAB) — 靠右，不挡阿寅 */
        body.ft-wide-stage-sound .ambient-soundscape__focus-chrome {
          position: fixed !important;
          left: auto !important;
          right: 14px !important;
          top: auto !important;
          bottom: max(100px, env(safe-area-inset-bottom, 0px)) !important;
          transform: none !important;
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
          rgba(255, 252, 245, 0.72) 0%,
          rgba(255, 252, 245, 0.62) 100%
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
        border-radius: 18px;
        background: rgba(255, 252, 245, 0.62);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(139, 115, 85, 0.14);
        box-shadow: 0 4px 18px rgba(44, 31, 20, 0.06);
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
        max-height: min(42vh, 280px);
        overflow-y: auto;
      }
      .ambient-soundscape__track-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ambient-soundscape__track {
        flex: 1;
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
      .ambient-soundscape__track.is-locked,
      .ambient-soundscape__track-play.is-locked {
        opacity: 0.55;
        cursor: pointer;
      }
      .ambient-soundscape__track-row.is-locked {
        opacity: 0.92;
      }
      .ambient-soundscape__track-play {
        flex: 0 0 auto;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid rgba(139, 115, 85, 0.35);
        background: rgba(255, 252, 245, 0.9);
        color: #5a4030;
        cursor: pointer;
        font-size: 11px;
        line-height: 1;
        padding: 0;
      }
      .ambient-soundscape__track-play.is-playing {
        border-color: rgba(139, 46, 46, 0.45);
        background: rgba(139, 46, 46, 0.12);
        color: #8b2e2e;
      }
      .ambient-soundscape__track-delete {
        flex: 0 0 auto;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: 1px solid rgba(139, 115, 85, 0.3);
        background: rgba(255, 252, 245, 0.78);
        color: #6a5040;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }
      .ambient-soundscape__upload-hint {
        margin: 0 0 6px;
        font-size: 11px;
        line-height: 1.35;
        color: rgba(92, 72, 52, 0.72);
      }
      .ambient-soundscape__upload-row {
        margin-bottom: 6px;
      }
      .ambient-soundscape__upload-btn {
        width: 100%;
        border: 1px dashed rgba(139, 115, 85, 0.4);
        border-radius: 8px;
        padding: 8px 10px;
        background: rgba(255, 252, 245, 0.75);
        color: #2c1f14;
        cursor: pointer;
        font-size: 12px;
      }
      .ambient-soundscape__upload-err {
        margin: 0 0 8px;
        font-size: 11px;
        color: #8b4a3a;
      }
      .ambient-soundscape__volume {
        display: block;
        margin-top: 10px;
      }
      .ambient-soundscape__volume input {
        width: 100%;
        accent-color: var(--color-accent, #b5623a);
      }
      .ambient-soundscape__session-cues {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 12px;
        font-size: 12px;
        line-height: 1.35;
        color: var(--color-ink-muted, #5c5348);
        cursor: pointer;
        user-select: none;
      }
      .ambient-soundscape__session-cues-input {
        margin: 2px 0 0;
        flex-shrink: 0;
        accent-color: var(--color-accent, #b5623a);
      }
      .ambient-soundscape__session-cues-text {
        flex: 1;
      }
      .ambient-soundscape__field-copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }
      .ambient-soundscape__field-hint {
        display: block;
        font-size: 11px;
        line-height: 1.35;
        font-weight: 400;
        opacity: 0.82;
      }
      .ambient-soundscape__interval-rhythm {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 12px;
        font-size: 12px;
        line-height: 1.35;
        color: var(--color-ink-muted, #5c5348);
      }
      .ambient-soundscape__interval-rhythm-select {
        width: 100%;
        font: inherit;
        font-size: 12px;
        color: var(--color-ink, #3a2e22);
        border: 1px solid rgba(196, 165, 116, 0.45);
        border-radius: 8px;
        padding: 6px 8px;
        background: rgba(255, 252, 245, 0.9);
      }
      .ambient-soundscape__awareness-card {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 10px;
        font-size: 12px;
        line-height: 1.35;
        color: var(--color-ink-muted, #5c5348);
        cursor: pointer;
        user-select: none;
      }
      .ambient-soundscape__awareness-card-input {
        margin: 2px 0 0;
        flex-shrink: 0;
        accent-color: var(--color-accent, #b5623a);
      }
      .ambient-soundscape__awareness-card-text {
        flex: 1;
      }
    `;
  }
}
