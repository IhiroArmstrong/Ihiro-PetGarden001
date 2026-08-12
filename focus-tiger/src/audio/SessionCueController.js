/**
 * Focus 计时提示音：开始磬 / 达标结束铃。
 * 免费核心反馈——不走 Ambient entitlement；可复用 ambient ducking。
 */

import {
  readSessionCuePref,
  writeSessionCuePrefEnabled,
  isSessionCueMasterEnabled
} from './sessionCuePreference.js';

export const SESSION_START_BELL_SRC = '/audio/cues/session-start-bell.mp3';
export const SESSION_END_CHIME_SRC = '/audio/cues/session-end-chime.mp3';

/** Ambient duck target while a cue plays (relative to user volume). */
export const SESSION_CUE_DUCK_RATIO = 0.35;
/** Unduck / end fade window after cue (ms). */
export const SESSION_CUE_FADE_MS = 1500;

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
 *   endAudio?: HTMLAudioElement | null,
 *   mountToDocument?: boolean,
 *   startSrc?: string,
 *   endSrc?: string,
 *   duckRatio?: number,
 *   fadeMs?: number
 * }} [options]
 */
export class SessionCueController {
  constructor({
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
    startAudio = null,
    endAudio = null,
    mountToDocument = true,
    startSrc = SESSION_START_BELL_SRC,
    endSrc = SESSION_END_CHIME_SRC,
    duckRatio = SESSION_CUE_DUCK_RATIO,
    fadeMs = SESSION_CUE_FADE_MS
  } = {}) {
    this._storage = storage;
    this._startSrc = startSrc;
    this._endSrc = endSrc;
    this._duckRatio = duckRatio;
    this._fadeMs = fadeMs;
    this._mountToDocument = mountToDocument;
    this._pref = readSessionCuePref(storage);
    this._start =
      startAudio ||
      (typeof document !== 'undefined' ? this._createEl() : null);
    this._end =
      endAudio ||
      (typeof document !== 'undefined' ? this._createEl() : null);
    this._playEpoch = 0;
  }

  _createEl() {
    const el = document.createElement('audio');
    el.preload = 'auto';
    el.setAttribute('preload', 'auto');
    el.style.cssText =
      'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
    el.setAttribute('aria-hidden', 'true');
    if (this._mountToDocument && document.body) {
      document.body.appendChild(el);
    }
    return el;
  }

  /** Warm decode before the Sit / chip gesture. */
  preload() {
    assignSrc(this._start, this._startSrc);
    assignSrc(this._end, this._endSrc);
  }

  isEnabled() {
    return isSessionCueMasterEnabled(this._pref);
  }

  /**
   * UI master toggle — keeps both fields in sync.
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this._pref = writeSessionCuePrefEnabled(this._storage, enabled);
  }

  reloadPref() {
    this._pref = readSessionCuePref(this._storage);
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
   *   mode: 'start' | 'end',
   *   onCueEnded?: (() => void) | null
   * }} opts
   */
  _playOne(el, { ambient = null, mode, onCueEnded = null }) {
    if (!el) {
      return false;
    }
    this._playEpoch += 1;
    const epoch = this._playEpoch;
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
      if (mode === 'start' && audible) {
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
    for (const el of [this._start, this._end]) {
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
