/**
 * Sitting 计时提示音：开始磬 / 间隔磬 / 达标结束铃。
 * Focusing **与** Breath practice 共用；免费核心反馈——不走 Ambient entitlement；
 * 音量跟 Soundscape 同一条 volume bar；可复用 ambient ducking。
 */

import {
  readSessionCuePref,
  writeSessionCuePrefEnabled,
  writeSessionIntervalMs,
  writeFocusAwarenessCardEnabled,
  isSessionCueMasterEnabled,
  isSessionIntervalEnabled,
  normalizeSessionIntervalMs
} from './sessionCuePreference.js';
import { evaluateIntervalCue } from './sessionIntervalScheduler.js';

export const SESSION_START_BELL_SRC = '/audio/cues/session-start-bell.mp3';
export const SESSION_INTERVAL_BELL_SRC = '/audio/cues/session-interval-bell.mp3';
export const SESSION_END_CHIME_SRC = '/audio/cues/session-end-chime.mp3';

/** Ambient duck target while a cue plays (relative to user volume). */
export const SESSION_CUE_DUCK_RATIO = 0.35;
/** Unduck / end fade window after cue (ms). */
export const SESSION_CUE_FADE_MS = 1500;
/**
 * Cue loudness follows the Soundscape volume bar (same 0–1 as ambient).
 * HTMLAudio default is 1.0 — that made start/interval/end bowls overpower music.
 */
export const SESSION_CUE_DEFAULT_VOLUME = 0.45;

/**
 * @param {HTMLAudioElement | null | undefined} el
 * @param {string} src
 */
function assignSrc(el, src) {
  if (!el) return;
  if (el.getAttribute('src') === src || el.src?.endsWith?.(src)) return;
  el.src = src;
  el.preload = 'auto';
  try {
    el.load();
  } catch {
    /* ignore */
  }
}

/**
 * @param {{
 *   storage?: Storage | { getItem?: Function, setItem?: Function } | null,
 *   startAudio?: HTMLAudioElement | null,
 *   intervalAudio?: HTMLAudioElement | null,
 *   endAudio?: HTMLAudioElement | null,
 *   mountToDocument?: boolean,
 *   startSrc?: string,
 *   intervalSrc?: string,
 *   endSrc?: string,
 *   duckRatio?: number,
 *   fadeMs?: number
 * }} [options]
 */
export class SessionCueController {
  constructor({
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
    startAudio = null,
    intervalAudio = null,
    endAudio = null,
    mountToDocument = true,
    startSrc = SESSION_START_BELL_SRC,
    intervalSrc = SESSION_INTERVAL_BELL_SRC,
    endSrc = SESSION_END_CHIME_SRC,
    duckRatio = SESSION_CUE_DUCK_RATIO,
    fadeMs = SESSION_CUE_FADE_MS
  } = {}) {
    this._storage = storage;
    this._startSrc = startSrc;
    this._intervalSrc = intervalSrc;
    this._endSrc = endSrc;
    this._duckRatio = duckRatio;
    this._fadeMs = fadeMs;
    this._mountToDocument = mountToDocument;
    this._pref = readSessionCuePref(storage);
    this._start =
      startAudio ||
      (typeof document !== 'undefined' ? this._createEl() : null);
    this._interval =
      intervalAudio ||
      (typeof document !== 'undefined' ? this._createEl() : null);
    this._end =
      endAudio ||
      (typeof document !== 'undefined' ? this._createEl() : null);
    this._playEpoch = 0;
    /** @type {boolean} */
    this._intervalActive = false;
    /** @type {number} */
    this._intervalFiredCount = 0;
    this._volume = SESSION_CUE_DEFAULT_VOLUME;
    this._applyVolumeToElements();
  }

  _createEl() {
    const el = document.createElement('audio');
    el.preload = 'auto';
    el.setAttribute('preload', 'auto');
    el.volume = SESSION_CUE_DEFAULT_VOLUME;
    el.style.cssText =
      'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
    el.setAttribute('aria-hidden', 'true');
    if (this._mountToDocument && document.body) {
      document.body.appendChild(el);
    }
    return el;
  }

