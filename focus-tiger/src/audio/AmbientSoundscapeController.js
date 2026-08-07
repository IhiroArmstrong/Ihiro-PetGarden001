/**
 * 禅意背景音：DOM <audio> 播放 + 实际可闻播放时长 → presenceBoost。
 * 不探测其他 App；不参与达标；会话内累计，不做长期存储。
 *
 * 产品口径（2026-07-25）：**不自动开播**——须用户点音符钮 / Sound 选曲才出声；
 * 偏好写入 localStorage（默认 `enabled: false`，记住上次曲目）；
 * **Rise / 会话结束自动停播**（不清掉存储偏好）；presence 累计随会话清零。
 */

import {
  isUserAmbientTrackId,
  getSharedUserAmbientLibrary
} from './UserAmbientLibrary.js';

/** 每播放 1 分钟音频 ≈ 12 秒专注进度对光效的贡献 → 权重 12/60 */
export const AUDIO_FOCUS_EQUIV_RATIO = 12 / 60;

/** 听满整场最多叠加的 visual boost（累计可闻时长） */
export const MAX_PRESENCE_BOOST = 0.2;

/**
 * 正在可闻播放时立刻给 Rim 一层缓亮，使「音乐会让光更亮」可感知；
 * 与累计 presenceBoost 相加，总贡献封顶见 getPresenceBoost。
 */
export const AUDIBLE_PLAYING_LIFT = 0.1;

export const AMBIENT_TRACK_OFF = 'off';
export const AMBIENT_TRACK_SINGING_BOWL = 'singing-bowl';
export const AMBIENT_TRACK_DIVINE_LIFE_SOCIETY = 'divine-life-society';
export const AMBIENT_TRACK_LORD_OF_THE_DAWN = 'lord-of-the-dawn';
export const AMBIENT_TRACK_MAESTRO_TLAKAELEL = 'maestro-tlakaelel';
export const AMBIENT_TRACK_THE_INNER_SOUND = 'the-inner-sound';
export const AMBIENT_TRACK_SOMNIA_VARIATION_3 = 'somnia-variation-3';
export const AMBIENT_TRACK_SOMNIA_VARIATION_10 = 'somnia-variation-10';
export const AMBIENT_TRACK_RAIN = 'rain';
export const AMBIENT_TRACK_DREAMLAND = 'dreamland';
export const AMBIENT_TRACK_INVISIBLE_BEAUTY = 'invisible-beauty';
export const AMBIENT_TRACK_KISS_THE_SKY = 'kiss-the-sky';
export const AMBIENT_TRACK_FROZEN_IN_LOVE = 'frozen-in-love';

/** 默认曲目：Mer-Ka-Ba（工程 id 仍为 singing-bowl） */
export const DEFAULT_AMBIENT_TRACK_ID = AMBIENT_TRACK_SINGING_BOWL;

/** 与 `localStateKeys.js` 白名单同步。 */
export const AMBIENT_PREF_STORAGE_KEY = 'focus-tiger.ambient-pref.v1';

