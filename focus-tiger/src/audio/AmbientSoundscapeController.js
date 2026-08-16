/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 禅意背景音：DOM <audio> 播放 + 实际可闻播放时长 → presenceBoost。
 * 不探测其他 App；不参与达标；会话内累计，不做长期存储。
 *
 * 产品口径：
 * - **Idle / 冷启动仍 opt-in**（2026-07-25）：须点音符 / Sound 才出声；偏好默认 `enabled: false`。
 * - **开坐即播**（2026-08-15）：Focusing 与 Breath practice 开始时自动播 preferred（Off → 默认曲）；
 *   **Rise / 达标 / Leave 停播**；不把「开」写入 localStorage，冷启动仍静音。
 * presence 累计随 Focusing 会话清零。
 */

import {
  isUserAmbientTrackId,
  getSharedUserAmbientLibrary
} from './UserAmbientLibrary.js';
import {
  canPlayAmbientTrack,
  isAmbientDeepBuiltInTrack,
  resolvePlayableAmbientTrackId
} from './ambientEntitlement.js';
import {
  AMBIENT_AUDITION_DEFAULT_MS,
  AMBIENT_AUDITION_FADE_MS,
  shouldOfferDeepAudition
} from './ambientAudition.js';

/** 每播放 1 分钟音频 ≈ 12 秒专注进度对光效的贡献 → 权重 12/60 */
export const AUDIO_FOCUS_EQUIV_RATIO = 12 / 60;

/** 听满整场最多叠加的 visual boost（累计可闻时长） */
export const MAX_PRESENCE_BOOST = 0.2;

/**
 * 正在可闻播放时立刻给 Rim 一层缓亮，使「音乐会让光更亮」可感知；
 * 与累计 presenceBoost 相加，总贡献封顶见 getPresenceBoost。
 */
export const AUDIBLE_PLAYING_LIFT = 0.1;

/** Default sitting / Soundscape volume (0–1). Session cues share this. */
export const AMBIENT_DEFAULT_VOLUME = 0.45;

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

/** Session cue duck target (relative to user volume). */
export const AMBIENT_SESSION_CUE_DUCK_RATIO = 0.35;