  /**
   * Unified sitting volume (0–1). Same slider as ambient music.
   * @param {number} volume
   */
  setVolume(volume) {
    const n = Number(volume);
    this._volume = Number.isFinite(n)
      ? Math.min(1, Math.max(0, n))
      : SESSION_CUE_DEFAULT_VOLUME;
    this._applyVolumeToElements();
  }

  /** @returns {number} */
  getVolume() {
    return this._volume;
  }

  _applyVolumeToElements() {
    const live = this._volume;
    for (const el of [this._start, this._interval, this._end]) {
      if (!el) continue;
      el.volume = live;
    }
  }

  /**
   * @param {{ getVolume?: () => number } | null | undefined} ambient
   * @returns {number}
   */
  _resolveCueVolume(ambient) {
    if (ambient && typeof ambient.getVolume === 'function') {
      const n = Number(ambient.getVolume());
      if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
    }
    return this._volume;
  }

  /** Warm decode before the Sit / chip gesture. */
  preload() {
    assignSrc(this._start, this._startSrc);
    assignSrc(this._interval, this._intervalSrc);
    assignSrc(this._end, this._endSrc);
  }

  isEnabled() {
    return isSessionCueMasterEnabled(this._pref);
  }

  /**
   * UI master toggle for start/end only — preserves interval + awareness.
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this._pref = writeSessionCuePrefEnabled(this._storage, enabled);
  }

  /** @returns {number} */
  getIntervalMs() {
    return normalizeSessionIntervalMs(this._pref.sessionIntervalMs);
  }

  /**
   * @param {number} ms 0 | 180000 | 300000
   */
  setIntervalMs(ms) {
    this._pref = writeSessionIntervalMs(this._storage, ms);
  }

  isIntervalEnabled() {
    return isSessionIntervalEnabled(this._pref);
  }

  isAwarenessCardEnabled() {
    return this._pref.focusAwarenessCardEnabled !== false;
  }

  /**
   * @param {boolean} enabled
   */
  setAwarenessCardEnabled(enabled) {
    this._pref = writeFocusAwarenessCardEnabled(this._storage, enabled);
  }

  reloadPref() {
    this._pref = readSessionCuePref(this._storage);
  }

  /** Begin mid-session interval scheduling (call on Focus start). */
  startIntervalSession() {
    this._intervalActive = true;
    this._intervalFiredCount = 0;
  }

  /** Stop interval scheduling (Rise / session end). */
  stopIntervalSession() {
    this._intervalActive = false;
    this._intervalFiredCount = 0;
  }

  /**
   * Wall-clock poll while Focusing. Advances fired count on play or skip.
   *
   * @param {{
   *   elapsedSeconds: number,
   *   targetSeconds: number,
   *   ambient?: {
   *     isAudiblePlaying?: () => boolean,
   *     duckTo?: (ratio: number, opts?: object) => void,
   *     unduck?: (opts?: object) => void,
   *     cancelDuck?: () => void
   *   } | null,
   *   onIntervalPlayed?: () => void
   * }} opts
   * @returns {{ action: string, firedCount?: number }}
   */
  tickInterval({
    elapsedSeconds,
    targetSeconds,
    ambient = null,
    onIntervalPlayed = null
  }) {
    if (!this._intervalActive) {
      return { action: 'inactive' };
    }
    const intervalMs = this.getIntervalMs();
    if (intervalMs <= 0) {
      return { action: 'disabled' };
    }
    const result = evaluateIntervalCue({
      elapsedMs: Math.max(0, Number(elapsedSeconds) || 0) * 1000,
      targetMs: Math.max(0, Number(targetSeconds) || 0) * 1000,
      lastFiredCount: this._intervalFiredCount,
      intervalMs
    });
    if (result.action === 'wait' || result.action === 'disabled') {
      return result;
    }
    this._intervalFiredCount = result.firedCount;
    if (result.action === 'skip') {
      return result;
    }
    const played = this.playInterval({ ambient });
    if (played) {
      onIntervalPlayed?.();
    }
    return {
      action: played ? 'play' : 'play_failed',
      firedCount: result.firedCount
    };
  }