/** Opt-in ambient library (YouTube Audio Library / user-provided). */
export const AMBIENT_TRACKS = [
  {
    id: AMBIENT_TRACK_SINGING_BOWL,
    src: '/audio/ambient/mer-ka-ba.mp3',
    labelKey: 'AMBIENT_TRACK_SINGING_BOWL'
  },
  {
    id: AMBIENT_TRACK_DIVINE_LIFE_SOCIETY,
    src: '/audio/ambient/divine-life-society-jesse-gallagher.mp3',
    labelKey: 'AMBIENT_TRACK_DIVINE_LIFE_SOCIETY'
  },
  {
    id: AMBIENT_TRACK_LORD_OF_THE_DAWN,
    src: '/audio/ambient/lord-of-the-dawn-jesse-gallagher.mp3',
    labelKey: 'AMBIENT_TRACK_LORD_OF_THE_DAWN'
  },
  {
    id: AMBIENT_TRACK_MAESTRO_TLAKAELEL,
    src: '/audio/ambient/maestro-tlakaelel-jesse-gallagher.mp3',
    labelKey: 'AMBIENT_TRACK_MAESTRO_TLAKAELEL'
  },
  {
    id: AMBIENT_TRACK_THE_INNER_SOUND,
    src: '/audio/ambient/the-inner-sound-jesse-gallagher.mp3',
    labelKey: 'AMBIENT_TRACK_THE_INNER_SOUND'
  },
  {
    id: AMBIENT_TRACK_SOMNIA_VARIATION_3,
    src: '/audio/ambient/somnia-variation-3-reed-mathis.mp3',
    labelKey: 'AMBIENT_TRACK_SOMNIA_VARIATION_3'
  },
  {
    id: AMBIENT_TRACK_SOMNIA_VARIATION_10,
    src: '/audio/ambient/somnia-variation-10-reed-mathis.mp3',
    labelKey: 'AMBIENT_TRACK_SOMNIA_VARIATION_10'
  },
  {
    id: AMBIENT_TRACK_RAIN,
    src: '/audio/ambient/meditation-impromptu-02.mp3',
    labelKey: 'AMBIENT_TRACK_RAIN'
  },
  {
    id: AMBIENT_TRACK_DREAMLAND,
    src: '/audio/ambient/dreamland-aakash-gandhi.mp3',
    labelKey: 'AMBIENT_TRACK_DREAMLAND'
  },
  {
    id: AMBIENT_TRACK_INVISIBLE_BEAUTY,
    src: '/audio/ambient/invisible-beauty-aakash-gandhi.mp3',
    labelKey: 'AMBIENT_TRACK_INVISIBLE_BEAUTY'
  },
  {
    id: AMBIENT_TRACK_KISS_THE_SKY,
    src: '/audio/ambient/kiss-the-sky-aakash-gandhi.mp3',
    labelKey: 'AMBIENT_TRACK_KISS_THE_SKY'
  },
  {
    id: AMBIENT_TRACK_FROZEN_IN_LOVE,
    src: '/audio/ambient/frozen-in-love-aakash-gandhi.mp3',
    labelKey: 'AMBIENT_TRACK_FROZEN_IN_LOVE'
  }
];

/**
 * @param {number} playedSeconds
 * @param {number} targetMinutes
 */
export function computePresenceBoost(playedSeconds, targetMinutes) {
  const targetSec = Math.max(1, Number(targetMinutes) || 1) * 60;
  const played = Math.max(0, Number(playedSeconds) || 0);
  return Math.min(
    MAX_PRESENCE_BOOST,
    (played * AUDIO_FOCUS_EQUIV_RATIO) / targetSec
  );
}

/**
 * @param {unknown} raw
 * @param {{ knownUserTrackIds?: Iterable<string> }} [options]
 * @returns {{ enabled: boolean, trackId: string }}
 */
export function normalizeAmbientPref(raw, { knownUserTrackIds } = {}) {
  const trackIds = new Set(AMBIENT_TRACKS.map((t) => t.id));
  const userIds = knownUserTrackIds
    ? new Set([...knownUserTrackIds].filter(isUserAmbientTrackId))
    : null;
  // Opt-in：无存储时默认关；有存储则尊重 enabled
  let enabled = false;
  let trackId = DEFAULT_AMBIENT_TRACK_ID;
  if (raw && typeof raw === 'object') {
    if (typeof raw.enabled === 'boolean') enabled = raw.enabled;
    if (typeof raw.trackId === 'string') {
      if (trackIds.has(raw.trackId)) {
        trackId = raw.trackId;
      } else if (raw.trackId === AMBIENT_TRACK_OFF) {
        trackId = AMBIENT_TRACK_OFF;
      } else if (isUserAmbientTrackId(raw.trackId)) {
        // Keep preferred user id when unknown set not provided (boot before list).
        if (!userIds || userIds.has(raw.trackId)) {
          trackId = raw.trackId;
        }
      }
    }
  }
  return { enabled, trackId };
}

