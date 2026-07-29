/**
 * 禅意背景音：DOM <audio> 播放 + 实际可闻播放时长 → presenceBoost。
 * 不探测其他 App；不参与达标；会话内累计，不做长期存储。
 *
 * 产品口径（2026-07-25）：**不自动开播**——须用户点音符钮 / Sound 选曲才出声；
 * 偏好写入 localStorage（默认 `enabled: false`，记住上次曲目）；
 * **Rise / 会话结束自动停播**（不清掉存储偏好）；presence 累计随会话清零。
 */

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
export const AMBIENT_TRACK_RAIN = 'rain';

/** 默认曲目：Mer-Ka-Ba（工程 id 仍为 singing-bowl） */
export const DEFAULT_AMBIENT_TRACK_ID = AMBIENT_TRACK_SINGING_BOWL;

/** 与 `localStateKeys.js` 白名单同步。 */
export const AMBIENT_PREF_STORAGE_KEY = 'focus-tiger.ambient-pref.v1';

/** MVP 仅两档；磬等第三曲待 CC0 素材 */
export const AMBIENT_TRACKS = [
  {
    id: AMBIENT_TRACK_SINGING_BOWL,
    src: '/audio/ambient/mer-ka-ba.mp3',
    labelKey: 'AMBIENT_TRACK_SINGING_BOWL'
  },
  {
    id: AMBIENT_TRACK_RAIN,
    src: '/audio/ambient/meditation-impromptu-02.mp3',
    labelKey: 'AMBIENT_TRACK_RAIN'
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
 * @returns {{ enabled: boolean, trackId: string }}
 */
export function normalizeAmbientPref(raw) {
  const trackIds = new Set(AMBIENT_TRACKS.map((t) => t.id));
  // Opt-in：无存储时默认关；有存储则尊重 enabled
  let enabled = false;
  let trackId = DEFAULT_AMBIENT_TRACK_ID;
  if (raw && typeof raw === 'object') {
    if (typeof raw.enabled === 'boolean') enabled = raw.enabled;
    if (typeof raw.trackId === 'string' && trackIds.has(raw.trackId)) {
      trackId = raw.trackId;
    } else if (raw.trackId === AMBIENT_TRACK_OFF) {
      trackId = AMBIENT_TRACK_OFF;
    }
  }
  return { enabled, trackId };
}

/**
 * Panel radio selection: keep the last chosen track highlighted after mute/pause.
 * Off is selected only when the user explicitly chose Off (preferred === off).
 *
 * @param {{ getTrackId: () => string, getPreferredTrackId: () => string }} ctrl
 * @returns {string}
 */
export function resolveAmbientPanelSelectedTrackId(ctrl) {
  const playing = ctrl.getTrackId?.() || AMBIENT_TRACK_OFF;
  if (playing !== AMBIENT_TRACK_OFF) return playing;
  const preferred = ctrl.getPreferredTrackId?.();
  return preferred || DEFAULT_AMBIENT_TRACK_ID;
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
   */
  constructor({
    now = () => Date.now(),
    audio = null,
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
    mountToDocument = true
  } = {}) {
    this._now = now;
    this._storage = storage;
    this._mountToDocument = mountToDocument;
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
   */
  endSession() {
    this._endCreditSegment();
    this._sessionActive = false;
    this._playedAccumulated = 0;
    this._segmentStartedAt = null;
    this._wantEnabled = false;
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
  }

  /** 同步静音：无论 wantsEnabled / 实际是否在播，一律停掉。 */
  mute() {
    // Note-mute pauses; next note-open may resume this preferred track (not panel Off).
    const shouldResume =
      this._preferredTrackId !== AMBIENT_TRACK_OFF &&
      (this._wantEnabled || this._isAudiblePlaying());
    this._resumePreferredOnOpen = shouldResume;
    this._wantEnabled = false;
    this._needsGestureUnlock = false;
    this._stopPlayback({ persist: true });
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

  /** 按偏好曲重新开播。 */
  async unmute() {
    if (this._preferredTrackId === AMBIENT_TRACK_OFF) {
      this._wantEnabled = false;
      this._resumePreferredOnOpen = false;
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
   * 彻底停播（同步）；作废进行中的 play()。
   * @param {{ persist?: boolean }} [options]
   */
  _stopPlayback({ persist = true } = {}) {
    this._playbackEpoch += 1;
    this._endCreditSegment();
    this._trackId = AMBIENT_TRACK_OFF;
    this._needsGestureUnlock = false;

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
   * @param {string} trackId off | singing-bowl | rain
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
      this._stopPlayback({ persist });
      return;
    }

    const track = AMBIENT_TRACKS.find((t) => t.id === id);
    if (!track || !this._audio) return;

    this._endCreditSegment();
    this._trackId = id;
    this._preferredTrackId = id;
    this._wantEnabled = true;
    const epoch = this._playbackEpoch;
    const player = this._audio;
    player.muted = false;
    player.loop = true;
    player.volume = this._volume;
    player.src = track.src;
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