  /**
   * @param {{
   *   ambient?: {
   *     isAudiblePlaying?: () => boolean,
   *     duckTo?: (ratio: number, opts?: object) => void,
   *     unduck?: (opts?: object) => void,
   *     cancelDuck?: () => void
   *   } | null
   * }} [opts]
   */
  playStart({ ambient = null } = {}) {
    if (!this._pref.sessionStartBellEnabled) return false;
    this.preload();
    return this._playOne(this._start, {
      ambient,
      mode: 'start'
    });
  }

  /**
   * Mid-session interval bowl (same duck/unduck as start).
   * @param {{
   *   ambient?: {
   *     isAudiblePlaying?: () => boolean,
   *     duckTo?: (ratio: number, opts?: object) => void,
   *     unduck?: (opts?: object) => void,
   *     cancelDuck?: () => void
   *   } | null
   * }} [opts]
   */
  playInterval({ ambient = null } = {}) {
    if (!isSessionIntervalEnabled(this._pref)) return false;
    this.preload();
    return this._playOne(this._interval, {
      ambient,
      mode: 'interval'
    });
  }

  /**
   * Target-reached end cue. Caller should stop ambient via onCueEnded
   * when using plan A (duck → chime → fadeOutAndStop).
   *
   * @param {{
   *   ambient?: {
   *     isAudiblePlaying?: () => boolean,
   *     duckTo?: (ratio: number, opts?: object) => void,
   *     fadeOutAndStop?: (opts?: object) => Promise<void> | void,
   *     endSession?: () => void,
   *     cancelDuck?: () => void
   *   } | null,
   *   onCueEnded?: () => void
   * }} [opts]
   */
  playEnd({ ambient = null, onCueEnded = null } = {}) {
    if (!this._pref.sessionEndBellEnabled) {
      return false;
    }
    this.preload();
    return this._playOne(this._end, {
      ambient,
      mode: 'end',
      onCueEnded
    });
  }

  /**
   * @param {HTMLAudioElement | null} el
   * @param {{
   *   ambient?: object | null,
   *   mode: 'start' | 'interval' | 'end',
   *   onCueEnded?: (() => void) | null
   * }} opts
   */
  _playOne(el, { ambient = null, mode, onCueEnded = null }) {
    if (!el) {
      return false;
    }
    this._playEpoch += 1;
    const epoch = this._playEpoch;
    const live = this._resolveCueVolume(ambient);
    this._volume = live;
    el.volume = live;
    const audible = Boolean(ambient?.isAudiblePlaying?.());
    if (audible && typeof ambient.duckTo === 'function') {
      ambient.duckTo(this._duckRatio, { fadeMs: 0 });
    }

    try {
      el.pause();
    } catch {
      /* ignore */
    }
    el.currentTime = 0;

    const finish = () => {
      if (epoch !== this._playEpoch) return;
      el.removeEventListener('ended', finish);
      el.removeEventListener('error', finish);
      if ((mode === 'start' || mode === 'interval') && audible) {
        ambient?.unduck?.({ fadeMs: this._fadeMs, delayMs: 0 });
      }
      onCueEnded?.();
    };
    el.addEventListener('ended', finish);
    el.addEventListener('error', finish);

    const playResult = el.play();
    if (playResult && typeof playResult.then === 'function') {
      playResult.catch(() => {
        finish();
      });
    }
    return true;
  }

  /** Invalidate in-flight cue callbacks (e.g. early Rise). */
  cancelPending() {
    this._playEpoch += 1;
    for (const el of [this._start, this._interval, this._end]) {
      if (!el) continue;
      try {
        el.pause();
      } catch {
        /* ignore */
      }
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
  }
}