/**
 * Panel radio selection must match audible intent:
 * - currently playing → that track
 * - wantsEnabled (e.g. gesture-unlock pending) → preferred track
 * - silent but user already picked/played a track this page (mute / Rise) → preferred
 * - cold open (never picked this page) → Off even if storage default is Mer-Ka-Ba
 *
 * @param {{
 *   getTrackId: () => string,
 *   getPreferredTrackId: () => string,
 *   wantsEnabled?: () => boolean,
 *   hasRememberedPanelTrack?: () => boolean
 * }} ctrl
 * @returns {string}
 */
export function resolveAmbientPanelSelectedTrackId(ctrl) {
  const playing = ctrl.getTrackId?.() || AMBIENT_TRACK_OFF;
  if (playing !== AMBIENT_TRACK_OFF) return playing;
  const preferred = ctrl.getPreferredTrackId?.();
  if (ctrl.wantsEnabled?.()) {
    if (preferred && preferred !== AMBIENT_TRACK_OFF) return preferred;
    return DEFAULT_AMBIENT_TRACK_ID;
  }
  // Mute / Rise: remember last chosen track in the list (still silent / Off playable).
  if (
    ctrl.hasRememberedPanelTrack?.() &&
    preferred &&
    preferred !== AMBIENT_TRACK_OFF
  ) {
    return preferred;
  }
  return AMBIENT_TRACK_OFF;
}

/**
 * Note click while silent: start preferred after note-mute resume **or**
 * after Rise (remembered highlight, no `_resumePreferredOnOpen`).
 * Cold open (never picked this page) stays false → panel only / Off.
 * @param {{
 *   isAudiblePlaying?: () => boolean,
 *   willResumePreferredOnOpen?: () => boolean,
 *   hasRememberedPanelTrack?: () => boolean,
 *   getPreferredTrackId?: () => string
 * }} ctrl
 * @returns {boolean}
 */
export function shouldStartPreferredFromNoteClick(ctrl) {
  if (ctrl.isAudiblePlaying?.()) return false;
  if (ctrl.willResumePreferredOnOpen?.()) return true;
  if (!ctrl.hasRememberedPanelTrack?.()) return false;
  const preferred = ctrl.getPreferredTrackId?.();
  return Boolean(preferred && preferred !== AMBIENT_TRACK_OFF);
}

function readAmbientPref(storage) {
  try {
    const raw = storage?.getItem?.(AMBIENT_PREF_STORAGE_KEY);
    if (!raw) return normalizeAmbientPref(null);
    return normalizeAmbientPref(JSON.parse(raw));
  } catch {
    return normalizeAmbientPref(null);
  }
}

function writeAmbientPref(storage, pref) {
  try {
    storage?.setItem?.(AMBIENT_PREF_STORAGE_KEY, JSON.stringify(pref));
  } catch {
    /* ignore */
  }
}