/** Soft fade when unducking after a start cue / fading out on session end. */
export const AMBIENT_DUCK_FADE_MS = 1500;

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
   * @param {number} [options.auditionMs] Deep 试听时长（默认 15s；DEV 可 `?ambientAuditionMs=`）
   * @param {number} [options.auditionFadeMs] 试听结束柔和淡出时长
   * @param {typeof setTimeout} [options.schedule]
   * @param {typeof clearTimeout} [options.cancelSchedule]
   */
  constructor({
    now = () => Date.now(),
    audio = null,
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
    mountToDocument = true,
    userLibrary = null,
    auditionMs = AMBIENT_AUDITION_DEFAULT_MS,
    auditionFadeMs = AMBIENT_AUDITION_FADE_MS,
    schedule = typeof setTimeout !== 'undefined'
      ? setTimeout.bind(globalThis)
      : (fn) => {
          fn();
          return 0;
        },
    cancelSchedule = typeof clearTimeout !== 'undefined'
      ? clearTimeout.bind(globalThis)
      : () => {}
  } = {}) {
    this._now = now;
    this._storage = storage;
    this._mountToDocument = mountToDocument;
    this._userLibrary = userLibrary || getSharedUserAmbientLibrary();
    this._auditionMs = Math.max(200, Number(auditionMs) || AMBIENT_AUDITION_DEFAULT_MS);
    this._auditionFadeMs = Math.max(0, Number(auditionFadeMs) || 0);
    this._schedule = schedule;
    this._cancelSchedule = cancelSchedule;
    this._volume = AMBIENT_DEFAULT_VOLUME;
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
    /** Deep audition in progress (temporary; never persists entitlement). */
    this._auditionActive = false;
    /** @type {string | null} */
    this._auditionTrackId = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._auditionTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._auditionFadeTimer = null;
    /** @type {null | { preferred: string, remember: boolean }} */
    this._prefBeforeAudition = null;
    /** @type {null | ((info: { reason: string, trackId: string | null }) => void)} */
    this._onAuditionEnded = null;
    /** Live volume multiplier for session cues (1 = full user volume). */
    this._duckRatio = 1;
    this._duckEpoch = 0;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._duckFadeTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._duckDelayTimer = null;
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

  /** 专注会话开始：可听时长从 0 计。开播由 `startSittingMusic`（main）在同一手势里调用。 */
  startSession() {
    this._endCreditSegment();
    this._sessionActive = true;
    this._playedAccumulated = 0;
    this._segmentStartedAt = null;
    this._syncCreditSegment();
  }

  /**
   * Focusing 开坐：播 preferred；若为 Off 则默认曲。
   * `persist: false` —— 不把 enabled:true 写入 ambient-pref（Idle 冷启动仍静音）。
   * @returns {Promise<void>}
   */
  async startSittingMusic() {
    const preferred = this.getPreferredTrackId();
    const playId =
      preferred === AMBIENT_TRACK_OFF
        ? DEFAULT_AMBIENT_TRACK_ID
        : resolvePlayableAmbientTrackId(preferred, {
            storage: this._storage,
            builtInTracks: AMBIENT_TRACKS
          });
    await this.setTrack(playId, { persist: false });
  }

  /**
   * 会话结束（Rise / 达标）：清零会话累计并停播。
   * 不改写 localStorage 偏好。下一场开坐会再 `startSittingMusic`；Idle / 冷启动仍静音。
   * 硬停（进度清零）；若本页曾选曲，面板仍高亮 preferred。
   */
  endSession() {
    this._endCreditSegment();
    this._sessionActive = false;
    this._playedAccumulated = 0;
    this._segmentStartedAt = null;
    this._wantEnabled = false;
    this._clearSeekPause();
    // Reset duck state without applying full volume (avoids a volume flash before stop).
    this._cancelDuckTimers();
    this._duckEpoch += 1;
    this._duckRatio = 1;
    this.cancelDeepAudition({ reason: 'session-end', notify: false });
    this._stopPlayback({ persist: false });
  }

  /**
   * Temporarily scale live volume relative to user `_volume` (does not persist).
   * @param {number} ratio 0–1 (e.g. 0.35 for session cues)
   * @param {{ fadeMs?: number }} [opts]
   */
  duckTo(ratio, { fadeMs = 0 } = {}) {
    const target = Math.min(1, Math.max(0, Number(ratio)));
    const safeTarget = Number.isFinite(target) ? target : AMBIENT_SESSION_CUE_DUCK_RATIO;
    this._cancelDuckTimers();
    this._duckEpoch += 1;
    const epoch = this._duckEpoch;
    const ms = Math.max(0, Number(fadeMs) || 0);
    if (ms <= 0 || !this._audio) {
      this._duckRatio = safeTarget;
      this._applyLiveVolume();
      return;
    }
    const start = this._duckRatio;
    const steps = 8;
    let i = 0;
    const tick = () => {
      if (epoch !== this._duckEpoch) return;
      i += 1;
      this._duckRatio = start + (safeTarget - start) * (i / steps);
      this._applyLiveVolume();
      if (i >= steps) {
        this._duckFadeTimer = null;
        this._duckRatio = safeTarget;
        this._applyLiveVolume();
        return;
      }
      this._duckFadeTimer = this._schedule(tick, ms / steps);
    };
    this._duckFadeTimer = this._schedule(tick, ms / steps);
  }

  /**
   * Restore live volume to user `_volume` after an optional delay.
   * @param {{ fadeMs?: number, delayMs?: number }} [opts]
   */
  unduck({ fadeMs = AMBIENT_DUCK_FADE_MS, delayMs = 0 } = {}) {
    this._cancelDuckTimers();
    this._duckEpoch += 1;
    const epoch = this._duckEpoch;
    const delay = Math.max(0, Number(delayMs) || 0);
    const run = () => {
      if (epoch !== this._duckEpoch) return;
      this.duckTo(1, { fadeMs });
    };
    if (delay <= 0) {
      run();
      return;
    }
    this._duckDelayTimer = this._schedule(run, delay);
  }

  /** Snap duck multiplier back to 1 and cancel pending fades. */
  cancelDuck() {
    this._cancelDuckTimers();
    this._duckEpoch += 1;
    this._duckRatio = 1;
    this._applyLiveVolume();
  }

  getDuckRatio() {
    return this._duckRatio;
  }

  /**
   * Fade live volume to 0 then hard-stop (session complete plan A).
   * @param {{ fadeMs?: number }} [opts]
   * @returns {Promise<void>}
   */
  async fadeOutAndStop({ fadeMs = AMBIENT_DUCK_FADE_MS } = {}) {
    this._cancelDuckTimers();
    this._duckEpoch += 1;
    const epoch = this._duckEpoch;
    const player = this._audio;
    const ms = Math.max(0, Number(fadeMs) || 0);
    const startVol =
      player && Number.isFinite(player.volume)
        ? player.volume
        : this._volume * this._duckRatio;

    if (player && ms > 0 && startVol > 0) {
      await new Promise((resolve) => {
        const steps = 8;
        let i = 0;
        const tick = () => {
          if (epoch !== this._duckEpoch) {
            resolve();
            return;
          }
          i += 1;
          try {
            player.volume = Math.max(0, startVol * (1 - i / steps));
          } catch {
            /* ignore */
          }
          if (i >= steps) {
            this._duckFadeTimer = null;
            resolve();
            return;
          }
          this._duckFadeTimer = this._schedule(tick, ms / steps);
        };
        this._duckFadeTimer = this._schedule(tick, ms / steps);
      });
    }

    if (epoch !== this._duckEpoch) return;
    this.endSession();
  }

  _cancelDuckTimers() {
    if (this._duckFadeTimer != null) {
      this._cancelSchedule(this._duckFadeTimer);
      this._duckFadeTimer = null;
    }
    if (this._duckDelayTimer != null) {
      this._cancelSchedule(this._duckDelayTimer);
      this._duckDelayTimer = null;
    }
  }

  _applyLiveVolume() {
    if (!this._audio) return;
    const live = Math.min(
      1,
      Math.max(0, this._volume * this._duckRatio)
    );
    try {
      this._audio.volume = live;
      this._audio.muted = live <= 0;
    } catch {
      /* ignore */
    }
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
    if (this._auditionActive) {
      this.cancelDeepAudition({ reason: 'mute', notify: false });
      return;
    }
    this.cancelDuck();
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

  /** 按偏好曲开播；若刚 note-mute 软暂停则断点续播。深库未授权时落到免费默认曲。 */
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
    const playId = resolvePlayableAmbientTrackId(this._preferredTrackId, {
      storage: this._storage,
      builtInTracks: AMBIENT_TRACKS
    });
    await this.setTrack(playId, { persist: false });
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
    const playId = resolvePlayableAmbientTrackId(trackId, {
      storage: this._storage,
      builtInTracks: AMBIENT_TRACKS
    });
    await this.setTrack(playId, { persist: false });
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
    this._duckRatio = 1;
    this._cancelDuckTimers();

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
   * @param {{ persist?: boolean, allowAudition?: boolean }} [options]
   * @returns {Promise<void>}
   */
  async setTrack(trackId, { persist = true, allowAudition = false } = {}) {
    const id = trackId || AMBIENT_TRACK_OFF;
    if (id === AMBIENT_TRACK_OFF) {
      // Explicit Off in the panel — remember Off (mute-via-note keeps preferred track).
      this.cancelDeepAudition({ reason: 'off' });
      this._preferredTrackId = AMBIENT_TRACK_OFF;
      this._wantEnabled = false;
      this._needsGestureUnlock = false;
      this._resumePreferredOnOpen = false;
      this._rememberPanelTrack = false;
      this._clearSeekPause();
      this._stopPlayback({ persist });
      return;
    }

    const entitlementOpts = {
      storage: this._storage,
      builtInTracks: AMBIENT_TRACKS
    };
    const auditionBypass =
      allowAudition &&
      shouldOfferDeepAudition(id, entitlementOpts);
    // Hard deny deep built-ins without B — UI must disable; resume paths use resolvePlayable*.
    // Audition path is the sole temporary bypass (persist forced false).
    if (!canPlayAmbientTrack(id, entitlementOpts) && !auditionBypass) {
      return;
    }
    if (auditionBypass) {
      persist = false;
    } else if (this._auditionActive) {
      this.cancelDeepAudition({ reason: 'replace' });
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
    if (!auditionBypass) {
      this._preferredTrackId = id;
      this._rememberPanelTrack = true;
    }
    this._wantEnabled = true;
    const epoch = this._playbackEpoch;
    const player = this._audio;
    player.muted = false;
    player.loop = true;
    this._applyLiveVolume();
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

  /** @returns {boolean} */
  isDeepAuditionActive() {
    return Boolean(this._auditionActive);
  }

  /** @returns {string | null} */
  getDeepAuditionTrackId() {
    return this._auditionTrackId;
  }

  /**
   * Unentitled deep track → timed preview then soft fade; never persists unlock.
   * Entitled → normal setTrack (no audition cut).
   *
   * @param {string} trackId
   * @param {object} [opts]
   * @param {(info: { reason: string, trackId: string | null }) => void} [opts.onEnded]
   * @returns {Promise<{ started: boolean, reason: string }>}
   */
  async startDeepAudition(trackId, { onEnded } = {}) {
    const id = String(trackId || '');
    const entitlementOpts = {
      storage: this._storage,
      builtInTracks: AMBIENT_TRACKS
    };
    if (canPlayAmbientTrack(id, entitlementOpts)) {
      await this.setTrack(id);
      return { started: false, reason: 'entitled' };
    }
    if (!isAmbientDeepBuiltInTrack(id, AMBIENT_TRACKS)) {
      return { started: false, reason: 'not-deep' };
    }

    this.cancelDeepAudition({ reason: 'restart', notify: false });
    this._prefBeforeAudition = {
      preferred: this._preferredTrackId,
      remember: this._rememberPanelTrack
    };
    this._auditionActive = true;
    this._auditionTrackId = id;
    this._onAuditionEnded = typeof onEnded === 'function' ? onEnded : null;

    await this.setTrack(id, { persist: false, allowAudition: true });
    if (this._trackId !== id || !this._isAudiblePlaying()) {
      // play failed / gesture — clear audition state without claiming success
      this._auditionActive = false;
      this._auditionTrackId = null;
      this._onAuditionEnded = null;
      this._prefBeforeAudition = null;
      return { started: false, reason: 'play-failed' };
    }

    // Keep preferred memory on pre-audition track (never sticky-deep).
    if (this._prefBeforeAudition) {
      this._preferredTrackId = this._prefBeforeAudition.preferred;
      this._rememberPanelTrack = this._prefBeforeAudition.remember;
    }

    this._auditionTimer = this._schedule(() => {
      void this._finishDeepAudition({ reason: 'duration' });
    }, this._auditionMs);

    return { started: true, reason: 'audition' };
  }

  /**
   * Stop audition immediately (Rise / mute / Off). Timer end uses `_finishDeepAudition` (fade + notify).
   * @param {{ reason?: string, notify?: boolean }} [opts]
   */
  cancelDeepAudition({ reason = 'cancel', notify = true } = {}) {
    if (!this._auditionActive && !this._auditionTimer && !this._auditionFadeTimer) {
      return;
    }
    this._clearAuditionTimers();
    const trackId = this._auditionTrackId;
    const wasActive = this._auditionActive;
    this._auditionActive = false;
    this._auditionTrackId = null;
    if (this._prefBeforeAudition) {
      this._preferredTrackId = this._prefBeforeAudition.preferred;
      this._rememberPanelTrack = this._prefBeforeAudition.remember;
      this._prefBeforeAudition = null;
    }
    if (wasActive) {
      this._wantEnabled = false;
      this._stopPlayback({ persist: false });
      if (this._audio) this._audio.volume = this._volume;
      const cb = this._onAuditionEnded;
      this._onAuditionEnded = null;
      if (notify) {
        try {
          cb?.({ reason, trackId });
        } catch {
          /* listener errors must not break audio */
        }
      }
    } else {
      this._onAuditionEnded = null;
    }
  }

  /**
   * @param {{ reason: string }} opts
   */
  async _finishDeepAudition({ reason }) {
    if (!this._auditionActive) return;
    this._clearAuditionTimers();
    const trackId = this._auditionTrackId;
    const player = this._audio;
    const fadeMs = this._auditionFadeMs;
    const startVol =
      player && Number.isFinite(player.volume) ? player.volume : this._volume;

    if (player && fadeMs > 0 && startVol > 0) {
      await new Promise((resolve) => {
        const steps = 8;
        let i = 0;
        const tick = () => {
          i += 1;
          const next = startVol * (1 - i / steps);
          try {
            player.volume = Math.max(0, next);
          } catch {
            /* ignore */
          }
          if (i >= steps) {
            this._auditionFadeTimer = null;
            resolve();
            return;
          }
          this._auditionFadeTimer = this._schedule(tick, fadeMs / steps);
        };
        this._auditionFadeTimer = this._schedule(tick, fadeMs / steps);
      });
    }

    this._auditionActive = false;
    this._auditionTrackId = null;
    if (this._prefBeforeAudition) {
      this._preferredTrackId = this._prefBeforeAudition.preferred;
      this._rememberPanelTrack = this._prefBeforeAudition.remember;
      this._prefBeforeAudition = null;
    }
    this._wantEnabled = false;
    this._stopPlayback({ persist: false });
    if (this._audio) {
      try {
        this._audio.volume = this._volume;
      } catch {
        /* ignore */
      }
    }
    const cb = this._onAuditionEnded;
    this._onAuditionEnded = null;
    try {
      cb?.({ reason, trackId });
    } catch {
      /* ignore */
    }
  }

  _clearAuditionTimers() {
    if (this._auditionTimer != null) {
      this._cancelSchedule(this._auditionTimer);
      this._auditionTimer = null;
    }
    if (this._auditionFadeTimer != null) {
      this._cancelSchedule(this._auditionFadeTimer);
      this._auditionFadeTimer = null;
    }
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
    this._applyLiveVolume();
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
    el.volume = Number.isFinite(vol)
      ? Math.min(1, Math.max(0, vol))
      : AMBIENT_DEFAULT_VOLUME;
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
    this._applyLiveVolume();
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
