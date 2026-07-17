/**
 * 禅意背景音：本页 <audio> 播放 + 实际可闻播放时长 → presenceBoost。
 * 不探测其他 App；不参与达标；会话内累计，不做长期存储。
 */

/** 每播放 1 分钟音频 ≈ 12 秒专注进度对光效的贡献 → 权重 12/60 */
export const AUDIO_FOCUS_EQUIV_RATIO = 12 / 60;

/** 听满整场最多叠加的 visual boost */
export const MAX_PRESENCE_BOOST = 0.2;

export const AMBIENT_TRACK_OFF = 'off';
export const AMBIENT_TRACK_SINGING_BOWL = 'singing-bowl';
export const AMBIENT_TRACK_RAIN = 'rain';

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

export class AmbientSoundscapeController {
  /**
   * @param {object} [options]
   * @param {() => number} [options.now] 可注入时钟（测试）
   * @param {HTMLAudioElement} [options.audio] 可注入 audio 元素
   */
  constructor({ now = () => Date.now(), audio = null } = {}) {
    this._now = now;
    this._audio = audio || (typeof Audio !== 'undefined' ? new Audio() : null);
    this._trackId = AMBIENT_TRACK_OFF;
    this._sessionActive = false;
    this._playedAccumulated = 0;
    /** @type {number | null} */
    this._segmentStartedAt = null;
    this._volume = 0.45;
    this._boundTimeUpdate = () => this._onTimeUpdate();
    this._boundPlayState = () => this._syncCreditSegment();

    if (this._audio) {
      this._audio.loop = true;
      this._audio.preload = 'auto';
      this._audio.volume = this._volume;
      this._audio.addEventListener('timeupdate', this._boundTimeUpdate);
      this._audio.addEventListener('play', this._boundPlayState);
      this._audio.addEventListener('playing', this._boundPlayState);
      this._audio.addEventListener('pause', this._boundPlayState);
      this._audio.addEventListener('ended', this._boundPlayState);
      this._audio.addEventListener('volumechange', this._boundPlayState);
    }
  }

  /** 专注会话开始（可听时长从 0 计） */
  startSession() {
    this._endCreditSegment();
    this._sessionActive = true;
    this._playedAccumulated = 0;
    this._segmentStartedAt = null;
  }

  /** 会话结束：停播并清零会话累计 */
  endSession() {
    this._endCreditSegment();
    this._sessionActive = false;
    this._playedAccumulated = 0;
    this._segmentStartedAt = null;
    this._trackId = AMBIENT_TRACK_OFF;
    if (this._audio) {
      this._audio.pause();
      this._audio.removeAttribute('src');
      this._audio.load();
    }
  }

  getTrackId() {
    return this._trackId;
  }

  getVolume() {
    return this._volume;
  }

  /**
   * @param {string} trackId off | singing-bowl | rain
   * @returns {Promise<void>}
   */
  async setTrack(trackId) {
    const id = trackId || AMBIENT_TRACK_OFF;
    if (id === AMBIENT_TRACK_OFF) {
      this._endCreditSegment();
      this._trackId = AMBIENT_TRACK_OFF;
      if (this._audio) {
        this._audio.pause();
        this._audio.removeAttribute('src');
        this._audio.load();
      }
      return;
    }

    const track = AMBIENT_TRACKS.find((t) => t.id === id);
    if (!track || !this._audio) return;

    this._endCreditSegment();
    this._trackId = id;
    this._audio.src = track.src;
    this._audio.loop = true;
    this._audio.volume = this._volume;
    try {
      await this._audio.play();
    } catch {
      // 浏览器自动播放策略：需用户手势；UI 已由点击触发，失败则保持选中待重试
    }
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
    return computePresenceBoost(this.getPlayedSeconds(), targetMinutes);
  }

  _isAudiblePlaying() {
    if (!this._sessionActive || !this._audio) return false;
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