export class AmbientSoundscapeController {
  /**
   * @param {object} [options]
   * @param {() => number} [options.now] 可注入时钟（测试）
   * @param {HTMLAudioElement} [options.audio] 可注入 audio 元素
   * @param {Storage | { getItem?: Function, setItem?: Function }} [options.storage]
   * @param {boolean} [options.mountToDocument] 测试可设为 false
   * @param {import('./UserAmbientLibrary.js').UserAmbientLibrary} [options.userLibrary]
   */
  constructor({
    now = () => Date.now(),
    audio = null,
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
    mountToDocument = true,
    userLibrary = null
  } = {}) {
    this._now = now;
    this._storage = storage;
    this._mountToDocument = mountToDocument;
    this._userLibrary = userLibrary || getSharedUserAmbientLibrary();
    this._volume = 0.45;
    this._audio =
      audio ||
      (typeof document !== 'undefined'
        ? this._createAudioElement(mountToDocument)
        : null);
    const pref = readAmbientPref(storage);
    this._wantEnabled = pref.enabled;
    this._preferredTrackId = pref.trackId;
    this._trackId = AMBIENT_TRACK_OFF;
    this._sessionActive = false;
    this._playedAccumulated = 0;
    /** @type {number | null} */
    this._segmentStartedAt = null;
    /** 每次停止/切换意图递增，作废进行中的 play() */
    this._playbackEpoch = 0;
    /** 浏览器拦截自动播放后，等待用户在静音按钮上再试 */
    this._needsGestureUnlock = false;
    /** After note-mute, next note-open resumes preferred (opt-in stays silent otherwise). */
    this._resumePreferredOnOpen = false;
    /**
     * User picked/played a non-Off track this page load — panel may highlight preferred
     * while silent (mute / Rise). Cold open stays Off.
     */
    this._rememberPanelTrack = false;
    /** Soft-paused by note-mute: keep src + currentTime for seek resume. */
    this._pausedWithSeek = false;
    /** @type {string | null} */
    this._pausedTrackId = null;
    this._boundTimeUpdate = () => this._onTimeUpdate();
    this._boundPlayState = () => this._syncCreditSegment();

    if (this._audio) {
      this._wireAudioListeners(this._audio);
    }
  }

  /** 用户偏好：是否希望播放背景音乐 */
  wantsEnabled() {
    return this._wantEnabled;
  }

  getPreferredTrackId() {
    return this._preferredTrackId;
  }

  /** @returns {boolean} */
  hasRememberedPanelTrack() {
    return Boolean(this._rememberPanelTrack);
  }

  /** 专注会话开始：可听时长从 0 计；不自动开播（须用户点音乐钮） */
  startSession() {
    this._endCreditSegment();
    this._sessionActive = true;
    this._playedAccumulated = 0;
    this._segmentStartedAt = null;
    this._syncCreditSegment();
  }

  /**
   * 会话结束（Rise / 达标）：清零会话累计并停播。
   * 不改写 localStorage 偏好——用户曾开过音乐时，下次可再点开。
   * 硬停（进度清零）；若本页曾选曲，面板仍高亮 preferred。
   */
  endSession() {
    this._endCreditSegment();
    this._sessionActive = false;
    this._playedAccumulated = 0;
    this._segmentStartedAt = null;
    this._wantEnabled = false;
    this._clearSeekPause();
    this._stopPlayback({ persist: false });
  }

  getTrackId() {
    return this._trackId;
  }

  getVolume() {
    return this._volume;
  }

  /** 当前是否可闻播放中 */
  isAudiblePlaying() {
    return this._isAudiblePlaying();
  }

  needsGestureUnlock() {
    return this._needsGestureUnlock;
  }

  /**
   * App 就绪：只同步偏好到 UI，**绝不**自动开播（须用户点音符 / Sound）。
   * 旧版若曾默认写入 enabled:true，此处一并静音并持久化为关，避免幽灵自动播放。
   * @returns {Promise<void>}
   */
  async startPreferredTrack() {
    this.mute();
    // Boot mute is not a user pause — keep cold-open opt-in silent.
    this._resumePreferredOnOpen = false;
    this._clearSeekPause();
  }

  /**
   * 同步静音：可闻时软暂停（保留 src + currentTime）；否则只关偏好。
   * 下次 unmute / 同曲 setTrack 从断点续播（非从头）。
   */
  mute() {
    const shouldResume =
      this._preferredTrackId !== AMBIENT_TRACK_OFF &&
      (this._wantEnabled || this._isAudiblePlaying());
    this._resumePreferredOnOpen = shouldResume;
    this._wantEnabled = false;
    this._needsGestureUnlock = false;

    const audio = this._audio;
    const hadAudible =
      this._isAudiblePlaying() ||
      (Boolean(audio?.src) && this._trackId !== AMBIENT_TRACK_OFF);

    if (hadAudible && audio) {
      this._playbackEpoch += 1;
      this._endCreditSegment();
      const pausedId =
        this._trackId !== AMBIENT_TRACK_OFF
          ? this._trackId
          : this._preferredTrackId;
      this._pausedWithSeek = pausedId !== AMBIENT_TRACK_OFF;
      this._pausedTrackId = this._pausedWithSeek ? pausedId : null;
      this._trackId = AMBIENT_TRACK_OFF;
      try {
        audio.pause();
      } catch {
        /* ignore */
      }
      // Keep src + currentTime for seek resume.
      audio.muted = true;
      this._persistPref();
      return;
    }

    this._persistPref();
  }

  /**
   * Whether the next Soundscape open (from the note) should resume preferred audio.
   * Consumed once so a cold open without prior mute stays opt-in silent.
   * @returns {boolean}
   */
  consumeResumePreferredOnOpen() {
    const next = Boolean(this._resumePreferredOnOpen);
    this._resumePreferredOnOpen = false;
    return next;
  }

  /** @returns {boolean} */
  willResumePreferredOnOpen() {
    return Boolean(this._resumePreferredOnOpen);
  }

  /** 按偏好曲开播；若刚 note-mute 软暂停则断点续播。 */
  async unmute() {
    if (this._preferredTrackId === AMBIENT_TRACK_OFF) {
      this._wantEnabled = false;
      this._resumePreferredOnOpen = false;
      this._clearSeekPause();
      this._persistPref();
      return;
    }
    this._resumePreferredOnOpen = false;
    this._wantEnabled = true;
    this._persistPref();
    await this.setTrack(this._preferredTrackId, { persist: false });
  }

  /**
   * UI 静音钮：可闻或在播偏好 → 静音；否则尝试开播。
   * @returns {Promise<boolean>} 切换后是否希望开启
   */
  async toggleFromUi() {
    if (this.isAudiblePlaying() || this._wantEnabled) {
      this.mute();
      return false;
    }
    await this.unmute();
    return true;
  }

  /**
   * @deprecated 使用 toggleFromUi / mute / unmute
   * @returns {Promise<boolean>}
   */
  async toggleEnabled() {
    return this.toggleFromUi();
  }

  /**
   * 临时开播（MicroRitual 等）：底层仍走 setTrack，但恢复 preferred / wantEnabled /
   * remember / resume 内存态，且不写 localStorage。不触碰 startSession / endSession /
   * presence 累计（_sessionActive / _playedAccumulated）。
   * @param {string} trackId
   * @returns {Promise<void>}
   */
  async playTrackEphemeral(trackId) {
    const snap = this._snapshotPrefMemory();
    await this.setTrack(trackId, { persist: false });
    this._restorePrefMemory(snap);
  }

  /**
   * 临时停播（MicroRitual 等）：硬停可闻播放，不改 getPreferredTrackId()，
   * 不写 focus-tiger.ambient-pref.v1，不触碰 startSession / endSession / presence。
   */
  stopPlaybackEphemeral() {
    const snap = this._snapshotPrefMemory();
    this._stopPlayback({ persist: false });
    this._restorePrefMemory(snap);
  }

  /** @returns {{ preferred: string, wantEnabled: boolean, remember: boolean, resume: boolean }} */
  _snapshotPrefMemory() {
    return {
      preferred: this._preferredTrackId,
      wantEnabled: this._wantEnabled,
      remember: this._rememberPanelTrack,
      resume: this._resumePreferredOnOpen
    };
  }

  /** @param {{ preferred: string, wantEnabled: boolean, remember: boolean, resume: boolean }} snap */
  _restorePrefMemory(snap) {
    this._preferredTrackId = snap.preferred;
    this._wantEnabled = snap.wantEnabled;
    this._rememberPanelTrack = snap.remember;
    this._resumePreferredOnOpen = snap.resume;
  }

  /**
   * 彻底停播（同步）；作废进行中的 play()。
   * @param {{ persist?: boolean }} [options]
   */
  _stopPlayback({ persist = true } = {}) {
    this._playbackEpoch += 1;
    this._endCreditSegment();
    this._trackId = AMBIENT_TRACK_OFF;
    this._needsGestureUnlock = false;
    this._clearSeekPause();

    const prev = this._audio;
    if (prev) {
      try {
        prev.pause();
      } catch {
        /* ignore */
      }
      prev.currentTime = 0;
      prev.src = '';
      prev.removeAttribute('src');
      prev.muted = true;
      try {
        prev.load();
      } catch {
        /* ignore */
      }
      if (this._mountToDocument && prev.parentNode) {
        prev.parentNode.removeChild(prev);
      }
    }

    if (this._mountToDocument && typeof document !== 'undefined') {
      this._audio = this._createAudioElement(true);
      this._wireAudioListeners(this._audio);
    } else if (prev && !this._mountToDocument) {
      this._audio = prev;
    } else {
      this._audio = null;
    }

    if (persist) this._persistPref();
  }

  /**
   * @param {string} trackId off | known AMBIENT_TRACKS id | user-*
   * @param {{ persist?: boolean }} [options]
   * @returns {Promise<void>}
   */
  async setTrack(trackId, { persist = true } = {}) {
    const id = trackId || AMBIENT_TRACK_OFF;
    if (id === AMBIENT_TRACK_OFF) {
      // Explicit Off in the panel — remember Off (mute-via-note keeps preferred track).
      this._preferredTrackId = AMBIENT_TRACK_OFF;
      this._wantEnabled = false;
      this._needsGestureUnlock = false;
      this._resumePreferredOnOpen = false;
      this._rememberPanelTrack = false;
      this._clearSeekPause();
      this._stopPlayback({ persist });
      return;
    }

    // Soft-paused same track → resume without resetting currentTime.
    if (
      this._pausedWithSeek &&
      this._pausedTrackId === id &&
      this._audio &&
      Boolean(this._audio.src)
    ) {
      this._preferredTrackId = id;
      this._wantEnabled = true;
      this._rememberPanelTrack = true;
      if (persist) this._persistPref();
      await this._resumeFromSeekPause(id);
      return;
    }

    let src = null;
    const builtIn = AMBIENT_TRACKS.find((t) => t.id === id);
    if (builtIn) {
      src = builtIn.src;
    } else if (isUserAmbientTrackId(id) && this._userLibrary) {
      src = await this._userLibrary.resolveSrc(id);
    }
    if (!src || !this._audio) return;

    this._clearSeekPause();
    this._endCreditSegment();
    this._trackId = id;
    this._preferredTrackId = id;
    this._wantEnabled = true;
    this._rememberPanelTrack = true;
    const epoch = this._playbackEpoch;
    const player = this._audio;
    player.muted = false;
    player.loop = true;
    player.volume = this._volume;
    player.src = src;
    if (persist) this._persistPref();

    try {
      await player.play();
    } catch {
      if (epoch !== this._playbackEpoch) return;
      this._needsGestureUnlock = true;
      return;
    }

    if (epoch !== this._playbackEpoch || this._trackId !== id) {
      try {
        player.pause();
      } catch {
        /* ignore */
      }
      return;
    }

    this._needsGestureUnlock = false;
    this._syncCreditSegment();
  }

  /**
   * After deleting a user track that was preferred / playing.
   * @param {string} removedId
   */
  async onUserTrackRemoved(removedId) {
    if (!isUserAmbientTrackId(removedId)) return;
    if (this._trackId === removedId) {
      this._wantEnabled = false;
      this._stopPlayback({ persist: false });
    }
    if (this._preferredTrackId === removedId) {
      this._preferredTrackId = DEFAULT_AMBIENT_TRACK_ID;
      this._wantEnabled = false;
      this._persistPref();
    }
  }

  /** @param {number} volume 0–1 */
  setVolume(volume) {
    this._volume = Math.min(1, Math.max(0, Number(volume) || 0));
    if (this._audio) {
      this._audio.volume = this._volume;
      this._audio.muted = this._volume <= 0;
    }
    this._syncCreditSegment();
  }

  getPlayedSeconds() {
    let seconds = this._playedAccumulated;
    if (this._segmentStartedAt != null) {
      seconds += (this._now() - this._segmentStartedAt) / 1000;
    }
    return seconds;
  }

  /** @param {number} targetMinutes */
  getPresenceBoost(targetMinutes) {
    if (!this._sessionActive) return 0;
    const cumulative = computePresenceBoost(
      this.getPlayedSeconds(),
      targetMinutes
    );
    const lift = this._isAudiblePlaying() ? AUDIBLE_PLAYING_LIFT : 0;
    return Math.min(MAX_PRESENCE_BOOST + AUDIBLE_PLAYING_LIFT, cumulative + lift);
  }

  _createAudioElement(mountToDocument) {
    const el = document.createElement('audio');
    el.setAttribute('preload', 'auto');
    el.loop = true;
    const vol = Number(this._volume);
    el.volume = Number.isFinite(vol) ? Math.min(1, Math.max(0, vol)) : 0.45;
    el.style.cssText =
      'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
    el.setAttribute('aria-hidden', 'true');
    if (mountToDocument && document.body) {
      document.body.appendChild(el);
    }
    return el;
  }

  /** @param {HTMLAudioElement} audio */
  _wireAudioListeners(audio) {
    audio.addEventListener('timeupdate', this._boundTimeUpdate);
    audio.addEventListener('play', this._boundPlayState);
    audio.addEventListener('playing', this._boundPlayState);
    audio.addEventListener('pause', this._boundPlayState);
    audio.addEventListener('ended', this._boundPlayState);
    audio.addEventListener('volumechange', this._boundPlayState);
  }

  _persistPref() {
    writeAmbientPref(this._storage, {
      enabled: this._wantEnabled,
      trackId: this._preferredTrackId
    });
  }

  _clearSeekPause() {
    this._pausedWithSeek = false;
    this._pausedTrackId = null;
  }

  /**
   * Resume after note-mute soft pause without resetting currentTime.
   * @param {string} id
   */
  async _resumeFromSeekPause(id) {
    const player = this._audio;
    if (!player) {
      this._clearSeekPause();
      return;
    }
    this._playbackEpoch += 1;
    const epoch = this._playbackEpoch;
    this._trackId = id;
    this._clearSeekPause();
    player.muted = false;
    player.loop = true;
    player.volume = this._volume;
    try {
      await player.play();
    } catch {
      if (epoch !== this._playbackEpoch) return;
      this._needsGestureUnlock = true;
      return;
    }
    if (epoch !== this._playbackEpoch || this._trackId !== id) {
      try {
        player.pause();
      } catch {
        /* ignore */
      }
      return;
    }
    this._needsGestureUnlock = false;
    this._syncCreditSegment();
  }

  _isAudiblePlaying() {
    if (!this._audio) return false;
    if (this._trackId === AMBIENT_TRACK_OFF) return false;
    if (this._audio.paused) return false;
    if (this._audio.muted || this._audio.volume <= 0) return false;
    return true;
  }

  /** timeupdate 心跳：维持可闻段累计（后台标签仍可靠墙钟段） */
  _onTimeUpdate() {
    this._syncCreditSegment();
  }

  _syncCreditSegment() {
    if (!this._sessionActive) {
      this._endCreditSegment();
      return;
    }
    if (this._isAudiblePlaying()) {
      if (this._segmentStartedAt == null) {
        this._segmentStartedAt = this._now();
      }
    } else {
      this._endCreditSegment();
    }
  }

  _endCreditSegment() {
    if (this._segmentStartedAt == null) return;
    this._playedAccumulated += (this._now() - this._segmentStartedAt) / 1000;
    this._segmentStartedAt = null;
  }
}
